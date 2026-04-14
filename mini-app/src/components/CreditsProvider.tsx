'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  label: string;
  priceLabel: string;
}

interface CreditsContextType {
  balance: number;
  packages: CreditPackage[];
  connected: boolean;
  address: string | undefined;
  purchasing: boolean;
  refreshBalance: () => Promise<void>;
  purchaseCredits: (packageId: string) => Promise<void>;
  setBalance: (n: number) => void;
}

const CreditsContext = createContext<CreditsContextType>({
  balance: 0,
  packages: [],
  connected: false,
  address: undefined,
  purchasing: false,
  refreshBalance: async () => {},
  purchaseCredits: async () => {},
  setBalance: () => {},
});

export function useCredits() {
  return useContext(CreditsContext);
}

export default function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [pendingPackageId, setPendingPackageId] = useState<string | null>(null);

  const { sendTransactionAsync } = useSendTransaction();
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | undefined>();

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/credits?address=${address}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setPackages(data.packages);
      }
    } catch {
      // Silently fail
    }
  }, [address]);

  // Load balance on connect
  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
    } else {
      setBalance(0);
    }
  }, [isConnected, address, refreshBalance]);

  // When tx is confirmed, submit to our API to credit
  useEffect(() => {
    if (!receipt || !pendingTxHash || !pendingPackageId || !address) return;

    (async () => {
      try {
        const res = await fetch('/api/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            packageId: pendingPackageId,
            txHash: pendingTxHash,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch {
        // Will be caught by the purchase flow
      } finally {
        setPurchasing(false);
        setPendingTxHash(undefined);
        setPendingPackageId(null);
      }
    })();
  }, [receipt, pendingTxHash, pendingPackageId, address]);

  const purchaseCredits = useCallback(
    async (packageId: string) => {
      if (!address) throw new Error('Wallet not connected');

      const pkg = packages.find((p) => p.id === packageId);
      if (!pkg) throw new Error('Invalid package');

      setPurchasing(true);
      setPendingPackageId(packageId);

      try {
        const payTo = process.env.NEXT_PUBLIC_EVM_ADDRESS;
        if (!payTo) throw new Error('Payment address not configured');

        // Encode USDC transfer
        const amount = parseUnits(pkg.price.toString(), 6);
        const data = encodeFunctionData({
          abi: [
            {
              name: 'transfer',
              type: 'function',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ type: 'bool' }],
            },
          ],
          functionName: 'transfer',
          args: [payTo as `0x${string}`, amount],
        });

        const txHash = await sendTransactionAsync({
          to: USDC_ADDRESS as `0x${string}`,
          data,
        });

        setPendingTxHash(txHash);
        // Receipt watcher in useEffect will handle the rest
      } catch (err) {
        setPurchasing(false);
        setPendingPackageId(null);
        throw err;
      }
    },
    [address, packages, sendTransactionAsync]
  );

  const value = useMemo(
    () => ({
      balance,
      packages,
      connected: isConnected,
      address,
      purchasing,
      refreshBalance,
      purchaseCredits,
      setBalance,
    }),
    [balance, packages, isConnected, address, purchasing, refreshBalance, purchaseCredits]
  );

  return (
    <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
  );
}

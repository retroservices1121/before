'use client';

import { createContext, useContext, useCallback, useMemo } from 'react';
import { useWalletClient } from 'wagmi';

interface PaymentContextType {
  fetchWithPayment: (url: string) => Promise<Response>;
  ready: boolean;
}

const PaymentContext = createContext<PaymentContextType>({
  fetchWithPayment: fetch,
  ready: false,
});

export function usePayment() {
  return useContext(PaymentContext);
}

export default function PaymentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: walletClient } = useWalletClient();

  const fetchWithPayment = useCallback(
    async (url: string): Promise<Response> => {
      // First try without payment (might be cached)
      const initialRes = await fetch(url);

      if (initialRes.status !== 402) {
        return initialRes;
      }

      // 402 - payment required
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      // Get payment details from 402 response
      const paymentHeader = initialRes.headers.get('x-payment') ||
        initialRes.headers.get('payment-required');

      if (!paymentHeader) {
        throw new Error('No payment details in 402 response');
      }

      let paymentDetails: any;
      try {
        paymentDetails = JSON.parse(paymentHeader);
      } catch {
        throw new Error('Invalid payment details');
      }

      // Sign the payment with the wallet
      const message = JSON.stringify({
        scheme: paymentDetails.scheme,
        network: paymentDetails.network,
        amount: paymentDetails.maxAmountRequired,
        recipient: paymentDetails.payTo,
        nonce: paymentDetails.nonce,
      });

      const signature = await walletClient.signMessage({ message });

      // Retry with payment proof
      const paidRes = await fetch(url, {
        headers: {
          'x-payment': JSON.stringify({
            ...paymentDetails,
            signature,
          }),
        },
      });

      return paidRes;
    },
    [walletClient]
  );

  const value = useMemo(
    () => ({
      fetchWithPayment,
      ready: !!walletClient,
    }),
    [fetchWithPayment, walletClient]
  );

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  );
}

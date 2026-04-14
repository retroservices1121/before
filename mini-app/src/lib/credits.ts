import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Credit packages
export const CREDIT_PACKAGES = [
  { id: 'starter', credits: 10, price: 0.99, label: '10 credits', priceLabel: '$0.99' },
  { id: 'standard', credits: 50, price: 3.99, label: '50 credits', priceLabel: '$3.99' },
] as const;

export type PackageId = (typeof CREDIT_PACKAGES)[number]['id'];

// USDC on Base (mainnet)
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
export const BASE_CHAIN_ID = 8453;
export const PAY_TO = process.env.EVM_ADDRESS || '';

// Simple file-based credit store (replace with DB in production)
const STORE_PATH = join(process.cwd(), '.credits.json');

interface CreditStore {
  [walletAddress: string]: {
    balance: number;
    purchases: Array<{
      packageId: string;
      credits: number;
      amount: number;
      txHash: string;
      timestamp: number;
    }>;
  };
}

function loadStore(): CreditStore {
  if (!existsSync(STORE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveStore(store: CreditStore) {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function getBalance(walletAddress: string): number {
  const store = loadStore();
  return store[normalizeAddress(walletAddress)]?.balance ?? 0;
}

export function deductCredit(walletAddress: string): boolean {
  const store = loadStore();
  const key = normalizeAddress(walletAddress);
  const entry = store[key];

  if (!entry || entry.balance < 1) return false;

  entry.balance -= 1;
  saveStore(store);
  return true;
}

export function addCredits(
  walletAddress: string,
  packageId: PackageId,
  txHash: string
): { balance: number } {
  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) throw new Error('Invalid package');

  const store = loadStore();
  const key = normalizeAddress(walletAddress);

  if (!store[key]) {
    store[key] = { balance: 0, purchases: [] };
  }

  // Check for duplicate tx hash
  const alreadyUsed = store[key].purchases.some((p) => p.txHash === txHash);
  if (alreadyUsed) {
    return { balance: store[key].balance };
  }

  store[key].balance += pkg.credits;
  store[key].purchases.push({
    packageId: pkg.id,
    credits: pkg.credits,
    amount: pkg.price,
    txHash,
    timestamp: Date.now(),
  });

  saveStore(store);
  return { balance: store[key].balance };
}

export function getPackage(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

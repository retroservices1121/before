import { createServer } from '@x402/next';
import { HTTPFacilitatorClient } from '@x402/core/server';

const facilitatorUrl =
  process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';

const facilitator = new HTTPFacilitatorClient(facilitatorUrl);

export const server = createServer(facilitator);

// Price per brief in USDC
export const BRIEF_PRICE = process.env.BRIEF_PRICE || '$0.50';

// Base mainnet CAIP-2 identifier
export const BASE_NETWORK = 'eip155:8453';

// Wallet address to receive payments
export const PAY_TO = process.env.EVM_ADDRESS || '';

export function getPaymentConfig() {
  return {
    scheme: 'exact' as const,
    price: BRIEF_PRICE,
    network: BASE_NETWORK,
    payTo: PAY_TO,
  };
}

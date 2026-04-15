export interface Market {
  id: string;
  slug: string;
  title: string;
  description?: string;
  probability: number;
  volume: number;
  volume24h?: number;
  priceChange24h?: number;
  platform: 'polymarket' | 'limitless' | 'kalshi' | 'aggregate';
  category?: string;
  endDate?: string;
  imageUrl?: string;
  url?: string;
  conditionId?: string;
  outcomes?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CryptoStats {
  name: string;
  symbol: string;
  price: number;
  priceChange24h?: number;
  priceChange7d?: number;
  marketCap?: number;
  volume24h?: number;
  riskLevel?: string;
  riskScore?: string;
}

export interface ContextBrief {
  marketId: string;
  summary: string;
  keyFactors: {
    name: string;
    sentiment: 'bullish' | 'bearish' | 'neutral' | 'pending';
    detail?: string;
  }[];
  historicalBaseRate?: string;
  upcomingCatalysts?: string[];
  cryptoStats?: CryptoStats;
  generatedAt: string;
}

export interface SpreddMarketsResponse {
  markets: Market[];
  total?: number;
  page?: number;
}

export interface User {
  id: string;
  email: string;
  apiKey: string;
  tier: 'lite' | 'pro';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  refPlatform?: string;
  createdAt: string;
}

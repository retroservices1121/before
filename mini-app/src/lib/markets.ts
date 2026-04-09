const B4E_API = process.env.B4E_API_URL || 'https://b4enews.com';

export interface Market {
  slug: string;
  title: string;
  probability: number;
  volume: number;
  volume24h?: number;
  priceChange24h?: number;
  category?: string;
  platform: string;
  endDate?: string;
  url?: string;
}

export async function getTrendingMarkets(): Promise<Market[]> {
  try {
    const res = await fetch(`${B4E_API}/api/markets`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Deep link URLs for prediction market mini apps on Base
const DEEP_LINKS: Record<string, string> = {
  limitless: 'https://limitless.exchange/market/',
  polymarket: 'https://polymarket.com/event/',
  kalshi: 'https://kalshi.com/markets/',
};

export function getTradeUrl(market: Market): string {
  // Prefer the market's own URL
  if (market.url) return market.url;

  const base = DEEP_LINKS[market.platform];
  if (base) return `${base}${market.slug}`;

  return `${B4E_API}/market/${market.slug}`;
}

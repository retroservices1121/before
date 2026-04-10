import { Market } from './types';
import { slugify } from './utils';

const SPREDD_API_URL = process.env.SPREDD_API_URL || 'https://api.spreddterminal.com';
const SPREDD_API_KEY = process.env.SPREDD_API_KEY || '';

// Spredd API response types
interface SpreddMarket {
  platform: string;
  market_id: string;
  title: string;
  description?: string;
  category?: string;
  yes_price: number;
  no_price?: number;
  volume: number;
  volume_24h?: number;
  liquidity?: number;
  end_date?: string;
  is_active?: boolean;
  chain?: string;
  collateral_token?: string;
  outcomes?: Record<string, number>;
  url?: string;
}

function mapSpreddMarket(s: SpreddMarket): Market {
  return {
    id: `${s.platform}-${s.market_id}`,
    slug: `${slugify(s.title)}--${s.platform}--${encodeURIComponent(s.market_id)}`,
    title: s.title,
    description: s.description,
    probability: s.yes_price,
    volume: s.volume,
    volume24h: s.volume_24h,
    platform: normalizePlatform(s.platform),
    category: s.category,
    endDate: s.end_date,
    url: s.url,
    conditionId: s.platform === 'polymarket' ? s.market_id : undefined,
  };
}

function normalizePlatform(p: string): Market['platform'] {
  const lower = p.toLowerCase();
  if (lower === 'polymarket') return 'polymarket';
  if (lower === 'limitless') return 'limitless';
  if (lower === 'kalshi') return 'kalshi';
  return 'aggregate';
}

async function spreddFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  if (!SPREDD_API_KEY) return null;

  try {
    const res = await fetch(`${SPREDD_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SPREDD_API_KEY,
        ...options?.headers,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Spredd API error: ${res.status} ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Spredd API fetch failed:', error);
    return null;
  }
}

export async function getTrendingMarkets(): Promise<Market[]> {
  const platforms = ['polymarket', 'limitless', 'kalshi'];
  const results = await Promise.all(
    platforms.map((p) =>
      spreddFetch<SpreddMarket[]>(`/v1/markets?platform=${p}&limit=15&min_price=0.05`)
    )
  );

  const all = results.flatMap((r) => (Array.isArray(r) ? r : []));

  if (all.length > 0) {
    return all
      .map(mapSpreddMarket)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 20);
  }

  console.log('Using mock market data (Spredd API not available)');
  return getMockMarkets();
}

export async function getMarket(slug: string): Promise<Market | null> {
  // Slug format: {title-slug}--{platform}--{encoded-market-id}
  const parts = slug.split('--');

  if (parts.length === 3) {
    const platform = parts[1];
    const marketId = decodeURIComponent(parts[2]);
    const data = await spreddFetch<SpreddMarket>(
      `/v1/markets/${platform}/${encodeURIComponent(marketId)}`
    );
    if (data && data.market_id) {
      return mapSpreddMarket(data);
    }
  }

  // Fallback: search by title keywords (for old-format slugs / mock data)
  const searchTerm = (parts[0] || slug).replace(/-/g, ' ');
  const searchData = await spreddFetch<SpreddMarket[]>(
    `/v1/markets?search=${encodeURIComponent(searchTerm)}&limit=5`
  );

  if (searchData && Array.isArray(searchData)) {
    const mapped = searchData.map(mapSpreddMarket);
    if (mapped.length > 0) return mapped[0];
  }

  // Fallback to mock
  const mocks = getMockMarkets();
  return mocks.find((m) => m.slug === slug || m.slug.startsWith(parts[0])) || null;
}

export async function searchMarkets(query: string): Promise<Market[]> {
  const data = await spreddFetch<SpreddMarket[]>(
    `/v1/markets?search=${encodeURIComponent(query)}&limit=5`
  );

  if (data && Array.isArray(data)) {
    return data.map(mapSpreddMarket);
  }

  // Fallback to mock
  const mocks = getMockMarkets();
  const lower = query.toLowerCase();
  return mocks.filter((m) => m.title.toLowerCase().includes(lower));
}

/**
 * Direct Polymarket API fallback for markets not found in Spredd.
 * Uses Polymarket's gamma API to resolve event slugs directly.
 */
export async function getPolymarketBySlug(eventSlug: string): Promise<Market | null> {
  try {
    const res = await fetch(
      `https://gamma-api.polymarket.com/events?slug=${encodeURIComponent(eventSlug)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) return null;

    const event = events[0];
    // Get the first (primary) market from the event
    const mkt = event.markets?.[0] || event;

    const prices = mkt.outcomePrices ? JSON.parse(mkt.outcomePrices) : [];
    const probability = prices.length > 0 ? parseFloat(prices[0]) : 0;

    return {
      id: `polymarket-${mkt.id || event.id}`,
      slug: eventSlug,
      title: event.title || mkt.title || eventSlug,
      description: event.description || mkt.description,
      probability,
      volume: parseFloat(mkt.volume || event.volume || '0'),
      volume24h: parseFloat(mkt.volume24hr || '0'),
      platform: 'polymarket',
      category: event.category || undefined,
      endDate: mkt.endDate || event.endDate,
      url: `https://polymarket.com/event/${eventSlug}`,
      conditionId: mkt.conditionId || undefined,
    };
  } catch (error) {
    console.error('Polymarket direct lookup failed:', error);
    return null;
  }
}

export async function getMarketNews(platform: string, marketId: string) {
  return spreddFetch<{ title: string; url: string; source: string }[]>(
    `/v1/news/market/${platform}/${marketId}`
  );
}

// ─── Mock data for development ───────────────────────────────────

function getMockMarkets(): Market[] {
  return [
    {
      id: '1',
      slug: 'fed-holds-rates-june-2026',
      title: 'Fed holds interest rates at June 2026 FOMC meeting',
      description: 'Will the Federal Reserve keep the federal funds rate unchanged at the June 2026 FOMC meeting?',
      probability: 0.87,
      volume: 12_400_000,
      volume24h: 1_850_000,
      priceChange24h: 8.2,
      platform: 'polymarket',
      category: 'Economics',
      endDate: '2026-06-18',
    },
    {
      id: '2',
      slug: 'bitcoin-150k-eoy-2026',
      title: 'Bitcoin above $150,000 by end of 2026',
      description: 'Will the price of Bitcoin exceed $150,000 at any point before January 1, 2027?',
      probability: 0.6,
      volume: 8_200_000,
      volume24h: 1_200_000,
      priceChange24h: 12.4,
      platform: 'aggregate',
      category: 'Crypto',
      endDate: '2026-12-31',
    },
    {
      id: '3',
      slug: 'eu-ai-act-enforcement-q3-2026',
      title: 'EU AI Act enforcement begins Q3 2026',
      description: 'Will the EU AI Act begin active enforcement of provisions by September 30, 2026?',
      probability: 0.73,
      volume: 3_100_000,
      volume24h: 620_000,
      priceChange24h: 8.1,
      platform: 'limitless',
      category: 'Technology',
      endDate: '2026-09-30',
    },
    {
      id: '4',
      slug: 'crypto-bill-passes-committee-2026',
      title: 'Bipartisan crypto legislation passes committee vote',
      description: 'Will bipartisan cryptocurrency legislation pass at least one congressional committee by end of Q2 2026?',
      probability: 0.72,
      volume: 5_600_000,
      volume24h: 890_000,
      priceChange24h: 3.1,
      platform: 'polymarket',
      category: 'Politics',
      endDate: '2026-06-30',
    },
    {
      id: '5',
      slug: 'nvidia-beats-q2-earnings-2026',
      title: 'NVIDIA beats Q2 2026 earnings consensus',
      description: 'Will NVIDIA report Q2 2026 earnings per share above Wall Street consensus estimate?',
      probability: 0.91,
      volume: 6_800_000,
      volume24h: 450_000,
      priceChange24h: 1.3,
      platform: 'kalshi',
      category: 'Markets',
      endDate: '2026-08-15',
    },
    {
      id: '6',
      slug: 'us-recession-q4-2026',
      title: 'US recession declared by Q4 2026',
      description: 'Will the NBER officially declare a US recession beginning on or before October 1, 2026?',
      probability: 0.34,
      volume: 4_100_000,
      volume24h: 380_000,
      priceChange24h: -5.7,
      platform: 'aggregate',
      category: 'Economics',
      endDate: '2026-10-01',
    },
    {
      id: '7',
      slug: 'openai-gpt5-release-2026',
      title: 'OpenAI releases GPT-5 in 2026',
      description: 'Will OpenAI publicly release a model branded as GPT-5 before January 1, 2027?',
      probability: 0.79,
      volume: 7_300_000,
      volume24h: 920_000,
      priceChange24h: 2.8,
      platform: 'limitless',
      category: 'Technology',
      endDate: '2026-12-31',
    },
    {
      id: '8',
      slug: 'trump-approval-above-50-july-2026',
      title: 'Trump approval rating above 50% in July 2026',
      description: 'Will any major polling aggregate show Trump approval above 50% at any point in July 2026?',
      probability: 0.28,
      volume: 3_900_000,
      volume24h: 510_000,
      priceChange24h: -2.1,
      platform: 'polymarket',
      category: 'Politics',
      endDate: '2026-07-31',
    },
  ];
}

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
    outcomes: s.outcomes,
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

  // Try Polymarket direct lookup (slug might be a Polymarket event slug)
  const polymarket = await getPolymarketBySlug(parts[0] || slug);
  if (polymarket) return polymarket;

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
    const markets = event.markets || [];

    if (markets.length === 0) return null;

    // Multi-market event: build outcomes map from all sub-markets
    // Single-market event: treat as binary yes/no
    if (markets.length > 1) {
      const outcomes: Record<string, number> = {};
      let totalVolume = 0;

      for (const m of markets) {
        const prices = m.outcomePrices ? JSON.parse(m.outcomePrices) : [];
        const yesPrice = prices.length > 0 ? parseFloat(prices[0]) : 0;
        const question = m.question || m.title || '';
        outcomes[question] = yesPrice;
        totalVolume += parseFloat(m.volume || '0');
      }

      // Use the highest-volume sub-market for the primary probability
      const topMarket = markets.reduce((a: any, b: any) =>
        parseFloat(b.volume || '0') > parseFloat(a.volume || '0') ? b : a
      );
      const topPrices = topMarket.outcomePrices ? JSON.parse(topMarket.outcomePrices) : [];

      return {
        id: `polymarket-${event.id}`,
        slug: eventSlug,
        title: event.title || eventSlug,
        description: event.description,
        probability: topPrices.length > 0 ? parseFloat(topPrices[0]) : 0,
        volume: totalVolume,
        platform: 'polymarket',
        category: event.category || undefined,
        endDate: topMarket.endDate || event.endDate,
        url: `https://polymarket.com/event/${eventSlug}`,
        conditionId: topMarket.conditionId || undefined,
        outcomes,
      };
    }

    // Single sub-market: binary yes/no
    const mkt = markets[0];
    const prices = mkt.outcomePrices ? JSON.parse(mkt.outcomePrices) : [];
    const probability = prices.length > 0 ? parseFloat(prices[0]) : 0;

    return {
      id: `polymarket-${mkt.id || event.id}`,
      slug: eventSlug,
      title: event.title || mkt.question || mkt.title || eventSlug,
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

/**
 * Direct DFlow API fallback for Kalshi markets tokenized on Solana.
 * DFlow tickers map 1:1 to Kalshi tickers.
 */
/**
 * Direct Limitless API fallback for markets not found in Spredd.
 * Uses Limitless's REST API to resolve market slugs directly.
 */
export async function getLimitlessMarket(slug: string): Promise<Market | null> {
  try {
    const res = await fetch(
      `https://api.limitless.exchange/markets/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return null;

    const data = await res.json();

    const prices = data.prices || [];
    const probability = prices.length > 0 ? parseFloat(prices[0]) : 0;

    return {
      id: `limitless-${data.address || slug}`,
      slug: data.slug || slug,
      title: data.title || slug,
      description: data.description || undefined,
      probability,
      volume: parseFloat(data.volume || '0'),
      volume24h: undefined,
      platform: 'limitless',
      category: data.categories?.[0]?.name || undefined,
      endDate: data.expirationDate || undefined,
      url: `https://limitless.exchange/markets/${data.slug || slug}`,
    };
  } catch (error) {
    console.error('Limitless API lookup failed:', error);
    return null;
  }
}

/**
 * Search Limitless markets by semantic similarity.
 */
export async function searchLimitlessMarkets(query: string): Promise<Market[]> {
  try {
    const res = await fetch(
      `https://api.limitless.exchange/markets/search?query=${encodeURIComponent(query)}&limit=3`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((m: any) => {
      const prices = m.prices || [];
      return {
        id: `limitless-${m.address || m.slug}`,
        slug: m.slug || '',
        title: m.title || '',
        description: m.description || undefined,
        probability: prices.length > 0 ? parseFloat(prices[0]) : 0,
        volume: parseFloat(m.volume || '0'),
        platform: 'limitless' as const,
        category: m.categories?.[0]?.name || undefined,
        endDate: m.expirationDate || undefined,
        url: `https://limitless.exchange/markets/${m.slug}`,
      };
    });
  } catch (error) {
    console.error('Limitless search failed:', error);
    return [];
  }
}

export async function getDFlowMarket(ticker: string): Promise<Market | null> {
  const DFLOW_API = 'https://dev-prediction-markets-api.dflow.net';
  const apiKey = process.env.DFLOW_API_KEY || '';

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const res = await fetch(`${DFLOW_API}/api/v1/market/${encodeURIComponent(ticker)}`, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const mkt = data.market || data;

    const yesBid = parseFloat(mkt.yesBid || '0');

    return {
      id: `dflow-${mkt.ticker || ticker}`,
      slug: (mkt.ticker || ticker).toLowerCase(),
      title: mkt.title || ticker,
      description: mkt.rulesPrimary || undefined,
      probability: yesBid,
      volume: parseInt(mkt.volume || '0', 10),
      volume24h: mkt.volume24hFp ? parseFloat(mkt.volume24hFp) : undefined,
      platform: 'kalshi',
      category: undefined,
      endDate: mkt.closeTime ? new Date(mkt.closeTime * 1000).toISOString().slice(0, 10) : undefined,
      url: `https://dflow.net/prediction/${mkt.ticker || ticker}`,
    };
  } catch (error) {
    console.error('DFlow API lookup failed:', error);
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

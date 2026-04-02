import { Market, SpreddMarketsResponse } from './types';

const SPREDD_API_URL = process.env.SPREDD_API_URL || 'https://api.spredd.com';
const SPREDD_API_KEY = process.env.SPREDD_API_KEY || '';

/**
 * Spredd API client
 * 
 * Update the endpoint paths below to match your actual Spredd API.
 * The client falls back to mock data when the API is unreachable,
 * so you can develop the UI before the API is fully wired.
 */

async function spreddFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${SPREDD_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(SPREDD_API_KEY && { Authorization: `Bearer ${SPREDD_API_KEY}` }),
        ...options?.headers,
      },
      next: { revalidate: 60 }, // Cache for 60s
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

/**
 * Fetch trending / high-volume markets
 * 
 * TODO: Update this endpoint to match your Spredd API.
 * Possible endpoints:
 *   /v1/markets?sort=volume&limit=20
 *   /v1/markets/trending
 *   /v1/aggregated/markets?orderBy=volume24h
 */
export async function getTrendingMarkets(): Promise<Market[]> {
  const data = await spreddFetch<SpreddMarketsResponse>(
    '/v1/markets?sort=volume&order=desc&limit=20'
  );

  if (data?.markets) {
    return data.markets;
  }

  // Fallback to mock data for development
  console.log('Using mock market data (Spredd API not available)');
  return getMockMarkets();
}

/**
 * Fetch a single market by slug or ID
 * 
 * TODO: Update endpoint to match your Spredd API.
 */
export async function getMarket(slug: string): Promise<Market | null> {
  const data = await spreddFetch<Market>(`/v1/markets/${slug}`);

  if (data) {
    return data;
  }

  // Fallback to mock
  const mocks = getMockMarkets();
  return mocks.find((m) => m.slug === slug) || null;
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

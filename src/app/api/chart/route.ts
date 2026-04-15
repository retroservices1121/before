import { NextRequest, NextResponse } from 'next/server';
import { isCryptoMarket } from '@/lib/tokens';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Map common market title keywords to CoinGecko coin IDs
const COINGECKO_ID_MAP: Record<string, string> = {
  bitcoin: 'bitcoin', btc: 'bitcoin',
  ethereum: 'ethereum', eth: 'ethereum',
  solana: 'solana', sol: 'solana',
  dogecoin: 'dogecoin', doge: 'dogecoin',
  xrp: 'ripple', ripple: 'ripple',
  cardano: 'cardano', ada: 'cardano',
  avalanche: 'avalanche-2', avax: 'avalanche-2',
  polygon: 'matic-network', matic: 'matic-network',
  chainlink: 'chainlink', link: 'chainlink',
  litecoin: 'litecoin', ltc: 'litecoin',
  polkadot: 'polkadot', dot: 'polkadot',
  bnb: 'binancecoin', binance: 'binancecoin',
  sui: 'sui', aptos: 'aptos',
  near: 'near', cosmos: 'cosmos', atom: 'cosmos',
  toncoin: 'the-open-network', ton: 'the-open-network',
  tron: 'tron', trx: 'tron',
  shiba: 'shiba-inu', shib: 'shiba-inu',
  pepe: 'pepe',
  uniswap: 'uniswap', uni: 'uniswap',
  aave: 'aave',
  arbitrum: 'arbitrum', arb: 'arbitrum',
  optimism: 'optimism', op: 'optimism',
  celestia: 'celestia', tia: 'celestia',
  jupiter: 'jupiter-exchange-solana', jup: 'jupiter-exchange-solana',
  render: 'render-token', rndr: 'render-token',
  injective: 'injective-protocol', inj: 'injective-protocol',
  sei: 'sei-network',
  stacks: 'blockstack', stx: 'blockstack',
  mantle: 'mantle', mnt: 'mantle',
  gold: 'tether-gold', xaut: 'tether-gold',
};

function extractCoinGeckoId(title: string): string | null {
  const lower = title.toLowerCase();
  // Sort by keyword length descending so "solana" matches before "sol"
  const sorted = Object.entries(COINGECKO_ID_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, coinId] of sorted) {
    const idx = lower.indexOf(keyword);
    if (idx === -1) continue;
    // Check word boundaries manually to avoid "sol" matching "resolution"
    const before = idx === 0 || /\W/.test(lower[idx - 1]);
    const after = idx + keyword.length >= lower.length || /\W/.test(lower[idx + keyword.length]);
    if (before && after) return coinId;
  }
  return null;
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title');
  const category = request.nextUrl.searchParams.get('category');
  const days = Math.min(parseInt(request.nextUrl.searchParams.get('days') || '30'), 90);

  if (!title) {
    return NextResponse.json(
      { error: 'Missing title parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!isCryptoMarket(title, category || undefined)) {
    return NextResponse.json(
      { error: 'Not a crypto/financial market' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const coinId = extractCoinGeckoId(title);
  if (!coinId) {
    return NextResponse.json(
      { error: 'Could not identify asset from title' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    if (res.status === 429) {
      return NextResponse.json(
        { error: 'CoinGecko rate limit, try again shortly' },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `CoinGecko returned ${res.status}` },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();

    // CoinGecko returns { prices: [[ts, price], ...], total_volumes: [[ts, vol], ...] }
    const prices: [number, number][] = data.prices || [];
    const volumes: [number, number][] = data.total_volumes || [];

    // Build a volume lookup by day (rounded to start of day)
    const volumeByDay = new Map<string, number>();
    for (const [ts, vol] of volumes) {
      const day = new Date(ts).toISOString().slice(0, 10);
      volumeByDay.set(day, vol);
    }

    // Deduplicate by day — CoinGecko returns a duplicate entry for today
    const seenDays = new Set<string>();
    const dedupedPrices = prices.filter(([ts]) => {
      const day = new Date(ts).toISOString().slice(0, 10);
      if (seenDays.has(day)) return false;
      seenDays.add(day);
      return true;
    });

    // Convert to candle-like format for the chart component
    const candles = dedupedPrices.map(([ts, price], i) => {
      const day = new Date(ts).toISOString().slice(0, 10);
      const prevPrice = i > 0 ? dedupedPrices[i - 1][1] : price;
      return {
        time: Math.floor(ts / 1000),
        open: prevPrice,
        high: Math.max(prevPrice, price),
        low: Math.min(prevPrice, price),
        close: price,
        volume: volumeByDay.get(day) || 0,
      };
    });

    return NextResponse.json(
      { assetId: coinId, interval: '1D', candles },
      {
        headers: {
          ...CORS_HEADERS,
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

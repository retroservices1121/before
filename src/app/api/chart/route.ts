import { NextRequest, NextResponse } from 'next/server';
import { isCryptoMarket } from '@/lib/tokens';

const TOKENS_API_URL = process.env.TOKENS_API_URL || 'https://api.tokens.xyz';
const TOKENS_API_KEY = process.env.TOKENS_API_KEY || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Map common names to Tokens API asset IDs
const ASSET_ID_MAP: Record<string, string> = {
  bitcoin: 'btc', btc: 'btc',
  ethereum: 'eth', eth: 'eth',
  solana: 'solana', sol: 'solana',
  dogecoin: 'doge', doge: 'doge',
  xrp: 'xrp', ripple: 'xrp',
  cardano: 'ada', ada: 'ada',
  avalanche: 'avax', avax: 'avax',
  polygon: 'matic', matic: 'matic',
  chainlink: 'link', link: 'link',
  litecoin: 'ltc', ltc: 'ltc',
  polkadot: 'dot', dot: 'dot',
  bnb: 'bnb', sui: 'sui', aptos: 'aptos',
  near: 'near', cosmos: 'atom', atom: 'atom',
};

function extractAssetId(title: string): string | null {
  const lower = title.toLowerCase();
  for (const [keyword, assetId] of Object.entries(ASSET_ID_MAP)) {
    if (lower.includes(keyword)) return assetId;
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

  const assetId = extractAssetId(title);
  if (!assetId) {
    return NextResponse.json(
      { error: 'Could not identify asset from title' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  if (!TOKENS_API_KEY) {
    return NextResponse.json(
      { error: 'Tokens API not configured' },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  try {
    const from = Math.floor(Date.now() / 1000) - days * 86400;
    const res = await fetch(
      `${TOKENS_API_URL}/v1/assets/${assetId}/ohlcv?interval=1D&from=${from}`,
      {
        headers: {
          'x-api-key': TOKENS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Tokens API returned ${res.status}` },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const data = await res.json();
    const candles = (data?.candles || []).map((c: any) => ({
      time: c.time || c.timestamp || c.t,
      open: c.open || c.o,
      high: c.high || c.h,
      low: c.low || c.l,
      close: c.close || c.c,
      volume: c.volume || c.v,
    }));

    return NextResponse.json(
      { assetId, interval: '1D', candles },
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

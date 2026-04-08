import { NextRequest, NextResponse } from 'next/server';
import { getMarket } from '@/lib/spredd';
import { generateContextBrief } from '@/lib/ai';
import { ContextBrief } from '@/lib/types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// In-memory brief cache — avoids re-running Gemini for the same market
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const briefCache = new Map<string, { brief: ContextBrief; cachedAt: number }>();

function getCachedBrief(key: string): ContextBrief | null {
  const entry = briefCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL) {
    briefCache.delete(key);
    return null;
  }
  return entry.brief;
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Check cache first
  const cached = getCachedBrief(slug);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      },
    });
  }

  const market = await getMarket(slug);

  if (!market) {
    return NextResponse.json(
      { error: 'Market not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const brief = await generateContextBrief(market);

  // Store in cache
  briefCache.set(slug, { brief, cachedAt: Date.now() });

  return NextResponse.json(brief, {
    headers: {
      ...CORS_HEADERS,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Cache': 'MISS',
    },
  });
}

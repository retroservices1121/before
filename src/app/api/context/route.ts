import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getMarket, searchMarkets } from '@/lib/spredd';
import { generateContextBrief } from '@/lib/ai';
import { getSession } from '@/lib/auth';
import { checkRateLimit, recordUsage, BETA_MODE } from '@/lib/rate-limit';
import { ContextBrief } from '@/lib/types';
import { slugify } from '@/lib/utils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  const title = request.nextUrl.searchParams.get('title');

  if (!slug && !title) {
    return NextResponse.json(
      { error: 'Missing slug or title parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const cacheKey = slug || slugify(title || '');

  // Check cache first — cached briefs are free, no usage counted
  const cached = getCachedBrief(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'HIT',
      },
    });
  }

  // Identify the user
  const session = await getSession(request);
  const userId = session ? session.userId : `anon:${getClientIp(request)}`;
  const tier = session ? session.tier : 'anon';

  // Rate limit check (only on cache miss)
  const rateLimit = await checkRateLimit(userId, tier);

  if (!rateLimit.allowed) {
    const upgradeMessages: Record<string, string> = BETA_MODE
      ? { anon: 'Beta limit: 2 free briefs per day. Come back tomorrow!', lite: 'Beta limit: 2 free briefs per day. Come back tomorrow!', pro: 'Beta limit: 2 free briefs per day. Come back tomorrow!' }
      : { anon: 'Go Lite for 5 briefs/day at $4.99/mo, or Pro for unlimited at $9.99/mo', lite: 'Upgrade to Pro for unlimited briefs at $9.99/mo' };

    return NextResponse.json(
      {
        error: 'Daily brief limit reached',
        limit: rateLimit.limit,
        remaining: 0,
        tier,
        upgrade: upgradeMessages[tier] || upgradeMessages.anon,
      },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  // Try to find the market: slug lookup first, then title search
  let market = slug ? await getMarket(slug) : null;

  if (!market && title) {
    const results = await searchMarkets(title);
    if (results && results.length > 0) {
      market = results[0];
    }
  }

  if (!market && slug && !title) {
    // Try searching with the slug as keywords
    const searchTerm = slug.replace(/-/g, ' ');
    const results = await searchMarkets(searchTerm);
    if (results && results.length > 0) {
      market = results[0];
    }
  }

  if (!market) {
    return NextResponse.json(
      { error: 'Market not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const brief = await generateContextBrief(market);

  // Record usage and cache
  await recordUsage(userId);
  briefCache.set(cacheKey, { brief, cachedAt: Date.now() });

  const remaining = rateLimit.remaining - 1;

  return NextResponse.json(
    { ...brief, _usage: { remaining, limit: rateLimit.limit, tier } },
    {
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS',
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(remaining),
      },
    }
  );
}

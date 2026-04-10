import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getMarket, searchMarkets, getPolymarketBySlug } from '@/lib/spredd';
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
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
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
  const ticker = request.nextUrl.searchParams.get('ticker');
  const platform = request.nextUrl.searchParams.get('platform');
  const eventSlug = request.nextUrl.searchParams.get('eventSlug');

  if (!slug && !title && !ticker) {
    return NextResponse.json(
      { error: 'Missing slug or title parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const cacheKey = ticker ? `${platform || 'unknown'}:${ticker}` : (slug || slugify(title || ''));
  const refresh = request.nextUrl.searchParams.get('refresh') === '1';

  // Check cache first — cached briefs are free, no usage counted
  if (refresh) {
    briefCache.delete(cacheKey);
  }
  const cached = !refresh ? getCachedBrief(cacheKey) : null;
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

  // Try to find the market using all available signals
  let market = null;

  // 1. Direct Spredd lookup by platform + ticker (most precise)
  if (ticker && platform) {
    market = await getMarket(`--${platform}--${encodeURIComponent(ticker)}`);
    if (!market) {
      market = await getMarket(`--${platform}--${encodeURIComponent(ticker.toLowerCase())}`);
    }
    // If ticker lookup fails, DON'T fuzzy search with ticker keywords.
    // Ticker strings like "KXHIGHNY-26APR10" produce garbage search results.
    // Fall through to synthetic market creation below.
  }

  // 2. Direct slug lookup
  if (!market && slug) {
    market = await getMarket(slug);
  }

  // 3. Polymarket event slug via their API
  if (!market && eventSlug) {
    market = await getPolymarketBySlug(eventSlug);
  }

  // 4. Search by title (only if no ticker - ticker markets use synthetic fallback)
  if (!market && title && !ticker) {
    const results = await searchMarkets(title);
    if (results && results.length > 0) {
      market = results[0];
    }
  }

  // 5. Search by slug keywords (only if no title and no ticker)
  if (!market && slug && !title && !ticker) {
    const searchTerm = slug.replace(/-/g, ' ');
    const results = await searchMarkets(searchTerm);
    if (results && results.length > 0) {
      market = results[0];
    }
  }

  // If no market found in Spredd, create a synthetic market from available info
  // and generate a brief anyway using Gemini + web context
  if (!market && (title || slug)) {
    const marketTitle = title || (slug ? slug.replace(/-/g, ' ') : 'Unknown Market');
    market = {
      id: `ext-${cacheKey}`,
      slug: cacheKey,
      title: marketTitle,
      probability: 0,
      volume: 0,
      platform: (platform as any) || 'aggregate',
      category: undefined,
      url: undefined,
    };
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

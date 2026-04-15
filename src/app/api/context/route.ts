import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getMarket, searchMarkets, getPolymarketBySlug, getDFlowMarket, getLimitlessMarket, searchLimitlessMarkets, getKalshiEvent, searchKalshiEvents } from '@/lib/spredd';
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

  const cacheKey = ticker
    ? `${platform || 'unknown'}:${ticker}`
    : (platform && title)
      ? `${platform}:${slugify(title)}`
      : (slug || slugify(title || ''));
  const refresh = request.nextUrl.searchParams.get('refresh') === '1';

  // Check cache first — cached briefs are free, no usage counted
  if (refresh) {
    // Clear ALL cache entries to avoid stale briefs from old cache keys
    briefCache.clear();
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

  if (ticker && platform) {
    // TICKER PATH: direct lookups only, no fuzzy search
    // 1a. Spredd by platform + ticker
    market = await getMarket(`--${platform}--${encodeURIComponent(ticker)}`);
    if (!market) {
      market = await getMarket(`--${platform}--${encodeURIComponent(ticker.toLowerCase())}`);
    }
    // 1b. Kalshi direct API by ticker
    if (!market) {
      market = await getKalshiEvent(ticker);
    }
    // 1c. DFlow API (for Kalshi markets on Solana)
    if (!market) {
      market = await getDFlowMarket(ticker);
    }
    // 1d. If all ticker lookups fail, go straight to synthetic market.
    // Do NOT search Spredd by keywords - ticker searches return wrong results.
  } else {
    // NON-TICKER PATH: slug, platform API, and search fallbacks

    // 2. Direct slug lookup via Spredd (only if slug has platform+id format)
    if (slug && slug.includes('--')) {
      market = await getMarket(slug);
    }

    // 3. Platform-specific API lookups by slug
    if (!market && eventSlug) {
      if (platform === 'limitless') {
        market = await getLimitlessMarket(eventSlug);
      } else if (platform === 'kalshi') {
        market = await getKalshiEvent(eventSlug);
      } else {
        market = await getPolymarketBySlug(eventSlug);
      }
    }

    // 3b. Platform-specific search by title
    if (!market && title && platform === 'limitless') {
      const results = await searchLimitlessMarkets(title);
      if (results.length > 0) market = results[0];
    }
    if (!market && title && platform === 'kalshi') {
      const results = await searchKalshiEvents(title);
      if (results.length > 0) market = results[0];
    }

    // 4. Spredd search by title (more reliable than slug keywords)
    if (!market && title) {
      const results = await searchMarkets(title);
      if (results && results.length > 0) {
        market = results[0];
      }
    }

    // 5. Kalshi search as fallback before slug keywords
    if (!market && title) {
      const kalshiResults = await searchKalshiEvents(title);
      if (kalshiResults.length > 0) market = kalshiResults[0];
    }

    // 6. Spredd search by slug keywords (last resort, only when no title available)
    if (!market && slug && !title) {
      const searchTerm = slug.replace(/-/g, ' ');
      const results = await searchMarkets(searchTerm);
      if (results && results.length > 0) {
        market = results[0];
      }
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

/**
 * The Spread API client
 *
 * Fetches news articles, Substack posts, and tweets correlated
 * with Polymarket price movements. Free, no API key required.
 *
 * Only works for Polymarket markets indexed by The Spread.
 * Falls back gracefully when a market isn't covered.
 */

const SPREAD_API_URL = 'https://spread-api.onrender.com/api';

export interface SpreadArticle {
  title: string;
  source: string;
  link?: string;
  publishedAt?: string;
  correlation: 'up' | 'down' | 'related';
}

export interface SpreadTweet {
  text: string;
  authorHandle: string;
  authorName: string;
  createdAt?: string;
  correlation: 'up' | 'down' | 'related';
  likes?: number;
  retweets?: number;
}

export interface SpreadContext {
  articles: SpreadArticle[];
  tweets: SpreadTweet[];
  fetchedAt: string;
}

/**
 * Fetch correlated news for a Polymarket market using its conditionId.
 * Two-step: resolve conditionId → Spread market ID, then fetch details.
 */
export async function getSpreadContext(conditionId: string): Promise<SpreadContext> {
  try {
    // Step 1: Resolve conditionId to Spread market ID
    const lookupRes = await fetch(`${SPREAD_API_URL}/markets/by-condition/${conditionId}`, {
      next: { revalidate: 300 },
    });

    if (!lookupRes.ok) {
      return emptyContext();
    }

    const lookup = await lookupRes.json();
    const spreadId = lookup?.id;

    if (!spreadId) {
      return emptyContext();
    }

    // Step 2: Fetch full market with correlated content
    const detailRes = await fetch(`${SPREAD_API_URL}/markets/${spreadId}`, {
      next: { revalidate: 300 },
    });

    if (!detailRes.ok) {
      return emptyContext();
    }

    const detail = await detailRes.json();

    const articles: SpreadArticle[] = (detail.articles || []).slice(0, 5).map((a: any) => ({
      title: a.title,
      source: a.source,
      link: a.link,
      publishedAt: a.published_at,
      correlation: a.correlation || 'related',
    }));

    const tweets: SpreadTweet[] = (detail.tweets || []).slice(0, 5).map((t: any) => ({
      text: t.text,
      authorHandle: t.author_handle,
      authorName: t.author_name,
      createdAt: t.created_at,
      correlation: t.correlation || 'related',
      likes: t.likes,
      retweets: t.retweets,
    }));

    return { articles, tweets, fetchedAt: new Date().toISOString() };
  } catch (error) {
    console.error('Spread API fetch failed:', error);
    return emptyContext();
  }
}

/**
 * Format Spread context for the AI prompt.
 */
export function formatSpreadForPrompt(context: SpreadContext): string {
  if (context.articles.length === 0 && context.tweets.length === 0) {
    return '';
  }

  let block = '\n\nCORRELATED NEWS (from The Spread — news matched to price movements):';

  if (context.articles.length > 0) {
    block += '\nArticles:';
    context.articles.forEach((a, i) => {
      const arrow = a.correlation === 'up' ? '↑' : a.correlation === 'down' ? '↓' : '~';
      block += `\n  [${arrow}] ${a.title} (${a.source})${a.publishedAt ? ` — ${a.publishedAt}` : ''}`;
    });
  }

  if (context.tweets.length > 0) {
    block += '\nKey tweets:';
    context.tweets.forEach((t) => {
      const arrow = t.correlation === 'up' ? '↑' : t.correlation === 'down' ? '↓' : '~';
      block += `\n  [${arrow}] @${t.authorHandle}: "${t.text.slice(0, 150)}"`;
    });
  }

  return block;
}

function emptyContext(): SpreadContext {
  return { articles: [], tweets: [], fetchedAt: new Date().toISOString() };
}

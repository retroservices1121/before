/**
 * TinyFish Web Agent API client
 *
 * Uses TinyFish's browser automation to crawl real-time news
 * related to prediction markets. Feeds into the AI context
 * brief generation pipeline.
 *
 * Docs: https://docs.tinyfish.ai/
 */

const TINYFISH_API_URL = process.env.TINYFISH_API_URL || 'https://agent.tinyfish.ai/v1';
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY || '';

export interface WebAgentResult {
  url: string;
  title: string;
  content: string;
  publishedAt?: string;
  source?: string;
}

export interface MarketWebContext {
  articles: WebAgentResult[];
  crawledAt: string;
  query: string;
}

/**
 * Dispatch a TinyFish Web Agent to crawl relevant context
 * for a given prediction market.
 */
export async function crawlMarketContext(
  marketTitle: string,
  category?: string
): Promise<MarketWebContext> {
  const query = buildSearchQuery(marketTitle, category);

  if (!TINYFISH_API_KEY) {
    return fallbackContext(query);
  }

  try {
    const response = await fetch(`${TINYFISH_API_URL}/automation/run-sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TINYFISH_API_KEY,
      },
      body: JSON.stringify({
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        goal: `Find the 5 most recent and relevant news articles about: "${marketTitle}". For each article, extract: the headline/title, the source URL, the publication date, and a 2-3 sentence summary of the key information. Return as a JSON array with fields: title, url, published_at, summary, source.`,
        browser_profile: 'lite',
      }),
    });

    if (!response.ok) {
      console.error(`TinyFish API error: ${response.status}`);
      return fallbackContext(query);
    }

    const articles = await parseSSEResponse(response);

    return {
      articles,
      crawledAt: new Date().toISOString(),
      query,
    };
  } catch (error) {
    console.error('TinyFish crawl failed:', error);
    return fallbackContext(query);
  }
}

/**
 * Parse SSE stream from TinyFish and extract article results.
 */
async function parseSSEResponse(response: Response): Promise<WebAgentResult[]> {
  const text = await response.text();

  // SSE events are separated by double newlines, data lines start with "data: "
  const events = text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => {
      try {
        return JSON.parse(line.slice(6));
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  // Find the COMPLETE event with results
  const complete = events.find(
    (e: any) => e.type === 'COMPLETE' || e.status === 'COMPLETED'
  );

  if (!complete?.result) return [];

  // TinyFish returns result as { result: "...json string..." }
  // or sometimes as a direct object/array
  let results: any[] = [];

  const raw = complete.result.result || complete.result;

  if (typeof raw === 'string') {
    // Extract JSON array from markdown code blocks or raw string
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        results = JSON.parse(jsonMatch[0]);
      } catch {
        return [];
      }
    }
  } else if (Array.isArray(raw)) {
    results = raw;
  }

  return results.map((r: any) => ({
    url: r.url || '',
    title: r.title || r.headline || '',
    content: r.summary || r.content || '',
    publishedAt: r.published_at || r.publishedAt || r.date || undefined,
    source: r.source || extractDomain(r.url),
  }));
}

/**
 * Build an effective search query from a market title.
 */
function buildSearchQuery(title: string, category?: string): string {
  const cleaned = title
    .replace(/^will\s+/i, '')
    .replace(/\s+by\s+(end\s+of\s+)?\d{4}$/i, '')
    .replace(/\s+before\s+.+$/i, '')
    .replace(/\s+in\s+\d{4}$/i, '');

  const categoryHint = category ? ` ${category}` : '';
  return `${cleaned}${categoryHint} latest news`;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

function fallbackContext(query: string): MarketWebContext {
  console.log('Using fallback context (TinyFish API not available)');
  return {
    articles: [],
    crawledAt: new Date().toISOString(),
    query,
  };
}

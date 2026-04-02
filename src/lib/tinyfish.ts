/**
 * TinyFish Web Agent API client
 * 
 * Uses TinyFish's Web Agent to crawl real-time news and data
 * related to prediction markets. This feeds into the AI context
 * brief generation pipeline.
 * 
 * Docs: https://docs.mino.ai/
 * 
 * TODO: Update the endpoint and auth method once you have
 * your accelerator API credits.
 */

const TINYFISH_API_URL = process.env.TINYFISH_API_URL || 'https://api.tinyfish.ai';
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
 * 
 * The agent searches for recent news, data, and analysis
 * related to the market topic, then returns structured results.
 */
export async function crawlMarketContext(
  marketTitle: string,
  category?: string
): Promise<MarketWebContext> {
  // Build a targeted search query from the market title
  const query = buildSearchQuery(marketTitle, category);

  try {
    const response = await fetch(`${TINYFISH_API_URL}/v1/agent/browse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TINYFISH_API_KEY}`,
      },
      body: JSON.stringify({
        task: `Search for the latest news and analysis about: "${marketTitle}". 
               Find 3-5 recent, high-quality articles from reputable sources.
               For each article, extract the title, URL, publication date, 
               and a 2-3 sentence summary of the key information relevant 
               to this prediction market topic.`,
        query,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      console.error(`TinyFish API error: ${response.status}`);
      return fallbackContext(query);
    }

    const data = await response.json();

    return {
      articles: parseAgentResults(data),
      crawledAt: new Date().toISOString(),
      query,
    };
  } catch (error) {
    console.error('TinyFish crawl failed:', error);
    return fallbackContext(query);
  }
}

/**
 * Build an effective search query from a market title.
 * Strips common prediction market phrasing to get the core topic.
 */
function buildSearchQuery(title: string, category?: string): string {
  // Remove common PM framing words
  const cleaned = title
    .replace(/^will\s+/i, '')
    .replace(/\s+by\s+(end\s+of\s+)?\d{4}$/i, '')
    .replace(/\s+before\s+.+$/i, '')
    .replace(/\s+in\s+\d{4}$/i, '');

  const categoryHint = category ? ` ${category}` : '';
  return `${cleaned}${categoryHint} latest news 2026`;
}

/**
 * Parse TinyFish agent response into structured results.
 * 
 * TODO: Update this parser to match the actual TinyFish 
 * Web Agent response format once you have API access.
 */
function parseAgentResults(data: any): WebAgentResult[] {
  // Adapt this based on actual TinyFish response structure
  if (Array.isArray(data?.results)) {
    return data.results.map((r: any) => ({
      url: r.url || '',
      title: r.title || '',
      content: r.content || r.summary || '',
      publishedAt: r.published_at || r.publishedAt || undefined,
      source: r.source || extractDomain(r.url),
    }));
  }

  // If response is a single text block, return as-is
  if (data?.text || data?.content) {
    return [
      {
        url: '',
        title: 'Web Research',
        content: data.text || data.content,
      },
    ];
  }

  return [];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Fallback when TinyFish API is unavailable.
 * Returns empty results so the context brief can still
 * generate from Claude's knowledge alone.
 */
function fallbackContext(query: string): MarketWebContext {
  console.log('Using fallback context (TinyFish API not available)');
  return {
    articles: [],
    crawledAt: new Date().toISOString(),
    query,
  };
}

/**
 * Tokens API client (tokens.xyz)
 * 
 * Optional enrichment layer for crypto-related prediction markets.
 * Provides real-time price data, OHLCV charts, risk scores, and
 * market liquidity data for Solana-based assets.
 * 
 * Docs: https://docs.tokens.xyz/v1/quickstart
 * 
 * This module is only invoked for crypto-category markets.
 * Non-crypto markets skip it entirely.
 */

const TOKENS_API_URL = process.env.TOKENS_API_URL || 'https://api.tokens.xyz';
const TOKENS_API_KEY = process.env.TOKENS_API_KEY || '';

export interface TokenAsset {
  assetId: string;
  name?: string;
  symbol?: string;
  price?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface TokenRisk {
  score?: string;
  level?: string;
  details?: string;
}

export interface TokenOHLCV {
  interval: string;
  candles: {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface CryptoEnrichment {
  asset: TokenAsset | null;
  risk: TokenRisk | null;
  ohlcv: TokenOHLCV | null;
  enrichedAt: string;
}

// Keywords that indicate a market is crypto-related
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'solana',
  'crypto', 'defi', 'nft', 'blockchain', 'web3',
  'stablecoin', 'usdc', 'usdt', 'dogecoin', 'doge', 'xrp',
  'ripple', 'cardano', 'avalanche', 'avax', 'polygon',
  'matic', 'chainlink', 'uniswap', 'aave', 'bnb',
  'litecoin', 'ltc', 'polkadot', 'cosmos',
  'arbitrum', 'sui', 'aptos',
  'meme coin', 'memecoin',
];

// Map common prediction market terms to Tokens API asset IDs
const ASSET_ID_MAP: Record<string, string> = {
  bitcoin: 'btc',
  btc: 'btc',
  ethereum: 'eth',
  eth: 'eth',
  solana: 'solana',
  sol: 'solana',
  dogecoin: 'doge',
  doge: 'doge',
  xrp: 'xrp',
  ripple: 'xrp',
  cardano: 'ada',
  ada: 'ada',
  avalanche: 'avax',
  avax: 'avax',
  polygon: 'matic',
  matic: 'matic',
  chainlink: 'link',
  link: 'link',
  litecoin: 'ltc',
  ltc: 'ltc',
  polkadot: 'dot',
  dot: 'dot',
  near: 'near',
  cosmos: 'atom',
  atom: 'atom',
  bnb: 'bnb',
  sui: 'sui',
  aptos: 'aptos',
};

/**
 * Check if a market title/category is crypto-related.
 */
export function isCryptoMarket(title: string, category?: string): boolean {
  if (category?.toLowerCase() === 'crypto') return true;

  const lower = title.toLowerCase();
  return CRYPTO_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Extract the most likely asset ID from a market title.
 * Returns null if no recognizable asset is found.
 */
function extractAssetId(title: string): string | null {
  const lower = title.toLowerCase();

  for (const [keyword, assetId] of Object.entries(ASSET_ID_MAP)) {
    if (lower.includes(keyword)) {
      return assetId;
    }
  }

  return null;
}

/**
 * Fetch from Tokens API with auth headers.
 */
async function tokensFetch<T>(path: string): Promise<T | null> {
  if (!TOKENS_API_KEY) {
    console.log('Tokens API key not set, skipping enrichment');
    return null;
  }

  try {
    const res = await fetch(`${TOKENS_API_URL}${path}`, {
      headers: {
        'x-api-key': TOKENS_API_KEY,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 120 }, // Cache for 2 minutes
    });

    if (!res.ok) {
      console.error(`Tokens API error: ${res.status} on ${path}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Tokens API fetch failed:', error);
    return null;
  }
}

/**
 * Enrich a crypto-related prediction market with live asset data.
 * 
 * Returns null for non-crypto markets or when the API is unavailable.
 */
export async function enrichCryptoMarket(
  title: string,
  category?: string
): Promise<CryptoEnrichment | null> {
  // Skip non-crypto markets entirely
  if (!isCryptoMarket(title, category)) {
    return null;
  }

  const assetId = extractAssetId(title);

  if (!assetId) {
    // Try searching for the asset
    const searchResult = await searchAsset(title);
    if (!searchResult) return null;
    return enrichByAssetId(searchResult);
  }

  return enrichByAssetId(assetId);
}

/**
 * Search Tokens API for an asset matching the market title.
 */
async function searchAsset(title: string): Promise<string | null> {
  // Extract meaningful search terms from the title
  const words = title.toLowerCase().split(/\s+/);
  const cryptoWord = words.find((w) =>
    CRYPTO_KEYWORDS.some((kw) => w.includes(kw))
  );

  if (!cryptoWord) return null;

  const data = await tokensFetch<any>(
    `/v1/assets/search?q=${encodeURIComponent(cryptoWord)}&limit=1`
  );

  return data?.results?.[0]?.assetId || null;
}

/**
 * Fetch full enrichment data for a known asset ID.
 */
async function enrichByAssetId(assetId: string): Promise<CryptoEnrichment> {
  // Fetch asset details with all include blocks in one call
  const [assetData, riskData, ohlcvData] = await Promise.all([
    tokensFetch<any>(`/v1/assets/${assetId}?include=profile,risk,markets`),
    tokensFetch<any>(`/v1/assets/${assetId}/risk-summary`),
    tokensFetch<any>(`/v1/assets/${assetId}/ohlcv?interval=1D&from=${Math.floor(Date.now() / 1000) - 30 * 86400}`),
  ]);

  // Parse asset data
  let asset: TokenAsset | null = null;
  if (assetData?.asset) {
    const a = assetData.asset;
    const stats = a.stats || {};

    asset = {
      assetId: a.assetId,
      name: a.name,
      symbol: a.symbol,
      price: stats.price,
      priceChange24h: stats.priceChange24hPercent,
      priceChange7d: stats.priceChange7dPercent,
      marketCap: stats.marketCap,
      volume24h: stats.volume24hUSD,
    };
  }

  // Parse risk data
  let risk: TokenRisk | null = null;
  if (riskData?.risk?.ok && riskData.risk.marketScore) {
    const ms = riskData.risk.marketScore;
    risk = {
      score: String(ms.score),
      level: ms.label || ms.grade,
      details: `Grade ${ms.grade}, tone: ${ms.tone}`,
    };
  }

  // Parse OHLCV data
  let ohlcv: TokenOHLCV | null = null;
  if (ohlcvData?.candles && Array.isArray(ohlcvData.candles)) {
    ohlcv = {
      interval: '1D',
      candles: ohlcvData.candles.map((c: any) => ({
        timestamp: c.time || c.timestamp || c.t,
        open: c.open || c.o,
        high: c.high || c.h,
        low: c.low || c.l,
        close: c.close || c.c,
        volume: c.volume || c.v,
      })),
    };
  }

  return {
    asset,
    risk,
    ohlcv,
    enrichedAt: new Date().toISOString(),
  };
}

/**
 * Format crypto enrichment data into a text block
 * suitable for inclusion in an AI context prompt.
 */
export function formatEnrichmentForPrompt(enrichment: CryptoEnrichment): string {
  const parts: string[] = ['LIVE CRYPTO MARKET DATA (via Tokens API):'];

  if (enrichment.asset) {
    const a = enrichment.asset;
    parts.push(`Asset: ${a.name || a.assetId} (${a.symbol || a.assetId})`);
    if (a.price) parts.push(`Current price: $${a.price.toLocaleString()}`);
    if (a.priceChange24h != null) parts.push(`24h change: ${a.priceChange24h > 0 ? '+' : ''}${a.priceChange24h.toFixed(2)}%`);
    if (a.priceChange7d != null) parts.push(`7d change: ${a.priceChange7d > 0 ? '+' : ''}${a.priceChange7d.toFixed(2)}%`);
    if (a.marketCap) parts.push(`Market cap: $${(a.marketCap / 1e9).toFixed(2)}B`);
    if (a.volume24h) parts.push(`24h volume: $${(a.volume24h / 1e6).toFixed(1)}M`);
  }

  if (enrichment.risk) {
    const r = enrichment.risk;
    if (r.level || r.score) {
      parts.push(`Risk assessment: ${r.level || r.score}${r.details ? ` — ${r.details}` : ''}`);
    }
  }

  if (enrichment.ohlcv && enrichment.ohlcv.candles.length > 0) {
    const candles = enrichment.ohlcv.candles;
    const recent = candles.slice(-7);
    const highestHigh = Math.max(...recent.map((c) => c.high));
    const lowestLow = Math.min(...recent.map((c) => c.low));
    const avgVolume = recent.reduce((sum, c) => sum + c.volume, 0) / recent.length;

    parts.push(`7-day range: $${lowestLow.toLocaleString()} — $${highestHigh.toLocaleString()}`);
    parts.push(`Avg daily volume (7d): $${(avgVolume / 1e6).toFixed(1)}M`);

    // Simple trend detection
    if (recent.length >= 2) {
      const firstClose = recent[0].close;
      const lastClose = recent[recent.length - 1].close;
      const trendPct = ((lastClose - firstClose) / firstClose) * 100;
      const trend = trendPct > 2 ? 'uptrend' : trendPct < -2 ? 'downtrend' : 'sideways';
      parts.push(`7-day trend: ${trend} (${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}%)`);
    }
  }

  return parts.join('\n');
}

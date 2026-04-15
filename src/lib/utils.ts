export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}K`;
  }
  return `$${volume}`;
}

export function formatProbability(prob: number): string {
  return `${(prob * 100).toFixed(0)}%`;
}

export function formatPriceChange(change: number | undefined): string {
  if (change === undefined || change === null) return '--';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'polymarket': return 'Polymarket';
    case 'limitless': return 'Limitless';
    case 'kalshi': return 'Kalshi';
    case 'aggregate': return 'Aggregated';
    default: return platform;
  }
}

export function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'polymarket': return 'text-b4e-blue';
    case 'limitless': return 'text-b4e-purple';
    case 'kalshi': return 'text-b4e-amber';
    case 'aggregate': return 'text-b4e-accent';
    default: return 'text-b4e-text-dim';
  }
}

export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'bullish': return 'text-b4e-accent';
    case 'bearish': return 'text-b4e-warm';
    case 'neutral': return 'text-b4e-amber';
    case 'pending': return 'text-b4e-text-muted';
    default: return 'text-b4e-text-dim';
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export interface ParsedMarketUrl {
  platform: 'polymarket' | 'limitless' | 'kalshi';
  eventSlug: string;
  /** Human-readable title derived from the slug */
  title: string;
}

/**
 * Parse a prediction market URL into platform + slug + title.
 * Returns null if the URL doesn't match a known platform.
 *
 * Supported formats:
 *   https://polymarket.com/event/some-event-slug
 *   https://polymarket.com/event/some-event-slug/sub-market
 *   https://limitless.exchange/markets/some-slug
 *   https://kalshi.com/markets/TICKER
 *   https://kalshi.com/markets/TICKER/sub-market
 */
export function parseMarketUrl(raw: string): ParsedMarketUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const segments = url.pathname.split('/').filter(Boolean);

  // Polymarket: /event/<slug>[/<sub>]
  if (url.hostname.includes('polymarket.com') && segments[0] === 'event' && segments[1]) {
    const eventSlug = segments[1];
    const title = eventSlug.replace(/-/g, ' ');
    return { platform: 'polymarket', eventSlug, title };
  }

  // Limitless: /markets/<slug>
  if (url.hostname.includes('limitless.exchange') && segments[0] === 'markets' && segments[1]) {
    const eventSlug = segments[1];
    const title = eventSlug.replace(/-/g, ' ');
    return { platform: 'limitless', eventSlug, title };
  }

  // Kalshi: /markets/<ticker>[/<sub>]
  if (url.hostname.includes('kalshi.com') && segments[0] === 'markets' && segments[1]) {
    const ticker = segments[1];
    const title = ticker.replace(/[-_]/g, ' ');
    return { platform: 'kalshi', eventSlug: ticker, title };
  }

  return null;
}

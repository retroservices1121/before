'use client';

import { useState, FormEvent } from 'react';
import { parseMarketUrl, getPlatformLabel } from '@/lib/utils';
import { ContextBrief } from '@/lib/types';
import ContextBriefComponent from './ContextBrief';
import PaywallGate from './PaywallGate';

export default function MarketUrlLookup() {
  const [url, setUrl] = useState('');
  const [brief, setBrief] = useState<ContextBrief | null>(null);
  const [marketTitle, setMarketTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState<{
    tier: string;
    limit: number;
    upgrade: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    const parsed = parseMarketUrl(url);
    if (!parsed) {
      setError('Unrecognized URL. Paste a link from Polymarket, Limitless, or Kalshi.');
      return;
    }

    setLoading(true);
    setError(null);
    setBrief(null);
    setRateLimited(null);
    setMarketTitle(parsed.title);

    try {
      const params = new URLSearchParams({
        title: parsed.title,
        platform: parsed.platform,
        eventSlug: parsed.eventSlug,
      });
      const res = await fetch(`/api/context?${params.toString()}`);

      if (res.status === 429) {
        const data = await res.json();
        setRateLimited({ tier: data.tier, limit: data.limit, upgrade: data.upgrade });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate brief');
      }

      const data = await res.json();
      setBrief(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setUrl('');
    setBrief(null);
    setMarketTitle(null);
    setError(null);
    setRateLimited(null);
  }

  return (
    <div className="mb-10">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste a Polymarket, Limitless, or Kalshi URL..."
          className="flex-1 bg-b4e-surface border border-b4e-border rounded px-4 py-3 font-mono text-[13px] md:text-[12px] text-b4e-text placeholder:text-b4e-text-muted/50 focus:outline-none focus:border-b4e-accent transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="font-mono text-[11px] md:text-[10px] tracking-[1.5px] uppercase px-5 py-3 rounded bg-b4e-accent text-b4e-bg font-semibold hover:shadow-[0_0_20px_rgba(0,229,159,0.15)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Get Brief'}
        </button>
      </form>

      {error && (
        <p className="font-mono text-[11px] text-b4e-warm mt-2">{error}</p>
      )}

      {/* Results area */}
      {(loading || brief || rateLimited) && (
        <div className="mt-6">
          {/* Market title header */}
          {marketTitle && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl tracking-tight capitalize">{marketTitle}</h2>
              <button
                onClick={handleClear}
                className="font-mono text-[10px] tracking-[1px] text-b4e-text-muted hover:text-b4e-text-dim transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-b4e-surface border border-b4e-border rounded-xl p-8 flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-b4e-border border-t-b4e-accent rounded-full animate-spin" />
              <span className="font-mono text-[11px] text-b4e-text-muted tracking-wide">
                Generating intelligence brief...
              </span>
            </div>
          )}

          {rateLimited && (
            <PaywallGate
              tier={rateLimited.tier}
              limit={rateLimited.limit}
              upgrade={rateLimited.upgrade}
            />
          )}

          {brief && <ContextBriefComponent brief={brief} />}
        </div>
      )}
    </div>
  );
}

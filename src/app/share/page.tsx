'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { parseMarketUrl } from '@/lib/utils';
import { ContextBrief } from '@/lib/types';
import ContextBriefComponent from '@/components/ContextBrief';
import PaywallGate from '@/components/PaywallGate';
import Link from 'next/link';

function ShareContent() {
  const searchParams = useSearchParams();
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

  // Extract URL from share target params
  useEffect(() => {
    const sharedUrl = searchParams.get('url') || '';
    const sharedText = searchParams.get('text') || '';
    const sharedTitle = searchParams.get('title') || '';

    // The shared content might be a URL directly, or text containing a URL
    const urlMatch = (sharedUrl || sharedText || sharedTitle).match(
      /https?:\/\/[^\s]+/
    );
    if (urlMatch) {
      setUrl(urlMatch[0]);
    }
  }, [searchParams]);

  // Auto-generate brief when URL is set from share
  useEffect(() => {
    if (!url) return;

    const parsed = parseMarketUrl(url);
    if (!parsed) {
      setError('Unrecognized URL. Share a link from Polymarket, Limitless, or Kalshi.');
      return;
    }

    setLoading(true);
    setError(null);
    setBrief(null);
    setRateLimited(null);
    setMarketTitle(parsed.title);

    const params = new URLSearchParams({
      title: parsed.title,
      platform: parsed.platform,
      eventSlug: parsed.eventSlug,
    });

    fetch(`/api/context?${params.toString()}`)
      .then(async (res) => {
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
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[1px] text-b4e-text-muted hover:text-b4e-text-dim transition-colors no-underline mb-6"
        >
          &larr; Markets
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-b4e-accent pulse-dot shadow-[0_0_6px_rgba(0,229,159,0.5)]" />
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-b4e-accent">
            Shared Market
          </span>
        </div>

        {marketTitle && (
          <h1 className="font-serif text-2xl md:text-3xl font-normal tracking-tight mb-4 leading-tight capitalize">
            {marketTitle}
          </h1>
        )}

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-b4e-accent hover:underline break-all"
          >
            {url}
          </a>
        )}
      </div>

      {/* States */}
      {!url && !error && (
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-8 text-center">
          <p className="font-mono text-[12px] text-b4e-text-muted mb-2">
            No market URL detected.
          </p>
          <p className="font-mono text-[11px] text-b4e-text-muted">
            Share a market from Polymarket, Limitless, or Kalshi to get a brief.
          </p>
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

      {error && (
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-6">
          <p className="font-mono text-[12px] text-b4e-warm">{error}</p>
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

      {/* Trade link */}
      {brief && url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[1px] px-6 py-3 mt-6 bg-b4e-accent text-b4e-bg font-semibold rounded hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all no-underline"
        >
          Trade this market &rarr;
        </a>
      )}
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="bg-b4e-surface border border-b4e-border rounded-xl p-8 flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-b4e-border border-t-b4e-accent rounded-full animate-spin" />
            <span className="font-mono text-[11px] text-b4e-text-muted tracking-wide">Loading...</span>
          </div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}

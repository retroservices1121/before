'use client';

import { useEffect, useState } from 'react';
import { ContextBrief } from '@/lib/types';
import ContextBriefComponent from './ContextBrief';
import PaywallGate from './PaywallGate';

interface Props {
  slug: string;
  title?: string;
  platform?: string;
}

export default function MarketBriefLoader({ slug, title, platform }: Props) {
  const [brief, setBrief] = useState<ContextBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState<{
    tier: string;
    limit: number;
    upgrade: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrief() {
      setLoading(true);
      setError(null);
      setRateLimited(null);

      try {
        const params = new URLSearchParams({ slug });
        if (title) params.set('title', title);
        if (platform) params.set('platform', platform);
        const res = await fetch(`/api/context?${params.toString()}`);

        if (res.status === 429) {
          const data = await res.json();
          setRateLimited({
            tier: data.tier,
            limit: data.limit,
            upgrade: data.upgrade,
          });
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to load brief`);
        }

        const data = await res.json();
        setBrief(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBrief();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-b4e-surface border border-b4e-border rounded-xl p-8 flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-b4e-border border-t-b4e-accent rounded-full animate-spin" />
        <span className="font-mono text-[11px] text-b4e-text-muted tracking-wide">
          Generating intelligence brief...
        </span>
      </div>
    );
  }

  if (rateLimited) {
    return <PaywallGate tier={rateLimited.tier} limit={rateLimited.limit} upgrade={rateLimited.upgrade} />;
  }

  if (error) {
    return (
      <div className="bg-b4e-surface border border-b4e-border rounded-xl p-6">
        <p className="font-mono text-[12px] text-b4e-warm">{error}</p>
      </div>
    );
  }

  if (brief) {
    return <ContextBriefComponent brief={brief} />;
  }

  return null;
}

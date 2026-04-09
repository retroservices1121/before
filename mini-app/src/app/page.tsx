'use client';

import { useState, useEffect } from 'react';
import { Market } from '@/lib/markets';
import MarketCard from '@/components/MarketCard';
import BriefViewer from '@/components/BriefViewer';
import PaymentProvider from '@/components/PaymentProvider';

const B4E_API = process.env.NEXT_PUBLIC_B4E_API || 'https://b4enews.com';

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${B4E_API}/api/markets`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMarkets(data))
      .catch(() => setMarkets([]))
      .finally(() => setLoading(false));
  }, []);

  if (selectedMarket) {
    return (
      <PaymentProvider>
        <BriefViewer
          market={selectedMarket}
          onBack={() => setSelectedMarket(null)}
        />
      </PaymentProvider>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
            style={{
              animation: 'pulse 2s ease-in-out infinite',
              boxShadow: '0 0 6px rgba(0,229,159,0.5)',
            }}
          />
          <span
            className="text-[10px] tracking-[3px] uppercase text-[var(--accent)]"
            style={{ fontFamily: 'monospace' }}
          >
            Live Markets
          </span>
        </div>
        <h1 className="text-[22px] font-semibold text-[var(--text)] leading-tight mb-1">
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: 'var(--accent)',
              letterSpacing: '2px',
            }}
          >
            before
          </span>
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
          AI intelligence briefs for prediction markets.
          Tap a market to generate a brief.
        </p>
      </div>

      {/* Market list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-6 h-6 mx-auto mb-3 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          <p
            className="text-[11px] text-[var(--text-muted)]"
            style={{ fontFamily: 'monospace' }}
          >
            Loading markets...
          </p>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[13px] text-[var(--text-muted)]">
            No markets available right now.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {markets.map((market) => (
            <MarketCard
              key={market.slug}
              market={market}
              onSelect={setSelectedMarket}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        className="mt-8 text-center text-[10px] text-[var(--text-muted)] pb-4"
        style={{ fontFamily: 'monospace' }}
      >
        Briefs cost $0.50 USDC on Base
      </div>
    </div>
  );
}

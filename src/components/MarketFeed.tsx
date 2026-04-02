'use client';

import { useState } from 'react';
import { Market } from '@/lib/types';
import MarketCard from './MarketCard';

const CATEGORIES = ['All', 'Economics', 'Politics', 'Crypto', 'Technology', 'Markets'] as const;

export default function MarketFeed({ markets }: { markets: Market[] }) {
  const [active, setActive] = useState<string>('All');

  const filtered = active === 'All'
    ? markets
    : markets.filter((m) => m.category?.toLowerCase() === active.toLowerCase());

  return (
    <>
      {/* Category filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`font-mono text-[10px] tracking-[1.5px] uppercase px-4 py-2 rounded border transition-all whitespace-nowrap ${
              cat === active
                ? 'bg-b4e-accent/10 border-b4e-accent text-b4e-accent'
                : 'bg-transparent border-b4e-border text-b4e-text-muted hover:border-b4e-border-accent hover:text-b4e-text-dim'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Markets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px]">
        {filtered.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="font-mono text-b4e-text-muted text-sm">
            {active === 'All'
              ? 'No markets available. Check your Spredd API connection.'
              : `No ${active.toLowerCase()} markets right now.`}
          </p>
        </div>
      )}
    </>
  );
}

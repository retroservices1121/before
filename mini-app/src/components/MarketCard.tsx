'use client';

import { Market } from '@/lib/markets';

interface Props {
  market: Market;
  onSelect: (market: Market) => void;
}

const platformColors: Record<string, { text: string; bg: string }> = {
  polymarket: { text: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  limitless: { text: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  kalshi: { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

function formatProbability(p: number): string {
  return `${Math.round(p * 100)}%`;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

export default function MarketCard({ market, onSelect }: Props) {
  const colors = platformColors[market.platform] || {
    text: '#00e59f',
    bg: 'rgba(0,229,159,0.12)',
  };

  const changePositive = (market.priceChange24h ?? 0) > 0;

  return (
    <button
      onClick={() => onSelect(market)}
      className="w-full text-left bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/30 transition-all active:scale-[0.98]"
    >
      {/* Platform badge */}
      <span
        className="inline-block text-[9px] tracking-[1.5px] uppercase font-semibold px-2 py-0.5 rounded-sm mb-2"
        style={{ color: colors.text, background: colors.bg }}
      >
        {market.platform}
      </span>

      {/* Title */}
      <h3 className="text-[14px] font-medium text-[var(--text)] leading-snug mb-3">
        {market.title}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <span className="text-[20px] font-bold text-[var(--accent)]" style={{ fontFamily: 'monospace' }}>
          {formatProbability(market.probability)}
        </span>

        {market.priceChange24h !== undefined && (
          <span
            className="text-[12px] font-semibold px-2 py-0.5 rounded"
            style={{
              fontFamily: 'monospace',
              color: changePositive ? 'var(--accent)' : 'var(--warm)',
              background: changePositive
                ? 'rgba(0,229,159,0.1)'
                : 'rgba(255,107,107,0.1)',
            }}
          >
            {changePositive ? '+' : ''}
            {(market.priceChange24h * 100).toFixed(1)}%
          </span>
        )}

        <span
          className="text-[11px] text-[var(--text-muted)] ml-auto"
          style={{ fontFamily: 'monospace' }}
        >
          {formatVolume(market.volume)}
        </span>
      </div>
    </button>
  );
}

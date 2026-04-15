'use client';

import { CryptoStats } from '@/lib/types';

function formatUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
}

function formatChange(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export default function CryptoStatsBar({ stats }: { stats: CryptoStats }) {
  const change24h = stats.priceChange24h;
  const change7d = stats.priceChange7d;

  return (
    <div className="mb-6 p-4 bg-b4e-surface border border-b4e-border rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted">
          Live Token Data
        </span>
        <span className="font-mono text-[9px] tracking-[1px] text-b4e-text-muted">
          {stats.name} ({stats.symbol.toUpperCase()})
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center gap-3 md:gap-6 flex-wrap">
        {/* Price */}
        <div>
          <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
            Price
          </div>
          <span className="font-mono text-lg font-bold text-b4e-text">
            ${stats.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Change */}
        {change24h != null && (
          <div>
            <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
              24h
            </div>
            <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded ${
              change24h > 0
                ? 'text-b4e-accent bg-b4e-accent/10'
                : change24h < 0
                ? 'text-b4e-warm bg-b4e-warm/10'
                : 'text-b4e-text-muted'
            }`}>
              {formatChange(change24h)}
            </span>
          </div>
        )}

        {/* 7d Change */}
        {change7d != null && (
          <div>
            <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
              7d
            </div>
            <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded ${
              change7d > 0
                ? 'text-b4e-accent bg-b4e-accent/10'
                : change7d < 0
                ? 'text-b4e-warm bg-b4e-warm/10'
                : 'text-b4e-text-muted'
            }`}>
              {formatChange(change7d)}
            </span>
          </div>
        )}

        {/* Market Cap */}
        {stats.marketCap != null && (
          <div>
            <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
              Mkt Cap
            </div>
            <span className="font-mono text-sm text-b4e-text-dim">
              {formatUsd(stats.marketCap)}
            </span>
          </div>
        )}

        {/* 24h Volume */}
        {stats.volume24h != null && (
          <div>
            <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
              24h Vol
            </div>
            <span className="font-mono text-sm text-b4e-text-dim">
              {formatUsd(stats.volume24h)}
            </span>
          </div>
        )}

        {/* Risk */}
        {stats.riskLevel && (
          <div>
            <div className="font-mono text-[10px] md:text-[8px] tracking-[1.5px] uppercase text-b4e-text-muted mb-0.5">
              Risk
            </div>
            <span className="font-mono text-sm text-b4e-amber">
              {stats.riskLevel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Market } from '@/lib/types';
import {
  formatVolume,
  formatProbability,
  formatPriceChange,
  getPlatformLabel,
  getPlatformColor,
} from '@/lib/utils';

export default function MarketCard({ market }: { market: Market }) {
  const changePositive = (market.priceChange24h ?? 0) > 0;
  const changeColor = changePositive ? 'text-b4e-accent' : 'text-b4e-warm';

  return (
    <Link
      href={`/market/${market.slug}`}
      className="block bg-b4e-surface border-l-2 border-b4e-border hover:border-b4e-accent hover:bg-b4e-surface-2 transition-all duration-300 p-6 no-underline group"
    >
      {/* Top row: platform + category */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-[9px] tracking-[1.5px] uppercase font-semibold px-2 py-0.5 rounded-sm ${
              market.platform === 'polymarket'
                ? 'text-b4e-blue bg-b4e-blue/10'
                : market.platform === 'limitless'
                ? 'text-b4e-purple bg-b4e-purple/10'
                : market.platform === 'kalshi'
                ? 'text-b4e-amber bg-b4e-amber/10'
                : 'text-b4e-accent bg-b4e-accent/10'
            }`}
          >
            {getPlatformLabel(market.platform)}
          </span>
          {market.category && (
            <span className="font-mono text-[9px] tracking-[1px] uppercase text-b4e-text-muted">
              {market.category}
            </span>
          )}
        </div>
        {market.volume24h && (
          <span className="font-mono text-[10px] text-b4e-text-muted">
            24h vol: {formatVolume(market.volume24h)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-sans text-[15px] font-medium text-b4e-text mb-4 leading-snug group-hover:text-white transition-colors">
        {market.title}
      </h3>

      {/* Bottom row: probability + change + total volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Probability */}
          <span className="font-mono text-2xl font-bold text-b4e-accent">
            {formatProbability(market.probability)}
          </span>
          {/* 24h change */}
          {market.priceChange24h !== undefined && (
            <span className={`font-mono text-xs font-medium ${changeColor}`}>
              {formatPriceChange(market.priceChange24h)}
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-b4e-text-muted">
          {formatVolume(market.volume)} vol
        </span>
      </div>

      {/* Probability bar */}
      <div className="mt-3 h-[3px] bg-b4e-border rounded-full overflow-hidden">
        <div
          className="h-full bg-b4e-accent rounded-full transition-all duration-700"
          style={{ width: `${market.probability * 100}%` }}
        />
      </div>
    </Link>
  );
}

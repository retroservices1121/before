import { getTrendingMarkets } from '@/lib/spredd';
import MarketFeed from '@/components/MarketFeed';
import MarketUrlLookup from '@/components/MarketUrlLookup';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const markets = await getTrendingMarkets();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-b4e-accent pulse-dot shadow-[0_0_6px_rgba(0,229,159,0.5)]" />
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-b4e-accent">
            Live Markets
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight mb-3">
          Trending Markets
        </h1>
        <p className="text-b4e-text-dim text-[14px] md:text-[16px] max-w-xl leading-relaxed">
          High-volume prediction markets across Polymarket, Limitless, and Kalshi.
          Paste a market URL or click any market for an AI-generated context brief.
        </p>
      </div>

      {/* URL lookup */}
      <MarketUrlLookup />

      <MarketFeed markets={markets} />
    </div>
  );
}

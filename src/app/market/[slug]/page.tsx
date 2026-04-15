import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getMarket } from '@/lib/spredd';
import MarketBriefLoader from '@/components/MarketBriefLoader';
import PriceChart from '@/components/PriceChart';
import {
  formatVolume,
  formatProbability,
  formatPriceChange,
  getPlatformLabel,
  slugify,
} from '@/lib/utils';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://b4enews.com';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const market = await getMarket(params.slug);
  if (!market) return {};

  const ogImageParams = new URLSearchParams({
    title: market.title,
    probability: formatProbability(market.probability),
    platform: market.platform,
    volume: formatVolume(market.volume),
  });
  if (market.outcomes && Object.keys(market.outcomes).length >= 3) {
    ogImageParams.set('outcomes', JSON.stringify(market.outcomes));
  }
  const ogImageUrl = `${APP_URL}/api/brief-image?${ogImageParams.toString()}`;

  return {
    title: `${market.title} — before`,
    description: `AI intelligence brief for "${market.title}" at ${formatProbability(market.probability)} probability.`,
    openGraph: {
      title: market.title,
      description: `${formatProbability(market.probability)} probability — AI intelligence brief by before`,
      images: [{ url: ogImageUrl, width: 600, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: market.title,
      description: `${formatProbability(market.probability)} probability — AI intelligence brief by before`,
      images: [ogImageUrl],
    },
  };
}

export default async function MarketPage({ params }: PageProps) {
  const market = await getMarket(params.slug);

  if (!market) {
    notFound();
  }

  const changePositive = (market.priceChange24h ?? 0) > 0;
  const changeColor = changePositive ? 'text-b4e-accent' : 'text-b4e-warm';
  const changeBg = changePositive ? 'bg-b4e-accent/10' : 'bg-b4e-warm/10';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[1px] text-b4e-text-muted hover:text-b4e-text-dim transition-colors no-underline mb-8"
      >
        &larr; Back to markets
      </Link>

      {/* Market header */}
      <div className="mb-8">
        {/* Platform + category */}
        <div className="flex items-center gap-3 mb-4">
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
          {market.endDate && (
            <span className="font-mono text-[9px] tracking-[1px] text-b4e-text-muted">
              Resolves {market.endDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-tight mb-6 leading-tight">
          {market.title}
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-6 flex-wrap">
          {/* Probability */}
          <div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-1">
              Probability
            </div>
            <span className="font-mono text-4xl font-bold text-b4e-accent">
              {formatProbability(market.probability)}
            </span>
          </div>

          {/* 24h change */}
          {market.priceChange24h !== undefined && (
            <div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-1">
                24h Change
              </div>
              <span
                className={`font-mono text-lg font-semibold px-3 py-1 rounded ${changeColor} ${changeBg}`}
              >
                {formatPriceChange(market.priceChange24h)}
              </span>
            </div>
          )}

          {/* Volume */}
          <div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-1">
              Total Volume
            </div>
            <span className="font-mono text-lg text-b4e-text">
              {formatVolume(market.volume)}
            </span>
          </div>

          {/* 24h Volume */}
          {market.volume24h && (
            <div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-1">
                24h Volume
              </div>
              <span className="font-mono text-lg text-b4e-text-dim">
                {formatVolume(market.volume24h)}
              </span>
            </div>
          )}
        </div>

        {/* Probability bar */}
        <div className="mt-6 h-1 bg-b4e-border rounded-full overflow-hidden">
          <div
            className="h-full bg-b4e-accent rounded-full transition-all duration-700"
            style={{ width: `${market.probability * 100}%` }}
          />
        </div>
      </div>

      {/* Description */}
      {market.description && (
        <div className="mb-8 p-5 bg-b4e-surface border border-b4e-border rounded-xl">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
            Market Description
          </div>
          <p className="text-[14px] leading-[1.75] text-b4e-text-dim">
            {market.description}
          </p>
        </div>
      )}

      {/* Price chart for crypto/financial markets */}
      <PriceChart title={market.title} category={market.category} />

      {/* AI Context Brief — loaded client-side with rate limiting */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-b4e-accent pulse-dot shadow-[0_0_6px_rgba(0,229,159,0.5)]" />
          <span className="font-mono text-[10px] tracking-[3px] uppercase text-b4e-accent">
            Before Intelligence Brief
          </span>
        </div>
        <MarketBriefLoader slug={params.slug} title={market.title} platform={market.platform} />
      </div>

      {/* Trade link */}
      {market.url && (
        <a
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[1px] px-6 py-3 bg-b4e-accent text-b4e-bg font-semibold rounded hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all no-underline"
        >
          Trade this market &rarr;
        </a>
      )}
    </div>
  );
}

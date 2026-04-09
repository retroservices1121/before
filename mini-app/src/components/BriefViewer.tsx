'use client';

import { useState, useCallback } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { usePayment } from './PaymentProvider';
import { Market, getTradeUrl } from '@/lib/markets';

interface Brief {
  summary: string;
  keyFactors: Array<{
    name: string;
    detail?: string;
    sentiment: string;
  }>;
  historicalBaseRate?: string;
  upcomingCatalysts?: string[];
  generatedAt?: string;
}

interface Props {
  market: Market;
  onBack: () => void;
}

const sentimentColors: Record<string, string> = {
  bullish: 'var(--accent)',
  bearish: 'var(--warm)',
  neutral: 'var(--amber)',
  pending: 'var(--text-muted)',
};

export default function BriefViewer({ market, onBack }: Props) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithPayment, ready } = usePayment();
  const { sdk } = useMiniKit();

  const loadBrief = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const slug = market.slug;
      const res = await fetchWithPayment(`/api/context?slug=${encodeURIComponent(slug)}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load brief');
      }

      const data = await res.json();
      setBrief(data);
    } catch (err: any) {
      if (err.message === 'Wallet not connected') {
        setError('Connect your wallet to pay for briefs');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [market.slug, fetchWithPayment]);

  function handleTrade() {
    const url = getTradeUrl(market);
    if (sdk) {
      sdk.actions.openUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }

  const changePositive = (market.priceChange24h ?? 0) > 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border)]">
        <button
          onClick={onBack}
          className="text-[11px] text-[var(--text-muted)] mb-3 block"
          style={{ fontFamily: 'monospace' }}
        >
          &larr; Back
        </button>

        <h1 className="text-[18px] font-semibold text-[var(--text)] leading-snug mb-3">
          {market.title}
        </h1>

        <div className="flex items-center gap-4">
          <span
            className="text-[28px] font-bold text-[var(--accent)]"
            style={{ fontFamily: 'monospace' }}
          >
            {Math.round(market.probability * 100)}%
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
        </div>
      </div>

      {/* Brief section */}
      <div className="flex-1 px-4 py-4">
        {!brief && !loading && !error && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-3">
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
                Intelligence Brief
              </span>
            </div>

            <p className="text-[13px] text-[var(--text-muted)] mb-4">
              Get an AI-generated analysis of this market.
            </p>

            <button
              onClick={loadBrief}
              disabled={!ready}
              className="text-[12px] tracking-[1px] px-6 py-3 bg-[var(--accent)] text-[var(--bg)] font-semibold rounded-lg disabled:opacity-50 active:scale-[0.97] transition-transform"
              style={{ fontFamily: 'monospace' }}
            >
              {ready ? 'Generate Brief — $0.50' : 'Connect wallet to continue'}
            </button>

            <p
              className="mt-3 text-[10px] text-[var(--text-muted)]"
              style={{ fontFamily: 'monospace' }}
            >
              Paid via USDC on Base
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 mx-auto mb-3 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            <p
              className="text-[11px] text-[var(--text-muted)]"
              style={{ fontFamily: 'monospace' }}
            >
              Generating brief...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-[12px] text-[var(--warm)] mb-3">{error}</p>
            <button
              onClick={loadBrief}
              className="text-[11px] px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] rounded"
              style={{ fontFamily: 'monospace' }}
            >
              Retry
            </button>
          </div>
        )}

        {brief && (
          <div>
            {/* Summary */}
            <div className="mb-4">
              <div
                className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2"
                style={{ fontFamily: 'monospace' }}
              >
                Why This Probability
              </div>
              <p className="text-[13px] text-[var(--text-dim)] leading-[1.7]">
                {brief.summary}
              </p>
            </div>

            <hr className="border-[var(--border)] my-3" />

            {/* Key Factors */}
            {brief.keyFactors && brief.keyFactors.length > 0 && (
              <div className="mb-4">
                <div
                  className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2"
                  style={{ fontFamily: 'monospace' }}
                >
                  Key Factors
                </div>
                {brief.keyFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 py-1.5"
                  >
                    <div>
                      <div
                        className="text-[11px] text-[var(--text-dim)]"
                        style={{ fontFamily: 'monospace' }}
                      >
                        {factor.name}
                      </div>
                      {factor.detail && (
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                          {factor.detail}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold capitalize flex-shrink-0"
                      style={{
                        fontFamily: 'monospace',
                        color: sentimentColors[factor.sentiment] || 'var(--text-muted)',
                      }}
                    >
                      {factor.sentiment}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Historical Base Rate */}
            {brief.historicalBaseRate && (
              <>
                <hr className="border-[var(--border)] my-3" />
                <div className="mb-4">
                  <div
                    className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2"
                    style={{ fontFamily: 'monospace' }}
                  >
                    Historical Base Rate
                  </div>
                  <p className="text-[12px] text-[var(--text-dim)] leading-relaxed">
                    {brief.historicalBaseRate}
                  </p>
                </div>
              </>
            )}

            {/* Upcoming Catalysts */}
            {brief.upcomingCatalysts && brief.upcomingCatalysts.length > 0 && (
              <>
                <hr className="border-[var(--border)] my-3" />
                <div className="mb-4">
                  <div
                    className="text-[9px] tracking-[2px] uppercase text-[var(--text-muted)] mb-2"
                    style={{ fontFamily: 'monospace' }}
                  >
                    Upcoming Catalysts
                  </div>
                  {brief.upcomingCatalysts.map((catalyst, i) => (
                    <div key={i} className="flex items-start gap-2 py-0.5">
                      <span
                        className="text-[11px] text-[var(--accent)] mt-0.5"
                        style={{ fontFamily: 'monospace' }}
                      >
                        &rarr;
                      </span>
                      <span className="text-[12px] text-[var(--text-dim)] leading-snug">
                        {catalyst}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar - trade CTA */}
      {brief && (
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)]">
          <button
            onClick={handleTrade}
            className="w-full text-[12px] tracking-[1px] px-4 py-3 bg-[var(--accent)] text-[var(--bg)] font-semibold rounded-lg active:scale-[0.97] transition-transform"
            style={{ fontFamily: 'monospace' }}
          >
            Trade this market &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

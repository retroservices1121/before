'use client';

import { useState } from 'react';
import { ContextBrief as ContextBriefType } from '@/lib/types';
import { getSentimentColor, timeAgo } from '@/lib/utils';
import CryptoStatsBar from './CryptoStatsBar';

export default function ContextBrief({ brief }: { brief: ContextBriefType }) {
  const [copied, setCopied] = useState(false);

  function handleShareToX() {
    const url = window.location.href;
    const text = 'via @b4e';
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, '_blank', 'width=550,height=420');
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      {/* Crypto stats bar — above the brief card */}
      {brief.cryptoStats && <CryptoStatsBar stats={brief.cryptoStats} />}

      <div className="bg-b4e-surface border border-b4e-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-b4e-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-b4e-accent pulse-dot" />
            <span className="font-mono text-[10px] tracking-[2px] uppercase text-b4e-text-muted">
              AI-Generated Context
            </span>
          </div>
          <span className="font-mono text-[10px] text-b4e-text-muted">
            {timeAgo(brief.generatedAt)}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Summary */}
          <div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
              Why This Probability
            </div>
            <p className="text-[14px] leading-[1.75] text-b4e-text-dim">
              {brief.summary}
            </p>
          </div>

          <hr className="border-b4e-border" />

          {/* Key Factors */}
          <div>
            <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-3">
              Key Factors
            </div>
            <div className="space-y-2">
              {brief.keyFactors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-4 py-1.5"
                >
                  <div className="flex-1">
                    <span className="font-mono text-[12px] text-b4e-text-dim">
                      {factor.name}
                    </span>
                    {factor.detail && (
                      <p className="text-[12px] text-b4e-text-muted mt-0.5 leading-relaxed">
                        {factor.detail}
                      </p>
                    )}
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold capitalize ${getSentimentColor(
                      factor.sentiment
                    )}`}
                  >
                    {factor.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Base Rate */}
          {brief.historicalBaseRate && (
            <>
              <hr className="border-b4e-border" />
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
                  Historical Base Rate
                </div>
                <p className="text-[13px] leading-[1.7] text-b4e-text-dim">
                  {brief.historicalBaseRate}
                </p>
              </div>
            </>
          )}

          {/* Upcoming Catalysts */}
          {brief.upcomingCatalysts && brief.upcomingCatalysts.length > 0 && (
            <>
              <hr className="border-b4e-border" />
              <div>
                <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
                  Upcoming Catalysts
                </div>
                <div className="space-y-1.5">
                  {brief.upcomingCatalysts.map((catalyst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-mono text-b4e-accent text-xs mt-0.5">
                        &rarr;
                      </span>
                      <span className="text-[13px] text-b4e-text-dim leading-relaxed">
                        {catalyst}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Share footer */}
        <div className="px-5 py-3 border-t border-b4e-border flex items-center justify-end gap-3">
          <button
            onClick={handleCopyLink}
            className="font-mono text-[10px] tracking-[1px] text-b4e-text-muted hover:text-b4e-accent transition-colors"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={handleShareToX}
            className="font-mono text-[10px] tracking-[1px] px-3 py-1.5 rounded bg-b4e-accent/10 border border-b4e-accent/25 text-b4e-accent hover:bg-b4e-accent/20 transition-colors"
          >
            Share on X
          </button>
        </div>
      </div>
    </>
  );
}

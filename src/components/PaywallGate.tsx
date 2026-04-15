'use client';

import { useState } from 'react';
import AuthModal from './AuthModal';

interface Props {
  tier: string;
  limit: number;
  upgrade: string;
}

export default function PaywallGate({ tier, limit, upgrade }: Props) {
  const [showAuth, setShowAuth] = useState(false);

  async function handleUpgrade(e: React.MouseEvent<HTMLButtonElement>) {
    const plan = e.currentTarget.getAttribute('data-plan') || 'pro';
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  return (
    <>
      <div className="bg-b4e-surface border border-b4e-border rounded-xl p-8 text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-b4e-amber/10 border border-b4e-amber/30 flex items-center justify-center">
          <span className="font-mono text-b4e-amber text-lg">!</span>
        </div>

        <h3 className="font-mono text-[12px] tracking-[2px] uppercase text-b4e-text-dim mb-2">
          Daily limit reached
        </h3>

        <p className="text-[13px] text-b4e-text-muted mb-6 max-w-sm mx-auto leading-relaxed">
          {upgrade}
        </p>

        {tier === 'anon' ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={handleUpgrade}
              data-plan="lite"
              className="font-mono text-[12px] tracking-[1px] px-5 py-3 bg-b4e-blue/15 border border-b4e-blue/30 text-b4e-blue rounded hover:bg-b4e-blue/25 transition-all"
            >
              Lite — $4.99/mo
            </button>
            <button
              onClick={handleUpgrade}
              data-plan="pro"
              className="font-mono text-[12px] tracking-[1px] px-5 py-3 bg-b4e-accent text-b4e-bg font-semibold rounded hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all"
            >
              Pro — $9.99/mo
            </button>
          </div>
        ) : tier === 'lite' ? (
          <button
            onClick={handleUpgrade}
            data-plan="pro"
            className="font-mono text-[12px] tracking-[1px] px-6 py-3 bg-b4e-accent text-b4e-bg font-semibold rounded hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all"
          >
            Upgrade to Pro — $9.99/mo
          </button>
        ) : null}

        <p className="mt-4 font-mono text-[10px] text-b4e-text-muted">
          {tier === 'anon' ? 'Sign up required' : 'Cancel anytime'}
        </p>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

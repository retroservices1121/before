'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserInfo {
  email: string;
  tier: 'lite' | 'pro';
  apiKey: string;
  usage: { today: number; limit: number | null };
}

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copyApiKey() {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpgrade(e: React.MouseEvent<HTMLButtonElement>) {
    const plan = e.currentTarget.getAttribute('data-plan') || 'pro';
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  async function handleManage() {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-7 h-7 mx-auto border-2 border-b4e-border border-t-b4e-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-mono text-[12px] tracking-[2px] uppercase text-b4e-text-dim mb-4">
          Not signed in
        </h1>
        <Link
          href="/"
          className="font-mono text-[11px] text-b4e-accent no-underline hover:underline"
        >
          &larr; Back to markets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[1px] text-b4e-text-muted hover:text-b4e-text-dim transition-colors no-underline mb-8"
      >
        &larr; Back to markets
      </Link>

      <h1 className="font-serif text-2xl mb-8">Account</h1>

      <div className="space-y-6">
        {/* Email */}
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-5">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
            Email
          </div>
          <p className="font-mono text-[14px] text-b4e-text-dim">{user.email}</p>
        </div>

        {/* Tier */}
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-5">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
            Plan
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`font-mono text-[13px] font-semibold px-3 py-1 rounded ${
                user.tier === 'pro'
                  ? 'bg-b4e-accent/15 text-b4e-accent'
                  : 'bg-b4e-blue/15 text-b4e-blue'
              }`}>
                {user.tier === 'pro' ? 'Pro' : 'Lite'}
              </span>
              <span className="text-[13px] text-b4e-text-muted">
                {user.tier === 'pro'
                  ? 'Unlimited briefs'
                  : `${user.usage.limit} briefs/day`}
              </span>
            </div>

            {user.tier === 'pro' ? (
              <button
                onClick={handleManage}
                className="font-mono text-[11px] text-b4e-text-muted hover:text-b4e-text-dim transition-colors"
              >
                Manage subscription
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                data-plan="pro"
                className="font-mono text-[11px] tracking-[1px] px-4 py-2 bg-b4e-accent text-b4e-bg font-semibold rounded hover:shadow-[0_0_20px_rgba(0,229,159,0.15)] transition-all"
              >
                Upgrade to Pro — $9.99/mo
              </button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-5">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
            Usage Today
          </div>
          <p className="font-mono text-[14px] text-b4e-text-dim">
            {user.usage.today} {user.usage.limit ? `/ ${user.usage.limit}` : ''} briefs generated
          </p>
        </div>

        {/* API Key */}
        <div className="bg-b4e-surface border border-b4e-border rounded-xl p-5">
          <div className="font-mono text-[9px] tracking-[2px] uppercase text-b4e-text-muted mb-2">
            API Key (for Chrome extension)
          </div>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-[12px] text-b4e-text-dim bg-b4e-bg border border-b4e-border rounded px-3 py-2 overflow-x-auto">
              {user.apiKey}
            </code>
            <button
              onClick={copyApiKey}
              className="font-mono text-[10px] tracking-[1px] px-3 py-2 bg-b4e-accent/10 border border-b4e-accent/30 text-b4e-accent rounded hover:bg-b4e-accent/20 transition-colors whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-[10px] text-b4e-text-muted mt-2">
            Paste this into the <span className="font-serif italic text-b4e-text-dim">before</span> Chrome extension settings.
          </p>
        </div>
      </div>
    </div>
  );
}

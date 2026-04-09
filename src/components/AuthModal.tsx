'use client';

import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send code');
      }

      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Capture platform ref from URL for attribution
      const refParam = new URLSearchParams(window.location.search).get('ref') || '';

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, ref: refParam }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid code');
      }

      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-b4e-bg border border-b4e-border rounded-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-b4e-border flex items-center justify-between">
          <span className="font-serif italic text-b4e-accent tracking-[3px]">before</span>
          <button
            onClick={onClose}
            className="font-mono text-b4e-text-muted hover:text-b4e-text text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <h3 className="font-mono text-[11px] tracking-[2px] uppercase text-b4e-text-dim mb-1">
                Sign in
              </h3>
              <p className="text-[13px] text-b4e-text-muted mb-5 leading-relaxed">
                Enter your email and we'll send you a login code.
              </p>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-b4e-surface border border-b4e-border rounded-lg px-4 py-3 font-mono text-[13px] text-b4e-text placeholder:text-b4e-text-muted outline-none focus:border-b4e-accent transition-colors mb-4"
              />

              {error && (
                <p className="font-mono text-[11px] text-b4e-warm mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-mono text-[12px] tracking-[1px] px-4 py-3 bg-b4e-accent text-b4e-bg font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <h3 className="font-mono text-[11px] tracking-[2px] uppercase text-b4e-text-dim mb-1">
                Check your email
              </h3>
              <p className="text-[13px] text-b4e-text-muted mb-5 leading-relaxed">
                We sent a 6-digit code to <span className="text-b4e-text-dim">{email}</span>
              </p>

              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                className="w-full bg-b4e-surface border border-b4e-border rounded-lg px-4 py-3 font-mono text-[20px] text-b4e-accent text-center tracking-[8px] placeholder:text-b4e-text-muted placeholder:tracking-[8px] outline-none focus:border-b4e-accent transition-colors mb-4"
              />

              {error && (
                <p className="font-mono text-[11px] text-b4e-warm mb-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full font-mono text-[12px] tracking-[1px] px-4 py-3 bg-b4e-accent text-b4e-bg font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(0,229,159,0.15)] transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="w-full mt-2 font-mono text-[11px] text-b4e-text-muted hover:text-b4e-text-dim py-2 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

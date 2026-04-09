'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthModal from './AuthModal';

interface UserInfo {
  email: string;
  tier: 'lite' | 'pro';
  usage: { today: number; limit: number | null };
}

export default function UserMenu() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setShowDropdown(false);
    window.location.reload();
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuth(true)}
          className="font-mono text-[10px] tracking-[2px] uppercase text-b4e-text-muted hover:text-b4e-accent transition-colors"
        >
          Sign in
        </button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 font-mono text-[10px] tracking-[1px] text-b4e-text-dim hover:text-b4e-text transition-colors"
      >
        <span className={`px-1.5 py-0.5 rounded text-[8px] tracking-[1px] uppercase font-semibold ${
          user.tier === 'pro'
            ? 'bg-b4e-accent/15 text-b4e-accent'
            : 'bg-b4e-blue/15 text-b4e-blue'
        }`}>
          {user.tier}
        </span>
        <span>{user.email.split('@')[0]}</span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-b4e-bg border border-b4e-border rounded-lg shadow-xl min-w-[180px] overflow-hidden">
            {user.usage.limit !== null && (
              <div className="px-4 py-2.5 border-b border-b4e-border">
                <span className="font-mono text-[9px] tracking-[1px] text-b4e-text-muted">
                  {user.usage.today}/{user.usage.limit} briefs today
                </span>
              </div>
            )}
            <Link
              href="/account"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2.5 font-mono text-[11px] text-b4e-text-dim hover:bg-b4e-surface transition-colors no-underline"
            >
              Account
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 font-mono text-[11px] text-b4e-text-muted hover:bg-b4e-surface transition-colors"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

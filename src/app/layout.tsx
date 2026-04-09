import type { Metadata } from 'next';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';
import './globals.css';

export const metadata: Metadata = {
  title: 'Before — Know Before It Matters',
  description: 'AI-powered market intelligence for prediction markets. Real-time context, discovery, and insights.',
  openGraph: {
    title: 'Before — Know Before It Matters',
    description: 'AI-powered market intelligence for prediction markets.',
    siteName: 'Before',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-xl bg-b4e-bg/85 border-b border-b4e-border">
          <Link
            href="/"
            className="font-serif italic text-lg tracking-[3px] text-b4e-accent no-underline"
          >
            before
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/markets"
              className="font-mono text-[10px] tracking-[2px] uppercase text-b4e-text-muted hover:text-b4e-text-dim transition-colors no-underline"
            >
              Markets
            </Link>
            <a
              href="https://docs.b4enews.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-[2px] uppercase text-b4e-text-muted hover:text-b4e-text-dim transition-colors no-underline"
            >
              Docs
            </a>
            <UserMenu />
          </div>
        </nav>

        {/* Main content */}
        <main className="pt-[72px] min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-b4e-border flex justify-between items-center">
          <span className="font-mono text-[11px] text-b4e-text-muted tracking-wide">
            &copy; 2026 <span className="font-serif italic text-b4e-text-dim">before</span>
          </span>
          <a
            href="https://x.com/b4e"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] text-b4e-text-muted tracking-wide hover:text-b4e-text no-underline transition-colors"
          >
            @b4e
          </a>
        </footer>
      </body>
    </html>
  );
}

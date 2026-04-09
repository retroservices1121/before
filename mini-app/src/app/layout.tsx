import type { Metadata } from 'next';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import './globals.css';

export const metadata: Metadata = {
  title: 'before — Know Before It Matters',
  description: 'AI-powered intelligence briefs for prediction markets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MiniKitProvider>{children}</MiniKitProvider>
      </body>
    </html>
  );
}

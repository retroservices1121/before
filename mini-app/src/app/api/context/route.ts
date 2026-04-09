import { NextRequest, NextResponse } from 'next/server';
import { server, getPaymentConfig } from '@/lib/x402';
import { withX402 } from '@x402/next';

const B4E_API = process.env.B4E_API_URL || 'https://b4enews.com';
const ADMIN_KEY = process.env.B4E_ADMIN_KEY || '';

async function handler(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    );
  }

  // Proxy to the main B4E API with admin key for unlimited access
  const url = `${B4E_API}/api/context?slug=${encodeURIComponent(slug)}`;
  const headers: Record<string, string> = {};
  if (ADMIN_KEY) {
    headers['Authorization'] = `Bearer ${ADMIN_KEY}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: data.error || 'Failed to fetch brief' },
      { status: res.status }
    );
  }

  const brief = await res.json();

  // Strip internal usage data (mini app uses x402, not tier limits)
  delete brief._usage;

  return NextResponse.json(brief);
}

// Wrap with x402 - every brief costs USDC
export const GET = withX402(
  handler,
  {
    accepts: [getPaymentConfig()],
    description: 'AI intelligence brief for a prediction market',
  },
  server
);

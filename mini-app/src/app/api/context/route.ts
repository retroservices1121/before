import { NextRequest, NextResponse } from 'next/server';
import { getBalance, deductCredit } from '@/lib/credits';

const B4E_API = process.env.B4E_API_URL || 'https://b4enews.com';
const ADMIN_KEY = process.env.B4E_ADMIN_KEY || '';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  const address = request.nextUrl.searchParams.get('address');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter' },
      { status: 400 }
    );
  }

  if (!address) {
    return NextResponse.json(
      { error: 'Missing address parameter' },
      { status: 400 }
    );
  }

  // Check credit balance
  const balance = getBalance(address);
  if (balance < 1) {
    return NextResponse.json(
      { error: 'No credits remaining', balance: 0 },
      { status: 402 }
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

  // Brief fetched successfully, deduct the credit
  const deducted = deductCredit(address);
  if (!deducted) {
    console.warn('[Credits] Deduction failed after balance check for', address);
  }

  const brief = await res.json();
  delete brief._usage;

  // Include remaining balance in response
  brief._credits = getBalance(address);

  return NextResponse.json(brief);
}

import { NextRequest, NextResponse } from 'next/server';

// MiniKit webhook handler for notifications and events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[MiniKit Webhook]', body);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

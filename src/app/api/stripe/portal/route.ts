import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { db, initDb } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://before-production.up.railway.app';

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  await initDb();

  const result = await db.execute({
    sql: 'SELECT stripe_customer_id FROM users WHERE id = ?',
    args: [session.userId],
  });

  const customerId = result.rows[0]?.stripe_customer_id as string | undefined;

  if (!customerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  try {
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 });
  }
}

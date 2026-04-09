import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://before-production.up.railway.app';

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  // Determine which plan to checkout
  let plan = 'pro';
  try {
    const body = await request.json().catch(() => ({}));
    if (body.plan === 'lite') plan = 'lite';
  } catch {}

  const priceId = plan === 'lite'
    ? process.env.STRIPE_LITE_PRICE_ID
    : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: session.userId,
      customer_email: session.email,
      metadata: { plan },
      success_url: `${APP_URL}/account?upgraded=true`,
      cancel_url: `${APP_URL}/account`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}

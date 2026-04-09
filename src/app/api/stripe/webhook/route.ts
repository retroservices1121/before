import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, initDb } from '@/lib/db';
import { getStripe } from '@/lib/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await initDb();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;
    const plan = session.metadata?.plan || 'pro';
    const tier = plan === 'lite' ? 'lite' : 'pro';

    if (userId) {
      await db.execute({
        sql: `UPDATE users SET tier = ?, stripe_customer_id = ?, stripe_subscription_id = ? WHERE id = ?`,
        args: [tier, customerId, subscriptionId, userId],
      });
      console.log(`[Stripe] User ${userId} upgraded to ${tier}`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    await db.execute({
      sql: `UPDATE users SET tier = 'lite', stripe_subscription_id = NULL WHERE stripe_customer_id = ?`,
      args: [customerId],
    });
    console.log(`[Stripe] Customer ${customerId} subscription cancelled`);
  }

  return NextResponse.json({ received: true });
}

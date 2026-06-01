import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

const PRICES: Record<string, Record<string, { sub: string; setup: string }>> = {
  starter: {
    monthly: { sub: import.meta.env.STRIPE_PRICE_STARTER_MONTHLY, setup: import.meta.env.STRIPE_SETUP_STARTER },
    six:     { sub: import.meta.env.STRIPE_PRICE_STARTER_SIX,     setup: import.meta.env.STRIPE_SETUP_STARTER },
    rolling: { sub: import.meta.env.STRIPE_PRICE_STARTER_ROLLING, setup: import.meta.env.STRIPE_SETUP_STARTER },
  },
  growth: {
    monthly: { sub: import.meta.env.STRIPE_PRICE_GROWTH_MONTHLY, setup: import.meta.env.STRIPE_SETUP_GROWTH },
    six:     { sub: import.meta.env.STRIPE_PRICE_GROWTH_SIX,     setup: import.meta.env.STRIPE_SETUP_GROWTH },
    rolling: { sub: import.meta.env.STRIPE_PRICE_GROWTH_ROLLING, setup: import.meta.env.STRIPE_SETUP_GROWTH },
  },
  pro: {
    monthly: { sub: import.meta.env.STRIPE_PRICE_PRO_MONTHLY, setup: import.meta.env.STRIPE_SETUP_PRO },
    six:     { sub: import.meta.env.STRIPE_PRICE_PRO_SIX,     setup: import.meta.env.STRIPE_SETUP_PRO },
    rolling: { sub: import.meta.env.STRIPE_PRICE_PRO_ROLLING, setup: import.meta.env.STRIPE_SETUP_PRO },
  },
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Get Online',
  growth: 'Get Found',
  pro: 'Get Leads',
};

const TERM_LABELS: Record<string, string> = {
  monthly: '3-month minimum',
  six: '6-month minimum',
  rolling: 'Rolling monthly',
};

export const GET: APIRoute = async ({ params, request, url }) => {
  const plan = params.plan?.toLowerCase();
  const term = url.searchParams.get('term')?.toLowerCase() ?? 'monthly';

  if (!plan || !PRICES[plan] || !PRICES[plan][term]) {
    return new Response('Invalid plan or term', { status: 400 });
  }

  const { sub, setup } = PRICES[plan][term];
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    metadata: { plan, term },
    payment_method_types: ['card'],
    line_items: [
      { price: sub, quantity: 1 },
      { price: setup, quantity: 1 },
    ],
    subscription_data: {
      description: `Pixova ${PLAN_LABELS[plan]} — ${TERM_LABELS[term]}`,
      metadata: { plan, term },
    },
    success_url: `${origin}/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing/`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    automatic_tax: { enabled: false },
    locale: 'en-GB',
    custom_text: {
      submit: { message: 'Setup fee + first month charged today. Monthly billing starts from month 2.' },
    },
  });

  return Response.redirect(session.url!, 303);
};

import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const plan = params.plan;

  const PRICE_MAP: Record<string, string> = {
    starter: import.meta.env.STRIPE_PRICE_STARTER,
    grow: import.meta.env.STRIPE_PRICE_GROW,
    'handed-off': import.meta.env.STRIPE_PRICE_HANDED_OFF,
  };

  if (!plan || !PRICE_MAP[plan]) {
    return new Response('Invalid plan', { status: 400 });
  }

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    billing_address_collection: 'auto',
    automatic_tax: { enabled: false },
  });

  return Response.redirect(session.url!, 303);
};

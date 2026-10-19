import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { sendEmail, layout, fieldTable, esc, OWNER_EMAIL } from '../../lib/email';

export const prerender = false;

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

// Stripe → Developers → Webhooks → endpoint https://www.pixova.uk/api/stripe-webhook/
// Event: checkout.session.completed. Copy the signing secret into STRIPE_WEBHOOK_SECRET.
export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !signature) return new Response('Webhook not configured', { status: 400 });

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    console.error('[stripe-webhook] Bad signature:', err);
    return new Response('Bad signature', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('Ignored', { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = session.customer_details?.email;
  const name = session.customer_details?.name ?? '';
  const firstName = name.split(' ')[0] || 'there';
  const plan = PLAN_LABELS[session.metadata?.plan ?? ''] ?? session.metadata?.plan ?? 'Pixova plan';
  const term = TERM_LABELS[session.metadata?.term ?? ''] ?? session.metadata?.term ?? '';
  const total = session.amount_total != null ? `£${(session.amount_total / 100).toFixed(2)}` : '';

  await sendEmail({
    to: [{ email: OWNER_EMAIL, name: 'Pixova' }],
    replyTo: email ? { email, name } : undefined,
    subject: `New booking: ${plan} — ${name || email}`,
    html: layout(
      `New ${esc(plan)} booking`,
      fieldTable([
        ['Name', name],
        ['Email', email],
        ['Phone', session.customer_details?.phone],
        ['Plan', plan],
        ['Term', term],
        ['Paid today', total],
        ['Stripe session', session.id],
      ]),
    ),
  });

  if (email) {
    await sendEmail({
      to: [{ email, name }],
      replyTo: { email: OWNER_EMAIL, name: 'Pixova' },
      subject: `Welcome to Pixova — your ${plan} plan is confirmed`,
      html: layout(
        `You're in, ${esc(firstName)}.`,
        `<p style="font-size:15px;line-height:1.6;">Your <strong>${esc(plan)}</strong> plan (${esc(term)}) is confirmed. Stripe will send a separate receipt for ${esc(total)}.</p>
         <p style="font-size:15px;line-height:1.6;font-weight:bold;margin-top:20px;">What happens next</p>
         <ol style="font-size:15px;line-height:1.7;padding-left:20px;">
           <li>I'll contact you within one working day to book a 20-minute kick-off call.</li>
           <li>Send me your logo, photos and anything you already have. No worries if you don't have much.</li>
           <li>You see a first version of your site within 7 days, and we refine it together.</li>
         </ol>
         <p style="font-size:15px;line-height:1.6;">Questions before then? Reply to this email or WhatsApp <a href="https://wa.me/447786366109" style="color:#0D2240;font-weight:bold;">+44 7786 366109</a>.</p>
         <p style="font-size:15px;margin-top:24px;">Anil<br/><span style="color:#6B7C8C;">Pixova</span></p>`,
      ),
    });
  }

  return new Response('ok', { status: 200 });
};

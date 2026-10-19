import type { APIRoute } from 'astro';
import { sendEmail, upsertContact, layout, fieldTable, esc, OWNER_EMAIL } from '../../lib/email';

export const prerender = false;

const TYPE_LABELS: Record<string, string> = {
  website: 'Website',
  seo: 'Local SEO',
  'custom-software': 'Custom software',
  automation: 'AI & automation',
  other: 'Something else',
};

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Accepts JSON or regular form posts from every enquiry form on the site.
export const POST: APIRoute = async ({ request }) => {
  let data: Record<string, string> = {};
  try {
    const type = request.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((v, k) => { data[k] = String(v); });
    }
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  // Honeypot: bots fill hidden fields, people don't.
  if (data.company_website) return json({ ok: true });

  const name = (data.name ?? '').trim().slice(0, 120);
  const email = (data.email ?? '').trim().slice(0, 200);
  const phone = (data.phone ?? '').trim().slice(0, 40);
  const business = (data.business ?? '').trim().slice(0, 160);
  const enquiryType = TYPE_LABELS[data.type] ? data.type : 'other';
  const budget = (data.budget ?? '').trim().slice(0, 60);
  const timeline = (data.timeline ?? '').trim().slice(0, 60);
  const message = (data.message ?? '').trim().slice(0, 5000);
  const source = (data.source ?? '').trim().slice(0, 200);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Please add your name and a valid email.' }, 400);
  }

  const typeLabel = TYPE_LABELS[enquiryType];

  const ownerSent = await sendEmail({
    to: [{ email: OWNER_EMAIL, name: 'Pixova' }],
    replyTo: { email, name },
    subject: `New enquiry: ${typeLabel} — ${business || name}`,
    html: layout(
      `New ${esc(typeLabel)} enquiry`,
      fieldTable([
        ['Name', name],
        ['Email', email],
        ['Phone', phone],
        ['Business', business],
        ['Type', typeLabel],
        ['Budget', budget],
        ['Timeline', timeline],
        ['Message', message],
        ['Page', source],
      ]) + `<p style="font-size:13px;color:#6B7C8C;margin-top:20px;">Hit reply to answer ${esc(name)} directly.</p>`,
    ),
  });

  await sendEmail({
    to: [{ email, name }],
    replyTo: { email: OWNER_EMAIL, name: 'Pixova' },
    subject: 'Got it — your Pixova enquiry',
    html: layout(
      `Thanks ${esc(name.split(' ')[0])}, I've got your message.`,
      `<p style="font-size:15px;line-height:1.6;">I read every enquiry myself. You'll hear back within one working day, usually much sooner.</p>
       <p style="font-size:15px;line-height:1.6;">If it's urgent, message me on WhatsApp: <a href="https://wa.me/447786366109" style="color:#0D2240;font-weight:bold;">+44 7786 366109</a>.</p>
       <p style="font-size:13px;color:#6B7C8C;margin-top:24px;">What you sent:</p>
       ${fieldTable([['Type', typeLabel], ['Business', business], ['Message', message]])}
       <p style="font-size:15px;margin-top:24px;">Anil<br/><span style="color:#6B7C8C;">Pixova</span></p>`,
    ),
  });

  await upsertContact(email, {
    FIRSTNAME: name.split(' ')[0],
    BUSINESS_NAME: business || undefined,
    ENQUIRY_TYPE: typeLabel,
  });

  if (!ownerSent) {
    return json({ ok: false, error: 'Message could not be sent. Please email hello@pixova.uk or WhatsApp us.' }, 502);
  }
  return json({ ok: true });
};

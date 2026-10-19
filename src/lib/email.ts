// Brevo transactional email + contact helpers.
// Sender address must be a verified sender in Brevo (Senders, Domains & Dedicated IPs).

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const BREVO_LIST_ID = Number(import.meta.env.BREVO_LIST_ID ?? 9);

export const OWNER_EMAIL = import.meta.env.ENQUIRY_TO_EMAIL || 'hello@pixova.uk';
const FROM_EMAIL = import.meta.env.EMAIL_FROM || 'hello@pixova.uk';
const FROM_NAME = 'Pixova';

interface SendArgs {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  replyTo?: { email: string; name?: string };
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.error('[email] BREVO_API_KEY missing');
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to,
        replyTo,
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error('[email] Brevo send failed:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] Brevo send error:', err);
    return false;
  }
}

export async function upsertContact(email: string, attributes: Record<string, string | undefined>) {
  if (!BREVO_API_KEY) return;
  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, attributes, listIds: [BREVO_LIST_ID], updateEnabled: true }),
    });
    if (!res.ok) console.error('[email] Brevo contact failed:', await res.text());
  } catch (err) {
    console.error('[email] Brevo contact error:', err);
  }
}

export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Simple branded wrapper used by every email.
export function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F4F7F8;font-family:Arial,Helvetica,sans-serif;color:#1A2E3D;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7F8;padding:32px 12px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#0D2240;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold;">Pixova<span style="color:#2ECC9A;">.</span></td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:20px;color:#0D2240;">${heading}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 28px;background:#F7FAFA;font-size:12px;color:#6B7C8C;">Pixova · Birmingham, UK · hello@pixova.uk · WhatsApp +44 7786 366109</td></tr>
</table></td></tr></table></body></html>`;
}

export function fieldTable(fields: [string, unknown][]): string {
  const rows = fields
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `<tr><td style="padding:8px 12px 8px 0;font-size:13px;color:#6B7C8C;vertical-align:top;white-space:nowrap;">${esc(k)}</td><td style="padding:8px 0;font-size:14px;color:#1A2E3D;white-space:pre-wrap;">${esc(v)}</td></tr>`)
    .join('');
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

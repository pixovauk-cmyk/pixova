import type { APIRoute } from 'astro';

export const prerender = false;

const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
const BREVO_LIST_ID = Number(import.meta.env.BREVO_LIST_ID ?? 9);

// POST — initial gate capture (name + email)
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { firstName, email } = body as { firstName: string; email: string };

    if (!email || !firstName) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), { status: 400 });
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: firstName },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[lead POST] Brevo error:', err);
    }
  } catch (err) {
    console.error('[lead POST] Error:', err);
  }

  // Always return success — never block the user journey
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

// PUT — enrich contact after qualify step
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, businessName, website, keyword, location, painPoint, workSource } = body as {
      email: string;
      businessName: string;
      website: string;
      keyword: string;
      location: string;
      painPoint: string;
      workSource: string;
    };

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing email' }), { status: 400 });
    }

    const encodedEmail = encodeURIComponent(email);
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodedEmail}`, {
      method: 'PUT',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attributes: {
          BUSINESS_NAME: businessName,
          WEBSITE: website,
          KEYWORD: keyword,
          LOCATION: location,
          PAIN_POINT: painPoint,
          WORK_SOURCE: workSource,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[lead PUT] Brevo error:', err);
    }
  } catch (err) {
    console.error('[lead PUT] Error:', err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

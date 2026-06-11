import type { APIRoute } from 'astro';
import { stripHtml } from '../../lib/strip';
import { analyse } from '../../lib/analyse';

export const prerender = false;

const SERPER_API_KEY = import.meta.env.SERPER_API_KEY;
const GOOGLE_API_KEY = import.meta.env.GOOGLE_API_KEY;
const GOOGLE_PLACE_API = import.meta.env.GOOGLE_PLACE_API;
const CHROME_UX_API = import.meta.env.Chrome_UX_Report_API;
const OPR_API_KEY = import.meta.env.OPEN_RANK_KEY;
const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

const DIRECTORY_DOMAINS = [
  'checkatrade.com', 'yell.com', 'trustpilot.com', 'bark.com',
  'ratedpeople.com', 'mybuilder.com', 'facebook.com', 'yelp.com',
  'google.com', 'bing.com', 'wikipedia.org', 'reddit.com',
];

const emailHits = new Map<string, number[]>();
const ipHits = new Map<string, number[]>();

function rateExceeded(map: Map<string, number[]>, key: string, limit: number): boolean {
  const now = Date.now();
  const window = 24 * 60 * 60 * 1000;
  const hits = (map.get(key) ?? []).filter(t => now - t < window);
  if (hits.length >= limit) return true;
  hits.push(now);
  map.set(key, hits);
  return false;
}

async function getBrevoCheckCount(email: string): Promise<number> {
  if (!BREVO_API_KEY) return 0;
  try {
    const res = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      headers: { 'api-key': BREVO_API_KEY },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    const val = data.attributes?.GAP_REPORT_COUNT;
    return val ? (parseInt(val, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

async function incrementBrevoCheckCount(email: string, current: number): Promise<void> {
  if (!BREVO_API_KEY) return;
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        attributes: { GAP_REPORT_COUNT: String(current + 1) },
        updateEnabled: true,
      }),
    });
  } catch {
    // non-blocking
  }
}

function isValidExternalUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (!['http:', 'https:'].includes(protocol)) return false;
    if (/^(localhost|127\.|0\.0\.0\.0|::1|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return false;
    return hostname.includes('.');
  } catch {
    return false;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function getPageSpeed(url: string): Promise<{ score: number | null; lcp: string | null } | null> {
  try {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=mobile`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const data = await res.json();
    const rawScore = data.lighthouseResult?.categories?.performance?.score;
    const score = rawScore != null && rawScore > 0 ? Math.round(rawScore * 100) : null;
    const lcpMs = data.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue ?? 0;
    const lcp = lcpMs > 0 ? `${(lcpMs / 1000).toFixed(1)}s` : null;
    if (score === null && lcp === null) return null;
    return { score, lcp };
  } catch {
    return null;
  }
}

async function getCruxData(domain: string): Promise<{ lcpMs: number } | null> {
  if (!CHROME_UX_API) return null;
  try {
    const origin = `https://${domain}`;
    const res = await fetch(
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CHROME_UX_API}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, metrics: ['largest_contentful_paint'] }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const lcpMs = data.record?.metrics?.largest_contentful_paint?.percentiles?.p75;
    return typeof lcpMs === 'number' ? { lcpMs } : null;
  } catch {
    return null;
  }
}

async function getPlacesData(businessName: string, location: string): Promise<{ rating: number; reviewCount: number } | null> {
  if (!GOOGLE_PLACE_API) return null;
  try {
    const query = encodeURIComponent(`${businessName} ${location}`);
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACE_API}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.results?.[0];
    if (!place || !place.rating) return null;
    return { rating: place.rating, reviewCount: place.user_ratings_total ?? 0 };
  } catch {
    return null;
  }
}

async function getOpenPageRanks(domains: string[]): Promise<Record<string, number>> {
  if (!OPR_API_KEY || domains.length === 0) return {};
  try {
    const params = domains.map(d => `domains[]=${encodeURIComponent(d)}`).join('&');
    const res = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?${params}`, {
      headers: { 'API-OPR': OPR_API_KEY },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const result: Record<string, number> = {};
    for (const item of data.response ?? []) {
      if (item.domain && typeof item.page_rank_integer === 'number') {
        result[item.domain] = item.page_rank_integer;
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function getSitemapCount(baseUrl: string): Promise<number | null> {
  const base = baseUrl.replace(/\/$/, '');
  for (const path of ['/sitemap.xml', '/sitemap_index.xml']) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${base}${path}`, { signal: controller.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      const xml = await res.text();
      const urlCount = (xml.match(/<url>/g) ?? []).length;
      const sitemapCount = (xml.match(/<sitemap>/g) ?? []).length;
      const count = urlCount || sitemapCount;
      if (count > 0) return count;
    } catch {
      continue;
    }
  }
  return null;
}

function extractBusinessName(title: string | undefined, domain: string): string {
  if (!title) return domain;
  return title.split(/\s*[\|–\-\/]\s*/)[0].trim() || domain;
}

function countLocationMentions(text: string, location: string): number {
  if (!location || !text) return 0;
  const escaped = location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.match(new RegExp(escaped, 'gi')) ?? []).length;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const errorResponse = (msg: string, status = 400) =>
    new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json' } });

  let body: { website: string; keyword: string; location: string; email: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid request body.');
  }

  const { website, keyword, location, email } = body;

  if (!website || !keyword || !location || !email) {
    return errorResponse('Missing required fields.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email address.');
  }

  if (!isValidExternalUrl(website)) {
    return errorResponse('Enter a valid public website address (e.g. https://yoursite.co.uk).');
  }

  if (keyword.length > 60 || location.length > 40) {
    return errorResponse('Input too long.');
  }

  // Strip any prompt-injection attempts from keyword/location
  const safeKeyword = keyword.replace(/[<>{}[\]\\]/g, '').trim();
  const safeLocation = location.replace(/[<>{}[\]\\]/g, '').trim();

  const ip = clientAddress ?? 'unknown';
  if (rateExceeded(emailHits, email, 2)) {
    return errorResponse("You've used your 2 free checks. Book a call if you want the full picture.", 429);
  }
  if (rateExceeded(ipHits, ip, 5)) {
    return errorResponse("You've used your free checks for today. Book a call if you want the full picture.", 429);
  }

  // Persistent check via Brevo — survives cold starts
  const brevoCount = await getBrevoCheckCount(email);
  if (brevoCount >= 2) {
    return errorResponse("You've used your 2 free checks. Book a call if you want the full picture.", 429);
  }

  const userDomain = extractDomain(website);

  try {
    // 1. SERP
    const serpRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: `${safeKeyword} ${safeLocation}`, gl: 'gb', hl: 'en', num: 10 }),
    });

    if (!serpRes.ok) {
      return errorResponse("We couldn't finish your report. Nothing's been used up — try again, or email us and we'll run it by hand.", 502);
    }

    const serpData = await serpRes.json();
    const organic: { position: number; title: string; domain: string }[] = (serpData.organic ?? [])
      .slice(0, 10)
      .map((r: any, i: number) => ({
        position: i + 1,
        title: r.title ?? '',
        domain: extractDomain(r.link ?? ''),
      }));

    const userDomainPosition = organic.find(r => r.domain === userDomain)?.position ?? null;

    const competitors = organic.filter(r =>
      r.domain !== userDomain &&
      !DIRECTORY_DOMAINS.some(d => r.domain.includes(d))
    ).slice(0, 2);

    if (competitors.length === 0) {
      return errorResponse("We couldn't find competitors to compare. Try a more specific keyword.", 422);
    }

    const comp1Domain = competitors[0].domain;
    const comp2 = competitors[1] ?? null;
    const allDomains = [userDomain, comp1Domain, ...(comp2 ? [comp2.domain] : [])];

    // 2. Phase 1: fetch pages + PageSpeed + CrUX + OpenPageRank in parallel
    const [userHtml, comp1Html, comp2Html, pageSpeed, userCrux, pageRanks] = await Promise.all([
      fetchPage(website),
      fetchPage(`https://${comp1Domain}`),
      comp2 ? fetchPage(`https://${comp2.domain}`) : Promise.resolve(null),
      getPageSpeed(website),
      getCruxData(userDomain),
      getOpenPageRanks(allDomains),
    ]);

    // 3. Strip HTML
    const userPage = userHtml ? stripHtml(userHtml, website) : null;
    const comp1Page = comp1Html ? stripHtml(comp1Html, `https://${comp1Domain}`) : null;
    const comp2Page = comp2Html && comp2 ? stripHtml(comp2Html, `https://${comp2.domain}`) : null;

    // 4. Phase 2: Places + sitemap lookups (need stripped titles first)
    const [userPlaces, comp1Places, comp2Places, userSitemap, comp1Sitemap, comp2Sitemap] = await Promise.all([
      getPlacesData(extractBusinessName(userPage?.title, userDomain), safeLocation),
      getPlacesData(extractBusinessName(comp1Page?.title, comp1Domain), safeLocation),
      comp2 ? getPlacesData(extractBusinessName(comp2Page?.title, comp2.domain), safeLocation) : Promise.resolve(null),
      getSitemapCount(website),
      getSitemapCount(`https://${comp1Domain}`),
      comp2 ? getSitemapCount(`https://${comp2.domain}`) : Promise.resolve(null),
    ]);

    // 5. Location mention counts
    const buildText = (page: typeof userPage) =>
      [page?.h1, ...(page?.h2s ?? []), page?.bodyText].filter(Boolean).join(' ');

    const userLocationCount = countLocationMentions(buildText(userPage), safeLocation);
    const comp1LocationCount = countLocationMentions(buildText(comp1Page), safeLocation);
    const comp2LocationCount = comp2 ? countLocationMentions(buildText(comp2Page), safeLocation) : 0;

    // 6. Claude analysis
    const analysis = await analyse({
      keyword: safeKeyword,
      location: safeLocation,
      serpTop10: organic,
      userPage,
      userPageSpeed: pageSpeed,
      userCrux,
      userPlaces,
      userSitemapCount: userSitemap,
      userLocationCount,
      userPageRank: pageRanks[userDomain] ?? null,
      competitor1: {
        domain: comp1Domain,
        page: comp1Page,
        places: comp1Places,
        sitemapCount: comp1Sitemap,
        locationCount: comp1LocationCount,
        pageRank: pageRanks[comp1Domain] ?? null,
      },
      competitor2: comp2 ? {
        domain: comp2.domain,
        page: comp2Page,
        places: comp2Places,
        sitemapCount: comp2Sitemap,
        locationCount: comp2LocationCount,
        pageRank: pageRanks[comp2.domain] ?? null,
      } : null,
    });

    // Increment persistent check count in Brevo
    incrementBrevoCheckCount(email, brevoCount).catch(() => {});

    return new Response(JSON.stringify({
      ...analysis,
      serpTop10: organic,
      userDomainPosition,
      userDomain,
      competitorDomains: [comp1Domain, comp2?.domain ?? null],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[audit] Unexpected error:', err);
    return errorResponse("We couldn't finish your report. Nothing's been used up — try again, or email us and we'll run it by hand.", 500);
  }
};

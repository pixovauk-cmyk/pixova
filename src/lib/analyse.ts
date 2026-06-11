import Anthropic from '@anthropic-ai/sdk';
import type { StrippedPage } from './strip';

const client = new Anthropic({ apiKey: import.meta.env.ANTHROPIC_API_KEY });

export interface AnalysisResult {
  userScore: number;
  competitorScores: number[];
  comparisonRows: { metric: string; sub?: string; you: string; them: string; youGood: boolean }[];
  verdict: string;
  lockedTeaser: string;
  topStrength: string;
  emailSubject: string;
}

interface CompetitorInput {
  domain: string;
  page: StrippedPage | null;
  places: { rating: number; reviewCount: number } | null;
  sitemapCount: number | null;
  locationCount: number;
  pageRank: number | null;
}

interface AnalyseInput {
  keyword: string;
  location: string;
  serpTop10: { position: number; title: string; domain: string }[];
  userPage: StrippedPage | null;
  userPageSpeed: { score: number | null; lcp: string | null } | null;
  userCrux: { lcpMs: number } | null;
  userPlaces: { rating: number; reviewCount: number } | null;
  userSitemapCount: number | null;
  userLocationCount: number;
  userPageRank: number | null;
  competitor1: CompetitorInput;
  competitor2: CompetitorInput | null;
}

interface PageExtras {
  places: { rating: number; reviewCount: number } | null;
  sitemapCount: number | null;
  locationCount: number;
  pageRank: number | null;
}

function formatPage(label: string, domain: string, page: StrippedPage | null, extras: PageExtras): string {
  if (!page) return `${label} (${domain}): Could not fetch page.`;

  const reviewLine = extras.places
    ? `Google reviews (verified): ${extras.places.reviewCount} reviews, ${extras.places.rating}★`
    : `Reviews mentioned on page: ${page.signals.reviewMention ?? 'none found'}`;

  return `${label} (${domain}):
Title: ${page.title}
Meta description: ${page.metaDescription}
H1 (exact text): "${page.h1}"
H2s: ${page.h2s.join(' | ')}
Word count: ${page.wordCount}
${reviewLine}
Phone number found: ${page.signals.phoneNumber ?? 'none'}
Click-to-call link: ${page.signals.hasClickToCall ? 'yes' : 'no'}
Has contact form: ${page.signals.hasForm ? 'yes' : 'no'}
Location mentions in page: ${extras.locationCount}
Sitemap page count: ${extras.sitemapCount != null ? extras.sitemapCount : 'not found'}
Domain authority (0–10): ${extras.pageRank != null ? extras.pageRank : 'unknown'}
Body text excerpt: ${page.bodyText.slice(0, 800)}`;
}

const SYSTEM_PROMPT = `You are an SEO and conversion analyst for Pixova, a UK web design agency. You write in plain British English for small business owners — tradespeople, salon owners, local professionals. No jargon, no hedging, no marketing fluff. Direct, specific, a little blunt, never insulting. Never use the words "seamless", "leverage", "cutting-edge", "bespoke", "delve" or "landscape".

You will receive: the user's target keyword and location, stripped data from their homepage (including exact H1 text, word count, phone number, review count from Google, sitemap page count, domain authority score, and location mention count), stripped data from up to two top-ranking competitor pages with the same enrichments, and the user's mobile speed data if available.

Write in plain English that a plumber, electrician or salon owner can understand immediately. No SEO jargon. No acronyms. If something is technical, say what it means in real life.

Analyse these seven things using ONLY the data supplied:
1. What the headline says — does it name the service and the town? Use EXACT H1 text.
2. How much Google has to read — use exact word counts
3. Can someone ring with one tap — use the actual phone number and click-to-call signal
4. Do they show proof people trust them — use Google reviews count and star rating if supplied; if not, use the review mention from the page; always quote the actual number and stars
5. How fast the page loads on a phone — use CrUX real-user LCP if supplied, else PageSpeed LCP; skip entirely if neither available
6. How many times the location appears — use the exact count supplied
7. How many pages does Google have to explore — use sitemap page count if supplied for both sites; skip row if neither has one

Scoring: 1–10. Be honest. A site missing the keyword in its headline, no reviews, and a slow load is a 2 or 3. Use only data supplied.

Respond with ONLY valid JSON, no markdown fences, matching exactly this schema:

{"userScore":3,"competitorScores":[8,7],"comparisonRows":[{"metric":"What your headline says","sub":"The first line Google reads to decide what you do and where","you":"'Got an idea? The business...' — no service, no city","them":"'Emergency Plumber Solihull — 24/7 Callouts' — clear and specific","youGood":false},{"metric":"Can someone call you in one tap?","sub":"On a mobile, people expect to tap a number and ring — not copy-paste it","you":"Number shown but not tappable","them":"07912 846492 — tap to call","youGood":false},{"metric":"Do you show proof people trust you?","sub":"Star ratings and review counts stop strangers choosing someone else","you":"No Google reviews found","them":"4.9 stars from 247 Google reviews","youGood":false},{"metric":"How much Google has to read","sub":"More content about your service means Google understands what you do","you":"1,176 words","them":"2,437 words","youGood":false},{"metric":"How fast your page loads","sub":"If it takes over 3 seconds on a phone, most people leave before they see your number","you":"Loads in 4.9s — too slow","them":"Loads in 1.8s","youGood":false},{"metric":"Does your site mention your area?","sub":"Google only ranks you for a place your website actually talks about","you":"2 times","them":"14 times","youGood":false},{"metric":"How many pages does Google see?","sub":"More pages means more chances to show up for different searches","you":"6 pages","them":"43 pages","youGood":false}],"verdict":"Three to five sentences. Plain English, no jargon. Sentence 1: where they rank or don't, and the single biggest reason — quote the exact H1 using single quotes. Sentences 2-3: the two worst gaps with real numbers from the data. Sentence 4: what this keyword is worth to the business in plain terms. Final sentence: Every one of these is fixable. None of them fix themselves.","lockedTeaser":"One sentence, plain English, hinting at how the competitor converts visitors into calls.","topStrength":"One specific genuine thing the user site does right — quote real data. Empty string if nothing.","emailSubject":"Plain-English subject line about their biggest gap, max 8 words"}

Rules:
- metric names must be plain English questions or phrases — never "H1 tag", "LCP", "CTR", "click-to-call" or any SEO acronym
- sub is a one-line plain-English explanation of why that metric matters in real life — max 12 words
- you and them values must quote actual text, actual numbers, actual phone strings from the supplied data — never "Yes", "No", "Functional", "Unknown" alone
- CRITICAL: never use double quotes (" ") inside a JSON string value — use single quotes (' ') when quoting headlines, slogans, or text. Double quotes inside JSON strings break the JSON and the tool fails.
- For the reviews row: if Google reviews count is supplied, use that (it's from Google directly). If 0 reviews found, say "No Google reviews found"
- If speed data not supplied, omit the speed row entirely
- If sitemap count not available for either site, omit the sitemap row
- youGood: true means the user is equal or better — show max 1 or 2 greens so losses feel credible
- The verdict must name at least one competitor domain
- Every number in the verdict must come from the supplied data — never invent search volumes`;

async function callClaude(prompt: string): Promise<AnalysisResult> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  // Strip markdown fences, then find outermost JSON object
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(stripped.slice(start, end + 1)) as AnalysisResult;
}

export async function analyse(input: AnalyseInput): Promise<AnalysisResult> {
  const serpList = input.serpTop10.map(r => `${r.position}. ${r.domain}`).join('\n');

  // Speed: prefer CrUX (real users) over PageSpeed (lab test)
  let speedInfo = 'Not available — omit speed row from comparison rows and verdict.';
  if (input.userCrux) {
    const lcpSec = (input.userCrux.lcpMs / 1000).toFixed(1);
    const rating = input.userCrux.lcpMs > 4000 ? 'Poor' : input.userCrux.lcpMs > 2500 ? 'Needs improvement' : 'Good';
    speedInfo = `Real user LCP (p75 on mobile): ${lcpSec}s — ${rating}.`;
  } else if (input.userPageSpeed) {
    const { score, lcp } = input.userPageSpeed;
    if (score != null && score > 0) {
      speedInfo = `Lab test score: ${score}/100${lcp ? `. LCP: ${lcp}` : ''}.`;
    } else if (lcp) {
      speedInfo = `LCP: ${lcp} (lab test only).`;
    }
  }

  const userExtras: PageExtras = {
    places: input.userPlaces,
    sitemapCount: input.userSitemapCount,
    locationCount: input.userLocationCount,
    pageRank: input.userPageRank,
  };

  const comp1Extras: PageExtras = {
    places: input.competitor1.places,
    sitemapCount: input.competitor1.sitemapCount,
    locationCount: input.competitor1.locationCount,
    pageRank: input.competitor1.pageRank,
  };

  const comp2Extras: PageExtras = input.competitor2 ? {
    places: input.competitor2.places,
    sitemapCount: input.competitor2.sitemapCount,
    locationCount: input.competitor2.locationCount,
    pageRank: input.competitor2.pageRank,
  } : { places: null, sitemapCount: null, locationCount: 0, pageRank: null };

  const prompt = `KEYWORD: ${input.keyword}
LOCATION: ${input.location}

SERP TOP 10:
${serpList}

USER PAGESPEED: ${speedInfo}

${formatPage('USER SITE DATA', 'user site', input.userPage, userExtras)}

${formatPage('COMPETITOR 1 DATA', input.competitor1.domain, input.competitor1.page, comp1Extras)}

${input.competitor2 ? formatPage('COMPETITOR 2 DATA', input.competitor2.domain, input.competitor2.page, comp2Extras) : 'COMPETITOR 2 DATA: Not available.'}`;

  try {
    return await callClaude(prompt);
  } catch (_) {
    return await callClaude(prompt + '\n\nReturn ONLY the JSON object. Use single quotes inside string values, never double quotes.');
  }
}

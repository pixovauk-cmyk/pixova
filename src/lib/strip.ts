import * as cheerio from 'cheerio';

export interface StrippedPage {
  title: string;
  metaDescription: string;
  h1: string;
  h2s: string[];
  h3s: string[];
  bodyText: string;
  wordCount: number;
  signals: {
    phoneNumber: string | null;
    hasClickToCall: boolean;
    hasForm: boolean;
    reviewMention: string | null;
    hasSSL: boolean;
    imageCount: number;
  };
}

const UK_PHONE_RE = /(\+44\s?[\d\s]{10,}|0[\d\s\-\.]{9,14})/;
const REVIEW_COUNT_RE = /(\d[\d,]*)\s*(google\s+reviews?|reviews?|ratings?|stars?)/i;
const REVIEW_KEYWORDS = /\b(reviews?|testimonials?|trustpilot|google reviews?|rated|stars?|⭐|feedback)\b/i;
const REVIEW_SCHEMA = /reviewrating|aggregaterating/i;

export function stripHtml(html: string, url: string): StrippedPage {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? '';
  const h1 = $('h1').first().text().trim();
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 12);
  const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 12);

  // Extract actual phone number from tel: links first, then body text
  let phoneNumber: string | null = null;
  const telLink = $('a[href^="tel:"]').first().attr('href');
  if (telLink) {
    phoneNumber = telLink.replace('tel:', '').trim();
  } else {
    const bodyForPhone = $('body').text();
    const match = bodyForPhone.match(UK_PHONE_RE);
    if (match) phoneNumber = match[0].replace(/\s+/g, ' ').trim();
  }

  const hasClickToCall = $('a[href^="tel:"]').length > 0;
  const hasForm = $('form').length > 0;

  // Remove non-content elements before extracting body text
  $('script, style, noscript, nav, footer, header, iframe, svg, [aria-hidden="true"]').remove();

  const rawText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = rawText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const bodyText = words.slice(0, 1500).join(' ');

  // Extract specific review mention (e.g. "47 Google reviews") or generic
  let reviewMention: string | null = null;
  const fullText = $('body').text();
  const countMatch = fullText.match(REVIEW_COUNT_RE);
  if (countMatch) {
    reviewMention = countMatch[0].trim();
  } else if (REVIEW_KEYWORDS.test(fullText) || REVIEW_SCHEMA.test(html)) {
    reviewMention = 'reviews mentioned';
  }

  const hasSSL = url.startsWith('https://');
  const imageCount = $('img').length;

  return {
    title,
    metaDescription,
    h1,
    h2s,
    h3s,
    bodyText,
    wordCount,
    signals: { phoneNumber, hasClickToCall, hasForm, reviewMention, hasSSL, imageCount },
  };
}

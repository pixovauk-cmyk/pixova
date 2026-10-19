// Single place for contact details, plans and the current offer.
// Edit here, commit, push — Vercel redeploys.

export const SITE = {
  name: 'Pixova',
  url: 'https://www.pixova.uk',
  email: 'hello@pixova.uk',
  phone: '+44 7786 366109',
  whatsapp: 'https://wa.me/447786366109',
  calendly: 'https://calendly.com/hello-pixova/30min',
  linkedin: 'https://www.linkedin.com/company/116006122/',
  facebook: 'https://www.facebook.com/people/Pixova/61589529080471/',
  founder: 'Anil Jaishi',
};

// Real, dated offer shown as a bar on every page. It hides itself after `ends`.
// Only switch on for an offer you will honour (e.g. a Stripe promo code).
// UK law (DMCC Act 2024) bans fake countdowns and fake "spots left".
export const OFFER = {
  active: true,
  festive: true, // shows a Santa hat on the logo while the offer runs
  label: 'Christmas offer',
  text: '£50 off your setup fee with code XMAS50 at checkout.',
  ends: '2026-12-24T23:59:59Z',
  href: '/pricing/',
};

export const offerLive = () => OFFER.active && new Date(OFFER.ends).getTime() > Date.now();

export type Plan = {
  slug: 'starter' | 'growth' | 'pro';
  name: string;
  tagline: string;
  bestFor: string;
  monthly: number;
  six: number;
  rolling: number;
  setup: number;
  featured?: boolean;
  features: string[];
  notIncluded: string[];
};

// Prices must match Stripe (scripts/setup-stripe.mjs). Changing a number here
// does not change what Stripe charges.
export const PLANS: Plan[] = [
  {
    slug: 'starter',
    name: 'Get Online',
    tagline: 'A proper website, done for you.',
    bestFor: 'New businesses and anyone stuck with a DIY site.',
    monthly: 69, six: 59, rolling: 79, setup: 199,
    features: [
      '5-page website, built and launched for you',
      'Works properly on phones',
      'Contact form, click-to-call and WhatsApp button',
      'Hosting, SSL and backups included',
      '2 changes a month (prices, photos, text)',
      'Google Analytics set up, plus a monthly traffic snapshot',
      'Email support, reply within 48 hours',
    ],
    notIncluded: ['Domain name (about £10 a year)', 'Google Business Profile', 'SEO and blog posts'],
  },
  {
    slug: 'growth',
    name: 'Get Found',
    tagline: 'Website plus the work that gets you on Google.',
    bestFor: 'Local businesses that want calls from Google every week.',
    monthly: 119, six: 99, rolling: 139, setup: 359,
    featured: true,
    features: [
      'Everything in Get Online',
      '8 pages, including blog, FAQ and reviews',
      'Google Business Profile set up properly',
      'Local SEO foundations on every page',
      'Google Search Console watched for problems',
      '1 blog post a month, written for your customers',
      '3 changes a month',
      'Review request system, so happy customers leave Google reviews',
      'Monthly one-page ranking report',
      'Reply within 24 hours',
    ],
    notIncluded: ['Weekly Google Business posts', 'WhatsApp direct line'],
  },
  {
    slug: 'pro',
    name: 'Get Leads',
    tagline: 'For businesses ready to beat the competition.',
    bestFor: 'Busy firms covering several towns or services.',
    monthly: 169, six: 149, rolling: 189, setup: 599,
    features: [
      'Everything in Get Found',
      '12 pages, with a page for each service',
      '2 blog posts a month',
      '6 changes a month',
      'Google Business Profile posts every week',
      'Monthly report on where you rank against competitors',
      'Same-day fixes and WhatsApp direct line',
      '30-minute call every quarter',
    ],
    notIncluded: ['Paid ads management', 'Photography or video'],
  },
];

export const TERMS = [
  { key: 'monthly', label: '3 months min', note: 'Most popular' },
  { key: 'six', label: '6 months min', note: 'Lowest price' },
  { key: 'rolling', label: 'Rolling', note: 'Cancel any time' },
] as const;

export const SOFTWARE_FROM = 200;

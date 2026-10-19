// Concept designs for the catalogue. These are sample layouts, not client sites,
// and the page labels them that way. Business names are made up.

export type Layout = 'split' | 'centered' | 'bold' | 'grid' | 'menu' | 'shop';

export type Design = {
  slug: string;
  business: string;
  industry: string;
  type: string;
  layout: Layout;
  headline: string;
  cta: string;
  colors: { bg: string; ink: string; accent: string; soft: string };
  serif?: boolean;
  pages: string[];
  idea: string;
};

export type DesignDetail = {
  img: string;
  img2: string;
  domain: string;
  phone: string;
  area: string;
  rating: string;
  reviews: number;
  services: [string, string][];
  review: [string, string];
  badge: string;
};

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70`;

// Realistic sample content for the catalogue mock-ups. Businesses are made up.
export const DETAILS: Record<string, DesignDetail> = {
  plumber: { img: u('1585704032915-c3400ca199e7'), img2: u('1607472586893-edb57bdc0e39'), domain: 'hartleyplumbing.co.uk', phone: '0121 496 0731', area: 'Birmingham & Solihull', rating: '4.9', reviews: 212, badge: 'Gas Safe registered', services: [['Boiler repair', 'from £85'], ['Leaks & burst pipes', 'from £65'], ['New bathrooms', 'free quote']], review: ['Came out within the hour on a Sunday. Fixed the leak and left the place spotless.', 'Sarah, Moseley'] },
  electrician: { img: u('1621905251189-08b45d6a269e'), img2: u('1555963966-b7ae5404b6ed'), domain: 'brightlineelectrical.co.uk', phone: '0121 496 0218', area: 'West Midlands', rating: '5.0', reviews: 148, badge: 'NICEIC approved', services: [['EICR certificate', '£120'], ['Consumer unit swap', 'from £395'], ['EV charger install', 'from £799']], review: ['Certificate sent the same afternoon. Saved me chasing for a week.', 'Raj, landlord'] },
  roofer: { img: u('1632759145351-1d592919f522'), img2: u('1600585154340-be6161a56a0c'), domain: 'summitroofing.co.uk', phone: '0121 496 0954', area: 'Birmingham & the Black Country', rating: '4.8', reviews: 97, badge: '10-year guarantee', services: [['Roof repairs', 'from £150'], ['Full re-roofs', 'free survey'], ['Flat roofs & EPDM', 'from £950']], review: ['Showed us photos of every stage. No surprises on the bill.', 'Tom & Lucy, Halesowen'] },
  landscaper: { img: u('1558904541-efa843a96f01'), img2: u('1416879595882-3373a0480b5b'), domain: 'greenfoldgardens.co.uk', phone: '0121 496 0412', area: 'Sutton Coldfield', rating: '4.9', reviews: 64, badge: 'Fully insured', services: [['Patios & paving', 'from £1,800'], ['Fencing', 'from £45/m'], ['Turf & planting', 'free quote']], review: ['Our garden finally gets used. The kids have not come inside since.', 'Priya, Four Oaks'] },
  salon: { img: u('1560066984-138dadb4c035'), img2: u('1522337360788-8b13dee7a37e'), domain: 'studioninehair.co.uk', phone: '0121 496 0590', area: 'Harborne', rating: '4.9', reviews: 386, badge: 'Book 24/7 online', services: [['Cut & finish', '£45'], ['Full head colour', 'from £85'], ['Balayage', 'from £140']], review: ['Booked at midnight, in the chair the next morning. Best colour I have had.', 'Emma, Harborne'] },
  barber: { img: u('1585747860715-2ba37e788b70'), img2: u('1503951914875-452162b0f3f1'), domain: 'fadeandco.uk', phone: '0121 496 0377', area: 'Digbeth', rating: '4.9', reviews: 521, badge: 'Walk-ins welcome', services: [['Skin fade', '£22'], ['Cut & beard', '£30'], ['Hot towel shave', '£25']], review: ['Cleanest fade in Brum. Booking takes ten seconds.', 'Jordan, Digbeth'] },
  nails: { img: u('1604654894610-df63bc536371'), img2: u('1522337360788-8b13dee7a37e'), domain: 'polishednailbar.co.uk', phone: '0121 496 0662', area: 'Solihull', rating: '5.0', reviews: 233, badge: 'Same-week slots', services: [['Gel manicure', '£28'], ['BIAB infill', '£35'], ['Nail art', 'from £5']], review: ['Lasted three weeks without a chip. Already booked again.', 'Chloe, Shirley'] },
  cafe: { img: u('1554118811-1e0d58224f24'), img2: u('1495474472287-4d71bcdd2085'), domain: 'littleembercafe.co.uk', phone: '0121 496 0145', area: 'Kings Heath', rating: '4.8', reviews: 412, badge: 'Open 7 days', services: [['Flat white', '£3.40'], ['Full brunch', '£11.50'], ['Avocado sourdough', '£9.00']], review: ['Order ahead on the walk in and it is ready when you arrive.', 'Dan, Kings Heath'] },
  takeaway: { img: u('1585937421612-70a008356fbe'), img2: u('1565557623262-b51c2513a641'), domain: 'spiceroutekitchen.co.uk', phone: '0121 496 0802', area: 'Balti Triangle', rating: '4.7', reviews: 689, badge: '10% off direct orders', services: [['Lamb balti', '£10.95'], ['Chicken tikka masala', '£9.95'], ['Family feast for 4', '£39.00']], review: ['Cheaper than the apps and the food arrives hotter.', 'Aisha, Sparkhill'] },
  bakery: { img: u('1578985545062-69928b1d9587'), img2: u('1509440159596-0249088772ff'), domain: 'risebakehouse.co.uk', phone: '0121 496 0926', area: 'Bournville', rating: '5.0', reviews: 158, badge: 'Order 48hrs ahead', services: [['Celebration cake', 'from £45'], ['Cupcake box (12)', '£24'], ['Sourdough loaf', '£4.50']], review: ['The birthday cake was the star of the party. Ordering online was so easy.', 'Hannah, Bournville'] },
  physio: { img: u('1519824145371-296894a0daa9'), img2: u('1576091160550-2173dba999ef'), domain: 'movewellphysio.co.uk', phone: '0121 496 0483', area: 'Edgbaston', rating: '4.9', reviews: 174, badge: 'HCPC registered', services: [['Initial assessment', '£60'], ['Follow-up session', '£50'], ['Sports massage', '£45']], review: ['Six sessions and I am running again. Booked everything online.', 'Mark, Edgbaston'] },
  dentist: { img: u('1588776814546-1ffcf47267a5'), img2: u('1606811971618-4486d14f3f99'), domain: 'kingsburydental.co.uk', phone: '0121 496 0310', area: 'Erdington', rating: '4.8', reviews: 302, badge: 'CQC registered', services: [['New patient exam', '£55'], ['Hygienist clean', '£65'], ['Teeth whitening', '£295']], review: ['Registered online in two minutes and got an appointment that week.', 'Sam, Erdington'] },
  'personal-trainer': { img: u('1571019614242-c5c5dee9f50b'), img2: u('1534438327276-14e5300c3a48'), domain: 'coachdanpt.co.uk', phone: '07700 900 412', area: 'Birmingham city centre', rating: '5.0', reviews: 89, badge: 'Level 4 PT', services: [['12-week programme', '£480'], ['1-to-1 session', '£40'], ['Online coaching', '£99/mo']], review: ['Down 9kg and stronger than I was at 25. No fads, just a plan.', 'Leon, Jewellery Quarter'] },
  accountant: { img: u('1554224155-6726b3ff858f'), img2: u('1450101499163-c8848c66ca85'), domain: 'clearbookaccountants.co.uk', phone: '0121 496 0758', area: 'Birmingham & online', rating: '4.9', reviews: 136, badge: 'ACCA chartered', services: [['Sole trader tax return', '£180'], ['Ltd company accounts', 'from £65/mo'], ['Bookkeeping', 'from £40/mo']], review: ['Fixed fee, no surprises, and they actually answer the phone.', 'Gary, electrician'] },
  solicitor: { img: u('1589829545856-d10d557cf95f'), img2: u('1521791055366-0d553872125f'), domain: 'ashfordlane.co.uk', phone: '0121 496 0627', area: 'Solihull', rating: '4.9', reviews: 118, badge: 'SRA regulated', services: [['Single will', '£195'], ['Probate', 'fixed fee'], ['Lasting power of attorney', '£350']], review: ['Explained everything clearly at a hard time for our family.', 'Margaret, Knowle'] },
  cleaning: { img: u('1581578731548-c64695cc6952'), img2: u('1563453392212-326f5e854473'), domain: 'sparkleofficecleaning.co.uk', phone: '0121 496 0864', area: 'Birmingham & Coventry', rating: '4.8', reviews: 77, badge: 'DBS checked staff', services: [['Small office, weekly', 'from £45'], ['Deep clean', 'from £180'], ['Window cleaning', 'from £30']], review: ['Got a price on the website in under a minute. Started the next Monday.', 'Office manager, Brindleyplace'] },
  florist: { img: u('1487070183336-b863922373d4'), img2: u('1490750967868-88aa4486c946'), domain: 'wildstemflorist.co.uk', phone: '0121 496 0291', area: 'Birmingham', rating: '4.9', reviews: 264, badge: 'Order by 1pm', services: [['Seasonal bouquet', 'from £35'], ['Luxury hand-tied', '£65'], ['Wedding flowers', 'consultation']], review: ['Delivered the same afternoon and looked better than the photos.', 'Ollie, Selly Oak'] },
  boutique: { img: u('1445205170230-053b83016050'), img2: u('1441986300917-64674bd600d8'), domain: 'marlowandthread.co.uk', phone: '0121 496 0539', area: 'Jewellery Quarter', rating: '4.8', reviews: 143, badge: 'Free click & collect', services: [['Linen overshirt', '£68'], ['Wide-leg trousers', '£74'], ['Knit cardigan', '£82']], review: ['Ordered on my lunch break and picked it up on the way home.', 'Freya, Moseley'] },
};

export const INDUSTRIES = [
  'Trades',
  'Beauty & wellbeing',
  'Food & drink',
  'Health',
  'Professional services',
  'Retail',
] as const;

export const TYPES = [
  'Brochure site',
  'Booking site',
  'Landing page',
  'Menu & ordering',
  'Online shop',
] as const;

export const DESIGNS: Design[] = [
  {
    slug: 'plumber',
    business: 'Hartley Plumbing',
    industry: 'Trades',
    type: 'Brochure site',
    layout: 'split',
    headline: 'Leak? Boiler down? We pick up.',
    cta: 'Call now',
    colors: { bg: '#F4F7FB', ink: '#0E2A47', accent: '#F26B1D', soft: '#DCE6F2' },
    pages: ['Home', 'Services', 'Areas covered', 'Reviews', 'Contact'],
    idea: 'Phone number in the header on every page. Emergency call button stays on screen as people scroll.',
  },
  {
    slug: 'electrician',
    business: 'Brightline Electrical',
    industry: 'Trades',
    type: 'Landing page',
    layout: 'bold',
    headline: 'EICR certificates from £120.',
    cta: 'Book an EICR',
    colors: { bg: '#111418', ink: '#FFFFFF', accent: '#FFD23F', soft: '#262B33' },
    pages: ['One page: offer, proof, booking form'],
    idea: 'One page for one job. Built for landlords searching "EICR near me" with the price up front.',
  },
  {
    slug: 'roofer',
    business: 'Summit Roofing',
    industry: 'Trades',
    type: 'Brochure site',
    layout: 'grid',
    headline: 'Roofs done right, first time.',
    cta: 'Free roof survey',
    colors: { bg: '#FBFAF7', ink: '#2B2A28', accent: '#B5462F', soft: '#ECE6DC' },
    pages: ['Home', 'Repairs', 'New roofs', 'Gallery', 'Contact'],
    idea: 'Before-and-after gallery leads, because homeowners want to see the work before they ring.',
  },
  {
    slug: 'landscaper',
    business: 'Greenfold Gardens',
    industry: 'Trades',
    type: 'Brochure site',
    layout: 'centered',
    headline: 'Gardens you will actually use.',
    cta: 'Get a quote',
    colors: { bg: '#F3F6F0', ink: '#1F3A2B', accent: '#5E9E4A', soft: '#DDE8D4' },
    serif: true,
    pages: ['Home', 'Patios', 'Fencing', 'Projects', 'Quote'],
    idea: 'Quote form asks for garden size and photos, so the first call is about price, not basics.',
  },
  {
    slug: 'salon',
    business: 'Studio Nine Hair',
    industry: 'Beauty & wellbeing',
    type: 'Booking site',
    layout: 'split',
    headline: 'Cut, colour, calm.',
    cta: 'Book online',
    colors: { bg: '#FBF5F2', ink: '#3A2A2A', accent: '#C9897A', soft: '#F1E1DA' },
    serif: true,
    pages: ['Home', 'Price list', 'Team', 'Book', 'Find us'],
    idea: 'Price list and booking on the same screen. Clients pick a stylist and a time without calling.',
  },
  {
    slug: 'barber',
    business: 'Fade & Co',
    industry: 'Beauty & wellbeing',
    type: 'Booking site',
    layout: 'bold',
    headline: 'Walk in sharp. Walk out sharper.',
    cta: 'Book a chair',
    colors: { bg: '#1A1A1A', ink: '#F5F1EA', accent: '#D4A24C', soft: '#2C2C2C' },
    pages: ['Home', 'Cuts & prices', 'Book', 'Instagram'],
    idea: 'Instagram feed pulled in so the site stays fresh without anyone updating it.',
  },
  {
    slug: 'nails',
    business: 'Polished Nail Bar',
    industry: 'Beauty & wellbeing',
    type: 'Landing page',
    layout: 'centered',
    headline: 'Gel, BIAB and nail art in Solihull.',
    cta: 'See availability',
    colors: { bg: '#FFF6FA', ink: '#4A1F35', accent: '#E0679A', soft: '#F8DDE9' },
    pages: ['One page: treatments, gallery, booking'],
    idea: 'Gallery first, prices second, booking third. The order people actually decide in.',
  },
  {
    slug: 'cafe',
    business: 'Little Ember Café',
    industry: 'Food & drink',
    type: 'Menu & ordering',
    layout: 'menu',
    headline: 'Coffee, brunch, good mornings.',
    cta: 'Order to collect',
    colors: { bg: '#FAF6EF', ink: '#3B2B1E', accent: '#C2652A', soft: '#EFE4D3' },
    serif: true,
    pages: ['Home', 'Menu', 'Order', 'Find us'],
    idea: 'Menu is real text, not a PDF, so Google can read it and people can order from their phone.',
  },
  {
    slug: 'takeaway',
    business: 'Spice Route Kitchen',
    industry: 'Food & drink',
    type: 'Menu & ordering',
    layout: 'menu',
    headline: 'Order direct. Skip the app fees.',
    cta: 'Start your order',
    colors: { bg: '#FFF8F0', ink: '#3A1410', accent: '#D7372B', soft: '#F8E3CF' },
    pages: ['Home', 'Menu', 'Deals', 'Order'],
    idea: 'Direct ordering so the takeaway keeps the 30% that delivery apps take.',
  },
  {
    slug: 'bakery',
    business: 'Rise Bakehouse',
    industry: 'Food & drink',
    type: 'Online shop',
    layout: 'shop',
    headline: 'Celebration cakes, made to order.',
    cta: 'Order a cake',
    colors: { bg: '#FFFBF4', ink: '#4A2E1E', accent: '#E8A33D', soft: '#F6E7CC' },
    serif: true,
    pages: ['Home', 'Cakes', 'Order form', 'Collection'],
    idea: 'Order form takes the date, size and message, plus a deposit, so no more back-and-forth on WhatsApp.',
  },
  {
    slug: 'physio',
    business: 'Movewell Physio',
    industry: 'Health',
    type: 'Booking site',
    layout: 'split',
    headline: 'Back to moving without pain.',
    cta: 'Book an assessment',
    colors: { bg: '#F2F8F8', ink: '#123B3E', accent: '#1E9C96', soft: '#D7ECEB' },
    pages: ['Home', 'Conditions', 'Prices', 'Book', 'Insurance'],
    idea: 'A page for each condition (back pain, sports injury) so each one can rank on Google.',
  },
  {
    slug: 'dentist',
    business: 'Kingsbury Dental',
    industry: 'Health',
    type: 'Brochure site',
    layout: 'centered',
    headline: 'Taking new NHS and private patients.',
    cta: 'Register today',
    colors: { bg: '#F6F9FC', ink: '#1A2E4A', accent: '#3C7DD9', soft: '#DFEAF7' },
    pages: ['Home', 'Treatments', 'Fees', 'Team', 'Register'],
    idea: 'Fees shown clearly. New patient registration done online in two minutes.',
  },
  {
    slug: 'personal-trainer',
    business: 'Coach Dan PT',
    industry: 'Health',
    type: 'Landing page',
    layout: 'bold',
    headline: '12 weeks. Real results. No fads.',
    cta: 'Book a free consult',
    colors: { bg: '#0F1B2D', ink: '#FFFFFF', accent: '#4ADE80', soft: '#1C2B42' },
    pages: ['One page: programme, results, consult booking'],
    idea: 'Client results with names and photos high up. That is what sells personal training.',
  },
  {
    slug: 'accountant',
    business: 'Clearbook Accountants',
    industry: 'Professional services',
    type: 'Brochure site',
    layout: 'split',
    headline: 'Fixed-fee accounts for sole traders.',
    cta: 'Get a fixed quote',
    colors: { bg: '#F7F7F5', ink: '#1E2B3A', accent: '#2F6F5E', soft: '#E3E8E4' },
    serif: true,
    pages: ['Home', 'Sole traders', 'Limited companies', 'Fees', 'Contact'],
    idea: 'Fixed fees on the page. Most accountants hide prices, so showing them wins the call.',
  },
  {
    slug: 'solicitor',
    business: 'Ashford & Lane',
    industry: 'Professional services',
    type: 'Brochure site',
    layout: 'centered',
    headline: 'Clear legal advice for families.',
    cta: 'Free 15-minute call',
    colors: { bg: '#FAF9F6', ink: '#22223B', accent: '#8C6D46', soft: '#ECE7DD' },
    serif: true,
    pages: ['Home', 'Wills', 'Probate', 'Family law', 'Team'],
    idea: 'Calm and trustworthy. Real team photos and SRA details, which matter to clients.',
  },
  {
    slug: 'cleaning',
    business: 'Sparkle Office Cleaning',
    industry: 'Professional services',
    type: 'Landing page',
    layout: 'grid',
    headline: 'Office cleaning, evenings and weekends.',
    cta: 'Get a price in 60s',
    colors: { bg: '#F3F8FF', ink: '#0B2545', accent: '#13A8E0', soft: '#D9ECFA' },
    pages: ['One page: services, price calculator, contact'],
    idea: 'Instant price calculator by office size. Businesses get a number without waiting for a call back.',
  },
  {
    slug: 'florist',
    business: 'Wild Stem Florist',
    industry: 'Retail',
    type: 'Online shop',
    layout: 'shop',
    headline: 'Same-day flowers across Birmingham.',
    cta: 'Shop bouquets',
    colors: { bg: '#FBF8F3', ink: '#2F2A24', accent: '#B5577B', soft: '#F1E4E8' },
    serif: true,
    pages: ['Home', 'Bouquets', 'Weddings', 'Delivery', 'Checkout'],
    idea: 'Delivery postcode check before checkout, so nobody orders to an area you do not cover.',
  },
  {
    slug: 'boutique',
    business: 'Marlow & Thread',
    industry: 'Retail',
    type: 'Online shop',
    layout: 'shop',
    headline: 'New season, small batch.',
    cta: 'Shop the edit',
    colors: { bg: '#F6F4F1', ink: '#1C1C1C', accent: '#7A8C6E', soft: '#E6E1D8' },
    pages: ['Home', 'New in', 'Collections', 'About', 'Basket'],
    idea: 'Simple shop with click-and-collect, so local customers can buy online and pick up in store.',
  },
];

// Examples of small custom tools. Each one is a typical job, not a client case study.

export type ToolKind = 'booking' | 'quote' | 'jobs' | 'invoice' | 'stock' | 'portal' | 'rota' | 'checklist';

export type Tool = {
  kind: ToolKind;
  name: string;
  forWho: string;
  problem: string;
  fix: string;
};

export const TOOLS: Tool[] = [
  {
    kind: 'quote',
    name: 'Instant quote calculator',
    forWho: 'Cleaners, landscapers, removals, printers',
    problem: 'You spend evenings writing the same quote over and over.',
    fix: 'Customers enter a few details on your website and see a price straight away. You get the lead by email.',
  },
  {
    kind: 'booking',
    name: 'Booking and deposits',
    forWho: 'Salons, tutors, photographers, driving instructors',
    problem: 'No-shows, and a phone that rings while you are with a client.',
    fix: 'People pick a slot, pay a deposit and get a text reminder the day before.',
  },
  {
    kind: 'jobs',
    name: 'Job sheet on your phone',
    forWho: 'Plumbers, electricians, builders, handymen',
    problem: 'Job details live in texts, notebooks and your head.',
    fix: 'One list of jobs with address, notes and photos. Mark it done on site and it is logged.',
  },
  {
    kind: 'invoice',
    name: 'Quote to invoice in one tap',
    forWho: 'Any trade or sole trader',
    problem: 'Invoices go out late, so money comes in late.',
    fix: 'Turn an accepted quote into an invoice with a pay-by-card link. Chases late payers for you.',
  },
  {
    kind: 'stock',
    name: 'Simple stock tracker',
    forWho: 'Cafés, small shops, salons',
    problem: 'You find out you have run out when a customer asks.',
    fix: 'Count stock on your phone. Get an email when something drops below your limit.',
  },
  {
    kind: 'portal',
    name: 'Customer portal',
    forWho: 'Accountants, letting agents, consultants',
    problem: 'Clients email you documents, then ask where things are up to.',
    fix: 'A private login where clients upload files and see progress without chasing you.',
  },
  {
    kind: 'rota',
    name: 'Staff rota',
    forWho: 'Cafés, care providers, cleaning teams',
    problem: 'The rota is a WhatsApp photo of a whiteboard.',
    fix: 'Staff see their shifts on their phone and can request swaps. You approve with one tap.',
  },
  {
    kind: 'checklist',
    name: 'Digital checklists and forms',
    forWho: 'Kitchens, gyms, landlords, care',
    problem: 'Paper checklists get lost right before an inspection.',
    fix: 'Daily checks done on a phone, with time, name and photos saved. Export a PDF whenever you need it.',
  },
];

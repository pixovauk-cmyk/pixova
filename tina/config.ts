import { defineConfig } from 'tinacms'

export default defineConfig({
  branch:
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    'main',

  clientId: process.env.TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images/blog',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'blog',
        label: 'Blog Posts',
        path: 'src/content/blog',
        format: 'mdx',
        ui: {},
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
          },
          {
            type: 'string',
            name: 'seoTitle',
            label: 'SEO Title',
            description: 'Overrides title in <head> if set',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Excerpt / meta description',
            ui: { component: 'textarea' },
            required: true,
          },
          {
            type: 'datetime',
            name: 'pubDate',
            label: 'Publish date',
            required: true,
          },
          {
            type: 'datetime',
            name: 'updatedDate',
            label: 'Updated date',
          },
          {
            type: 'string',
            name: 'primaryKeyword',
            label: 'Primary keyword',
          },
          {
            type: 'string',
            name: 'heroImage',
            label: 'Hero image URL',
            description:
              'Paste an image URL (Unsplash, CDN, or /images/blog/filename.webp)',
          },
          {
            type: 'string',
            name: 'readTime',
            label: 'Read time',
            description: 'e.g. "5 min read"',
          },
          {
            type: 'string',
            name: 'avatar',
            label: 'Author avatar',
            options: ['neil', 'dave', 'sarah', 'all'],
          },
          {
            type: 'string',
            name: 'body',
            label: 'Body (Markdown)',
            ui: { component: 'textarea' },
            isBody: true,
          },
        ],
      },
      {
        name: 'pricing',
        label: 'Pricing',
        path: 'src/content',
        match: { include: 'pricing' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'object',
            name: 'juneOffer',
            label: 'Offer Banner',
            fields: [
              { type: 'string', name: 'badge', label: 'Badge label' },
              { type: 'string', name: 'message', label: 'Message' },
              { type: 'string', name: 'highlight', label: 'Highlighted text (teal)' },
              { type: 'string', name: 'closingNote', label: 'Closing note' },
            ],
          },
          {
            type: 'object',
            name: 'plans',
            label: 'Plans',
            list: true,
            fields: [
              { type: 'string', name: 'slug', label: 'Slug (starter/growth/pro)' },
              { type: 'string', name: 'badge', label: 'Badge label' },
              { type: 'string', name: 'name', label: 'Plan name' },
              { type: 'string', name: 'tagline', label: 'Tagline' },
              { type: 'number', name: 'monthlyPrice', label: 'Monthly price (£)' },
              { type: 'number', name: 'sixMonthPrice', label: '6-month price (£)' },
              { type: 'number', name: 'rollingPrice', label: 'Rolling price (£)' },
              { type: 'number', name: 'setupFee', label: 'Setup fee (£)' },
              { type: 'boolean', name: 'featured', label: 'Featured (dark card)' },
              {
                type: 'string',
                name: 'features',
                label: 'Included features',
                list: true,
              },
              {
                type: 'string',
                name: 'notIncluded',
                label: 'Not included',
                list: true,
              },
            ],
          },
          {
            type: 'object',
            name: 'faq',
            label: 'FAQ',
            list: true,
            fields: [
              { type: 'string', name: 'question', label: 'Question' },
              { type: 'string', name: 'answer', label: 'Answer', ui: { component: 'textarea' } },
            ],
          },
        ],
      },
      {
        name: 'homepage',
        label: 'Homepage',
        path: 'src/content',
        match: { include: 'homepage' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'object',
            name: 'urgencyBar',
            label: 'Urgency Bar',
            fields: [
              { type: 'string', name: 'badge', label: 'Badge label' },
              { type: 'string', name: 'message', label: 'Message text' },
              { type: 'string', name: 'highlight', label: 'Highlighted text (bold teal)' },
              { type: 'string', name: 'linkHref', label: 'CTA link URL' },
            ],
          },
          {
            type: 'object',
            name: 'hero',
            label: 'Hero',
            fields: [
              { type: 'string', name: 'headline', label: 'Headline (black text)' },
              { type: 'string', name: 'headlineHighlight', label: 'Headline (teal text)' },
              { type: 'string', name: 'subheadline', label: 'Subheadline', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'liveStats',
            label: 'Live Stats',
            fields: [
              { type: 'number', name: 'sitesThisWeek', label: 'Sites built this week' },
              { type: 'number', name: 'inProgress', label: 'Currently in progress' },
              { type: 'number', name: 'launchedThisMonth', label: 'Launched this month' },
              { type: 'string', name: 'latestLaunchName', label: 'Latest launch name' },
              { type: 'string', name: 'latestLaunchUrl', label: 'Latest launch URL' },
            ],
          },
          {
            type: 'object',
            name: 'testimonials',
            label: 'Testimonials',
            list: true,
            fields: [
              { type: 'string', name: 'name', label: 'Name' },
              { type: 'string', name: 'role', label: 'Role / location' },
              { type: 'string', name: 'badge', label: 'Badge text' },
              { type: 'string', name: 'image', label: 'Image path' },
              { type: 'string', name: 'quote', label: 'Quote', ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'faq',
            label: 'FAQ',
            list: true,
            fields: [
              { type: 'string', name: 'question', label: 'Question' },
              { type: 'string', name: 'answer', label: 'Answer', ui: { component: 'textarea' } },
            ],
          },
        ],
      },
    ],
  },
})

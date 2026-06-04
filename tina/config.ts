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
        ui: {
          router: ({ document }) =>
            `/blog/${document._sys.filename}/`,
        },
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
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
})

import { config, collection, singleton, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: process.env.NODE_ENV === 'production' ? 'cloud' : 'local',
  },
  cloud: {
    project: 'pixovauk/pixova',
  },

  collections: {
    blog: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: { contentField: 'body' },
      schema: {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        pubDate: fields.date({
          label: 'Publish date',
          validation: { isRequired: true },
        }),
        description: fields.text({
          label: 'Excerpt / meta description',
          multiline: true,
          validation: { isRequired: true },
        }),
        heroImage: fields.text({
          label: 'Hero image URL',
          description: 'Paste an image URL (Unsplash, CDN, or /images/blog/filename.webp)',
        }),
        seoTitle: fields.text({
          label: 'SEO title (optional — overrides title in <head>)',
        }),
        primaryKeyword: fields.text({
          label: 'Primary keyword',
        }),
        readTime: fields.text({
          label: 'Read time',
          description: 'e.g. "5 min read"',
        }),
        avatar: fields.select({
          label: 'Author avatar',
          options: [
            { label: 'Neil', value: 'neil' },
            { label: 'Dave', value: 'dave' },
            { label: 'Sarah', value: 'sarah' },
            { label: 'All', value: 'all' },
          ],
          defaultValue: 'neil',
        }),
        body: fields.mdx({
          label: 'Body',
          options: {
            bold: true,
            italic: true,
            strikethrough: true,
            code: true,
            heading: [2, 3, 4],
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            link: true,
            divider: true,
            codeBlock: true,
            image: {
              directory: 'public/images/blog',
              publicPath: '/images/blog/',
            },
          },
        }),
      },
    }),
  },

  singletons: {
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/homepage',
      schema: {
        heroHeadline: fields.text({
          label: 'Hero headline',
          description: 'Main H1 on the homepage',
        }),
        heroSubheadline: fields.text({
          label: 'Hero subheadline',
          multiline: true,
          description: 'The paragraph beneath the headline',
        }),
      },
    }),
  },
});

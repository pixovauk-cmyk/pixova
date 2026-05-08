import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().optional(),
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    primaryKeyword: z.string().optional(),
    heroImage: z.string().optional(),
    readTime: z.string().optional(),
    avatar: z.enum(['dave', 'sarah', 'neil', 'all']).optional(),
  }),
});

export const collections = { blog };

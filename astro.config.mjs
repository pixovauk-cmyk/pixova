import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';
import tina from '@tinacms/astro/integration';

export default defineConfig({
  site: 'https://www.pixova.uk',
  trailingSlash: 'always',
  adapter: vercel(),
  server: { port: 4401 },
  integrations: [
    sitemap(),
    react(),
    mdx(),
    keystatic(),
    tina(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

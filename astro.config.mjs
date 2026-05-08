import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  site: 'https://pixova.uk',
  server: { port: 4401 },
  integrations: [
    sitemap(),
    react(),
    mdx(),
    ...(isDev ? [keystatic()] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

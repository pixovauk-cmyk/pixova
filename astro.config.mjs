import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tina from '@tinacms/astro/integration';

export default defineConfig({
  site: 'https://www.pixova.uk',
  trailingSlash: 'always',
  adapter: vercel(),
  server: { port: 4401 },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/success/'),
    }),
    react(),
    mdx(),
    tina(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

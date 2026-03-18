// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Replace with your actual domain before deploying
  // Example: site: 'https://example.com',
  site: 'https://your-domain.com',

  integrations: [
    react(),
    // Auto-generates sitemap.xml for SEO
    // Submit the generated sitemap to Google Search Console
    sitemap({
      // Customize changefreq for all pages (optional)
      changefreq: 'weekly',
      // Set priority for all pages (optional)
      priority: 0.7,
      // Set lastmod to current build date
      lastmod: new Date(),
    }),
  ],
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});
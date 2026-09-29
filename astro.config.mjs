// @ts-check
import { defineConfig, sessionDrivers } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';
import { remarkCodeMeta } from './src/lib/remark-code-meta.ts';
import { CONFIG } from './src/data/config.ts';
import { fileURLToPath } from 'node:url';
import { localBlogWriter } from './tools/local-blog-writer.mjs';

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false,
};

// https://astro.build/config
export default defineConfig({
  site: CONFIG.site.url,
  output: 'server',

  // This site does not use sessions; avoid provisioning a KV namespace at deploy time.
  session: { driver: sessionDrivers.lruCache() },

  adapter: cloudflare(),

  vite: {
    environments: {
      ssr: {
        optimizeDeps: {
          // The content schema loads astro/zod on the first blog request.
          // Prebundle it before serving so discovery cannot replace React's
          // shared module graph while that request is rendering.
          include: ['astro/zod'],
        },
      },
    },
    plugins: [
      tailwindcss(),
      localBlogWriter(fileURLToPath(new URL('./src/content/blog', import.meta.url))),
    ],
  },

  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkGfm, remarkCodeMeta],
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      syntaxHighlight: false,
    }),
    sitemap(),
  ],

  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm, remarkCodeMeta],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});

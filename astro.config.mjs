// @ts-check
import { defineConfig } from 'astro/config';
import markdownBase from './scripts/markdown-base.mjs';
import { unified } from '@astrojs/markdown-remark';
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://Starworker.github.io',
  base: process.env.BASE_PATH || '/seven-spades',
  output: 'static',
  trailingSlash: 'always',
  i18n: { locales: ['zh-cn', 'zh-tw', 'en'], defaultLocale: 'zh-cn', routing: 'manual' },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
    processor: unified({ rehypePlugins: [[markdownBase, { base: process.env.BASE_PATH || '/' }]] }),
  },
});

import type { APIRoute } from 'astro';
import { categories } from '../config';
import { getPosts, getTags, postSlug } from '../lib/posts';
import { xml } from '../lib/xml';
import { languages, localizedUrl } from '../i18n/routes';
export const GET: APIRoute = async ({ site }) => {
  const routes = ['', 'about/', 'contact/', 'categories/', 'tags/', ...categories.map(c => `categories/${c.id}/`)];
  const entries = routes.flatMap(path => languages.map(language => `<url><loc>${xml(new URL(localizedUrl(path, language.id), site || 'https://example.com').href)}</loc></url>`));
  for (const language of languages) {
    const posts = await getPosts(language.id);
    entries.push(...getTags(posts).map(tag => `<url><loc>${xml(new URL(localizedUrl(`tags/${encodeURIComponent(tag)}/`, language.id), site || 'https://example.com').href)}</loc></url>`));
    entries.push(...posts.map(post => `<url><loc>${xml(new URL(localizedUrl(`blog/${postSlug(post)}/`, language.id), site || 'https://example.com').href)}</loc><lastmod>${(post.data.updatedAt || post.data.publishedAt).toISOString()}</lastmod></url>`));
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

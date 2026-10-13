import type { APIRoute } from 'astro';
import { site as settings, url } from '../config';
import { getPosts, postSlug } from '../lib/posts';
import { xml } from '../lib/xml';
export const GET: APIRoute = async ({ site }) => {
  const absolute = (path: string) => new URL(url(path), site || 'https://example.com').href;
  const items = (await getPosts()).map(post => `<item><title>${xml(post.data.title)}</title><description>${xml(post.data.description)}</description><link>${xml(absolute(`blog/${postSlug(post)}/`))}</link><guid isPermaLink="true">${xml(absolute(`blog/${postSlug(post)}/`))}</guid><pubDate>${post.data.publishedAt.toUTCString()}</pubDate><category>${xml(post.data.category)}</category></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(settings.name)}</title><description>${xml(settings.description)}</description><link>${xml(absolute(''))}</link><language>zh-cn</language><atom:link href="${xml(absolute('rss.xml'))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};


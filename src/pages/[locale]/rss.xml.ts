import type { APIRoute } from 'astro';
import { getPosts, postSlug } from '../../lib/posts';
import { site as settings } from '../../config';
import { localizedUrl } from '../../i18n/routes';
import { translateText } from '../../i18n/translate';
import { xml } from '../../lib/xml';
export function getStaticPaths() { return ['en', 'zh-tw'].map(locale => ({ params: { locale } })); }
export const GET: APIRoute = async ({ site, params }) => {
  const language = params.locale!;
  const absolute = (path: string) => new URL(localizedUrl(path, language), site || 'https://example.com').href;
  const items = (await getPosts(language)).map(post => `<item><title>${xml(post.data.title)}</title><description>${xml(post.data.description)}</description><link>${xml(absolute(`blog/${postSlug(post)}/`))}</link><guid isPermaLink="true">${xml(absolute(`blog/${postSlug(post)}/`))}</guid><pubDate>${post.data.publishedAt.toUTCString()}</pubDate><category>${xml(post.data.category)}</category></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(translateText(settings.name, language))}</title><description>${xml(translateText(settings.description, language))}</description><link>${xml(absolute(''))}</link><language>${language === 'en' ? 'en' : 'zh-tw'}</language><atom:link href="${xml(absolute('rss.xml'))}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};


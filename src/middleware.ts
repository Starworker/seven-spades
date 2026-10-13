import { defineMiddleware } from 'astro:middleware';
import { languagePath, availableLanguages } from './i18n/routes';
import { translateHtml } from './i18n/translate';
export const onRequest = defineMiddleware(async (context, next) => {
  const { language, path } = languagePath(context.url.pathname);
  context.locals.language ||= language;
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = translateHtml(await response.text(), context.locals.language, path, context.site?.origin || context.url.origin, await availableLanguages(path));
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  headers.set('Content-Language', language === 'zh-tw' ? 'zh-TW' : language === 'en' ? 'en' : 'zh-CN');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
});

import { categories, url } from '../config';
import { getPosts, getTags } from '../lib/posts';
export const languages = [
  { id: 'zh-cn', label: '简体中文', html: 'zh-CN' },
  { id: 'zh-tw', label: '繁體中文', html: 'zh-TW' },
  { id: 'en', label: 'English', html: 'en' },
] as const;
export async function pagePaths(language = 'zh-cn') {
  const posts = await getPosts(language);
  return ['', 'about', 'contact', 'categories', 'tags', '404', ...categories.map(c => `categories/${c.id}`), ...getTags(posts).map(t => `tags/${t}`), ...posts.map(p => `blog/${p.id.slice(p.id.indexOf('/') + 1)}`)];
}
export async function availableLanguages(path: string) {
  const normalized = decodeURIComponent(path).replace(/\/$/, '');
  if (!normalized.startsWith('blog/') && !normalized.startsWith('tags/')) return [...languages];
  const available = await Promise.all(languages.map(async language => ({ language, paths: await pagePaths(language.id) })));
  return available.filter(item => item.paths.includes(normalized)).map(item => item.language);
}
export function languagePath(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const relative = pathname.slice(base.length).replace(/^\//, '');
  const match = relative.match(/^(en|zh-tw)(?:\/|$)/);
  return { language: match?.[1] || 'zh-cn', path: match ? relative.slice(match[0].length) : relative };
}
export function localizedUrl(path: string, language: string) {
  const page = path === '404.html' || path === '404/' || path === '404' ? language === 'zh-cn' ? '404.html' : '404/' : path;
  return url(`${language === 'zh-cn' ? '' : `${language}/`}${page}`);
}

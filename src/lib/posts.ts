import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'blog'>;
export async function getPosts(language = 'zh-cn') {
  return (await getCollection('blog', ({ data, id }) => !data.draft && id.startsWith(`${language}/`))).sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime() || a.id.localeCompare(b.id));
}
export function postSlug(post: Post) { return post.id.slice(post.id.indexOf('/') + 1); }
export function postLanguage(post: Post) { return post.id.split('/')[0]; }
export function readingTime(post: Post) { return Math.max(1, Math.ceil((post.body?.length || 0) / 450)); }
export function getTags(posts: Post[]) { return [...new Set(posts.flatMap(post => post.data.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN')); }

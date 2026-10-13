import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
if (process.env.SITE_URL === undefined) { try { process.loadEnvFile('.env'); } catch {} }
const root = resolve('dist');
const base = `/${(process.env.BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
const origin = new URL(process.env.SITE_URL || 'https://example.com').origin;
const failures = [];
let pages = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!file.endsWith('.html')) continue;
    pages++;
    const html = await readFile(file, 'utf8');
    for (const [label, pattern] of [['title', /<title\b[^>]*>[^<]+<\/title>/], ['description', /name="description"/], ['canonical', /rel="canonical"/], ['heading', /<h1[ >]/], ['language', /lang="(?:zh-CN|zh-TW|en)"/]]) {
      if (!pattern.test(html)) failures.push(`${file}: missing ${label}`);
    }
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      const raw = match[1].replace(/&amp;/g, '&');
      if (/^(mailto:|data:|\/\/)/.test(raw)) continue;
      let pathname;
      if (/^https?:/.test(raw)) { const parsed = new URL(raw); if (parsed.origin !== origin) continue; pathname = parsed.pathname; }
      else if (raw.startsWith('/')) pathname = raw.split('?')[0]; else continue;
      if (base && pathname !== base && !pathname.startsWith(`${base}/`)) { failures.push(`${file}: link outside base ${raw}`); continue; }
      const local = decodeURIComponent(pathname.slice(base.length));
      const target = resolve(root, `.${local}`);
      if (!target.startsWith(root)) { failures.push(`${file}: invalid path ${raw}`); continue; }
      try { const info = await stat(target); if (info.isDirectory()) await stat(join(target, 'index.html')); }
      catch { failures.push(`${file}: broken link ${raw}`); }
    }
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      if (!html.includes(`id="${match[1]}"`)) failures.push(`${file}: broken anchor ${match[1]}`);
    }
  }
}
await walk(root);
for (const file of ['rss.xml', 'sitemap.xml', 'robots.txt', '404.html', '.nojekyll']) await stat(join(root, file));
if (!pages) failures.push('No generated pages');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Verified ${pages} HTML pages: metadata, internal links, assets, anchors and base ${base || '/'}.`);

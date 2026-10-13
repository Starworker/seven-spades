import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'parse5';

// Temporary authored fixtures verify independent content without translating real posts.
const root = resolve('src/content/blog');
const created = [];
const fixtures = [
  ['zh-cn', 'content-language-test', 'TEST_CN', '原文简体内容', false],
  ['zh-tw', 'content-language-test', 'TEST_TW', '保留简体字，不自动转换。', false],
  ['en', 'content-language-test', 'TEST_EN', 'English authored content with 中文原文 retained.', false],
  ['en', 'english-only-test', 'ONLY_EN', 'Independent English-only article.', false],
  ['en', 'private-language-test', 'PRIVATE_EN', 'Draft must not be public.', true],
];
function run(base) {
  const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], { encoding: 'utf8', env: { ...process.env, BASE_PATH: base, SITE_URL: 'https://example.com' } });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const file of ['scripts/verify-build.mjs', 'scripts/check-translations.mjs']) {
    const verification = spawnSync(process.execPath, [file], { encoding: 'utf8', env: { ...process.env, BASE_PATH: base, SITE_URL: 'https://example.com' } });
    assert.equal(verification.status, 0, verification.stderr || verification.stdout);
  }
}
async function absent(path) { await assert.rejects(access(path)); }
try {
  for (const [language, slug, title, body, draft] of fixtures) {
    const path = resolve(root, language, `${slug}.md`);
    assert(path.startsWith(root + sep));
    await absent(path);
    await writeFile(path, `---\ntitle: ${title}\ndescription: ${body}\npublishedAt: 2026-10-13\ncategory: proxy-ip\ntags: [content-test]\nfeatured: true\ndraft: ${draft}\n---\n\n## Shared anchor\n\n${body}\n\n[Source language](/blog/proxy-basics/)\n\n\`\`\`text\n${language} raw 中文 code\n\`\`\`\n`);
    created.push(path);
  }
  for (const base of ['/', '/seven-spades/']) {
    run(base);
    for (const [language, slug, title, body, draft] of fixtures) {
      const prefix = language === 'zh-cn' ? '' : `${language}/`;
      const path = `dist/${prefix}blog/${slug}/index.html`;
      if (draft) { await absent(path); continue; }
      const html = await readFile(path, 'utf8');
      const tree = parse(html);
      const elements = [];
      function visit(n) { if (n.tagName) elements.push(n); n.childNodes?.forEach(visit); }
      visit(tree);
      const attrs = n => Object.fromEntries(n.attrs.map(a => [a.name, a.value]));
      const links = elements.filter(n => attrs(n)['data-language-link']).map(n => attrs(n)['data-language-link']);
      assert.deepEqual(links, slug === 'english-only-test' ? ['en'] : ['zh-cn', 'zh-tw', 'en']);
      assert(html.includes(body), `Authored content changed: ${path}`);
      assert(html.includes(`<h1 data-verbatim="">${title}</h1>`), `Title changed: ${path}`);
      assert(html.includes(`href="${base}blog/proxy-basics/"`), 'Authored link should retain target language');
      const home = await readFile(`dist/${prefix}index.html`, 'utf8');
      assert(home.includes(title), `Language home does not list ${title}`);
      for (const other of ['TEST_CN', 'TEST_TW', 'TEST_EN']) if (other !== title && title !== 'ONLY_EN') assert(!home.includes(other), 'Other language leaked into homepage');
      const rss = await readFile(`dist/${prefix}rss.xml`, 'utf8');
      assert(rss.includes(title)); assert(rss.includes(body)); assert(!rss.includes('PRIVATE_EN'));
    }
    await absent('dist/blog/english-only-test/index.html');
    await absent('dist/zh-tw/blog/english-only-test/index.html');
    await absent('dist/en/blog/proxy-basics/index.html');
    const only = await readFile('dist/en/blog/english-only-test/index.html', 'utf8');
    assert(!only.includes('hreflang="zh-CN"')); assert(!only.includes('hreflang="zh-TW"'));
    const sitemap = await readFile('dist/sitemap.xml', 'utf8');
    assert(!sitemap.includes('private-language-test')); assert(!sitemap.includes('/en/blog/proxy-basics/'));
  }
  console.log('PASS: authored content, per-language lists/RSS, matching versions, English-only posts, drafts, missing translations, root and Pages base.');
} finally {
  for (const path of created) { assert(path.startsWith(root + sep)); await unlink(path); }
  run('/');
}

import { parse } from 'parse5';
import { readdir, readFile } from 'node:fs/promises';
const missing = new Set();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!file.endsWith('.html')) continue;
    const tree = parse(await readFile(file, 'utf8'), { scriptingEnabled: false });
    const html = await readFile(file, 'utf8');
    if (!html.includes('lang="en"') || !html.includes('hreflang="en"')) throw new Error(`Missing language metadata: ${file}`);
    function visit(node) {
      if (['script', 'style', 'pre', 'code', 'option'].includes(node.tagName) || node.attrs?.some(a => ['data-language-link', 'data-language-current', 'data-verbatim'].includes(a.name))) return;
      if (node.nodeName === '#text' && /[\u3400-\u9fff]/.test(node.value)) missing.add(node.value.trim());
      for (const attr of node.attrs || []) {
        const meta = node.attrs.find(a => ['name', 'property'].includes(a.name))?.value;
        if ((['title', 'alt', 'aria-label'].includes(attr.name) || attr.name === 'content' && ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(meta)) && /[\u3400-\u9fff]/.test(attr.value)) missing.add(attr.value);
      }
      node.childNodes?.forEach(visit);
    }
    visit(tree);
  }
}
await walk('dist/en');
if (missing.size) {
  console.error('Missing English translations. Add source text keys to src/i18n/en.json:\n' + JSON.stringify([...missing], null, 2));
  process.exit(1);
}
console.log('English interface coverage passed; authored article content is not translated.');

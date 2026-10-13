import { parse, serialize, type DefaultTreeAdapterMap } from 'parse5';
import { Converter } from 'opencc-js/cn2t';
import english from './en.json';
import { languages, localizedUrl } from './routes';
import { url } from '../config';
type Node = DefaultTreeAdapterMap['node'];
type Element = DefaultTreeAdapterMap['element'];
const traditional = Converter({ from: 'cn', to: 'tw' });
const dictionary: Record<string, string> = english;
const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
const replacements = new RegExp(keys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
export function translateText(text: string, language: string): string {
  if (language === 'zh-tw') return traditional(text);
  if (language !== 'en') return text;
  const trimmed = text.trim();
  if (dictionary[trimmed]) return text.replace(trimmed, dictionary[trimmed]);
  return text.replace(replacements, match => dictionary[match]).replace(/\b1 guides\b/g, '1 guide');
}
export function translateHtml(html: string, language: string, path: string, origin: string, available = [...languages]) {
  const tree = parse(html, { scriptingEnabled: false });
  const absolute = (p: string, lang = language) => new URL(localizedUrl(p, lang), origin).href;
  function attr(node: Element, name: string) { return node.attrs.find(a => a.name === name); }
  function visit(node: Node, skip = false, authored = false) {
    if ('tagName' in node) {
      if (node.tagName === 'html') { const lang = attr(node, 'lang'); if (lang) lang.value = languages.find(l => l.id === language)!.html; }
      if (node.tagName === 'script') {
        if (attr(node, 'type')?.value === 'application/ld+json') {
          const text = node.childNodes.find(n => n.nodeName === '#text') as DefaultTreeAdapterMap['textNode'] | undefined;
          if (text) {
            const data = JSON.parse(text.value);
            data.author.name = translateText(data.author.name, language); data.mainEntityOfPage = absolute(path);
            data.inLanguage = languages.find(l => l.id === language)!.html;
            text.value = JSON.stringify(data).replace(/</g, '\\u003c');
          }
        }
        return;
      }
      skip ||= ['style', 'pre', 'code', 'option'].includes(node.tagName) || !!attr(node, 'data-language-link') || !!attr(node, 'data-verbatim');
      authored ||= !!attr(node, 'data-authored-content');
      if (!skip) for (const a of node.attrs) if (['alt', 'title', 'aria-label'].includes(a.name)) a.value = translateText(a.value, language);
      if (node.tagName === 'meta') {
        const key = attr(node, 'name')?.value || attr(node, 'property')?.value;
        const content = attr(node, 'content');
        if (!skip && content && ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(key || '')) content.value = translateText(content.value, language);
        if (content && key === 'og:locale') content.value = language === 'en' ? 'en_US' : language === 'zh-tw' ? 'zh_TW' : 'zh_CN';
        if (content && key === 'og:url') content.value = absolute(path);
      }
      if (node.tagName === 'link' && attr(node, 'rel')?.value === 'canonical') attr(node, 'href')!.value = absolute(path === '404.html' ? '404.html' : path);
      if (node.tagName === 'a' && !authored) {
        const href = attr(node, 'href');
        const base = url();
        if (href && href.value.startsWith(base) && !attr(node, 'data-language-link')) {
          const relative = href.value.slice(base.length);
          if (!relative.match(/^(images\/|_astro\/|favicon|robots\.txt)/) && !relative.match(/^(en|zh-tw)\//)) href.value = localizedUrl(relative, language);
        }
      }
      if (node.tagName === 'select' && attr(node, 'data-language-select')) {
        attr(node, 'aria-label')!.value = translateText('选择语言', language);
        for (const child of node.childNodes) if ('tagName' in child && child.tagName === 'option') {
          const lang = attr(child, 'data-language')!.value;
          attr(child, 'value')!.value = localizedUrl(path === '404.html' ? '404/' : path, lang);
          child.attrs = child.attrs.filter(a => a.name !== 'selected');
          if (lang === language) child.attrs.push({ name: 'selected', value: '' });
        }
      }
      if (node.tagName === 'a' && attr(node, 'data-language-link')) attr(node, 'href')!.value = localizedUrl(path, attr(node, 'data-language-link')!.value);
      if (node.tagName === 'a' && attr(node, 'data-language-link')) {
        node.attrs = node.attrs.filter(a => a.name !== 'aria-current');
        if (attr(node, 'data-language-link')!.value === language) node.attrs.push({ name: 'aria-current', value: 'true' });
      }
      if (attr(node, 'data-language-current')) {
        const text = node.childNodes.find(n => n.nodeName === '#text') as DefaultTreeAdapterMap['textNode'];
        text.value = languages.find(l => l.id === language)!.label;
        return;
      }
      if (node.tagName === 'link' && attr(node, 'type')?.value === 'application/rss+xml') {
        attr(node, 'href')!.value = localizedUrl('rss.xml', language);
        attr(node, 'title')!.value = translateText(attr(node, 'title')!.value, language);
      }
    }
    if (node.nodeName === '#text' && !skip) { const text = node as DefaultTreeAdapterMap['textNode']; text.value = translateText(text.value, language); }
    if ('childNodes' in node) {
      node.childNodes = node.childNodes.filter(child => !('tagName' in child && attr(child, 'data-language-link') && !available.some(l => l.id === attr(child, 'data-language-link')!.value)));
      node.childNodes.forEach(child => visit(child, skip, authored));
    }
  }
  visit(tree);
  const head = tree.childNodes.find(n => 'tagName' in n && n.tagName === 'html') as Element;
  const headNode = head.childNodes.find(n => 'tagName' in n && n.tagName === 'head') as Element;
  headNode.childNodes = headNode.childNodes.filter(n => !('tagName' in n && n.tagName === 'link' && attr(n, 'hreflang')));
  const alternate = parse(`<html><head>${available.map(l => `<link rel="alternate" hreflang="${l.html}" href="${absolute(path, l.id)}">`).join('')}${available.some(l => l.id === 'zh-cn') ? `<link rel="alternate" hreflang="x-default" href="${absolute(path, 'zh-cn')}">` : ''}</head></html>`);
  const alternateHtml = alternate.childNodes.find(n => 'tagName' in n && n.tagName === 'html') as Element;
  const alternateHead = alternateHtml.childNodes.find(n => 'tagName' in n && n.tagName === 'head') as Element;
  headNode.childNodes.push(...alternateHead.childNodes);
  return serialize(tree);
}

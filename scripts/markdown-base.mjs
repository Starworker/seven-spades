// Rewrite root-relative Markdown links at build time, including no-JavaScript visits.
export default function markdownBase({ base = '/' } = {}) {
  const prefix = `/${base.replace(/^\/+|\/+$/g, '')}`.replace(/\/$/, '');
  return function transform(tree) {
    function visit(node) {
      if (node.type === 'element') {
        for (const key of ['href', 'src']) {
          const value = node.properties?.[key];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && prefix && value !== prefix && !value.startsWith(`${prefix}/`)) node.properties[key] = `${prefix}${value}`;
        }
        if (node.tagName === 'img') { node.properties.loading = 'lazy'; node.properties.decoding = 'async'; }
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

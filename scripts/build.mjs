// Renders each content/<slug>/<page>.html fragment into two pages:
//   products/<slug>/<page>/index.html  (full site nav)
//   app/<slug>/<page>/index.html       (product-only header, for links inside the apps)
// Usage: node scripts/build.mjs   (generated files are committed; no dependencies)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://www.darkarborlabs.com';
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(read('assets/products.js'), sandbox);
const products = Object.fromEntries(sandbox.window.DAL_PRODUCTS.map((p) => [p.slug, p]));

const layouts = { site: read('layouts/site.html'), app: read('layouts/app.html') };
const fill = (tpl, vars) =>
  tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Unknown token {{${k}}}`);
    return vars[k];
  });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function parse(file) {
  const m = read(file).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(
    m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()])
  );
  return { meta, content: m[2].trim().replace(/^(?=.)/gm, '    ').trimStart() };
}

function write(path, html) {
  mkdirSync(dirname(join(ROOT, path)), { recursive: true });
  writeFileSync(join(ROOT, path), html);
  console.log('wrote', path);
}

for (const slug of readdirSync(join(ROOT, 'content'))) {
  const product = products[slug];
  if (!product) throw new Error(`content/${slug}: no matching slug in assets/products.js`);
  const pages = readdirSync(join(ROOT, 'content', slug)).map((f) => f.replace(/\.html$/, ''));
  const parsed = Object.fromEntries(pages.map((p) => [p, parse(`content/${slug}/${p}.html`)]));

  for (const page of pages) {
    const { meta, content } = parsed[page];
    const root = '../../../'; // both output trees sit three levels deep
    const vars = {
      root,
      slug,
      name: esc(product.name),
      icon: product.icon,
      title: esc(meta.title),
      page: esc(meta.page),
      description: esc(meta.description),
      color: meta.color,
      canonical: `${SITE_URL}/products/${slug}/${page}/`,
      content,
      pagenav: pages
        .map((p) => {
          const cur = p === page ? ' aria-current="page"' : '';
          return `<a href="../${p}/"${cur}>${esc(parsed[p].meta.page)}</a>`;
        })
        .join(''),
    };
    write(`products/${slug}/${page}/index.html`, fill(layouts.site, vars));
    write(`app/${slug}/${page}/index.html`, fill(layouts.app, vars));
  }
}

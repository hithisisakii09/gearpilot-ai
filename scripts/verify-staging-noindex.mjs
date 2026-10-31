import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const htmlPaths = ['index.html', 'about/index.html', 'methodology/index.html', 'affiliate-disclosure/index.html', 'privacy/index.html', 'contact/index.html', 'guides/standing-desk-fit/index.html'];
for (const path of htmlPaths) {
  const html = await readFile(new URL(path, root), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex,follow"\s*\/?\s*>/, `staging robots meta missing: ${path}`);
  assert.doesNotMatch(html, /<link rel="canonical"/, `staging canonical leaked: ${path}`);
}
const robots = await readFile(new URL('robots.txt', root), 'utf8');
assert.match(robots, /^User-agent: \*\nDisallow: \/\n$/);
assert.doesNotMatch(robots, /Allow:|Sitemap:/);
console.log('Staging-only noindex build checks passed for all seven HTML routes and robots.txt.');

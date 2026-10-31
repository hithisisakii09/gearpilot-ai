import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../dist/', import.meta.url);
const site = 'https://gearpilot-ai.hithisisakii09.workers.dev';
const routes = ['/', '/about/', '/methodology/', '/affiliate-disclosure/', '/privacy/', '/contact/', '/guides/standing-desk-fit/'];
for (const route of routes) {
  const path = route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
  const html = await readFile(new URL(path, root), 'utf8');
  const expectedRobots = route === '/contact/' ? 'noindex,follow' : 'index,follow';
  assert.ok(html.includes(`<meta name="robots" content="${expectedRobots}"`), `normal robots meta mismatch: ${path}`);
  assert.ok(html.includes(`<link rel="canonical" href="${site}${route}"`), `normal canonical mismatch: ${path}`);
}
const robots = await readFile(new URL('robots.txt', root), 'utf8');
assert.equal(robots, `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
console.log('Normal build SEO verified for seven routes and robots.txt.');

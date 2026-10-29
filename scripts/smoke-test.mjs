import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const root = join(process.cwd(), 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    const relative = normalize(pathname).replace(/^[/\\]+/, '');
    let path = join(root, relative);
    const info = await stat(path).catch(() => null);
    if (info?.isDirectory() || pathname.endsWith('/')) path = join(path, 'index.html');
    const body = await readFile(path);
    response.writeHead(200, { 'content-type': mime[extname(path)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to start smoke-test server');
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const routes = ['/', '/methodology/', '/affiliate-disclosure/', '/privacy/', '/contact/', '/robots.txt', '/sitemap.xml'];
const results = [];

try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
    const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    if (!response?.ok()) errors.push(`homepage returned ${response?.status()}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) errors.push('horizontal overflow');
    if (!await page.getByRole('heading', { name: 'Standing desk finder' }).isVisible()) errors.push('finder missing');
    await page.getByRole('button', { name: 'Update results' }).click();
    if (!await page.locator('#result-summary').textContent()) errors.push('result summary missing');
    const disclosureHref = await page.getByRole('link', { name: 'Affiliate disclosure' }).first().getAttribute('href');
    if (disclosureHref !== '/affiliate-disclosure/') errors.push('affiliate disclosure navigation broken');
    results.push({ width, overflow, errors });
    await page.close();
  }

  const page = await browser.newPage();
  const routeResults = [];
  for (const route of routes) {
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    routeResults.push({ route, status: response?.status() ?? 0 });
  }
  const home = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  if (!home?.ok()) throw new Error('Unable to reload homepage for link checks');
  const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')).filter(Boolean))]);
  const linkResults = [];
  for (const href of internalLinks) {
    const response = await page.request.get(`${origin}${href}`);
    linkResults.push({ href, status: response.status() });
  }
  await page.close();
  const failures = [...results.flatMap((item) => item.errors), ...routeResults.filter((item) => item.status !== 200).map((item) => `${item.route}: ${item.status}`), ...linkResults.filter((item) => item.status >= 400).map((item) => `${item.href}: ${item.status}`)];
  console.log(JSON.stringify({ viewports: results, routes: routeResults, internalLinks: linkResults, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(process.cwd(), 'dist');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const headersConfig = await readFile(join(root, '_headers'), 'utf8');
const securityHeaders = Object.fromEntries([...headersConfig.matchAll(/^\s{2}([^:\s]+):\s*(.*?)\s*$/gm)].map((match) => [match[1].toLowerCase(), match[2]]));
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    const relative = normalize(pathname).replace(/^[/\\]+/, '');
    let path = resolve(root, relative);
    if (path !== root && !path.startsWith(`${root}${sep}`)) throw new Error('Request escaped static build directory');
    const info = await stat(path).catch(() => null);
    if (info?.isDirectory() || pathname.endsWith('/')) path = join(path, 'index.html');
    const body = await readFile(path);
    response.writeHead(200, { ...securityHeaders, 'content-type': mime[extname(path)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    const notFound = await readFile(join(root, '404.html')).catch(() => Buffer.from('Not found'));
    response.writeHead(404, { ...securityHeaders, 'content-type': 'text/html; charset=utf-8' });
    response.end(notFound);
  }
});

await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to start smoke-test server');
const origin = `http://127.0.0.1:${address.port}`;
const canonicalOrigin = 'https://gearpilot-ai.hithisisakii09.workers.dev';
const browser = await chromium.launch({ headless: true });
const pageRoutes = ['/', '/methodology/', '/affiliate-disclosure/', '/privacy/', '/contact/', '/guides/standing-desk-fit/'];
const utilityRoutes = ['/robots.txt', '/sitemap.xml'];
const results = [];
const forbiddenSchemaTypes = new Set(['Organization', 'Product', 'Offer', 'AggregateRating', 'Review', 'FAQPage']);

try {
  for (const width of [375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
    const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
    if (!response?.ok()) errors.push(`homepage returned ${response?.status()}`);
    for (const [header, expected] of [['x-content-type-options', 'nosniff'], ['x-frame-options', 'DENY'], ['referrer-policy', 'strict-origin-when-cross-origin']]) {
      if (response?.headers()[header] !== expected) errors.push(`missing/incorrect security header ${header}`);
    }
    if (!response?.headers()['content-security-policy']?.includes("script-src 'self'")) errors.push('CSP does not restrict scripts to same-origin');
    if (!response?.headers()['content-security-policy']?.includes("frame-ancestors 'none'")) errors.push('CSP does not block framing');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    if (overflow) errors.push('horizontal overflow');
    if (!await page.getByRole('heading', { name: 'Standing desk finder' }).isVisible()) errors.push('finder missing');
    if (await page.locator('h1').count() !== 1) errors.push('homepage must have exactly one h1');
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.className !== 'skip-link')) errors.push('skip link is not first in keyboard order');
    if (await page.locator('button[type="submit"]').evaluate((button) => button.getBoundingClientRect().height < 44)) errors.push('finder submit target is smaller than 44px');
    const unlabeledControls = await page.locator('input, select, textarea').evaluateAll((controls) => controls.filter((control) => !control.labels?.length).length);
    if (unlabeledControls) errors.push(`${unlabeledControls} form controls are missing labels`);
    await page.getByRole('button', { name: 'Update results' }).click();
    if (!await page.locator('#result-summary').textContent()) errors.push('result summary missing');
    const disclosureHref = await page.getByRole('link', { name: 'Affiliate disclosure' }).first().getAttribute('href');
    if (disclosureHref !== '/affiliate-disclosure/') errors.push('affiliate disclosure navigation broken');
    results.push({ width, overflow, errors });
    await page.close();
  }

  const page = await browser.newPage();
  const routeResults = [];
  const pageMetadata = [];
  const canonicalUrls = new Set();
  const titles = new Set();
  const indexableCanonicals = [];
  const allSchemaTypes = new Set();

  for (const route of pageRoutes) {
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    const status = response?.status() ?? 0;
    routeResults.push({ route, status });
    if (status !== 200) continue;

    const errors = [];
    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const descriptionCount = await page.locator('meta[name="description"]').count();
    const canonicalCount = await page.locator('link[rel="canonical"]').count();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    if (!title.trim() || titles.has(title)) errors.push('missing or duplicate title');
    titles.add(title);
    if (descriptionCount !== 1 || !description?.trim()) errors.push('missing or duplicate description');
    if (canonicalCount !== 1 || canonical !== `${canonicalOrigin}${route}`) errors.push('canonical is absent, duplicated, or incorrect');
    if (canonical && canonicalUrls.has(canonical)) errors.push('duplicate canonical URL');
    if (canonical) canonicalUrls.add(canonical);
    if (route === '/contact/' && robots !== 'noindex,follow') errors.push('contact page must be noindex');
    if (route !== '/contact/' && robots !== 'index,follow') errors.push('indexable page robots directive is incorrect');
    if (robots === 'index,follow' && canonical) indexableCanonicals.push(canonical);

    for (const selector of ['meta[property="og:type"]', 'meta[property="og:site_name"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[name="twitter:card"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]']) {
      if (await page.locator(selector).count() !== 1) errors.push(`missing or duplicate ${selector}`);
    }
    if (await page.locator('meta[property="og:url"]').getAttribute('content') !== canonical) errors.push('Open Graph URL does not match canonical');
    if (await page.locator('meta[property="og:title"]').getAttribute('content') !== title) errors.push('Open Graph title does not match page title');
    if (await page.locator('meta[property="og:description"]').getAttribute('content') !== description) errors.push('Open Graph description does not match page description');
    if (await page.locator('h1').count() !== 1) errors.push('page must have exactly one h1');
    const badHeadingOrder = await page.locator('body').evaluate((body) => {
      const levels = [...body.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((heading) => Number(heading.tagName.slice(1)));
      return levels.some((level, index) => index > 0 && level > levels[index - 1] + 1);
    });
    if (badHeadingOrder) errors.push('heading levels are skipped');

    const externalScripts = await page.locator('script[src]').evaluateAll((scripts) => scripts.map((script) => script.src).filter((src) => new URL(src).origin !== location.origin));
    if (externalScripts.length) errors.push(`unexpected third-party scripts: ${externalScripts.join(', ')}`);
    const schemaTypes = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')['@type']));
    const flattenedTypes = schemaTypes.flat();
    const schemaObjects = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')));
    if (schemaObjects.some((item) => item['@context'] !== 'https://schema.org')) errors.push('JSON-LD context is missing or incorrect');
    flattenedTypes.forEach((type) => allSchemaTypes.add(type));
    if (!flattenedTypes.includes('WebSite')) errors.push('WebSite schema is missing');
    const website = schemaObjects.find((item) => item['@type'] === 'WebSite');
    if (website?.url !== `${canonicalOrigin}/` || website?.name !== 'GearPilot AI') errors.push('WebSite schema identity does not match the production site');
    if (flattenedTypes.some((type) => forbiddenSchemaTypes.has(type))) errors.push('unsupported structured data type present');
    if (route === '/guides/standing-desk-fit/' && !flattenedTypes.includes('BreadcrumbList')) errors.push('visible guide breadcrumbs lack matching schema');
    const unlabeledImages = await page.locator('img:not([alt])').count();
    if (unlabeledImages) errors.push(`${unlabeledImages} images missing alternative text`);
    const smallTargets = await page.locator('nav a, input, select, button').evaluateAll((elements) => elements.filter((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.height < 44 || bounds.width < 24;
    }).length);
    if (smallTargets) errors.push(`${smallTargets} navigation/form targets are below the tested minimum`);
    if (await page.evaluate(() => document.cookie)) errors.push('unexpected document cookie present');
    if (route === '/privacy/') {
      const pageHtml = await page.content();
      if (!/analytics script/i.test(pageHtml)) errors.push('privacy notice does not disclose current analytics status');
      if (/cloudflareinsights\.com|google-analytics\.com|googletagmanager\.com|plausible\.io/i.test(pageHtml)) errors.push('analytics/tracking code found despite no configured analytics');
    }
    const unsafeNewTabs = await page.locator('a[target="_blank"]').evaluateAll((links) => links.filter((link) => {
      const rel = (link.getAttribute('rel') ?? '').split(/\s+/);
      return !rel.includes('noopener') || !rel.includes('noreferrer');
    }).length);
    if (unsafeNewTabs) errors.push(`${unsafeNewTabs} new-tab links omit noopener/noreferrer`);
    routeResults.push(...errors.map((error) => ({ route, error })));
    pageMetadata.push({ route, title, canonical, robots, schemaTypes: flattenedTypes });
  }

  for (const route of utilityRoutes) {
    const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    routeResults.push({ route, status: response?.status() ?? 0 });
  }

  const robotsResponse = await page.request.get(`${origin}/robots.txt`);
  const robotsText = await robotsResponse.text();
  if (!robotsText.includes('User-agent: *') || !robotsText.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) routeResults.push({ route: '/robots.txt', error: 'robots directives or sitemap declaration incorrect' });

  const sitemapResponse = await page.request.get(`${origin}/sitemap.xml`);
  const sitemapText = await sitemapResponse.text();
  const sitemapUrls = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  if (!sitemapText.includes('<urlset') || sitemapUrls.length !== indexableCanonicals.length) routeResults.push({ route: '/sitemap.xml', error: 'sitemap is malformed or incomplete' });
  if (new Set(sitemapUrls).size !== sitemapUrls.length || sitemapUrls.some((url) => !indexableCanonicals.includes(url))) routeResults.push({ route: '/sitemap.xml', error: 'sitemap contains duplicate or non-indexable URLs' });
  if (sitemapUrls.some((url) => url.includes('/contact/'))) routeResults.push({ route: '/sitemap.xml', error: 'noindex contact URL appears in sitemap' });

  const unknown = await page.goto(`${origin}/not-a-real-route/`, { waitUntil: 'networkidle' });
  if (unknown?.status() !== 404 || await page.getByRole('heading', { name: 'Page not found' }).count() !== 1) routeResults.push({ route: '/not-a-real-route/', error: '404 response or custom page is missing' });
  if (await page.locator('meta[name="robots"]').getAttribute('content') !== 'noindex,follow') routeResults.push({ route: '/not-a-real-route/', error: '404 page must be noindex' });
  if (await page.locator('link[rel="canonical"]').count() !== 0) routeResults.push({ route: '/not-a-real-route/', error: '404 page must omit canonical' });
  if (unknown?.headers()['x-content-type-options'] !== 'nosniff' || !unknown.headers()['content-security-policy']) routeResults.push({ route: '/not-a-real-route/', error: '404 response is missing security headers' });

  const pageLinkResults = [];
  for (const route of pageRoutes) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
    const internalLinks = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')).filter(Boolean))]);
    for (const href of internalLinks) {
      const response = await page.request.get(`${origin}${href}`);
      pageLinkResults.push({ from: route, href, status: response.status() });
    }
  }
  const failures = [...results.flatMap((item) => item.errors), ...routeResults.filter((item) => item.status !== undefined && item.status !== 200).map((item) => `${item.route}: ${item.status}`), ...routeResults.filter((item) => item.error).map((item) => `${item.route}: ${item.error}`), ...pageLinkResults.filter((item) => item.status >= 400).map((item) => `${item.from} -> ${item.href}: ${item.status}`)];
  async function filesIn(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => entry.isDirectory() ? filesIn(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
  }
  const protectedDataNames = new Set(['candidates.json', 'observations.json', 'affiliate-programs.json']);
  const researchDataFiles = (await filesIn(root)).filter((file) => protectedDataNames.has(file.split(sep).at(-1))).map((file) => file.slice(root.length + 1));
  if (researchDataFiles.length) failures.push(`research data unexpectedly emitted as root static assets: ${researchDataFiles.join(', ')}`);
  for (const privatePath of ['/src/data/candidates.json', '/src/data/observations.json', '/src/data/affiliate-programs.json']) {
    const response = await page.request.get(`${origin}${privatePath}`);
    if (response.status() !== 404) failures.push(`${privatePath} unexpectedly returned ${response.status()}`);
  }
  console.log(JSON.stringify({ viewports: results, pages: pageMetadata, schemaTypes: [...allSchemaTypes], routes: routeResults, sitemapUrls, internalLinks: pageLinkResults, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
}

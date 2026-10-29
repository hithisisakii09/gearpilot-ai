import { describe, expect, it } from 'vitest';
import {
  createBreadcrumbStructuredData,
  createSeoMetadata,
  normalizeCanonicalUrl,
  PUBLIC_SITE_URL,
  serializeJsonLd,
} from '../src/lib/seo';

describe('technical SEO primitives', () => {
  it('creates complete, unique page metadata without placeholder preview images', () => {
    const home = createSeoMetadata('Finder | GearPilot AI', 'Compare demonstration records transparently.', '/');
    const guide = createSeoMetadata('Workspace guide | GearPilot AI', 'Plan a desk for your workspace.', '/guides/standing-desk-fit/');
    expect(home.canonicalUrl).toBe(`${PUBLIC_SITE_URL}/`);
    expect(guide.canonicalUrl).toBe(`${PUBLIC_SITE_URL}/guides/standing-desk-fit/`);
    expect(guide.canonicalUrl).not.toBe(home.canonicalUrl);
    expect(home.robots).toBe('index,follow');
    expect(guide.openGraph).toMatchObject({ type: 'website', title: 'Workspace guide | GearPilot AI', url: guide.canonicalUrl });
    expect(guide.twitter).toMatchObject({ card: 'summary', description: 'Plan a desk for your workspace.' });
    expect('image' in guide.openGraph).toBe(false);
  });

  it('normalizes root-relative canonical URLs and safely omits canonicals for errors', () => {
    expect(normalizeCanonicalUrl('/privacy')).toBe(`${PUBLIC_SITE_URL}/privacy/`);
    expect(normalizeCanonicalUrl('/')).toBe(`${PUBLIC_SITE_URL}/`);
    expect(normalizeCanonicalUrl(null)).toBeNull();
    expect(() => normalizeCanonicalUrl('//attacker.example/path')).toThrow(/root-relative/);
    expect(() => normalizeCanonicalUrl('https://attacker.example/')).toThrow(/root-relative/);
    expect(() => normalizeCanonicalUrl('/path?query=1')).toThrow(/query or fragment/);
    expect(() => normalizeCanonicalUrl('/path#fragment')).toThrow(/query or fragment/);
    expect(() => normalizeCanonicalUrl('/\\attacker.example')).toThrow(/root-relative/);
    expect(() => normalizeCanonicalUrl('/', 'http://example.test')).toThrow(/HTTPS origin/);
  });

  it('emits breadcrumb schema only from supplied visible navigation and safely serializes JSON-LD', () => {
    const breadcrumb = createBreadcrumbStructuredData([
      { label: 'Home', path: '/' },
      { label: 'Desk setup', path: '/guides/standing-desk-fit/' },
    ]);
    expect(breadcrumb.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${PUBLIC_SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Desk setup', item: `${PUBLIC_SITE_URL}/guides/standing-desk-fit/` },
    ]);
    expect(() => createBreadcrumbStructuredData([{ label: 'Only item', path: '/' }])).toThrow(/at least a home page/);
    expect(serializeJsonLd({ text: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });

  it('supports noindex decisions without changing canonical origin', () => {
    const errorPage = createSeoMetadata('Page not found | GearPilot AI', 'The requested page was not found.', null, false);
    expect(errorPage).toMatchObject({ canonicalUrl: null, robots: 'noindex,follow', openGraph: { url: null } });
  });
});

export const PUBLIC_SITE_URL = 'https://gearpilot-ai.hithisisakii09.workers.dev';

export type BreadcrumbItem = { label: string; path: string };

export type SeoMetadata = {
  canonicalUrl: string | null;
  robots: 'index,follow' | 'noindex,follow';
  openGraph: {
    type: 'website';
    siteName: 'GearPilot AI';
    title: string;
    description: string;
    url: string | null;
  };
  twitter: {
    card: 'summary';
    title: string;
    description: string;
  };
};

export function normalizeCanonicalUrl(path: string | null, siteUrl = PUBLIC_SITE_URL): string | null {
  if (path === null) return null;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\') || /[?#]/.test(path)) {
    throw new Error('Canonical path must be a root-relative pathname without a query or fragment');
  }

  const site = new URL(siteUrl);
  if (site.protocol !== 'https:' || site.pathname !== '/' || site.search || site.hash) {
    throw new Error('Canonical site URL must be an HTTPS origin');
  }
  const canonical = new URL(path, site);
  if (canonical.origin !== site.origin) throw new Error('Canonical path cannot change the site origin');
  if (canonical.pathname !== '/' && !canonical.pathname.endsWith('/')) canonical.pathname += '/';
  return canonical.href;
}

export function createSeoMetadata(
  title: string,
  description: string,
  canonicalPath: string | null,
  indexable = true,
  siteUrl = PUBLIC_SITE_URL,
): SeoMetadata {
  if (!title.trim() || !description.trim()) throw new Error('SEO title and description are required');
  const canonicalUrl = normalizeCanonicalUrl(canonicalPath, siteUrl);
  return {
    canonicalUrl,
    robots: indexable ? 'index,follow' : 'noindex,follow',
    openGraph: { type: 'website', siteName: 'GearPilot AI', title, description, url: canonicalUrl },
    twitter: { card: 'summary', title, description },
  };
}

export function createBreadcrumbStructuredData(items: BreadcrumbItem[], siteUrl = PUBLIC_SITE_URL) {
  if (items.length < 2) throw new Error('Breadcrumbs require at least a home page and current page');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: normalizeCanonicalUrl(item.path, siteUrl),
    })),
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

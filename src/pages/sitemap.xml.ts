export const prerender = true;

const indexablePaths = ['/', '/about/', '/methodology/', '/affiliate-disclosure/', '/privacy/', '/guides/standing-desk-fit/'];
const xmlEscape = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL('https://gearpilot-ai.hithisisakii09.workers.dev');
  const urls = indexablePaths.map((path) => `<url><loc>${xmlEscape(new URL(path, base).href)}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

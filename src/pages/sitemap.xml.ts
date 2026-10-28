export const prerender = true;

export function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL('https://gearpilot-ai.hithisisakii09.workers.dev');
  const paths = ['/', '/methodology/', '/affiliate-disclosure/', '/privacy/', '/contact/'];
  const urls = paths.map((path) => `<url><loc>${new URL(path, base).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

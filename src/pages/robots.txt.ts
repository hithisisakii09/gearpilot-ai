export const prerender = true;

export function GET({ site }: { site: URL | undefined }) {
  const base = site ?? new URL('https://gearpilot-ai.hithisisakii09.workers.dev');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', base).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

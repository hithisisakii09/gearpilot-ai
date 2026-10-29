# Phase 3.4 technical SEO implementation

- Production origin is configured in `astro.config.mjs` and centralized in `src/lib/seo.ts`.
- `src/components/Seo.astro` emits one title, description, robots directive, canonical when appropriate, Open Graph metadata, and Twitter card/title/description. No social image is claimed.
- Canonicals accept internal root-relative paths only, use HTTPS, normalize trailing slashes, and cannot switch origin. Error pages can omit canonical output.
- All documents declare `lang="en-US"`. Contact is noindex until a real public contact channel exists; the custom 404 is noindex and non-canonical.
- Static HTML remains the primary content and finder initial state; client JavaScript enhances finder form interactions.
- Sitemap routes are curated, indexable canonical URLs only. `robots.txt` allows public routes and names the production sitemap.
- Header/footer navigation and contextual links expose the guide and methodology without query-dependent or generated product pages.
- Cloudflare Workers static assets use `not_found_handling: "404-page"` for the built `404.html`.

No automatic Search Console/Bing submission, indexing claim, social preview asset, or URL-specific product landing page was added.

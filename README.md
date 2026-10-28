# GearPilot AI

Evidence-first US home-office comparison MVP. The current standing-desk catalog is synthetic demonstration data, not real products, prices, reviews, or purchase recommendations.

## Quick start

Requires Node.js 22 LTS or newer and npm.

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Verify

```bash
npm test
npm run build
npm audit
```

## Deployment

This repository uses Cloudflare Workers static assets through `wrangler.jsonc`; build output is `dist`. The site URL is configured in `astro.config.mjs`. Do not deploy unverified changes automatically.

## Product safety

All initial catalog products and offers are fictional. Never represent synthetic products as real listings. Real merchant data requires approved usage rights, verified claims, suitable evidence, affiliate disclosures, valid program participation, and source URLs. See `docs/PRODUCT_DATA_ARCHITECTURE.md`, `docs/AFFILIATE_INTEGRATION_PLAN.md`, and `docs/PHASE2_RELEASE_CHECKLIST.md`.

## Next milestones

- Add interactive finder with browser tests
- Add verified evidence ingestion and freshness checks
- Add merchant policy adapters and consent-aware analytics
- Add product categories beyond standing desks
- Add agent review queue and human approval workflow

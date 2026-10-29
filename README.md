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
npm run check
npm run catalog:check
npm run build
npm audit
```

Phase 3.3 local evidence commands are `observations:list`, `observations:validate`, `observations:preview`, `observations:record`, and `quality:report`. Recording requires explicit human-approval metadata and does not promote products or offers automatically.

## Deployment

This repository uses Cloudflare Workers static assets through `wrangler.jsonc`; build output is `dist`. The site URL is configured in `astro.config.mjs`. Do not deploy unverified changes automatically.

## Product safety

All initial public catalog products and offers are fictional. Never represent synthetic products as real listings. Phase 3 keeps real-product research candidates out of public recommendations until evidence is complete and fresh. Real merchant data requires approved usage rights, verified claims, suitable evidence, affiliate disclosures, valid program participation, and source URLs. See `docs/PRODUCT_DATA_ARCHITECTURE.md`, `docs/PHASE3_CATALOG_ARCHITECTURE.md`, `docs/PHASE3_SOURCE_REGISTER.md`, `docs/PHASE3_DATA_FRESHNESS_POLICY.md`, `docs/PHASE3_RELEASE_CHECKLIST.md`, and the `docs/PHASE3_3_*` reports.

## Next milestones

- Add interactive finder with browser tests
- Complete independent human review before promoting pending evidence
- Add merchant policy adapters and consent-aware analytics
- Add product categories beyond standing desks
- Add agent review queue and human approval workflow

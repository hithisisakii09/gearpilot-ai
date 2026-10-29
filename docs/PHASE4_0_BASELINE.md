# Phase 4.0 baseline

## Starting point

- Baseline: Phase 3.9 merge `b6de3fc2d4988e85c85b5e699ac52c0b1a5e7b85`.
- Work branch: `feature/phase4-advertiser-readiness`, created from fetched `origin/main`.
- Initial worktree: clean.
- Production, analytics, affiliate tracking, and publication were not changed.

## Catalog and commercial status

The checked-in catalog contains 10 research candidates. Two historical Vari observations remain pending editorial review. The catalog contains no independently approved real products or eligible offers. The affiliate registry lists eight researched merchants, all `not_applied`; no approved destination domains or tracking references are configured. These counts describe repository data, not live merchant availability.

Public recommendations remain explicitly synthetic demo content. The recommendation ordering is not commission-based. Candidate research, approved product evidence, offer eligibility, and affiliate approval remain separate decisions.

## Existing safeguards

- Zod schemas distinguish candidate/product/offer and affiliate-program records.
- Product and offer eligibility requires fresh evidence, applicable policy evidence, and separate editorial approval.
- Affiliate URL resolution checks the program lifecycle, market, merchant association, and destination allowlist.
- The observation workflow separates collection from human review and requires the reviewer to differ from the collector.
- SEO metadata and sitemap generation exist; the smoke script covers page routes, metadata, structured-data exclusions, response headers, skip navigation, target sizing, and 375/768/1440-pixel viewports.

## Phase 4.0 scope

This change adds an About page and truthful editorial/context copy, strengthens buying-guide education, and adds a non-persisting Branch/CJ approval-intake validator. It does not change catalog candidates, observations, affiliate registry statuses, links, or public offers. See the other Phase 4.0 reports for detailed audit and validation outcomes.

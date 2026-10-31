# Global research expansion (non-publication phase)

The research queue targets multiple continents, beginning with the 12 countries in `config/global-markets.json`. This registry **does not** make the current US-only product schema, USD pricing, merchant contracts, or public finder globally compatible.

## Regional agent pipeline

1. Rotate research by country, category, manufacturer and merchant; avoid duplicate SKU/variant records.
2. Capture local-language primary sources, merchant availability, exact selected options, local currency, delivery address coverage, taxes/duties, returns and evidence timestamps.
3. Audit locale, tax and consumer-disclosure requirements per jurisdiction; never assume US affiliate permission applies globally.
4. Keep observations unpublished until independent governance review and appropriate merchant authorization.
5. Add country-aware catalog, offer, currency, tax and localization schema migrations behind tests and separate release gates.
6. Track real clicks, conversions, commissions and FX costs by country only after approved analytics integration.

## Automation

`.github/workflows/global-research-audit.yml` is a daily **read-only registry/catalog audit** once merged to the default branch. GitHub scheduled workflows run from the default branch, can be delayed or disabled, and do not autonomously browse manufacturers. Separate source adapters and durable queue infrastructure are required for true continuous multi-market research.

## Release constraints

Phase 4.8 hold remains. No automatic self-approval, unverified affiliate links, purchase, contract, production deployment or claim of income. Use gstack-style QA/review and Superpowers-style TDD when installed in the executing agent environment.

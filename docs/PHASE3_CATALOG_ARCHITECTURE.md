# Phase 3.1 catalog architecture

## Scope and safety boundary

Phase 3.1 introduces a reviewable research queue, not a live commerce catalog. `src/data/candidates.json` contains ten real manufacturer-backed standing-desk candidates with no offers. It is not imported by the public finder. `src/data/demo.json` remains the only rendered catalog and is explicitly marked `demo`.

## Contracts

`src/lib/schema.ts` now defines four verification states: `verified`, `partially_verified`, `unverified`, and `demo`. Product verification and affiliate-program approval remain independent.

```text
Catalog
├── Product
│   ├── stable ID, brand, manufacturer, model, category, US market
│   ├── official manufacturer URL and source register entries
│   ├── documented standing-desk specifications
│   ├── per-specification source ID, status, and verified timestamp
│   ├── optional image attribution and usage-permission status
│   └── review notes and update timestamp
└── Offer
    ├── product reference, seller, USD observation(s), and shipping observation
    ├── availability observation(s)
    ├── affiliate approval state and optional approved URL
    └── review notes and update timestamp
```

Unknown values are omitted or `null`; they are never represented as zero. Catalog units are inches, pounds, USD cents, and UTC ISO-8601 timestamps. `kilogramsToPounds()` and `millimetresToInches()` provide documented, tested conversion helpers before data enters the catalog.

## Validation rules

- IDs are unique and every offer must resolve to a product.
- Dimensions and capacities must be positive; min height must be lower than max height.
- Prices and shipping are non-negative integer cents; USD is the only supported currency for this US catalog.
- Timestamps must be ISO-8601 with an offset and cannot be more than 36 hours in the future.
- A verified product needs an official manufacturer URL, sources, identity provenance, and source references for every populated specification.
- Non-demo prices and availability need observed timestamps; approved affiliate status requires a recorded approved URL.

## Public recommendation rule

A real record is eligible only if both product and offer are `verified`, the product has sources, and the offer has an in-stock availability observation plus a known total price that pass freshness policy. Partially verified and unverified records are excluded rather than down-ranked. This prevents stale or incomplete facts from appearing as product recommendations.

## Manual ingestion

Run `npm.cmd run catalog:check` before review. It is a read-only dry run over `src/data/candidates.json`; it does not fetch websites, create links, alter production, or write catalog data. Add edits in Git, review the source register, validate locally, then require human approval before changing a record to `verified` or adding an offer.

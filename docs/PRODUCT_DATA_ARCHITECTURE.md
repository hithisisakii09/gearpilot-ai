# Product data architecture

## Model

The catalog separates durable product information from time-sensitive merchant offers:

```text
Catalog
├── Product (identity, category, specifications, image attribution, pros/cons,
│   comparison attributes, source URLs, last-updated timestamp)
└── Offer (product reference, retailer, USD price, price-verification timestamp,
    availability, affiliate-program status/URL, source URLs, last-updated timestamp)
```

`src/lib/schema.ts` is the runtime contract. It provides unique product/offer IDs, referential integrity, US-market/currency constraints, and a `dataStatus` of `demo` or `verified`.

## Data-entry rules

- Keep `dataStatus: "demo"` until every published fact has been checked against allowed primary sources.
- A `verified` product and offer each require at least one HTTPS source URL. Product images require a URL and attribution.
- Record price in cents and `USD`, mandatory shipping separately, and a price-verification timestamp. Unknown mandatory shipping is `null`, which makes an offer ineligible.
- Record availability as `in_stock`, `out_of_stock`, `discontinued`, or `unknown`; only in-stock offers can be recommended or linked.
- Record pros, cons, and comparison attributes only when they can be tied to the documented editorial evidence process. Empty arrays are preferable to invented commentary.
- Never replace a real product ID or offer ID. Create a new offer when the retailer/listing changes.

## Promotion workflow

1. Add the product and offer as `demo` in a review branch.
2. Capture official product and retailer sources, price checks, image attribution, and update timestamps.
3. Validate locally with the Zod catalog schema and tests.
4. Review source freshness and program approval; change to `verified` only after human approval.
5. Re-check visible content and outbound behavior in the staging build before release.

The current `src/data/demo.json` is intentionally a synthetic fixture, not a product feed.

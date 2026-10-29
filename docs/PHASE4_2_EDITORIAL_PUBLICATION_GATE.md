# Phase 4.2 editorial and product-only publication gate

## Existing commercial gates

The existing commercial eligibility path is preserved: product and offer verification are separate; an offer requires current exact-configuration price/shipping and stock evidence, independent review, and applicable warranty/returns. Affiliate link resolution requires an active approved program and allowlisted destination. Ranking remains commission-independent.

## New informational profile capability

- `Product.configuration` now represents an exact variant, including selected options, dimensions, and optional SKU. A product marked `verified` must include that exact configuration; the model and desktop dimensions must agree with the verified product fields.
- `buildPublicProductProfile` accepts a product plus explicit owner publication authorization scoped to that product. It returns `null` unless the product parses as verified, has an exact configuration, independent review, cited manufacturer source provenance, recent verified specifications, and authorization dated after review.
- The view model intentionally has no offer parameter and no price, shipping, stock, affiliate URL, or purchase CTA fields.
- Warranty duration may be displayed only when it is a verified manufacturer specification, with applicability/coverage limitations stated. Returns remain explicitly UNKNOWN because product-only evidence does not establish order-specific policy.
- `ProductProfile.astro` is a reusable informational template. It creates no Product/Offer JSON-LD or purchase links.
- No public route, catalog record, or authorization was added. The capability remains disabled unless an owner explicitly wires a genuinely reviewed product and authorization into a publication surface.

## Required independent decisions

1. Evidence collector captures genuine configuration-specific primary sources.
2. Different authorized reviewer approves evidence and the product record.
3. Owner explicitly authorizes product-only profile publication.
4. Separately, a commercial offer must independently pass offer eligibility; affiliate use separately requires program approval and approved destination hosts.

Passing one gate never implies passing another. No real product profile is enabled by this change.

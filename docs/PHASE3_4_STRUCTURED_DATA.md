# Phase 3.4 structured data policy

## Emitted JSON-LD

- `WebSite`: GearPilot AI name, configured production URL, and language. This describes the deployed site, not a separately asserted legal organization.
- `BreadcrumbList`: emitted only for the guide page where the same breadcrumb links and labels are visibly rendered.

JSON-LD is serialized with HTML-sensitive characters escaped before insertion.

## Deliberately omitted

- `Organization`: legal organization/identity facts are not established in the repository.
- `Article`: the guide is useful editorial material, but no verified author identity or publication date is available to support fuller article attribution.
- `FAQPage`: no FAQ content is published.
- `Product`, `Offer`, `AggregateRating`, and `Review`: the public finder remains synthetic demo data; the ten research candidates have zero verified offers. Two Vari observations remain pending review. There are no current approved affiliate offers, verified ratings, or reviews.

Browser smoke parses every rendered JSON-LD block and rejects unsupported product, offer, rating, review, organization, and FAQ types. Reconsider schema only when corresponding facts are visible and verified.

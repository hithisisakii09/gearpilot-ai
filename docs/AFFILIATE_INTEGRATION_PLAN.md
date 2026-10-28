# Affiliate integration plan

## Guardrails implemented

- Affiliate status and URL live on the offer, not on ranking inputs.
- `getApprovedAffiliateLink()` returns a link only for an in-stock offer with `affiliateProgramStatus: "approved"` and a recorded URL.
- The link receives `rel="sponsored nofollow noopener noreferrer"` and opens in a separate tab.
- Missing, pending, unavailable, and non-participating programs produce no outbound link and a clear user-facing message.
- There are currently no approved programs, merchant claims, or tracking IDs in the repository.

## Per-merchant onboarding

1. Obtain written approval or approved-network access for the merchant/program.
2. Record only the exact program-approved destination URL; do not manufacture query parameters or tracking IDs.
3. Confirm program terms allow the intended price/specification use and required disclosure language.
4. Add verified retailer/product sources and price verification time.
5. Have a human reviewer confirm the URL, availability behavior, required disclosures, and ranking independence.
6. Test the rendered `rel` attributes and a missing-link fallback before publication.

## Operational controls

- Store approval evidence outside this public repository or as a non-secret review record; do not commit credentials, dashboards, or tokens.
- Re-verify prices and availability on a documented schedule. Expire or hide stale offers rather than presenting an old price as current.
- Commission rate, EPC, conversion, cookie duration, and merchant preference must never enter the recommendation score.

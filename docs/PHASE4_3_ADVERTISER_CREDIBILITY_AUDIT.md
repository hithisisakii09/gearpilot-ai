# Phase 4.3 advertiser credibility audit

## Public-facing copy

- **About:** remains truthful about early-stage development, synthetic demo records, and absence of hands-on testing, established traffic, partnerships, or earnings. No identity/contact details were invented.
- **Contact:** continues to state there is no public monitored contact channel. A real channel must be supplied, tested, and owner-approved before it can be published.
- **Privacy:** describes current application behavior and qualifies Cloudflare request/security processing and unverified retention; it is not a legal-compliance claim.
- **Affiliate disclosure:** corrected the stale statement that all eight merchant records were `not_applied`. It now explains that the Branch record is pending based on owner-supplied evidence, not acceptance, and the other seven remain not applied.
- **Methodology:** documents the actual distinction between an informational product-only profile and the separate offer/affiliate gates.
- **Standing-desk guide:** existing general education covers fit, adjustment, stability, warranty/returns, shipping, and checking exact configuration sources without product review claims.

## Technical checks

The shared layout provides canonical/robots metadata, primary/footer navigation and a keyboard skip link. Sitemap contains indexable public routes and excludes Contact; robots.txt links the sitemap. Existing local smoke checks cover metadata, internal links, security headers on the local static preview, input labels, skip link, minimum targets, schema exclusions, and responsive widths.

The synthetic product-profile preview uses a dynamic development-only route. Static builds generate no route for it; the production smoke test asserts a 404. No production deployment SHA, remote CI, Lighthouse, live response headers, or assistive-technology audit is claimed.

## Remaining owner readiness

No public email was supplied. Operator identity, monitored contact, actual hosting retention, applicable jurisdiction, and qualified privacy/legal review remain owner actions. No legal compliance is asserted.

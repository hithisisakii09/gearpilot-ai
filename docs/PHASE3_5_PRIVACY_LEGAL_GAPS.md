# Phase 3.5 privacy, disclosure, and legal owner gaps

## Implemented and locally verified

- `src/pages/privacy.astro` says there is no app analytics script, account, form, or newsletter; it discloses Cloudflare hosting/request processing as a possibility and states retention settings are unverified.
- `src/pages/affiliate-disclosure.astro` states current demo/no-link status and that all eight merchant programs are not applied; it explains future eligibility and sponsored-link requirements.
- `src/pages/contact.astro` does not invent a channel; its metadata is `noindex,follow` until a real monitored contact route exists.
- The finder explicitly labels three fictional demo records and excludes research candidates from public offers.
- No analytics beacon, cookie, fingerprinting, or affiliate-click measurement is present in app code or page output checks.
- Cloudflare's Web Analytics documentation was reviewed as a possible future aggregate analytics option; account configuration and actual data/retention settings were not verified.

## Owner-supplied facts missing — release BLOCKED

- Legal/operator identity, jurisdiction, mailing/business address if required, and monitored privacy/correction contact.
- Actual Cloudflare account/zone owner, applicable service terms, request/security log processing, retention settings, data transfers, and any configured subprocessors.
- Whether a privacy contact channel or data subject request process exists and how requests are handled.
- Applicable user regions and resulting controller/processor, notice, cookie/consent, and consumer-protection obligations.
- Affiliate terms and actual program participation/approval; currently none.
- If analytics is considered: authorized property/zone configuration, exact script/data fields, retention, access controls, privacy notice updates, and any required consent.

No legal compliance, lawful basis, opt-in/consent status, or jurisdictional applicability is asserted.

## Qualified review required

Ask qualified privacy/legal counsel to review the eventual real controller notice, hosting/data-processing details, user rights and retention; jurisdiction-specific privacy/cookie requirements; accessibility and consumer-protection statements; and any future affiliate disclosure placement/wording and merchant terms.

## Proposed copy — draft only; not published

The following is a template for an owner to complete and counsel to review. Bracketed values are deliberately absent from the live pages until documented:

> GearPilot AI is operated by **[owner-provided legal operator name]**. For privacy requests or corrections, contact **[owner-provided monitored channel]**. The site uses **[verified hosting and analytics services]** to **[verified purposes]**. Those providers process **[verified data categories]** for **[verified retention period/criteria]** under **[verified terms and locations]**. **[Counsel-approved rights and request instructions.]**

Do not publish this template with blanks or treat it as legal advice. Current production copy remains conservative and incomplete; the contact route stays noindex.

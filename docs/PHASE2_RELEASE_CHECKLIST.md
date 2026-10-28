# Phase 2 release checklist

## Required before public launch

- [ ] Replace every synthetic product and offer with verified data or keep the site in clearly labeled demo mode.
- [ ] Review every specification, price, availability, source URL, image license/attribution, pro, and con.
- [ ] Obtain and record approval for each affiliate program and its exact destination URL.
- [ ] Publish a monitored contact method.
- [ ] Replace the interim privacy notice with the actual controller/provider/tracking/rights information.
- [ ] Obtain legal/editorial review of disclosure, privacy, claims, and merchant terms.
- [ ] Set a process and owner for price/source freshness and correction requests.
- [ ] Perform desktop, tablet, and mobile browser QA against the staging deployment, including console errors and keyboard-only navigation.
- [ ] Run an automated accessibility audit and address high-impact findings.
- [ ] Confirm canonical URLs, sitemap, robots, Open Graph preview, structured data, 404 handling, and every navigation/footer link on the deployed domain.
- [ ] Run `npm.cmd test`, `npm.cmd run build`, and `npm.cmd audit` with clean output.
- [ ] Review `git diff`, obtain approval, merge, then deploy through the approved Cloudflare workflow.

## Explicit non-actions in Phase 2

- No merge to `main`.
- No Cloudflare deployment.
- No merchant signup, tracking-ID generation, external API, database, paid service, or fabricated content.

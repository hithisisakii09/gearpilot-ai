# Phase 3.2 release checklist

- [x] Branch is based on merged Phase 3.1 `origin/main`.
- [x] Registry models all required lifecycle statuses and excludes credentials/secrets from Git.
- [x] All eight merchant records are explicitly `not_applied`; no approval, program, network, or application claim is fabricated.
- [x] Resolver requires verification, approval evidence, credential reference, HTTPS, merchant matching, active status, US region, and destination allowlisting.
- [x] Sponsored links receive `sponsored nofollow noopener noreferrer`; non-approved links are blocked.
- [x] Commission/referral information remains outside recommendation scoring.
- [x] Click measurement is intentionally absent; privacy disclosure states this.
- [ ] Complete a human-authorized application only after confirming official merchant terms.
- [ ] Add valid program approval evidence and a safe secret reference outside Git.
- [ ] Capture current verified offers before considering any referral destination.
- [ ] Conduct legal/editorial review of each program's required disclosure and promotional restrictions.
- [ ] Obtain approval before merging or deploying.

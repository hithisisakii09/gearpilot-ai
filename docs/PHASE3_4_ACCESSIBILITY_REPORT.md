# Phase 3.4 accessibility report

## Automated local checks

The Playwright smoke suite verifies at 375px, 768px, and 1440px:

- No horizontal overflow and exactly one page H1.
- Heading levels do not skip a level.
- First keyboard Tab reaches the skip-to-main link.
- Finder form controls have associated labels; submit button and tested navigation/form controls have 44 CSS-pixel minimum targets.
- Internal navigation destinations resolve and no browser console/page errors occur on the responsive homepage checks.
- No images are currently rendered without alternative text.

The existing focus-visible outline and skip-link behavior are preserved. No axe, Lighthouse accessibility audit, or assistive-technology suite is installed; no automated WCAG conformance claim is made.

As a source-palette calculation (not an automated full-page audit), normal text/link/focus colors measured at or above 9:1 for the tested dark surfaces, and button text/background at 9.94:1. Hover, alpha, browser overrides, and every component state were not exhaustively audited.

## Manual checks pending

- Test the full finder with keyboard only and representative screen readers.
- Review color contrast in all states (including hover, focus, muted text, and button states) against WCAG criteria.
- Confirm zoom/reflow at 200% and 400%, browser high-contrast modes, reduced motion, and touch target spacing on real devices.
- Have an accessibility reviewer assess the guide and disclosure/privacy content.

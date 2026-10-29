# Phase 3.4 performance report

## Implemented observations

- Astro serves prerendered static HTML; the guide and metadata are available without client-side rendering.
- The finder retains its existing enhancement bundle. No new runtime package, remote font, image, analytics beacon, or third-party JavaScript dependency was added.
- Main templates have no hero or catalog image assets requiring optimization. System fonts remain in use.
- Native browser form controls and responsive CSS are retained. The change only adds touch-target minimums and breadcrumb styling.

## Measurements

Measured from the local static build on 2026-10-29. Sizes are raw bytes plus a local gzip-size estimate using Node zlib; they are not observed network transfer sizes and Cloudflare may use different compression.

| Asset | Raw bytes | Local gzip estimate |
| --- | ---: | ---: |
| Homepage HTML | 8,575 | 3,055 |
| Workspace guide HTML | 8,137 | 3,127 |
| Finder JavaScript bundle | 116,627 | 31,787 |
| All static output files | 158,850 | 48,388 |

The only JavaScript asset is the existing interactive finder bundle; its footprint is the largest asset and deserves follow-up code-splitting/bundle analysis before further interactive features are added. This phase did not remove the existing runtime schema/recommendation checks or change finder behavior to chase a size target. Generated pages include the content and metadata as static HTML. No separate CSS/font/image asset or third-party request is present.

Lighthouse is not installed/available in this workspace, and no production Core Web Vitals field dataset was collected; no Lighthouse score, LCP, INP, or CLS value is claimed. Local browser timing is not a substitute for field data or a production performance result.

## Remaining work

Run Lighthouse against an authorized preview/production release, examine mobile throttled traces, and collect field Web Vitals only after privacy-reviewed analytics configuration. Check rendered 404 behavior and cache/header configuration in Cloudflare preview before release.

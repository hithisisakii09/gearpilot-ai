# Phase 4.3 product profile preview verification

The dev route `/dev/product-profile-preview/` uses an inline, clearly labeled synthetic fixture and the existing profile builder/component. It is generated through a dynamic Astro route only when `import.meta.env.DEV` is true. In production builds, `getStaticPaths()` returns an empty list, so no preview page is emitted.

Local development server verification on 2026-10-29 returned HTTP 200 and rendered the `SYNTHETIC TEST FIXTURE` banner and synthetic profile content. The server was stopped after verification.

The production smoke test requests the same path from the built static site and requires HTTP 404. The component includes no Product/Offer JSON-LD or commerce fields. The builder requires verified exact configuration, fresh cited manufacturer evidence, independent editorial review, and explicit product-scoped owner authorization. It accepts no offer object, and the preview contains no price, stock, shipping, purchase CTA, or affiliate URL.

This is a local development preview test only; it is not a real product, approval, owner authorization, production route, or deployed-site check.

# Phase 3.3 manual verification workflow

## Commands

```powershell
npm.cmd run observations:list
npm.cmd run observations:validate -- --input path\to\proposed-observations.json
npm.cmd run observations:preview -- --input path\to\proposed-observations.json
npm.cmd run observations:record -- --input path\to\approved-observations.json --reviewer "Reviewer name" --reviewed-at 2026-10-29T05:05:00Z --confirm-reviewed
npm.cmd run quality:report -- --at 2026-10-29T05:05:00Z --write
```

`list` identifies missing evidence. `validate` and `preview` are read-only and report reference, duplicate, and conflict errors. `record` is the only write path and refuses to run without the explicit confirmation flag, reviewer identity, review timestamp, and matching `approved` metadata on every proposed observation. It never edits product verification status or affiliate state.

## Reviewer procedure

1. Select one exact sellable US configuration, including size, finish, frame/controller, SKU, and other price-changing options.
2. Open an official manufacturer or authorized seller page without bypassing access controls.
3. Record full product/source URLs, merchant, USD price in integer cents, shipping status/amount, stock status, UTC observation time, and a concise evidence note.
4. Use `null` for unknown facts. Do not infer free shipping, stock, currency, or configuration defaults.
5. Run `observations:validate`, inspect conflicts, then run `observations:preview` and review the Git diff.
6. An authorized human independently checks the source and adds their name, UTC review time, and `reviewStatus: "approved"`.
7. Run `observations:record` with matching approval arguments.
8. Promotion into a `verified` product/offer is a separate editorial change. Run the complete test and release checklist before it.

No command performs network collection or unattended updates.

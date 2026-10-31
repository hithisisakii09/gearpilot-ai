# Evidence retention preflight (non-destructive)

The offline `scripts/evidence-retention-audit.mjs` checks ledger integrity and flags stale, future-dated or missing observation timestamps. Its default 30-day threshold is an **illustrative research freshness policy**, not an approved legal retention or deletion schedule. No files are removed, evidence is not encrypted or transferred, and no approval is issued. Do not treat this as production retention compliance. Final policy requires jurisdiction-specific review and independent reviewer governance; Phase 4.8 hold remains active.

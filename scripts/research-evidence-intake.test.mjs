import { describe, it, expect } from 'vitest';
import { validateEvidenceIntake } from './research-evidence-intake.mjs';
const queue = { tasks: [{ id: '2026-10-31:IN:standing_desk', country: 'IN', currency: 'INR', category: 'standing_desk' }] };
const entry = { taskId: '2026-10-31:IN:standing_desk', country: 'IN', currency: 'INR', category: 'standing_desk', sku: 'DESK-123', productName: 'Desk', sourceUrl: 'https://manufacturer.example/products/desk', sourceKind: 'manufacturer_product_page', priceMinorUnits: null, observedAt: '2026-10-31T08:00:00Z' };
describe('research evidence intake', () => {
  it('quarantines accepted records for review, never publication', () => { const result = validateEvidenceIntake([entry], queue); expect(result).toMatchObject({ valid: true, publicationAuthorized: false }); expect(result.accepted[0]).toMatchObject({ reviewStatus: 'pending_review', publicationAuthorized: false }); });
  it('rejects task market mismatch', () => expect(validateEvidenceIntake([{ ...entry, country: 'US' }], queue).errors[0].code).toBe('TASK_MARKET_MISMATCH'));
  it('rejects non-HTTPS evidence URLs', () => expect(validateEvidenceIntake([{ ...entry, sourceUrl: 'http://manufacturer.example/' }], queue).errors[0].code).toBe('UNSAFE_SOURCE_URL'));
  it('rejects IP-literal sources', () => expect(validateEvidenceIntake([{ ...entry, sourceUrl: 'https://127.0.0.1/' }], queue).errors[0].code).toBe('UNSAFE_SOURCE_URL'));
  it('rejects duplicate evidence', () => expect(validateEvidenceIntake([entry, entry], queue).errors[0].code).toBe('DUPLICATE_EVIDENCE'));
  it('rejects unsupported source kind', () => expect(validateEvidenceIntake([{ ...entry, sourceKind: 'social_post' }], queue).errors[0].code).toBe('UNSUPPORTED_SOURCE_KIND'));
});

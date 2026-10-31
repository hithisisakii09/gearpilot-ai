import { describe, it, expect } from 'vitest';
import { auditResearchQueue } from './research-queue-audit.mjs';
const registry = { markets: [{ country: 'IN', currency: 'INR', language: 'en' }] };
const task = { id: '2026-10-31:IN:standing_desk', country: 'IN', currency: 'INR', language: 'en', category: 'standing_desk', status: 'pending_primary_source_research', publicationAuthorized: false };
describe('research queue safety', () => {
  it('accepts pending tasks', () => expect(auditResearchQueue({ tasks: [task] }, registry).valid).toBe(true));
  it('rejects duplicate tasks', () => expect(auditResearchQueue({ tasks: [task, task] }, registry).findings.some(f => f.code === 'DUPLICATE_TASK')).toBe(true));
  it('rejects self-authorized publication', () => expect(auditResearchQueue({ tasks: [{ ...task, publicationAuthorized: true }] }, registry).findings.some(f => f.code === 'UNSAFE_TASK_STATE')).toBe(true));
  it('rejects currency mismatch', () => expect(auditResearchQueue({ tasks: [{ ...task, currency: 'USD' }] }, registry).findings.some(f => f.code === 'MARKET_METADATA_MISMATCH')).toBe(true));
});

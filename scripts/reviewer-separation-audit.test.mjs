import { describe, expect, it } from 'vitest';
import { auditReviewerSeparation } from './reviewer-separation-audit.mjs';
const plan = () => ({ collectorId: 'collector', reviewerIds: ['reviewer-a', 'reviewer-b'], authenticatedReviewerIds: [], publicationAuthorized: false, bypassAllowed: false });
describe('reviewer separation planning audit', () => {
  it('accepts distinct planned identities without granting approval', () => expect(auditReviewerSeparation(plan())).toMatchObject({ valid: true, publicationAuthorized: false, reviewerSelectionStatus: 'planning_only' }));
  it('rejects a reviewer acting as collector', () => expect(auditReviewerSeparation({ ...plan(), collectorId: 'reviewer-a' }).valid).toBe(false));
  it('rejects duplicate reviewers', () => expect(auditReviewerSeparation({ ...plan(), reviewerIds: ['same', 'same'] }).valid).toBe(false));
  it('rejects missing reviewer', () => expect(auditReviewerSeparation({ ...plan(), reviewerIds: ['reviewer-a'] }).valid).toBe(false));
  it('rejects asserted authentication', () => expect(auditReviewerSeparation({ ...plan(), authenticatedReviewerIds: ['reviewer-a'] }).valid).toBe(false));
  it('rejects publishing or bypass', () => expect(auditReviewerSeparation({ ...plan(), publicationAuthorized: true, bypassAllowed: true }).valid).toBe(false));
});

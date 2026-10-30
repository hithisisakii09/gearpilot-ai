import { describe, expect, it } from 'vitest';
import { auditConfigurationIdentity } from './audit-configuration-identity.mjs';

const candidate = { products: [{ id: 'branch-duo-standing-desk', specifications: { desktopWidthInches: 48, desktopDepthInches: 24 } }] };

describe('read-only configuration identity audit', () => {
  it('flags a 36x24 assessment against a 48x24 catalog', () => {
    const result = auditConfigurationIdentity(candidate, { candidateAssessments: [{ productId: 'branch-duo-standing-desk', exactConfiguration: { id: 'branch-36x24', desktopWidthInches: 36, desktopDepthInches: 24 } }] });
    expect(result).toEqual([{ severity: 'blocker', code: 'CONFIGURATION_MISMATCH', productId: 'branch-duo-standing-desk', field: 'width', catalog: 48, assessment: 36, configurationId: 'branch-36x24' }]);
  });
  it('does not flag a matching configuration', () => {
    expect(auditConfigurationIdentity(candidate, { candidateAssessments: [{ productId: 'branch-duo-standing-desk', exactConfiguration: { desktopWidthInches: 48, desktopDepthInches: 24 } }] })).toEqual([]);
  });
  it('reports unknown candidate IDs without mutating inputs', () => {
    const data = { candidateAssessments: [{ productId: 'unknown', exactConfiguration: null }] };
    expect(auditConfigurationIdentity(candidate, data)[0].code).toBe('UNKNOWN_PRODUCT');
    expect(data.candidateAssessments[0].productId).toBe('unknown');
  });
});

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { auditConfigurationIdentity } from './audit-configuration-identity.mjs';

const candidate = { products: [{ id: 'branch-duo-standing-desk', specifications: { desktopWidthInches: 48, desktopDepthInches: 24 } }] };

describe('read-only configuration identity audit', () => {
  it('runs from the repository root as a relative CLI path', () => {
    const root = fileURLToPath(new URL('../', import.meta.url));
    const output = execFileSync(process.execPath, ['scripts/audit-configuration-identity.mjs'], { cwd: root, encoding: 'utf8' });
    const report = JSON.parse(output);
    expect(report.status).toBe('review_required');
    expect(report.findings).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'CONFIGURATION_MISMATCH', productId: 'branch-duo-standing-desk', catalog: 48, assessment: 36 })]));
  });
  it('flags a 36x24 assessment against a 48x24 catalog', () => {
    const result = auditConfigurationIdentity(candidate, { candidateAssessments: [{ productId: 'branch-duo-standing-desk', exactConfiguration: { id: 'branch-36x24', desktopWidthInches: 36, desktopDepthInches: 24 } }] });
    expect(result).toEqual([{ severity: 'blocker', code: 'CONFIGURATION_MISMATCH', productId: 'branch-duo-standing-desk', field: 'width', catalog: 48, assessment: 36, configurationId: 'branch-36x24' }]);
  });
  it('does not flag a matching configuration', () => {
    expect(auditConfigurationIdentity(candidate, { candidateAssessments: [{ productId: 'branch-duo-standing-desk', exactConfiguration: { desktopWidthInches: 48, desktopDepthInches: 24 } }] })).toEqual([]);
  });
  it('reports nonfinite observed dimensions as warnings, not mismatches', () => {
    const data = { candidateAssessments: [{ productId: 'branch-duo-standing-desk', exactConfiguration: { desktopWidthInches: NaN, desktopDepthInches: 24 } }] };
    expect(auditConfigurationIdentity(candidate, data)).toEqual([{ severity: 'warning', code: 'INVALID_ASSESSMENT_DIMENSION', productId: 'branch-duo-standing-desk', field: 'width', configurationId: null }]);
  });
  it('blocks duplicate catalog product identities instead of silently overwriting', () => {
    const catalog = { products: [candidate.products[0], { ...candidate.products[0], specifications: { desktopWidthInches: 36, desktopDepthInches: 24 } }] };
    expect(auditConfigurationIdentity(catalog, { candidateAssessments: [] })).toEqual([{ severity: 'blocker', code: 'DUPLICATE_CATALOG_PRODUCT_ID', productId: 'branch-duo-standing-desk' }]);
  });
  it('reports unknown products as findings for human review', () => {
    const findings = auditConfigurationIdentity(candidate, { candidateAssessments: [{ productId: 'unmapped' }] });
    expect(findings).toEqual([{ severity: 'warning', code: 'UNKNOWN_PRODUCT', productId: 'unmapped' }]);
  });
  it('reports unknown candidate IDs without mutating inputs', () => {
    const data = { candidateAssessments: [{ productId: 'unknown', exactConfiguration: null }] };
    expect(auditConfigurationIdentity(candidate, data)[0].code).toBe('UNKNOWN_PRODUCT');
    expect(data.candidateAssessments[0].productId).toBe('unknown');
  });
});

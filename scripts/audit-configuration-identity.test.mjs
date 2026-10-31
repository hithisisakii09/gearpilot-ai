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
  it('blocks catalog entries with missing product identity', () => {
    expect(auditConfigurationIdentity({ products: [{ specifications: { desktopWidthInches: 48 } }] }, { candidateAssessments: [] })).toEqual([{ severity: 'blocker', code: 'MISSING_CATALOG_PRODUCT_ID' }]);
  });
  it('blocks assessments with missing product identity', () => {
    expect(auditConfigurationIdentity(candidate, { candidateAssessments: [{ exactConfiguration: { desktopWidthInches: 48 } }] })).toEqual([{ severity: 'blocker', code: 'MISSING_ASSESSMENT_PRODUCT_ID' }]);
  });
  it('warns when the same product configuration is assessed twice', () => {
    const assessment = { productId: 'branch-duo-standing-desk', exactConfiguration: { id: 'same-configuration', desktopWidthInches: 48, desktopDepthInches: 24 } };
    expect(auditConfigurationIdentity(candidate, { candidateAssessments: [assessment, assessment] })).toEqual([{ severity: 'warning', code: 'DUPLICATE_ASSESSMENT_CONFIGURATION', productId: 'branch-duo-standing-desk', configurationId: 'same-configuration' }]);
  });
  it('reports null catalog and assessment records instead of crashing', () => {
    expect(auditConfigurationIdentity({ products: [null] }, { candidateAssessments: [null] })).toEqual([
      { severity: 'blocker', code: 'INVALID_CATALOG_PRODUCT_RECORD' },
      { severity: 'blocker', code: 'INVALID_ASSESSMENT_RECORD' },
    ]);
  });
  it('blocks actual offer observations with mismatched dimensions', () => {
    const findings = auditConfigurationIdentity({ products: [{ id: 'desk', specifications: { desktopWidthInches: 48, desktopDepthInches: 24 } }] }, { observations: [{ productId: 'desk', reviewStatus: 'approved', configuration: { desktopWidthInches: 36, desktopDepthInches: 24 } }] });
    expect(findings).toEqual([{ severity: 'blocker', code: 'OBSERVATION_CONFIGURATION_MISMATCH', productId: 'desk', field: 'desktopWidthInches', catalog: 48, observation: 36 }]);
  });
  it('blocks malformed observations without crashing', () => {
    expect(auditConfigurationIdentity({ products: [] }, { observations: [null, {}] })).toEqual([
      { severity: 'blocker', code: 'INVALID_OBSERVATION_RECORD' },
      { severity: 'blocker', code: 'MISSING_OBSERVATION_PRODUCT_ID' },
    ]);
  });
  it('blocks assessment records explicitly missing exact configuration evidence', () => {
    const findings = auditConfigurationIdentity({ products: [{ id: 'desk' }] }, { candidateAssessments: [{ productId: 'desk', missingEvidence: ['exact_configuration'] }] });
    expect(findings).toEqual([{ severity: 'blocker', code: 'ASSESSMENT_CONFIGURATION_EVIDENCE_MISSING', productId: 'desk' }]);
  });
  it('flags commercial observations that lack independent approval', () => {
    const findings = auditConfigurationIdentity({ products: [{ id: 'desk' }] }, { observations: [{ id: 'offer-1', productId: 'desk', reviewStatus: 'pending_review' }] });
    expect(findings).toEqual([{ severity: 'warning', code: 'OBSERVATION_NOT_APPROVED', productId: 'desk', observationId: 'offer-1' }]);
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

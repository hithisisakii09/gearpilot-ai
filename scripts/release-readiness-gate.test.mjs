import { describe, expect, it } from 'vitest';
import { evaluateReleaseGate } from './release-readiness-gate.mjs';

const catalog = { products: [{ id: 'desk', specifications: { desktopWidthInches: 48 } }] };
const observations = { candidateAssessments: [{ productId: 'desk', exactConfiguration: { desktopWidthInches: 48 } }] };

describe('production readiness gate', () => {
  it('blocks release when independent approvals and staging evidence are absent', () => {
    const result = evaluateReleaseGate({ catalog, observations });
    expect(result.verdict).toBe('NO_GO');
    expect(result.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ gate: 'explicitLaunchApproval' })]));
  });
  it('does not convert self-attested booleans into launch authorization', () => {
    const evidence = Object.fromEntries(['independentCodeReview','twoIndependentApprovers','separateCollector','privateEncryptedVersionedEvidence','liveStagingUat','stagingRollback','merchantCompliance','explicitLaunchApproval'].map((key) => [key, true]));
    const result = evaluateReleaseGate({ catalog, observations, evidence });
    expect(result.verdict).toBe('NO_GO');
    expect(result.reason).toBe('PHASE_4_8_PUBLICATION_HOLD');
    expect(result.evidenceAccepted).toBe(false);
    expect(result.checks.every((check) => !check.verified)).toBe(true);
    expect(result.blockers.filter((blocker) => blocker.code === 'UNVERIFIED_RELEASE_GATE')).toHaveLength(8);
  });
  it('retains configuration blockers', () => {
    const result = evaluateReleaseGate({ catalog, observations: { candidateAssessments: [{ productId: 'desk', exactConfiguration: { desktopWidthInches: 36 } }] } });
    expect(result.blockers).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'CONFIGURATION_MISMATCH' })]));
  });
});

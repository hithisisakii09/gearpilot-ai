import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { auditConfigurationIdentity } from './audit-configuration-identity.mjs';

/** Read-only and fail-closed. Never authorizes deployment or publication. */
export function evaluateReleaseGate({ catalog, observations, evidence = {} }) {
  const findings = auditConfigurationIdentity(catalog, observations);
  const required = ['independentCodeReview', 'twoIndependentApprovers', 'separateCollector', 'privateEncryptedVersionedEvidence', 'liveStagingUat', 'stagingRollback', 'merchantCompliance', 'explicitLaunchApproval'];
  const checks = required.map((key) => ({ key, verified: evidence[key] === true }));
  const blockers = [
    ...findings.map((finding) => ({ code: finding.code, source: 'configuration_audit', severity: finding.severity })),
    ...checks.filter((check) => !check.verified).map((check) => ({ code: 'UNVERIFIED_RELEASE_GATE', gate: check.key, severity: 'blocker' })),
  ];
  return { verdict: 'NO_GO', reason: 'PHASE_4_8_PUBLICATION_HOLD', blockers, checks, findings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const catalog = JSON.parse(readFileSync(new URL('../src/data/candidates.json', import.meta.url), 'utf8'));
  const observations = JSON.parse(readFileSync(new URL('../src/data/observations.json', import.meta.url), 'utf8'));
  console.log(JSON.stringify(evaluateReleaseGate({ catalog, observations }), null, 2));
}

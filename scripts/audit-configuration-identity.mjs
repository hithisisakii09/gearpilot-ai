import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Read-only checks for research configuration identity. Never promotes offers. */
export function auditConfigurationIdentity(candidates, observationData) {
  const products = new Map((candidates.products ?? []).map((p) => [p.id, p]));
  const findings = [];
  for (const assessment of observationData.candidateAssessments ?? []) {
    const product = products.get(assessment.productId);
    if (!product) {
      findings.push({ severity: 'warning', code: 'UNKNOWN_PRODUCT', productId: assessment.productId });
      continue;
    }
    const config = assessment.exactConfiguration;
    if (!config) continue;
    for (const [field, label] of [['desktopWidthInches', 'width'], ['desktopDepthInches', 'depth']]) {
      const expected = product.specifications?.[field];
      const observed = config[field];
      if (typeof expected === 'number' && typeof observed === 'number' && expected !== observed) {
        findings.push({ severity: 'blocker', code: 'CONFIGURATION_MISMATCH', productId: assessment.productId, field: label, catalog: expected, assessment: observed, configurationId: config.id ?? null });
      }
    }
  }
  return findings;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const catalogPath = new URL('../src/data/candidates.json', import.meta.url);
  const observationsPath = new URL('../src/data/observations.json', import.meta.url);
  const findings = auditConfigurationIdentity(JSON.parse(readFileSync(catalogPath, 'utf8')), JSON.parse(readFileSync(observationsPath, 'utf8')));
  console.log(JSON.stringify({ status: findings.some((f) => f.severity === 'blocker') ? 'review_required' : 'no_blockers_found', findings }, null, 2));
  // Exit successfully: a research finding must not alter data or trigger publication.
}

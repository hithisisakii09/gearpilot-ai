import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/** Read-only checks for research configuration identity. Never promotes offers. */
export function auditConfigurationIdentity(candidates, observationData) {
  const findings = [];
  const products = new Map();
  for (const product of candidates.products ?? []) {
    if (typeof product.id !== 'string' || !product.id.trim()) {
      findings.push({ severity: 'blocker', code: 'MISSING_CATALOG_PRODUCT_ID' });
      continue;
    }
    if (products.has(product.id)) findings.push({ severity: 'blocker', code: 'DUPLICATE_CATALOG_PRODUCT_ID', productId: product.id });
    else products.set(product.id, product);
  }
  const assessmentIds = new Set();
  for (const assessment of observationData.candidateAssessments ?? []) {
    if (typeof assessment.productId !== 'string' || !assessment.productId.trim()) {
      findings.push({ severity: 'blocker', code: 'MISSING_ASSESSMENT_PRODUCT_ID' });
      continue;
    }
    const configurationId = assessment.exactConfiguration?.id;
    if (typeof configurationId === 'string' && configurationId.trim()) {
      const identity = JSON.stringify([assessment.productId, configurationId]);
      if (assessmentIds.has(identity)) findings.push({ severity: 'warning', code: 'DUPLICATE_ASSESSMENT_CONFIGURATION', productId: assessment.productId, configurationId });
      else assessmentIds.add(identity);
    }
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
      if (observed !== undefined && !Number.isFinite(observed)) {
        findings.push({ severity: 'warning', code: 'INVALID_ASSESSMENT_DIMENSION', productId: assessment.productId, field: label, configurationId: config.id ?? null });
      } else if (Number.isFinite(expected) && Number.isFinite(observed) && expected !== observed) {
        findings.push({ severity: 'blocker', code: 'CONFIGURATION_MISMATCH', productId: assessment.productId, field: label, catalog: expected, assessment: observed, configurationId: config.id ?? null });
      }
    }
  }
  return findings;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const catalogPath = new URL('../src/data/candidates.json', import.meta.url);
  const observationsPath = new URL('../src/data/observations.json', import.meta.url);
  const findings = auditConfigurationIdentity(JSON.parse(readFileSync(catalogPath, 'utf8')), JSON.parse(readFileSync(observationsPath, 'utf8')));
  console.log(JSON.stringify({ status: findings.length ? 'review_required' : 'no_findings', findings }, null, 2));
  // Exit successfully: a research finding must not alter data or trigger publication.
}

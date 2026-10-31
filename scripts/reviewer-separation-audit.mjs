import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Offline planning-only validator. No identity proof or authorization is issued.
export function auditReviewerSeparation(plan) {
  const findings = [];
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return { valid: false, findings: ['INVALID_PLAN'], publicationAuthorized: false };
  const { collectorId, reviewerIds, authenticatedReviewerIds, publicationAuthorized, bypassAllowed } = plan;
  if (typeof collectorId !== 'string' || !collectorId.trim()) findings.push('MISSING_COLLECTOR');
  if (!Array.isArray(reviewerIds) || reviewerIds.length !== 2 || reviewerIds.some(id => typeof id !== 'string' || !id.trim()) || new Set(reviewerIds).size !== 2) findings.push('REQUIRES_TWO_DISTINCT_REVIEWERS');
  if (Array.isArray(reviewerIds) && reviewerIds.includes(collectorId)) findings.push('COLLECTOR_REVIEWER_CONFLICT');
  if (!Array.isArray(authenticatedReviewerIds) || authenticatedReviewerIds.length !== 0) findings.push('NO_AUTHENTICATION_ASSERTIONS_ACCEPTED');
  if (publicationAuthorized !== false || bypassAllowed !== false) findings.push('PUBLICATION_OR_BYPASS_NOT_ALLOWED');
  return { valid: findings.length === 0, findings, publicationAuthorized: false, reviewerSelectionStatus: 'planning_only' };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/reviewer-separation-audit.mjs <planning-file.json>');
  const plan = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
  const result = auditReviewerSeparation(plan);
  console.log(JSON.stringify(result));
  if (!result.valid) process.exitCode = 1;
}

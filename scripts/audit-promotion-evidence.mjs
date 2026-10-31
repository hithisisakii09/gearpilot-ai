import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// This audit is advisory for research review. It never approves, ingests, or publishes an offer.
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function instant(value) {
  if (typeof value !== 'string' || !ISO_INSTANT.test(value)) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) return null;
  const time = value.match(/T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/);
  if (!time) return null;
  const [, hours, minutes, seconds, offset, offsetHours, offsetMinutes] = time;
  if (+hours > 23 || +minutes > 59 || +seconds > 59) return null;
  if (offset !== 'Z' && (+offsetHours > 14 || +offsetMinutes > 59 || (+offsetHours === 14 && +offsetMinutes !== 0))) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function auditPromotionEvidence(collection, now = new Date()) {
  const nowMs = now instanceof Date ? now.getTime() : NaN;
  if (!Number.isFinite(nowMs)) throw new Error('Invalid audit clock');
  const findings = [];
  for (const observation of collection.observations ?? []) {
    if (!observation || typeof observation !== 'object') continue;
    const deadline = observation.sourceMetadata?.promotionEnds;
    if (deadline === undefined || deadline === null) continue;
    const context = { observationId: observation.id ?? null, productId: observation.productId ?? null };
    const deadlineMs = instant(deadline);
    if (deadlineMs === null) {
      findings.push({ severity: 'blocker', code: 'INVALID_PROMOTION_DEADLINE', ...context });
      continue;
    }
    const observedAtMs = instant(observation.observedAt);
    if (observedAtMs === null) {
      findings.push({ severity: 'blocker', code: 'INVALID_PROMOTION_OBSERVED_AT', ...context });
    } else if (observedAtMs > deadlineMs) {
      findings.push({ severity: 'blocker', code: 'OBSERVED_AFTER_PROMOTION_DEADLINE', ...context });
    }
    if (deadlineMs <= nowMs) {
      findings.push({ severity: 'blocker', code: 'EXPIRED_PROMOTION_EVIDENCE', ...context, promotionEnds: deadline });
    }
  }
  return findings;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const collection = JSON.parse(readFileSync(new URL('../src/data/observations.json', import.meta.url), 'utf8'));
  const findings = auditPromotionEvidence(collection);
  console.log(JSON.stringify({
    status: findings.length ? 'review_required' : 'no_findings',
    writesPerformed: false,
    findings,
  }, null, 2));
  // Research findings must never trigger promotion or publication.
}

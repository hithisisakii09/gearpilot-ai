// @ts-nocheck -- Node 22 executes this local CLI via type stripping; the Astro app intentionally has no Node runtime types.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { AffiliateRegistrySchema, CatalogSchema, ObservationCollectionSchema, type ObservationCollection } from '../src/lib/schema.ts';
import { createCatalogQualityReport, findConflictingObservations, findDuplicateObservations, qualityReportMarkdown, validateObservationReferences } from '../src/lib/observations.ts';

const args = process.argv.slice(2);
const command = args[0];
const flag = (name: string): string | null => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] ?? null : null;
};
const has = (name: string): boolean => args.includes(name);
const root = process.cwd();
const defaultCatalogPath = resolve(root, 'src/data/candidates.json');
const defaultObservationPath = resolve(root, 'src/data/observations.json');
const defaultRegistryPath = resolve(root, 'src/data/affiliate-programs.json');

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function catalog() {
  return CatalogSchema.parse(await json(defaultCatalogPath));
}

async function collection(path = defaultObservationPath): Promise<ObservationCollection> {
  return ObservationCollectionSchema.parse(await json(path));
}

async function validationSummary(path: string) {
  const candidateCatalog = await catalog();
  const candidateCollection = await collection(path);
  const referenceErrors = validateObservationReferences(candidateCollection, candidateCatalog.products);
  const duplicates = findDuplicateObservations(candidateCollection.observations);
  const conflicts = findConflictingObservations(candidateCollection.observations);
  return { candidateCatalog, candidateCollection, referenceErrors, duplicates, conflicts, valid: referenceErrors.length === 0 && duplicates.length === 0 && conflicts.length === 0 };
}

if (command === 'list') {
  const { candidateCatalog, candidateCollection } = await validationSummary(defaultObservationPath);
  const observationsByProduct = new Map<string, number>();
  candidateCollection.observations.forEach((item) => observationsByProduct.set(item.productId, (observationsByProduct.get(item.productId) ?? 0) + 1));
  const assessments = new Map(candidateCollection.candidateAssessments.map((item) => [item.productId, item]));
  console.log(JSON.stringify(candidateCatalog.products.map((product) => ({
    productId: product.id,
    model: `${product.manufacturer} ${product.model}`,
    observations: observationsByProduct.get(product.id) ?? 0,
    missingEvidence: assessments.get(product.id)?.missingEvidence ?? ['assessment'],
  })), null, 2));
} else if (command === 'validate' || command === 'preview') {
  const input = resolve(flag('--input') ?? defaultObservationPath);
  const summary = await validationSummary(input);
  console.log(JSON.stringify({
    mode: command,
    writesPerformed: false,
    input,
    valid: summary.valid,
    observations: summary.candidateCollection.observations.length,
    assessments: summary.candidateCollection.candidateAssessments.length,
    referenceErrors: summary.referenceErrors,
    duplicateObservations: summary.duplicates,
    conflictingObservations: summary.conflicts,
  }, null, 2));
  if (!summary.valid) process.exitCode = 1;
} else if (command === 'record') {
  const inputFlag = flag('--input');
  const reviewer = flag('--reviewer');
  const reviewedAt = flag('--reviewed-at');
  if (!inputFlag || !reviewer || !reviewedAt || !has('--confirm-reviewed')) throw new Error('record requires --input, --reviewer, --reviewed-at, and --confirm-reviewed');
  const input = resolve(inputFlag);
  const proposed = await collection(input);
  const reviewTime = new Date(reviewedAt);
  if (!Number.isFinite(reviewTime.getTime()) || reviewTime.getTime() > Date.now()) throw new Error('reviewed-at must be a valid UTC timestamp that is not in the future');
  if (proposed.observations.some((item) => item.reviewStatus !== 'approved' || item.reviewer !== reviewer || item.reviewedAt !== reviewedAt)) throw new Error('Every recorded observation must already carry matching explicit approval metadata');
  const existing = await collection();
  const merged = ObservationCollectionSchema.parse({
    lastUpdatedAt: reviewedAt,
    observations: [...existing.observations, ...proposed.observations],
    candidateAssessments: existing.candidateAssessments,
  });
  const candidateCatalog = await catalog();
  const errors = validateObservationReferences(merged, candidateCatalog.products);
  const duplicates = findDuplicateObservations(merged.observations);
  const conflicts = findConflictingObservations(merged.observations);
  if (errors.length || duplicates.length || conflicts.length) throw new Error(JSON.stringify({ errors, duplicates, conflicts }));
  await writeFile(defaultObservationPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ recorded: proposed.observations.map((item) => item.id), reviewer, reviewedAt, destination: defaultObservationPath }, null, 2));
} else if (command === 'report') {
  const now = new Date(flag('--at') ?? Date.now());
  if (!Number.isFinite(now.getTime())) throw new Error('--at must be a valid timestamp');
  const candidateCatalog = await catalog();
  const candidateCollection = await collection();
  const registry = AffiliateRegistrySchema.parse(await json(defaultRegistryPath));
  const report = createCatalogQualityReport(candidateCatalog, candidateCollection, registry.programs, now);
  if (has('--write')) {
    await writeFile(resolve(root, 'docs/PHASE3_3_DATA_QUALITY_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    await writeFile(resolve(root, 'docs/PHASE3_3_DATA_QUALITY_REPORT.md'), qualityReportMarkdown(report), 'utf8');
  }
  console.log(JSON.stringify({ ...report, writesPerformed: has('--write') }, null, 2));
} else {
  console.error('Usage: observations.ts <list|validate|preview|record|report> [options]');
  process.exitCode = 1;
}

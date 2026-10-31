import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAuthorizedSourceManifest, auditSourceManifest } from './source-authorization.mjs';
const catalog = JSON.parse(readFileSync(new URL('../src/data/candidates.json', import.meta.url), 'utf8'));
const manifest = createAuthorizedSourceManifest(catalog);
const audit = auditSourceManifest(manifest);
if (!audit.valid) { console.error(JSON.stringify(audit)); process.exit(1); }
mkdirSync(resolve('artifacts'), { recursive: true });
writeFileSync(resolve('artifacts/source-authorization-manifest.json'), JSON.stringify({ ...manifest, audit }, null, 2) + '\n');
console.log(JSON.stringify({ sources: audit.sources, liveFetchAllowed: false, publicationAuthorized: false }));

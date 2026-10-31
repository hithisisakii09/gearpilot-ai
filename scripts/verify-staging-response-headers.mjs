import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const headers = await readFile(new URL('../dist/_headers', import.meta.url), 'utf8');
const blocks = headers.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
const globalBlocks = blocks.filter((block) => block.split(/\r?\n/)[0].trim() === '/*');
assert.ok(globalBlocks.length > 0, 'Missing global static asset headers block');
const headerLines = globalBlocks.flatMap((block) => block.split(/\r?\n/).slice(1));
const robots = headerLines.filter((line) => /^\s*X-Robots-Tag\s*:/i.test(line));
assert.equal(robots.length, 1, 'Expected exactly one global X-Robots-Tag header');
assert.equal(robots[0].split(':').slice(1).join(':').trim().toLowerCase(), 'noindex, nofollow, noarchive');
for (const required of ['X-Content-Type-Options', 'X-Frame-Options', 'Content-Security-Policy']) {
  assert.ok(headerLines.some((line) => new RegExp('^\\s*' + required + '\\s*:', 'i').test(line)), `Missing security header: ${required}`);
}
console.log('Staging-only static asset response header configuration validated (remote behavior not verified).');

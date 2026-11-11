import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync('dist/index.html', 'utf8');
assert.match(html, /<title>PulseOS Platform<\/title>/);
assert.match(html, /href="\/pulseos-manifest.json"/);
assert.match(html, /href="\/pulseos-icon-512.webp"/);
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    assert.doesNotMatch(path, /tremonix/i, `Foreign business asset: ${path}`);
    if (entry.isDirectory()) check(path);
    else if (/\.(html|js|json|txt|xml)$/.test(path)) {
      assert.doesNotMatch(readFileSync(path, 'utf8'), /tremonix/i, `Foreign business content: ${path}`);
    }
  }
}
check('dist');
console.log('PulseOS build guard passed: title, icon, manifest, and no Tremonix code/assets.');

// Block reintroduction of fabricated public worker views or loss of the primary CTA.
const workforce = readFileSync('src/components/pulseos/WorkforceMode.tsx', 'utf8');
assert.doesNotMatch(workforce, /James Carter|Competency Passport|Schedule field verification|label="Role readiness"/i);
assert.match(workforce, /label="Competency library"/);
assert.match(workforce, /href="\/course-builder" className="rounded-xl bg-gold-500 px-4 py-2\.5 text-sm font-bold text-navy-950 hover:bg-gold-400">Workforce Competency<\/a><a href="\/"/);
assert.match(workforce, /\['library', 'Competency Library', Layers3\]/);
assert.match(workforce, /\['roles', 'Role Builder', Wrench\]/);
assert.match(workforce, /\['ojt', 'OJT & Compliance', Clock3\]/);
console.log('PulseOS homepage guard passed: no fabricated worker views, primary CTA, retained library and tabs.');

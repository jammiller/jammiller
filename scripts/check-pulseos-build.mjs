import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync('dist/index.html', 'utf8');
assert.match(html, /<title>Construction Workforce Readiness Program \| PulseOS<\/title>/);
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
assert.match(workforce, /\['library', 'Competency Library', Layers3/);
assert.match(workforce, /\['roles', 'Role Builder', Wrench/);
assert.match(workforce, /\['ojt', 'OJT & Compliance', Clock3/);
console.log('PulseOS workforce tools guard passed: no fabricated worker views, retained library and tabs.');

// Each public entry needs its own crawlable metadata, not only a client-side title.
const programHtml = readFileSync('dist/construction-workforce-readiness/index.html', 'utf8');
assert.match(programHtml, /<title>Construction Workforce Readiness Program \| PulseOS<\/title>/);
assert.match(programHtml, /rel="canonical" href="https:\/\/pulseosplatform.com\/construction-workforce-readiness"/);
assert.match(programHtml, /meta name="description" content="12-week self-paced construction workforce readiness program\./);
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
assert.match(sitemap, /<loc>https:\/\/pulseosplatform.com\/construction-workforce-readiness<\/loc>/);
assert.match(readFileSync('dist/llms.txt', 'utf8'), /https:\/\/pulseosplatform.com\/construction-workforce-readiness/);
console.log('PulseOS program page guard passed: dedicated metadata, sitemap, and llms.txt.');

for (const [route, title] of Object.entries({
  'course-builder': 'Course Builder — PulseOS Platform',
  'competency-library': 'Competency Library | PulseOS',
  'role-builder': 'Role Builder | PulseOS',
  'ojt-compliance': 'OJT &amp; Compliance | PulseOS',
})) {
  const page = readFileSync(`dist/${route}/index.html`, 'utf8');
  assert.ok(page.includes(`<title>${title}</title>`), `Missing title for ${route}`);
  assert.ok(page.includes(`rel="canonical" href="https://pulseosplatform.com/${route}"`));
  assert.ok(sitemap.includes(`<loc>https://pulseosplatform.com/${route}</loc>`));
}
assert.doesNotMatch(sitemap, /ojt-workspace|foreman|assessments|analytics|education/);
for (const path of ['src/components/PulseOS.tsx', 'src/components/pulseos/PulseOSClientView.tsx']) {
  assert.doesNotMatch(readFileSync(path, 'utf8'), /book a demo|calendar\.app\.google/i);
}
console.log('Public section metadata and sitemap passed; private workspaces excluded; consultation links removed.');

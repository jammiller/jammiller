import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function checkBuild(directory) {
  const html = readFileSync(join(directory, 'index.html'), 'utf8');
  assert.match(html, /<title>Tremonix — Revenue Recovery Audit<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/tremonix.com\/"/);
  function check(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      assert.doesNotMatch(file, /pulseos|datapulse|statslab|voltecho/i);
      if (entry.isDirectory()) check(file);
      else if (/\.(html|js|json|txt|xml|svg)$/.test(file)) {
        assert.doesNotMatch(readFileSync(file, 'utf8'), /pulseos|datapulse|statslab|voltecho/i, `Foreign product content: ${file}`);
      }
    }
  }
  check(directory);
  assert.match(readFileSync(join(directory, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/tremonix.com\/sitemap.xml/);
}
checkBuild(process.argv[2] || 'dist');
console.log('Tremonix build isolation passed: metadata, sitemap, and no foreign product content.');

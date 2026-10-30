import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function checkBuild(directory) {
  const html = readFileSync(join(directory, 'index.html'), 'utf8');
  assert.match(html, /<title>Tremonix — Revenue Recovery Audit<\/title>/);
  assert.match(html, /rel="canonical" href="https:\/\/tremonix.com\/"/);
  for (const size of [16, 32]) {
    assert.ok(html.includes(`sizes="${size}x${size}" href="/tremonix-logo-icon-${size}.png"`), 'Favicon must use the approved logo');
  }
  assert.ok(html.includes('href="/tremonix-logo-icon-180.png"'), 'Apple icon must use the approved logo');
  assert.doesNotMatch(html, /href="\/tremonix-icon\.svg"/);
  const manifest = JSON.parse(readFileSync(join(directory, 'tremonix-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.icons.map(icon => icon.src), [192, 512].map(size => `/tremonix-logo-icon-${size}.png`));
  for (const size of [16, 32, 180, 192, 512]) {
    const png = readFileSync(join(directory, `tremonix-logo-icon-${size}.png`));
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  assert.equal(readFileSync(join(directory, 'favicon.ico')).readUInt16LE(2), 1);
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

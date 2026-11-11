import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html = fs.readFileSync('dist/pulseos.html', 'utf8');
assert.match(html, /<title>PulseOS Platform<\/title>/);
assert.match(html, /data-app="pulseos"/);
assert.match(html, /rel="manifest" href="\/pulseos-manifest.json"/);
assert.match(html, /rel="icon" type="image\/webp" sizes="512x512" href="\/pulseos-icon-512.webp"/);
const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
for (const hostname of ['pulseosplatform.com', 'www.pulseosplatform.com', 'pulse-test-datapulse-social.vercel.app']) {
  const nodes = new Map();
  const document = {
    title: '', documentElement: { dataset: { app: 'pulseos' } },
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, { rel: 'icon', setAttribute(k, v) { this[k] = v; } });
      return nodes.get(selector);
    },
  };
  vm.runInNewContext(inline, { window: { location: { hostname, pathname: '/' } }, document });
  assert.equal(document.title, 'PulseOS Platform');
  assert.equal(nodes.get('link[rel="manifest"]').href, '/pulseos-manifest.json');
  assert.equal(nodes.get('link[rel="icon"]').href, '/pulseos-icon-512.webp');
  assert.equal(nodes.get('link[rel="icon"]').type, 'image/webp');
}
const manifest = JSON.parse(fs.readFileSync('dist/pulseos-manifest.json'));
assert.equal(manifest.name, 'PulseOS Platform');
for (const icon of manifest.icons) assert.ok(fs.existsSync(`dist${icon.src}`));
const config = JSON.parse(fs.readFileSync('vercel.json'));
const rule = config.rewrites[0];
const host = new RegExp(`^(?:${rule.has[0].value})$`);
const path = new RegExp(`^${rule.source}$`);
for (const h of ['pulseosplatform.com', 'www.pulseosplatform.com', 'pulse-os-git-main-datapulse-social.vercel.app', 'pulse-abc123-datapulse-social.vercel.app']) assert.ok(host.test(h));
assert.ok(!host.test('tremonix.com'));
for (const p of ['/', '/course-builder', '/learning-intelligence/lvi']) assert.ok(path.test(p));
for (const p of ['/assets/main.js', '/pulseos-icon-512.webp', '/pulseos-manifest.json']) assert.ok(!path.test(p));
console.log('PulseOS initial HTML, runtime title/icon/manifest, and host routing checks passed.');

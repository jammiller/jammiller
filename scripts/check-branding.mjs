import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Execute the actual shell script, not a duplicate of its branding logic.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).filter(script => script.includes('document.title = variant.title'));
assert.equal(scripts.length, 1, 'Expected exactly one shell branding script');

const cases = [
  ['pulseosplatform.com', '', 'PulseOS Platform', '/pulseos-icon-512.webp', '/pulseos-manifest.json'],
  ['www.pulseosplatform.com', '', 'PulseOS Platform', '/pulseos-icon-512.webp', '/pulseos-manifest.json'],
  ['pulse-os-test.vercel.app', '', 'PulseOS Platform', '/pulseos-icon-512.webp', '/pulseos-manifest.json'],
  ['tremonix.com', '', 'Tremonix — Revenue Leak Diagnostic', '/tremonix-icon.svg', '/tremonix-manifest.json'],
  ['www.tremonix.com', '', 'Tremonix — Revenue Leak Diagnostic', '/tremonix-icon.svg', '/tremonix-manifest.json'],
  ['other.vercel.app', 'pulseos', 'PulseOS Platform', '/pulseos-icon-512.webp', '/pulseos-manifest.json'],
];
for (const [hostname, app, title, icon, manifest] of cases) {
  for (const pathname of ['/', '/pulseos', '/course-builder']) {
    const elements = new Map();
    const document = {
      documentElement: { dataset: { app } },
      querySelector(selector) {
        if (!elements.has(selector)) elements.set(selector, {
          setAttribute(name, value) { this[name] = value; },
        });
        return elements.get(selector);
      },
    };
    runInNewContext(scripts[0], { window: { location: { hostname, pathname } }, document });
    assert.equal(document.title, title, `${hostname}${pathname}: title`);
    assert.equal(elements.get('link[rel="icon"][sizes="32x32"]').href, icon);
    assert.equal(elements.get('link[rel="manifest"]').href, manifest);
    assert.equal(elements.get('meta[property="og:title"]').content, title);
  }
}
console.log('Shell branding regression checks passed (18 host/route cases).');

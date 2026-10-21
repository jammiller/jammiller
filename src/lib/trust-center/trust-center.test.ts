import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleTrustCenterRequest } from './api.ts';
import { AnomalyDetectionService } from './anomalies.ts';
import { MemoryTrustCenterStore } from './memoryStore.ts';
import { createIntegrityMonitor, getInvestigationQueue, getOverview } from './monitor.ts';
import { computeScore, riskLevelForScore } from './scoring.ts';
import { seedTrustCenter } from './seed.ts';

const NOW = new Date('2026-10-21T12:00:00Z');
const now = () => NOW;
const future = '2027-10-21T00:00:00Z';

test('risk bands', () => {
  assert.equal(riskLevelForScore(80), 'low');
  assert.equal(riskLevelForScore(79), 'medium');
  assert.equal(riskLevelForScore(50), 'medium');
  assert.equal(riskLevelForScore(49), 'high');
});

test('scoring examples: clean = 100, missing expiry + unverified source = 62', () => {
  const base = { entityType: 'credential', now: NOW, hasDuplicate: false, openAnomalies: [] };
  assert.equal(computeScore({ ...base, verified: true, sourceVerified: true, expiresAt: future }).score, 100);
  assert.equal(computeScore({ ...base, sourceVerified: false, expiresAt: null }).score, 62);
});

test('duplicate credential scores 32 / high and creates an open anomaly', async () => {
  const store = new MemoryTrustCenterStore();
  const monitor = createIntegrityMonitor(store, now);
  const meta = { verified: true, sourceVerified: true, expiresAt: future, entityKey: 'u1:OSHA10' };
  const first = await monitor.ingest({ eventType: 'CredentialAwarded', actorId: 'a', entityType: 'credential', entityId: 'c1', metadata: meta });
  assert.equal(first.trust.trustScore, 100);
  const second = await monitor.ingest({ eventType: 'CredentialAwarded', actorId: 'a', entityType: 'credential', entityId: 'c2', metadata: meta });
  assert.equal(second.trust.trustScore, 32);
  assert.equal(second.trust.riskLevel, 'high');
  assert.equal(second.anomalies[0].type, 'duplicate');
  assert.equal(store.audit.length, 2);
  // re-ingesting does not create a second open anomaly
  const again = await monitor.ingest({ eventType: 'CredentialAwarded', actorId: 'a', entityType: 'credential', entityId: 'c2', metadata: meta });
  assert.equal(again.anomalies.length, 0);
  assert.equal(store.anomalies.length, 1);
});

test('behavioral spike and document mismatch detection', async () => {
  const store = new MemoryTrustCenterStore();
  const svc = new AnomalyDetectionService(store, { spikeThreshold: 3, spikeWindowMs: 120000 }, now);
  const ts = NOW.toISOString();
  for (let i = 0; i < 3; i++) await store.insertAudit({ event_type: 'RecordUpdated', actor_id: 'bot', entity_type: 'record', entity_id: `r${i}`, timestamp: ts, metadata: {} });
  const spike = await svc.detect({ eventType: 'RecordUpdated', actorId: 'bot', entityType: 'record', entityId: 'r3' }, ts);
  assert.deepEqual(spike.map((a) => a.type), ['behavioral_spike']);
  const doc = await svc.detect({ eventType: 'ContractModified', actorId: 'u', entityType: 'contract', entityId: 'k1', metadata: { approved: true, hash: 'x', expectedHash: 'y' } }, ts);
  assert.deepEqual(doc.map((a) => a.type).sort(), ['document_mismatch', 'modified_after_approval']);
});

test('seed populates overview and investigation queue', async () => {
  const store = new MemoryTrustCenterStore();
  await seedTrustCenter(store, now);
  const overview = await getOverview(store);
  assert.equal(overview.totalEntities, 7);
  assert.ok(overview.riskCounts.high >= 1);
  assert.ok(overview.openInvestigations >= 1);
  assert.equal(overview.resolved, 1);
  const queue = await getInvestigationQueue(store);
  assert.equal(queue[0].severity, 'high');
  assert.ok(queue.every((a) => a.status !== 'resolved'));
});

test('API: guarded ingest, filters, validation', async () => {
  const store = new MemoryTrustCenterStore();
  const monitor = createIntegrityMonitor(store, now);
  const deps = { store, monitor, authorize: async (r: Request, action: 'read' | 'ingest') => r.headers.get('x-role') === 'admin' || (action === 'read' && r.headers.get('x-role') === 'reader') };
  const call = (path: string, init: RequestInit = {}) => handleTrustCenterRequest(new Request(`http://x/trust-center/${path}`, init), deps);
  const ev = JSON.stringify({ eventType: 'UserLogin', actorId: 'u', entityType: 'user', entityId: 'u1' });

  assert.equal((await call('events', { method: 'POST', body: ev })).status, 403);
  assert.equal((await call('events', { method: 'POST', body: ev, headers: { 'x-role': 'reader' } })).status, 403);
  assert.equal((await call('events', { method: 'POST', body: '{}', headers: { 'x-role': 'admin' } })).status, 400);
  assert.equal((await call('events', { method: 'POST', body: ev, headers: { 'x-role': 'admin' } })).status, 201);

  const h = { headers: { 'x-role': 'reader' } };
  assert.equal((await call('overview')).status, 403);
  const overview = await (await call('overview', h)).json();
  assert.equal(overview.totalEntities, 1);
  assert.equal((await (await call('audit-logs?eventType=UserLogin', h)).json()).length, 1);
  assert.equal((await (await call('audit-logs?eventType=Nope', h)).json()).length, 0);
  assert.equal((await call('anomalies?status=bogus', h)).status, 400);
  assert.equal((await call('trust-scores?riskLevel=low', h)).status, 200);
  assert.equal((await call('nope', h)).status, 404);
});

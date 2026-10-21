import { createIntegrityMonitor } from './monitor.ts';
import type { TrustCenterStore } from './types.ts';

/** Dev-only sample flow: pushes realistic events through the real IntegrityMonitor. */
export async function seedTrustCenter(store: TrustCenterStore, now: () => Date = () => new Date()) {
  const monitor = createIntegrityMonitor(store, now);
  const day = 86400000;
  const at = (offsetDays: number) => new Date(now().getTime() + offsetDays * day).toISOString();
  const events = [
    { eventType: 'CredentialAwarded', actorId: 'admin-1', entityType: 'credential', entityId: 'cred-osha10-ava', ownerId: 'user-ava',
      metadata: { verified: true, sourceVerified: true, expiresAt: at(365), entityKey: 'user-ava:OSHA10' } },
    { eventType: 'CredentialAwarded', actorId: 'admin-1', entityType: 'credential', entityId: 'cred-nccer-ben', ownerId: 'user-ben',
      metadata: { verified: true, sourceVerified: false, entityKey: 'user-ben:NCCER-CORE' } },
    { eventType: 'CredentialAwarded', actorId: 'admin-2', entityType: 'credential', entityId: 'cred-osha10-ava-dup', ownerId: 'user-ava',
      metadata: { verified: true, sourceVerified: true, expiresAt: at(300), entityKey: 'user-ava:OSHA10' } },
    { eventType: 'CredentialAwarded', actorId: 'admin-1', entityType: 'credential', entityId: 'cred-osha30-cy', ownerId: 'user-cy',
      metadata: { verified: true, sourceVerified: true, expiresAt: at(-20), entityKey: 'user-cy:OSHA30' } },
    { eventType: 'ContractModified', actorId: 'vendor-user-7', entityType: 'contract', entityId: 'contract-114', ownerId: 'vendor-7',
      metadata: { approved: true, hash: 'b7c1', expectedHash: 'a9f0', verified: true, sourceVerified: true } },
    { eventType: 'AssessmentSubmitted', actorId: 'user-dee', entityType: 'assessment', entityId: 'assess-22', ownerId: 'user-dee',
      metadata: { verified: true, sourceVerified: true } },
    { eventType: 'DocumentUploaded', actorId: 'user-eli', entityType: 'document', entityId: 'doc-88', ownerId: 'user-eli',
      metadata: { signaturesRequired: true, signed: false, verified: true } },
  ];
  for (const e of events) await monitor.ingest({ ...e, timestamp: at(-events.indexOf(e) / 10) });
  const [resolved] = await store.listAnomalies({ entityId: 'doc-88' });
  if (resolved) await store.updateAnomalyStatus(resolved.id, 'resolved', now().toISOString());
}

import type { Anomaly, IntegrityEvent, RiskLevel, TrustCenterStore } from './types.ts';

export interface AnomalyConfig {
  /** Records touched by one actor inside the window before a behavioral spike is flagged. */
  spikeThreshold: number;
  spikeWindowMs: number;
}

export const DEFAULT_ANOMALY_CONFIG: AnomalyConfig = { spikeThreshold: 500, spikeWindowMs: 2 * 60 * 1000 };

interface Finding { type: string; severity: RiskLevel; description: string }

export class AnomalyDetectionService {
  constructor(
    private store: TrustCenterStore,
    private config: AnomalyConfig = DEFAULT_ANOMALY_CONFIG,
    private now: () => Date = () => new Date(),
  ) {}

  async detect(event: IntegrityEvent, timestamp: string): Promise<Anomaly[]> {
    const findings: Finding[] = [
      ...(await this.duplicates(event)),
      ...(await this.spike(event, timestamp)),
      ...this.integrityMismatch(event),
    ];
    const created: Anomaly[] = [];
    for (const f of findings) {
      const open = await this.store.listAnomalies({
        entityType: event.entityType, entityId: event.entityId, type: f.type,
        status: ['open', 'investigating'], pageSize: 1,
      });
      if (open.length > 0) continue;
      const ts = this.now().toISOString();
      created.push(await this.store.insertAnomaly({
        entity_type: event.entityType, entity_id: event.entityId, ...f,
        status: 'open', created_at: ts, updated_at: ts,
      }));
    }
    return created;
  }

  /** Same entityKey (e.g. user + credential) seen on a different entity. */
  private async duplicates(event: IntegrityEvent): Promise<Finding[]> {
    const key = event.metadata?.entityKey;
    if (typeof key !== 'string' || !key) return [];
    const matches = await this.store.findAuditByEntityKey(key);
    const other = matches.find((m) => m.entity_type !== event.entityType || m.entity_id !== event.entityId);
    return other
      ? [{ type: 'duplicate', severity: 'high', description: `Entity key "${key}" already used by ${other.entity_type} ${other.entity_id}` }]
      : [];
  }

  /** Behavioral heuristic: too many events by one actor within the window. */
  private async spike(event: IntegrityEvent, timestamp: string): Promise<Finding[]> {
    const since = new Date(new Date(timestamp).getTime() - this.config.spikeWindowMs).toISOString();
    const count = await this.store.countAuditByActorSince(event.actorId, since);
    return count >= this.config.spikeThreshold
      ? [{ type: 'behavioral_spike', severity: 'high', description: `Actor ${event.actorId} produced ${count} events in ${Math.round(this.config.spikeWindowMs / 1000)}s` }]
      : [];
  }

  /** Basic document hooks: hash mismatch, modification after approval, missing signatures, version mismatch. */
  private integrityMismatch(event: IntegrityEvent): Finding[] {
    const m = event.metadata ?? {};
    const out: Finding[] = [];
    if (typeof m.hash === 'string' && typeof m.expectedHash === 'string' && m.hash !== m.expectedHash) {
      out.push({ type: 'document_mismatch', severity: 'high', description: 'Document hash does not match expected hash' });
    }
    if (/modified|updated/i.test(event.eventType) && m.approved === true) {
      out.push({ type: 'modified_after_approval', severity: 'high', description: `${event.entityType} modified after approval` });
    }
    if (m.signaturesRequired === true && m.signed === false) {
      out.push({ type: 'missing_signature', severity: 'medium', description: 'Required signature is missing' });
    }
    if (m.version !== undefined && m.expectedVersion !== undefined && m.version !== m.expectedVersion) {
      out.push({ type: 'version_mismatch', severity: 'medium', description: 'Document version mismatch' });
    }
    return out;
  }
}

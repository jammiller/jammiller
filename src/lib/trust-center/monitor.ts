import { AnomalyDetectionService } from './anomalies.ts';
import { TrustScoreService } from './scoring.ts';
import type { Anomaly, AnomalyFilter, AuditLogEntry, IntegrityEvent, TrustCenterStore, TrustObject, TrustOverview } from './types.ts';

/** Single entry point for every PulseOS module: log, detect anomalies, rescore. */
export class IntegrityMonitor {
  constructor(
    private store: TrustCenterStore,
    private scores: TrustScoreService,
    private anomalies: AnomalyDetectionService,
    private now: () => Date = () => new Date(),
  ) {}

  async ingest(event: IntegrityEvent): Promise<{ audit: AuditLogEntry; anomalies: Anomaly[]; trust: TrustObject }> {
    const timestamp = event.timestamp ?? this.now().toISOString();
    const audit = await this.store.insertAudit({
      event_type: event.eventType,
      actor_id: event.actorId,
      entity_type: event.entityType,
      entity_id: event.entityId,
      timestamp,
      metadata: event.metadata ?? {},
    });
    const anomalies = await this.anomalies.detect(event, timestamp);
    const trust = await this.scores.recompute(event.entityType, event.entityId, event.ownerId ?? null);
    return { audit, anomalies, trust };
  }
}

/** Investigation queue: open/investigating anomalies, high severity first, newest first. */
export async function getInvestigationQueue(store: TrustCenterStore, filter: AnomalyFilter = {}): Promise<Anomaly[]> {
  const rank = { high: 0, medium: 1, low: 2 } as const;
  const rows = await store.listAnomalies({ status: ['open', 'investigating'], ...filter });
  return [...rows].sort((a, b) => rank[a.severity] - rank[b.severity] || b.created_at.localeCompare(a.created_at));
}

export async function getOverview(store: TrustCenterStore): Promise<TrustOverview> {
  const scores = await store.listTrustScores({ pageSize: 100000 });
  const anomalies = await store.listAnomalies({ pageSize: 100000 });
  const riskCounts = { low: 0, medium: 0, high: 0 };
  for (const s of scores) riskCounts[s.risk_level]++;
  return {
    overallScore: scores.length ? Math.round(scores.reduce((n, s) => n + s.score, 0) / scores.length) : 100,
    riskCounts,
    totalEntities: scores.length,
    openInvestigations: anomalies.filter((a) => a.status !== 'resolved').length,
    resolved: anomalies.filter((a) => a.status === 'resolved').length,
  };
}

export function createIntegrityMonitor(store: TrustCenterStore, now: () => Date = () => new Date()) {
  return new IntegrityMonitor(store, new TrustScoreService(store, undefined, now), new AnomalyDetectionService(store, undefined, now), now);
}

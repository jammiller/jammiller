import type {
  Anomaly, AnomalyFilter, AnomalyStatus, AuditFilter, AuditLogEntry, Page,
  TrustCenterStore, TrustScoreFilter, TrustScoreRow,
} from './types.ts';

// Structural subset of a Supabase client so this module runs in both Vite and Deno.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SupabaseLike { from(table: string): any }

const T = { audit: 'pulseos_audit_log', scores: 'pulseos_trust_scores', anomalies: 'pulseos_anomalies' } as const;

function range(q: any, { page = 1, pageSize = 50 }: Page) {
  return q.range((page - 1) * pageSize, page * pageSize - 1);
}

async function run<R>(q: PromiseLike<{ data: R | null; error: { message: string } | null }>): Promise<R> {
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as R;
}

export class SupabaseTrustCenterStore implements TrustCenterStore {
  constructor(private db: SupabaseLike) {}

  insertAudit(entry: Omit<AuditLogEntry, 'id'>) {
    return run<AuditLogEntry>(this.db.from(T.audit).insert(entry).select().single());
  }
  listAudit(f: AuditFilter = {}) {
    let q = this.db.from(T.audit).select('*').order('timestamp', { ascending: false });
    if (f.eventType) q = q.eq('event_type', f.eventType);
    if (f.actorId) q = q.eq('actor_id', f.actorId);
    if (f.entityType) q = q.eq('entity_type', f.entityType);
    if (f.entityId) q = q.eq('entity_id', f.entityId);
    if (f.since) q = q.gte('timestamp', f.since);
    return run<AuditLogEntry[]>(range(q, f));
  }
  async countAuditByActorSince(actorId: string, sinceIso: string) {
    const { count, error } = await this.db.from(T.audit)
      .select('id', { count: 'exact', head: true }).eq('actor_id', actorId).gte('timestamp', sinceIso);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }
  findAuditByEntityKey(key: string) {
    return run<AuditLogEntry[]>(this.db.from(T.audit).select('*').eq('metadata->>entityKey', key).limit(50));
  }
  getTrustScore(entityType: string, entityId: string) {
    return run<TrustScoreRow | null>(this.db.from(T.scores).select('*')
      .eq('entity_type', entityType).eq('entity_id', entityId).maybeSingle());
  }
  upsertTrustScore(row: Omit<TrustScoreRow, 'id'>) {
    return run<TrustScoreRow>(this.db.from(T.scores).upsert(row, { onConflict: 'entity_type,entity_id' }).select().single());
  }
  listTrustScores(f: TrustScoreFilter = {}) {
    let q = this.db.from(T.scores).select('*').order('score', { ascending: true });
    if (f.riskLevel) q = q.eq('risk_level', f.riskLevel);
    if (f.entityType) q = q.eq('entity_type', f.entityType);
    return run<TrustScoreRow[]>(range(q, f));
  }
  insertAnomaly(a: Omit<Anomaly, 'id'>) {
    return run<Anomaly>(this.db.from(T.anomalies).insert(a).select().single());
  }
  listAnomalies(f: AnomalyFilter = {}) {
    let q = this.db.from(T.anomalies).select('*').order('created_at', { ascending: false });
    if (f.status) q = Array.isArray(f.status) ? q.in('status', f.status) : q.eq('status', f.status);
    if (f.severity) q = q.eq('severity', f.severity);
    if (f.entityType) q = q.eq('entity_type', f.entityType);
    if (f.entityId) q = q.eq('entity_id', f.entityId);
    if (f.type) q = q.eq('type', f.type);
    return run<Anomaly[]>(range(q, f));
  }
  async updateAnomalyStatus(id: string, status: AnomalyStatus, updatedAt: string) {
    await run(this.db.from(T.anomalies).update({ status, updated_at: updatedAt }).eq('id', id));
  }
}

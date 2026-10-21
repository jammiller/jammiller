import type {
  Anomaly, AnomalyFilter, AnomalyStatus, AuditFilter, AuditLogEntry, Page,
  TrustCenterStore, TrustScoreFilter, TrustScoreRow,
} from './types.ts';

function paginate<T>(rows: T[], { page = 1, pageSize = 50 }: Page = {}): T[] {
  return rows.slice((page - 1) * pageSize, page * pageSize);
}

/** In-memory store used for tests and the dev-only demo (no external systems). */
export class MemoryTrustCenterStore implements TrustCenterStore {
  audit: AuditLogEntry[] = [];
  scores: TrustScoreRow[] = [];
  anomalies: Anomaly[] = [];
  private seq = 0;
  private id() { return `mem-${++this.seq}`; }

  async insertAudit(entry: Omit<AuditLogEntry, 'id'>) {
    const row = { ...entry, id: this.id() };
    this.audit.push(row);
    return row;
  }
  async listAudit(f: AuditFilter = {}) {
    const rows = this.audit
      .filter((e) => (!f.eventType || e.event_type === f.eventType)
        && (!f.actorId || e.actor_id === f.actorId)
        && (!f.entityType || e.entity_type === f.entityType)
        && (!f.entityId || e.entity_id === f.entityId)
        && (!f.since || e.timestamp >= f.since))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return paginate(rows, f);
  }
  async countAuditByActorSince(actorId: string, sinceIso: string) {
    return this.audit.filter((e) => e.actor_id === actorId && e.timestamp >= sinceIso).length;
  }
  async findAuditByEntityKey(key: string) {
    return this.audit.filter((e) => e.metadata?.entityKey === key);
  }
  async getTrustScore(entityType: string, entityId: string) {
    return this.scores.find((s) => s.entity_type === entityType && s.entity_id === entityId) ?? null;
  }
  async upsertTrustScore(row: Omit<TrustScoreRow, 'id'>) {
    const existing = await this.getTrustScore(row.entity_type, row.entity_id);
    if (existing) { Object.assign(existing, row); return existing; }
    const created = { ...row, id: this.id() };
    this.scores.push(created);
    return created;
  }
  async listTrustScores(f: TrustScoreFilter = {}) {
    const rows = this.scores
      .filter((s) => (!f.riskLevel || s.risk_level === f.riskLevel) && (!f.entityType || s.entity_type === f.entityType))
      .sort((a, b) => a.score - b.score);
    return paginate(rows, f);
  }
  async insertAnomaly(a: Omit<Anomaly, 'id'>) {
    const row = { ...a, id: this.id() };
    this.anomalies.push(row);
    return row;
  }
  async listAnomalies(f: AnomalyFilter = {}) {
    const statuses = f.status === undefined ? null : Array.isArray(f.status) ? f.status : [f.status];
    const rows = this.anomalies
      .filter((a) => (!statuses || statuses.includes(a.status))
        && (!f.severity || a.severity === f.severity)
        && (!f.entityType || a.entity_type === f.entityType)
        && (!f.entityId || a.entity_id === f.entityId)
        && (!f.type || a.type === f.type))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return paginate(rows, f);
  }
  async updateAnomalyStatus(id: string, status: AnomalyStatus, updatedAt: string) {
    const a = this.anomalies.find((x) => x.id === id);
    if (a) { a.status = status; a.updated_at = updatedAt; }
  }
}

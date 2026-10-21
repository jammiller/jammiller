export type RiskLevel = 'low' | 'medium' | 'high';
export type AnomalyStatus = 'open' | 'investigating' | 'resolved';

export interface Anomaly {
  id: string;
  entity_type: string;
  entity_id: string;
  type: string;
  severity: RiskLevel;
  description: string;
  status: AnomalyStatus;
  created_at: string;
  updated_at: string;
}

export interface TrustScoreRow {
  id: string;
  entity_type: string;
  entity_id: string;
  owner_id: string | null;
  score: number;
  risk_level: RiskLevel;
  updated_at: string;
}

export interface AuditLogEntry {
  id: string;
  event_type: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

/** Normalized event accepted by the IntegrityMonitor. */
export interface IntegrityEvent {
  eventType: string;
  actorId: string;
  entityType: string;
  entityId: string;
  ownerId?: string | null;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

/** Cross-module view of a scored object. */
export interface TrustObject {
  id: string;
  type: string;
  ownerId: string | null;
  trustScore: number;
  riskLevel: RiskLevel;
  anomalies: Anomaly[];
}

export interface Page {
  page?: number;
  pageSize?: number;
}

export interface AuditFilter extends Page {
  eventType?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  since?: string;
}

export interface TrustScoreFilter extends Page {
  riskLevel?: RiskLevel;
  entityType?: string;
}

export interface AnomalyFilter extends Page {
  status?: AnomalyStatus | AnomalyStatus[];
  severity?: RiskLevel;
  entityType?: string;
  entityId?: string;
  type?: string;
}

export interface TrustOverview {
  overallScore: number;
  riskCounts: Record<RiskLevel, number>;
  totalEntities: number;
  openInvestigations: number;
  resolved: number;
}

/** Persistence boundary; implemented by Supabase and in-memory stores. */
export interface TrustCenterStore {
  insertAudit(entry: Omit<AuditLogEntry, 'id'>): Promise<AuditLogEntry>;
  listAudit(filter?: AuditFilter): Promise<AuditLogEntry[]>;
  countAuditByActorSince(actorId: string, sinceIso: string): Promise<number>;
  findAuditByEntityKey(entityKey: string): Promise<AuditLogEntry[]>;
  getTrustScore(entityType: string, entityId: string): Promise<TrustScoreRow | null>;
  upsertTrustScore(row: Omit<TrustScoreRow, 'id'>): Promise<TrustScoreRow>;
  listTrustScores(filter?: TrustScoreFilter): Promise<TrustScoreRow[]>;
  insertAnomaly(a: Omit<Anomaly, 'id'>): Promise<Anomaly>;
  listAnomalies(filter?: AnomalyFilter): Promise<Anomaly[]>;
  updateAnomalyStatus(id: string, status: AnomalyStatus, updatedAt: string): Promise<void>;
}

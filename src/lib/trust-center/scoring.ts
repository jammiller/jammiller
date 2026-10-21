import type { Anomaly, AuditLogEntry, RiskLevel, TrustCenterStore, TrustObject, TrustScoreRow } from './types.ts';

/**
 * Risk bands (score is 0-100, higher is more trustworthy):
 *   low    : score >= 80
 *   medium : 50 <= score < 80
 *   high   : score < 50
 */
export const RISK_THRESHOLDS = { low: 80, medium: 50 } as const;

export function riskLevelForScore(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.low) return 'low';
  if (score >= RISK_THRESHOLDS.medium) return 'medium';
  return 'high';
}

export interface TrustSignals {
  entityType: string;
  verified?: boolean;
  sourceVerified?: boolean;
  expiresAt?: string | null;
  now: Date;
  hasDuplicate: boolean;
  openAnomalies: Anomaly[];
}

export interface TrustRule {
  id: string;
  description: string;
  penalty: number;
  applies: (s: TrustSignals) => boolean;
}

/** Default MVP ruleset. Each applicable rule subtracts its penalty from 100. */
export const DEFAULT_TRUST_RULES: TrustRule[] = [
  { id: 'unverified', description: 'Record is not verified', penalty: 15, applies: (s) => s.verified === false },
  { id: 'unverified_source', description: 'Source is not verified', penalty: 20, applies: (s) => s.sourceVerified === false },
  {
    id: 'missing_expiration',
    description: 'Credential has no expiration date',
    penalty: 18,
    applies: (s) => s.entityType === 'credential' && !s.expiresAt,
  },
  {
    id: 'expired',
    description: 'Expiration date has passed',
    penalty: 30,
    applies: (s) => !!s.expiresAt && new Date(s.expiresAt).getTime() < s.now.getTime(),
  },
  { id: 'duplicate', description: 'Potential duplicate found', penalty: 68, applies: (s) => s.hasDuplicate },
  {
    id: 'high_severity_anomaly',
    description: 'Open high-severity anomaly (non-duplicate)',
    penalty: 25,
    applies: (s) => s.openAnomalies.some((a) => a.severity === 'high' && a.type !== 'duplicate'),
  },
];

export function computeScore(signals: TrustSignals, rules: TrustRule[] = DEFAULT_TRUST_RULES) {
  const applied = rules.filter((r) => r.applies(signals));
  const score = Math.max(0, Math.min(100, 100 - applied.reduce((n, r) => n + r.penalty, 0)));
  return { score, riskLevel: riskLevelForScore(score), applied };
}

export class TrustScoreService {
  constructor(
    private store: TrustCenterStore,
    private rules: TrustRule[] = DEFAULT_TRUST_RULES,
    private now: () => Date = () => new Date(),
  ) {}

  /** Recompute and persist the score for an entity from its audit history and open anomalies. */
  async recompute(entityType: string, entityId: string, ownerId: string | null = null): Promise<TrustObject> {
    const history = await this.store.listAudit({ entityType, entityId, pageSize: 500 });
    const ordered = [...history].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const merged = ordered.reduce<AuditLogEntry['metadata']>((acc, e) => ({ ...acc, ...e.metadata }), {});
    const anomalies = await this.store.listAnomalies({
      entityType, entityId, status: ['open', 'investigating'], pageSize: 100,
    });
    const { score, riskLevel } = computeScore({
      entityType,
      verified: typeof merged.verified === 'boolean' ? merged.verified : undefined,
      sourceVerified: typeof merged.sourceVerified === 'boolean' ? merged.sourceVerified : undefined,
      expiresAt: typeof merged.expiresAt === 'string' ? merged.expiresAt : null,
      now: this.now(),
      hasDuplicate: anomalies.some((a) => a.type === 'duplicate'),
      openAnomalies: anomalies,
    }, this.rules);
    const existing = await this.store.getTrustScore(entityType, entityId);
    const row: TrustScoreRow = await this.store.upsertTrustScore({
      entity_type: entityType,
      entity_id: entityId,
      owner_id: ownerId ?? existing?.owner_id ?? null,
      score,
      risk_level: riskLevel,
      updated_at: this.now().toISOString(),
    });
    return {
      id: row.entity_id, type: row.entity_type, ownerId: row.owner_id,
      trustScore: row.score, riskLevel: row.risk_level, anomalies,
    };
  }
}

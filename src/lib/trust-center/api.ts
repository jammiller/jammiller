import { getInvestigationQueue, getOverview, type IntegrityMonitor } from './monitor.ts';
import type { AnomalyStatus, IntegrityEvent, RiskLevel, TrustCenterStore } from './types.ts';

export interface TrustCenterApiDeps {
  store: TrustCenterStore;
  monitor: IntegrityMonitor;
  /** Return true when the request may perform the given action. Ingest is for internal callers only. */
  authorize: (req: Request, action: 'read' | 'ingest') => Promise<boolean>;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const RISK: RiskLevel[] = ['low', 'medium', 'high'];
const STATUSES: AnomalyStatus[] = ['open', 'investigating', 'resolved'];

function num(v: string | null, fallback: number, max: number) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.min(Math.floor(n), max) : fallback;
}

export function parseIntegrityEvent(body: unknown): IntegrityEvent | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  for (const k of ['eventType', 'actorId', 'entityType', 'entityId']) {
    if (typeof b[k] !== 'string' || !(b[k] as string).trim()) return null;
  }
  if (b.metadata !== undefined && (typeof b.metadata !== 'object' || b.metadata === null || Array.isArray(b.metadata))) return null;
  if (b.timestamp !== undefined && (typeof b.timestamp !== 'string' || Number.isNaN(Date.parse(b.timestamp)))) return null;
  return {
    eventType: b.eventType as string, actorId: b.actorId as string,
    entityType: b.entityType as string, entityId: b.entityId as string,
    ownerId: typeof b.ownerId === 'string' ? b.ownerId : null,
    metadata: (b.metadata as Record<string, unknown> | undefined) ?? {},
    timestamp: b.timestamp as string | undefined,
  };
}

/**
 * Routes (last path segment): GET overview | trust-scores | anomalies | investigations | audit-logs, POST events.
 */
export async function handleTrustCenterRequest(req: Request, deps: TrustCenterApiDeps): Promise<Response> {
  const url = new URL(req.url);
  const route = url.pathname.replace(/\/$/, '').split('/').pop();
  const q = url.searchParams;
  const paging = { page: num(q.get('page'), 1, 100000), pageSize: num(q.get('pageSize'), 50, 200) };

  if (req.method === 'POST' && route === 'events') {
    if (!(await deps.authorize(req, 'ingest'))) return json({ error: 'forbidden' }, 403);
    let body: unknown;
    try { body = await req.json(); } catch { return json({ error: 'invalid JSON' }, 400); }
    const event = parseIntegrityEvent(body);
    if (!event) return json({ error: 'invalid event' }, 400);
    return json(await deps.monitor.ingest(event), 201);
  }
  if (req.method !== 'GET') return json({ error: 'method not allowed' }, 405);
  if (!(await deps.authorize(req, 'read'))) return json({ error: 'forbidden' }, 403);

  const risk = q.get('riskLevel');
  const status = q.get('status');
  const severity = q.get('severity');
  if ((risk && !RISK.includes(risk as RiskLevel)) || (severity && !RISK.includes(severity as RiskLevel))
    || (status && !STATUSES.includes(status as AnomalyStatus))) return json({ error: 'invalid filter' }, 400);

  switch (route) {
    case 'overview':
      return json(await getOverview(deps.store));
    case 'trust-scores':
      return json(await deps.store.listTrustScores({ ...paging, riskLevel: (risk as RiskLevel) ?? undefined, entityType: q.get('entityType') ?? undefined }));
    case 'anomalies':
      return json(await deps.store.listAnomalies({ ...paging, status: (status as AnomalyStatus) ?? undefined, severity: (severity as RiskLevel) ?? undefined, entityType: q.get('entityType') ?? undefined }));
    case 'investigations':
      return json(await getInvestigationQueue(deps.store, { ...paging, severity: (severity as RiskLevel) ?? undefined }));
    case 'audit-logs':
      return json(await deps.store.listAudit({
        ...paging, eventType: q.get('eventType') ?? undefined, actorId: q.get('actorId') ?? undefined,
        entityType: q.get('entityType') ?? undefined, entityId: q.get('entityId') ?? undefined, since: q.get('since') ?? undefined,
      }));
    default:
      return json({ error: 'not found' }, 404);
  }
}

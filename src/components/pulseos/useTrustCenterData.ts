import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MemoryTrustCenterStore } from '../../lib/trust-center/memoryStore';
import { getInvestigationQueue, getOverview } from '../../lib/trust-center/monitor';
import { seedTrustCenter } from '../../lib/trust-center/seed';
import { SupabaseTrustCenterStore } from '../../lib/trust-center/supabaseStore';
import type { Anomaly, AuditLogEntry, TrustCenterStore, TrustOverview, TrustScoreRow } from '../../lib/trust-center/types';

export interface TrustCenterData {
  overview: TrustOverview;
  scores: TrustScoreRow[];
  investigations: Anomaly[];
  audit: AuditLogEntry[];
}

/**
 * Loads Trust Center data for PulseOS admins. When the tables are empty or not readable
 * (no admin session, migration not applied), falls back to dev-only sample data that is
 * produced by the real IntegrityMonitor so the UI is demonstrable without external systems.
 */
export function useTrustCenterData() {
  const [data, setData] = useState<TrustCenterData | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const read = async (store: TrustCenterStore): Promise<TrustCenterData> => ({
      overview: await getOverview(store),
      scores: await store.listTrustScores({ pageSize: 200 }),
      investigations: await getInvestigationQueue(store, { pageSize: 200 }),
      audit: await store.listAudit({ pageSize: 200 }),
    });
    try {
      const live = await read(new SupabaseTrustCenterStore(supabase));
      if (live.overview.totalEntities > 0 || live.audit.length > 0) {
        setData(live); setDemo(false); setLoading(false);
        return;
      }
    } catch {
      // fall through to sample data
    }
    const memory = new MemoryTrustCenterStore();
    await seedTrustCenter(memory);
    setData(await read(memory)); setDemo(true); setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { data, demo, loading, reload: load };
}

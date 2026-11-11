import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { ComplianceEvidence, ComplianceRequirement, OJTEnrollment, OJTHourEntry, OJTProgram } from '../../lib/pulseos-ojt-types';

export function useOJTData(enabled: boolean) {
  const [programs, setPrograms] = useState<OJTProgram[]>([]);
  const [enrollments, setEnrollments] = useState<OJTEnrollment[]>([]);
  const [hours, setHours] = useState<OJTHourEntry[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [evidence, setEvidence] = useState<ComplianceEvidence[]>([]);
  const latestRequest = useRef(0);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const request = ++latestRequest.current;
    if (!enabled) {
      setPrograms([]); setEnrollments([]); setHours([]); setRequirements([]); setEvidence([]); setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    const [programResult, enrollmentResult, hourResult, requirementResult, evidenceResult] = await Promise.all([
      supabase.from('pulseos_ojt_programs').select('*').order('created_at', { ascending: false }),
      supabase.from('pulseos_ojt_enrollments').select('*').order('created_at', { ascending: false }),
      supabase.from('pulseos_ojt_hour_entries').select('*').order('work_date', { ascending: false }),
      supabase.from('pulseos_compliance_requirements').select('*').order('state_code').order('title'),
      supabase.from('pulseos_compliance_evidence').select('*').order('created_at', { ascending: false }),
    ]);
    if (request !== latestRequest.current) return;

    const firstError = [programResult, enrollmentResult, hourResult, requirementResult, evidenceResult].find(result => result.error)?.error;
    if (firstError) setError(firstError.message);
    setPrograms((programResult.data ?? []) as OJTProgram[]);
    setEnrollments((enrollmentResult.data ?? []) as OJTEnrollment[]);
    setHours((hourResult.data ?? []) as OJTHourEntry[]);
    setRequirements((requirementResult.data ?? []) as ComplianceRequirement[]);
    setEvidence((evidenceResult.data ?? []) as ComplianceEvidence[]);
    setLoading(false);
  }, [enabled]);

  useEffect(() => { refetch(); }, [refetch]);

  return { programs, enrollments, hours, requirements, evidence, loading, error, refetch };
}

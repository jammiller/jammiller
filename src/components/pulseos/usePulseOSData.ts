import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type {
  Program, Course, UbDUnit, Lesson, Assessment, AssessmentSubmission,
} from '../../lib/pulseos-types';

export function usePulseOSData() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [units, setUnits] = useState<UbDUnit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes, uRes, lRes, aRes, sRes] = await Promise.all([
        supabase.from('pulseos_programs').select('*').order('created_at', { ascending: false }),
        supabase.from('pulseos_courses').select('*').order('created_at', { ascending: false }),
        supabase.from('pulseos_units').select('*').order('updated_at', { ascending: false }),
        supabase.from('pulseos_lessons').select('*').order('created_at', { ascending: false }),
        supabase.from('pulseos_assessments').select('*').order('created_at', { ascending: false }),
        supabase.from('pulseos_assessment_submissions').select('*').order('submitted_at', { ascending: false }),
      ]);

      if (pRes.error) throw pRes.error;
      if (cRes.error) throw cRes.error;
      if (uRes.error) throw uRes.error;
      if (lRes.error) throw lRes.error;
      if (aRes.error) throw aRes.error;
      if (sRes.error) throw sRes.error;

      setPrograms(pRes.data as Program[]);
      setCourses(cRes.data as Course[]);
      setUnits(uRes.data as UbDUnit[]);
      setLessons(lRes.data as Lesson[]);
      setAssessments(aRes.data as Assessment[]);
      setSubmissions(sRes.data as AssessmentSubmission[]);
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Failed to load PulseOS data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { programs, courses, units, lessons, assessments, submissions, loading, error, refetch: fetchAll };
}

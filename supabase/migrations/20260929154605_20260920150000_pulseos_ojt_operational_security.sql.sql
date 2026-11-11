-- Operational OJT workspace: restrict program records and evidence to authenticated PulseOS administrators.
-- This migration also provisions private document storage for compliance evidence.

DROP POLICY IF EXISTS admin_manage_ojt_programs ON pulseos_ojt_programs;
DROP POLICY IF EXISTS admin_manage_ojt_enrollments ON pulseos_ojt_enrollments;
DROP POLICY IF EXISTS admin_manage_ojt_hour_entries ON pulseos_ojt_hour_entries;
DROP POLICY IF EXISTS admin_manage_compliance_requirements ON pulseos_compliance_requirements;
DROP POLICY IF EXISTS admin_manage_compliance_evidence ON pulseos_compliance_evidence;

CREATE POLICY admin_manage_ojt_programs ON pulseos_ojt_programs FOR ALL TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_ojt_enrollments ON pulseos_ojt_enrollments FOR ALL TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_ojt_hour_entries ON pulseos_ojt_hour_entries FOR ALL TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_compliance_requirements ON pulseos_compliance_requirements FOR ALL TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_compliance_evidence ON pulseos_compliance_evidence FOR ALL TO authenticated
  USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

-- Baseline checklists are configurable starting points, not a statement of agency requirements.
INSERT INTO pulseos_compliance_requirements (state_code, title, description, evidence_type, required)
VALUES
  ('FL', 'Executed OJT agreement and training plan', 'Agency-accepted agreement and plan retained for the enrollment.', 'agreement', true),
  ('FL', 'Participant eligibility record', 'Eligibility support retained according to the applicable workforce program.', 'eligibility', true),
  ('FL', 'Approved timesheets', 'Daily work activity, trainee attestation, and supervisor approval retained.', 'timesheet', true),
  ('FL', 'Wage and reimbursement support', 'Payroll, wage, and reimbursement support retained where applicable.', 'wage_record', true),
  ('FL', 'Progress review and completion record', 'Periodic review and closeout or completion documentation retained.', 'progress_review', true),
  ('GA', 'Executed OJT contract and individualized training plan', 'Agency-accepted contract and individual training plan retained.', 'agreement', true),
  ('GA', 'Participant eligibility and enrollment record', 'Eligibility and enrollment support retained according to the applicable workforce program.', 'eligibility', true),
  ('GA', 'Payroll or time records with supervisor approval', 'Time or payroll records and supervisor approval retained.', 'timesheet', true),
  ('GA', 'Wage, reimbursement, and retention support', 'Wage, reimbursement, and retention documentation retained where applicable.', 'wage_record', true),
  ('GA', 'Progress review and exit or completion record', 'Progress review and exit or completion documentation retained.', 'closeout', true)
ON CONFLICT (state_code, title) DO UPDATE SET description = EXCLUDED.description, evidence_type = EXCLUDED.evidence_type, required = EXCLUDED.required;

INSERT INTO storage.buckets (id, name, public)
VALUES ('pulseos-ojt-evidence', 'pulseos-ojt-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS pulseos_ojt_evidence_read ON storage.objects;
DROP POLICY IF EXISTS pulseos_ojt_evidence_insert ON storage.objects;
DROP POLICY IF EXISTS pulseos_ojt_evidence_update ON storage.objects;
DROP POLICY IF EXISTS pulseos_ojt_evidence_delete ON storage.objects;

CREATE POLICY pulseos_ojt_evidence_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pulseos-ojt-evidence' AND pulseos_is_admin());
CREATE POLICY pulseos_ojt_evidence_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pulseos-ojt-evidence' AND pulseos_is_admin());
CREATE POLICY pulseos_ojt_evidence_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pulseos-ojt-evidence' AND pulseos_is_admin())
  WITH CHECK (bucket_id = 'pulseos-ojt-evidence' AND pulseos_is_admin());
CREATE POLICY pulseos_ojt_evidence_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pulseos-ojt-evidence' AND pulseos_is_admin());
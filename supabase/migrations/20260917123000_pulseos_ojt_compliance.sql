-- PulseOS OJT records and configurable Florida / Georgia compliance evidence.
-- Compliance requirements are program-configurable; sponsors must confirm current local, state, and federal obligations.

CREATE TABLE IF NOT EXISTS pulseos_ojt_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL CHECK (state_code IN ('FL', 'GA')),
  title text NOT NULL,
  sponsor_name text NOT NULL,
  occupation_title text NOT NULL,
  required_hours numeric(10,2) NOT NULL CHECK (required_hours > 0),
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_ojt_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES pulseos_ojt_programs(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES pulseos_workers(id) ON DELETE SET NULL,
  trainee_name text NOT NULL,
  employer_name text NOT NULL,
  supervisor_name text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  wage_at_start numeric(12,2) CHECK (wage_at_start >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_ojt_hour_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES pulseos_ojt_enrollments(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  hours numeric(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  work_activity text NOT NULL,
  competency_id uuid REFERENCES pulseos_competencies(id) ON DELETE SET NULL,
  supervisor_name text NOT NULL,
  supervisor_approved_at timestamptz,
  trainee_attested_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, work_date, work_activity)
);

CREATE TABLE IF NOT EXISTS pulseos_compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL CHECK (state_code IN ('FL', 'GA')),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  evidence_type text NOT NULL CHECK (evidence_type IN ('agreement', 'eligibility', 'training_plan', 'wage_record', 'timesheet', 'supervisor_approval', 'progress_review', 'closeout')),
  required boolean NOT NULL DEFAULT true,
  effective_from date,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (state_code, title)
);

CREATE TABLE IF NOT EXISTS pulseos_compliance_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES pulseos_ojt_enrollments(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES pulseos_compliance_requirements(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'missing' CHECK (status IN ('missing', 'in_review', 'verified', 'expired', 'waived')),
  document_url text,
  verified_by text,
  verified_at timestamptz,
  expires_at date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, requirement_id)
);

CREATE INDEX IF NOT EXISTS idx_pulseos_ojt_enrollments_program ON pulseos_ojt_enrollments(program_id, status);
CREATE INDEX IF NOT EXISTS idx_pulseos_ojt_hours_enrollment_date ON pulseos_ojt_hour_entries(enrollment_id, work_date DESC);
CREATE INDEX IF NOT EXISTS idx_pulseos_compliance_evidence_enrollment ON pulseos_compliance_evidence(enrollment_id, status);

ALTER TABLE pulseos_ojt_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_ojt_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_ojt_hour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_compliance_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_manage_ojt_programs ON pulseos_ojt_programs FOR ALL TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_ojt_enrollments ON pulseos_ojt_enrollments FOR ALL TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_ojt_hour_entries ON pulseos_ojt_hour_entries FOR ALL TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_compliance_requirements ON pulseos_compliance_requirements FOR ALL TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());
CREATE POLICY admin_manage_compliance_evidence ON pulseos_compliance_evidence FOR ALL TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP TRIGGER IF EXISTS trg_pulseos_ojt_programs_updated ON pulseos_ojt_programs;
CREATE TRIGGER trg_pulseos_ojt_programs_updated BEFORE UPDATE ON pulseos_ojt_programs FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();
DROP TRIGGER IF EXISTS trg_pulseos_ojt_enrollments_updated ON pulseos_ojt_enrollments;
CREATE TRIGGER trg_pulseos_ojt_enrollments_updated BEFORE UPDATE ON pulseos_ojt_enrollments FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();
DROP TRIGGER IF EXISTS trg_pulseos_compliance_evidence_updated ON pulseos_compliance_evidence;
CREATE TRIGGER trg_pulseos_compliance_evidence_updated BEFORE UPDATE ON pulseos_compliance_evidence FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();

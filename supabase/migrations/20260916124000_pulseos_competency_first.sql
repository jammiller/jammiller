-- PulseOS competency-first workforce foundation
-- Core hierarchy: industry -> occupation -> role -> competency -> task.

CREATE TABLE IF NOT EXISTS pulseos_industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_occupations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id uuid NOT NULL REFERENCES pulseos_industries(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (industry_id, name)
);

CREATE TABLE IF NOT EXISTS pulseos_competencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  industry_id uuid NOT NULL REFERENCES pulseos_industries(id) ON DELETE RESTRICT,
  domain text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_proficiency_level smallint NOT NULL DEFAULT 1 CHECK (target_proficiency_level BETWEEN 1 AND 5),
  knowledge jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  experience jsonb NOT NULL DEFAULT '[]'::jsonb,
  behaviors jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_competency_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency_id uuid NOT NULL REFERENCES pulseos_competencies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id uuid NOT NULL REFERENCES pulseos_occupations(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (occupation_id, title)
);

CREATE TABLE IF NOT EXISTS pulseos_role_competencies (
  role_id uuid NOT NULL REFERENCES pulseos_roles(id) ON DELETE CASCADE,
  competency_id uuid NOT NULL REFERENCES pulseos_competencies(id) ON DELETE RESTRICT,
  required_proficiency_level smallint NOT NULL CHECK (required_proficiency_level BETWEEN 1 AND 5),
  required boolean NOT NULL DEFAULT true,
  PRIMARY KEY (role_id, competency_id)
);

CREATE TABLE IF NOT EXISTS pulseos_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role_id uuid REFERENCES pulseos_roles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES pulseos_workers(id) ON DELETE CASCADE,
  competency_id uuid NOT NULL REFERENCES pulseos_competencies(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN ('training_completion', 'field_observation', 'certification', 'work_hours', 'assessment', 'supervisor_validation', 'project_portfolio', 'simulation')),
  title text NOT NULL,
  source_url text,
  observed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulseos_worker_competencies (
  worker_id uuid NOT NULL REFERENCES pulseos_workers(id) ON DELETE CASCADE,
  competency_id uuid NOT NULL REFERENCES pulseos_competencies(id) ON DELETE CASCADE,
  proficiency_level smallint NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'in_review' CHECK (status IN ('in_review', 'verified', 'expired')),
  verified_at timestamptz,
  verified_by text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (worker_id, competency_id)
);

CREATE INDEX IF NOT EXISTS idx_pulseos_competencies_industry_domain ON pulseos_competencies(industry_id, domain);
CREATE INDEX IF NOT EXISTS idx_pulseos_tasks_competency ON pulseos_competency_tasks(competency_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_evidence_worker_competency ON pulseos_evidence(worker_id, competency_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_worker_competencies_competency ON pulseos_worker_competencies(competency_id);

ALTER TABLE pulseos_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_competency_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_role_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulseos_worker_competencies ENABLE ROW LEVEL SECURITY;

-- PulseOS currently operates as a public single-tenant workspace. Replace these policies
-- with tenant-scoped policies before enabling multi-organization production access.
DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['pulseos_industries', 'pulseos_occupations', 'pulseos_competencies', 'pulseos_competency_tasks', 'pulseos_roles', 'pulseos_role_competencies', 'pulseos_workers', 'pulseos_evidence', 'pulseos_worker_competencies']
  LOOP
    EXECUTE format('CREATE POLICY public_workspace_access ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS trg_pulseos_competencies_updated ON pulseos_competencies;
CREATE TRIGGER trg_pulseos_competencies_updated BEFORE UPDATE ON pulseos_competencies FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();
DROP TRIGGER IF EXISTS trg_pulseos_roles_updated ON pulseos_roles;
CREATE TRIGGER trg_pulseos_roles_updated BEFORE UPDATE ON pulseos_roles FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();
DROP TRIGGER IF EXISTS trg_pulseos_workers_updated ON pulseos_workers;
CREATE TRIGGER trg_pulseos_workers_updated BEFORE UPDATE ON pulseos_workers FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();
DROP TRIGGER IF EXISTS trg_pulseos_worker_competencies_updated ON pulseos_worker_competencies;
CREATE TRIGGER trg_pulseos_worker_competencies_updated BEFORE UPDATE ON pulseos_worker_competencies FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();

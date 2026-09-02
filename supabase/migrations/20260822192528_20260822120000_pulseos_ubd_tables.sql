/*
# PulseOS — UbD-First Learning Operations System

## Purpose
Creates the full database schema for PulseOS, a real functioning learning operations platform
built on Understanding by Design (UbD). Everything orbits the UbD Unit, which contains
structured fields for Stage 1 (Desired Results), Stage 2 (Evidence), and Stage 3 (Learning Plan).

## New Tables

1. **pulseos_programs** — Top-level container (e.g., "3rd Grade ELA", "AP Biology")
   - id, title, description, subject, grade_band, created_at, updated_at

2. **pulseos_courses** — Belongs to a program; a structured sequence of units
   - id, program_id (FK), title, description, created_at, updated_at

3. **pulseos_units** — THE UbD CORE OBJECT. Contains Stage 1/2/3 as structured JSONB fields.
   - id, course_id (FK), title, description
   - stage1 (jsonb): big_ideas, understandings, essential_questions, knowledge_skills, standards
   - stage2 (jsonb): performance_tasks, summative_assessments, formative_checks, rubrics
   - stage3 (jsonb): learning_experiences, sequence, resources, differentiation_notes
   - status (draft | in_review | published | archived)
   - version (int, default 1)
   - created_at, updated_at

4. **pulseos_lessons** — Micro-UbD tied to a unit
   - id, unit_id (FK), title, objectives (jsonb), essential_question, plan (jsonb), resources (jsonb), created_at

5. **pulseos_assessments** — Stage 2 evidence objects tied to units/lessons
   - id, unit_id (FK), lesson_id (FK nullable), type (summative | formative | performance)
   - title, description, questions (jsonb), rubric (jsonb), created_at

6. **pulseos_assessment_submissions** — Learner responses + scores
   - id, assessment_id (FK), respondent_name, answers (jsonb), score (numeric), submitted_at

7. **pulseos_analytics_events** — Tracks usage, completion, performance
   - id, unit_id (FK nullable), lesson_id (FK nullable), assessment_id (FK nullable)
   - event_type (view | complete | score), value (numeric), metadata (jsonb), created_at

## Security
- This is a no-auth app (no sign-in screen). All policies use `TO anon, authenticated`.
- All data is intentionally shared/public — any visitor can create and view UbD units, assessments, etc.
- RLS enabled on every table.
- 4 policies per table (select/insert/update/delete), all with `USING (true)` / `WITH CHECK (true)`
  because the data is intentionally public in this single-tenant tool.

## Important Notes
1. UbD is enforced at the data level: stage1/stage2/stage3 are structured JSONB fields, not free text.
2. Versioning: units track version number for future version-control features.
3. Analytics: every view/complete/score event is logged for real dashboards.
4. Assessments link back to units (Stage 2 evidence) and optionally to specific lessons.
5. Submission scoring is stored as numeric for analytics aggregation.
*/

-- Programs
CREATE TABLE IF NOT EXISTS pulseos_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject text,
  grade_band text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_programs" ON pulseos_programs;
CREATE POLICY "anon_select_programs" ON pulseos_programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_programs" ON pulseos_programs;
CREATE POLICY "anon_insert_programs" ON pulseos_programs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_programs" ON pulseos_programs;
CREATE POLICY "anon_update_programs" ON pulseos_programs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_programs" ON pulseos_programs;
CREATE POLICY "anon_delete_programs" ON pulseos_programs FOR DELETE TO anon, authenticated USING (true);

-- Courses
CREATE TABLE IF NOT EXISTS pulseos_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES pulseos_programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_courses" ON pulseos_courses;
CREATE POLICY "anon_select_courses" ON pulseos_courses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_courses" ON pulseos_courses;
CREATE POLICY "anon_insert_courses" ON pulseos_courses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_courses" ON pulseos_courses;
CREATE POLICY "anon_update_courses" ON pulseos_courses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_courses" ON pulseos_courses;
CREATE POLICY "anon_delete_courses" ON pulseos_courses FOR DELETE TO anon, authenticated USING (true);

-- Units (UbD Core)
CREATE TABLE IF NOT EXISTS pulseos_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES pulseos_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  stage1 jsonb NOT NULL DEFAULT '{"big_ideas":[],"understandings":[],"essential_questions":[],"knowledge_skills":[],"standards":[]}'::jsonb,
  stage2 jsonb NOT NULL DEFAULT '{"performance_tasks":[],"summative_assessments":[],"formative_checks":[],"rubrics":[]}'::jsonb,
  stage3 jsonb NOT NULL DEFAULT '{"learning_experiences":[],"sequence":[],"resources":[],"differentiation_notes":""}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  version int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_units ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_units" ON pulseos_units;
CREATE POLICY "anon_select_units" ON pulseos_units FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_units" ON pulseos_units;
CREATE POLICY "anon_insert_units" ON pulseos_units FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_units" ON pulseos_units;
CREATE POLICY "anon_update_units" ON pulseos_units FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_units" ON pulseos_units;
CREATE POLICY "anon_delete_units" ON pulseos_units FOR DELETE TO anon, authenticated USING (true);

-- Lessons
CREATE TABLE IF NOT EXISTS pulseos_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES pulseos_units(id) ON DELETE CASCADE,
  title text NOT NULL,
  objectives jsonb DEFAULT '[]'::jsonb,
  essential_question text,
  plan jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_lessons" ON pulseos_lessons;
CREATE POLICY "anon_select_lessons" ON pulseos_lessons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lessons" ON pulseos_lessons;
CREATE POLICY "anon_insert_lessons" ON pulseos_lessons FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lessons" ON pulseos_lessons;
CREATE POLICY "anon_update_lessons" ON pulseos_lessons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lessons" ON pulseos_lessons;
CREATE POLICY "anon_delete_lessons" ON pulseos_lessons FOR DELETE TO anon, authenticated USING (true);

-- Assessments
CREATE TABLE IF NOT EXISTS pulseos_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES pulseos_units(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES pulseos_lessons(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'formative',
  title text NOT NULL,
  description text,
  questions jsonb DEFAULT '[]'::jsonb,
  rubric jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_assessments" ON pulseos_assessments;
CREATE POLICY "anon_select_assessments" ON pulseos_assessments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assessments" ON pulseos_assessments;
CREATE POLICY "anon_insert_assessments" ON pulseos_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assessments" ON pulseos_assessments;
CREATE POLICY "anon_update_assessments" ON pulseos_assessments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assessments" ON pulseos_assessments;
CREATE POLICY "anon_delete_assessments" ON pulseos_assessments FOR DELETE TO anon, authenticated USING (true);

-- Assessment Submissions
CREATE TABLE IF NOT EXISTS pulseos_assessment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES pulseos_assessments(id) ON DELETE CASCADE,
  respondent_name text NOT NULL,
  answers jsonb DEFAULT '[]'::jsonb,
  score numeric,
  submitted_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_assessment_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_select_submissions" ON pulseos_assessment_submissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_insert_submissions" ON pulseos_assessment_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_update_submissions" ON pulseos_assessment_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_delete_submissions" ON pulseos_assessment_submissions FOR DELETE TO anon, authenticated USING (true);

-- Analytics Events
CREATE TABLE IF NOT EXISTS pulseos_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES pulseos_units(id) ON DELETE SET NULL,
  lesson_id uuid REFERENCES pulseos_lessons(id) ON DELETE SET NULL,
  assessment_id uuid REFERENCES pulseos_assessments(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  value numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE pulseos_analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_select_analytics" ON pulseos_analytics_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_insert_analytics" ON pulseos_analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_update_analytics" ON pulseos_analytics_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_delete_analytics" ON pulseos_analytics_events FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pulseos_courses_program ON pulseos_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_units_course ON pulseos_units(course_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_lessons_unit ON pulseos_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_assessments_unit ON pulseos_assessments(unit_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_submissions_assessment ON pulseos_assessment_submissions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_analytics_unit ON pulseos_analytics_events(unit_id);
CREATE INDEX IF NOT EXISTS idx_pulseos_analytics_type ON pulseos_analytics_events(event_type);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION pulseos_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pulseos_programs_updated ON pulseos_programs;
CREATE TRIGGER trg_pulseos_programs_updated BEFORE UPDATE ON pulseos_programs
  FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();

DROP TRIGGER IF EXISTS trg_pulseos_courses_updated ON pulseos_courses;
CREATE TRIGGER trg_pulseos_courses_updated BEFORE UPDATE ON pulseos_courses
  FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();

DROP TRIGGER IF EXISTS trg_pulseos_units_updated ON pulseos_units;
CREATE TRIGGER trg_pulseos_units_updated BEFORE UPDATE ON pulseos_units
  FOR EACH ROW EXECUTE FUNCTION pulseos_update_timestamp();

/*
# ClassFlow — classroom management tables

1. Purpose
   Adds persistent storage for the ClassFlow add-on so attendance, grading,
   lesson notes, and student rosters survive page reloads. This is a
   single-tenant (no-auth) app, so all policies allow anon + authenticated
   CRUD — the data is intentionally shared/public within the workspace.

2. New Tables
   - `classflow_students` — the class roster (name, initials, streak note)
   - `classflow_attendance` — per-student-per-day attendance records
   - `classflow_grades` — graded submissions (student, description, score, confidence, note, status)
   - `classflow_notes` — lesson notes (title, body, editable)

3. Columns
   classflow_students:
     id (uuid pk), name (text), initials (text), streak_note (text),
     sort_order (int default 0), created_at (timestamptz)
   classflow_attendance:
     id (uuid pk), student_id (uuid fk -> classflow_students),
     attendance_date (date), status (text: present|absent|late|null),
     created_at (timestamptz)
   classflow_grades:
     id (uuid pk), student_name (text), description (text),
     score (text), confidence (text), note (text),
     status (text: pending|graded, default 'pending'), created_at (timestamptz)
   classflow_notes:
     id (uuid pk), title (text), body (text),
     created_at (timestamptz), updated_at (timestamptz)

4. Security
   RLS enabled on all four tables.
   Policies: anon + authenticated full CRUD (single-tenant, intentionally shared).

5. Notes
   - Attendance is keyed by (student_id, attendance_date) with a unique
     constraint so re-marking the same student on the same day upserts
     instead of creating duplicates.
   - Seed data is inserted so the ClassFlow UI has content on first load.
*/

-- Students
CREATE TABLE IF NOT EXISTS classflow_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  initials text NOT NULL,
  streak_note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classflow_students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cf_students_select" ON classflow_students;
CREATE POLICY "cf_students_select" ON classflow_students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cf_students_insert" ON classflow_students;
CREATE POLICY "cf_students_insert" ON classflow_students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cf_students_update" ON classflow_students;
CREATE POLICY "cf_students_update" ON classflow_students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cf_students_delete" ON classflow_students;
CREATE POLICY "cf_students_delete" ON classflow_students FOR DELETE
  TO anon, authenticated USING (true);

-- Attendance
CREATE TABLE IF NOT EXISTS classflow_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES classflow_students(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  status text CHECK (status IN ('present', 'absent', 'late') OR status IS NULL),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, attendance_date)
);

ALTER TABLE classflow_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cf_attendance_select" ON classflow_attendance;
CREATE POLICY "cf_attendance_select" ON classflow_attendance FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cf_attendance_insert" ON classflow_attendance;
CREATE POLICY "cf_attendance_insert" ON classflow_attendance FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cf_attendance_update" ON classflow_attendance;
CREATE POLICY "cf_attendance_update" ON classflow_attendance FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cf_attendance_delete" ON classflow_attendance;
CREATE POLICY "cf_attendance_delete" ON classflow_attendance FOR DELETE
  TO anon, authenticated USING (true);

-- Grades
CREATE TABLE IF NOT EXISTS classflow_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  description text NOT NULL,
  score text NOT NULL,
  confidence text NOT NULL DEFAULT 'high',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'graded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classflow_grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cf_grades_select" ON classflow_grades;
CREATE POLICY "cf_grades_select" ON classflow_grades FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cf_grades_insert" ON classflow_grades;
CREATE POLICY "cf_grades_insert" ON classflow_grades FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cf_grades_update" ON classflow_grades;
CREATE POLICY "cf_grades_update" ON classflow_grades FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cf_grades_delete" ON classflow_grades;
CREATE POLICY "cf_grades_delete" ON classflow_grades FOR DELETE
  TO anon, authenticated USING (true);

-- Notes
CREATE TABLE IF NOT EXISTS classflow_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classflow_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cf_notes_select" ON classflow_notes;
CREATE POLICY "cf_notes_select" ON classflow_notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cf_notes_insert" ON classflow_notes;
CREATE POLICY "cf_notes_insert" ON classflow_notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cf_notes_update" ON classflow_notes;
CREATE POLICY "cf_notes_update" ON classflow_notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cf_notes_delete" ON classflow_notes;
CREATE POLICY "cf_notes_delete" ON classflow_notes FOR DELETE
  TO anon, authenticated USING (true);

-- Seed data: students
INSERT INTO classflow_students (name, initials, streak_note, sort_order) VALUES
  ('Priya N.', 'PN', '6-day streak', 0),
  ('Marcus D.', 'MD', 'perfect month', 1),
  ('Jordan T.', 'JT', '2nd absence, unexplained', 2),
  ('Elena R.', 'ER', 'perfect month', 3),
  ('Sam K.', 'SK', '3rd late this week', 4),
  ('Aisha B.', 'AB', '12-day streak', 5),
  ('Noah P.', 'NP', 'perfect month', 6),
  ('Grace L.', 'GL', 'not yet marked', 7)
ON CONFLICT DO NOTHING;

-- Seed data: grades
INSERT INTO classflow_grades (student_name, description, score, confidence, note, status) VALUES
  ('Priya N.', 'Quiz 4 — Cellular Respiration, short answer', '8.5/10', 'high', 'Suggested note: "Clear on glycolysis, missing detail on the electron transport chain — see Q3."', 'pending'),
  ('Marcus D.', 'Quiz 4 — Cellular Respiration, short answer', '6/10', 'medium', 'Suggested note: "Answer partially matches a classmate''s phrasing on Q2 — worth a quick look before returning."', 'pending'),
  ('Elena R.', 'Quiz 4 — Cellular Respiration, short answer', '9.5/10', 'high', 'Suggested note: "Strong, complete answer across all three parts."', 'pending'),
  ('Diego F.', 'Quiz 4 — Cellular Respiration, short answer', '7/10', 'edited by you', '', 'graded')
ON CONFLICT DO NOTHING;

-- Seed data: notes
INSERT INTO classflow_notes (title, body) VALUES
  ('Today — Cellular Respiration', 'Glycolysis → pyruvate → Krebs cycle → electron transport chain.
Emphasize: where ATP is actually produced at each stage.
Demo tomorrow: yeast + sugar, watch the balloon inflate (CO₂).')
ON CONFLICT DO NOTHING;

/*
# Remove auth gates from PulseOS data tables

## Purpose
The user has requested removing the login feature from PulseOS entirely.
This means the app now runs as a single-tenant, no-auth application where
the anon-key Supabase client needs full CRUD access to all PulseOS data tables.

## Changes
- Replace admin-only INSERT/UPDATE/DELETE policies on all pulseos_ data tables
  with anon+authenticated policies that allow full access.
- SELECT policies already allow anon — no change needed.
- pulseos_user_roles table policies are left unchanged (no longer used by the app
  but keeping them avoids breaking anything that references the table).

## Tables affected
- pulseos_programs
- pulseos_courses
- pulseos_units
- pulseos_lessons
- pulseos_assessments
- pulseos_assessment_submissions
- pulseos_analytics_events

## Security notes
- This is intentionally a no-auth, single-tenant app. All data is shared/public.
- USING (true) / WITH CHECK (true) is acceptable here because there is no
  sign-in screen and the data is intentionally shared.
*/

-- pulseos_programs
DROP POLICY IF EXISTS "admin_insert_programs" ON pulseos_programs;
CREATE POLICY "anon_insert_programs" ON pulseos_programs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_programs" ON pulseos_programs;
CREATE POLICY "anon_update_programs" ON pulseos_programs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_programs" ON pulseos_programs;
CREATE POLICY "anon_delete_programs" ON pulseos_programs FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_courses
DROP POLICY IF EXISTS "admin_insert_courses" ON pulseos_courses;
CREATE POLICY "anon_insert_courses" ON pulseos_courses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_courses" ON pulseos_courses;
CREATE POLICY "anon_update_courses" ON pulseos_courses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_courses" ON pulseos_courses;
CREATE POLICY "anon_delete_courses" ON pulseos_courses FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_units
DROP POLICY IF EXISTS "admin_insert_units" ON pulseos_units;
CREATE POLICY "anon_insert_units" ON pulseos_units FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_units" ON pulseos_units;
CREATE POLICY "anon_update_units" ON pulseos_units FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_units" ON pulseos_units;
CREATE POLICY "anon_delete_units" ON pulseos_units FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_lessons
DROP POLICY IF EXISTS "admin_insert_lessons" ON pulseos_lessons;
CREATE POLICY "anon_insert_lessons" ON pulseos_lessons FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_lessons" ON pulseos_lessons;
CREATE POLICY "anon_update_lessons" ON pulseos_lessons FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_lessons" ON pulseos_lessons;
CREATE POLICY "anon_delete_lessons" ON pulseos_lessons FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_assessments
DROP POLICY IF EXISTS "admin_insert_assessments" ON pulseos_assessments;
CREATE POLICY "anon_insert_assessments" ON pulseos_assessments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_assessments" ON pulseos_assessments;
CREATE POLICY "anon_update_assessments" ON pulseos_assessments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_assessments" ON pulseos_assessments;
CREATE POLICY "anon_delete_assessments" ON pulseos_assessments FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_assessment_submissions
DROP POLICY IF EXISTS "admin_update_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_update_submissions" ON pulseos_assessment_submissions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "anon_delete_submissions" ON pulseos_assessment_submissions FOR DELETE
  TO anon, authenticated USING (true);

-- pulseos_analytics_events
DROP POLICY IF EXISTS "admin_update_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_update_analytics" ON pulseos_analytics_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_analytics" ON pulseos_analytics_events;
CREATE POLICY "anon_delete_analytics" ON pulseos_analytics_events FOR DELETE
  TO anon, authenticated USING (true);

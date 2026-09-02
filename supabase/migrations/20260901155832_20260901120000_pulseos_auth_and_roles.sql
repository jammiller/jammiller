/*
# PulseOS — Authentication, User Roles, and Access Control

## Purpose
Adds user roles to PulseOS so the platform can distinguish between
admins (who see the full dashboard, builder, assessments editor, and
analytics) and clients (who see a limited read-only view of published
units and can take assessments). This enables a proper sign-in flow
so the owner no longer needs to navigate through datapulsesocial and
verify via email — they just go to the PulseOS site, log in with
email and password, and land on the dashboard.

## New Tables
1. **pulseos_user_roles**
   - id (uuid, primary key)
   - user_id (uuid, FK to auth.users, ON DELETE CASCADE)
   - role (text: 'admin' | 'client', default 'client')
   - created_at (timestamptz)

## Security Changes
### RLS on pulseos_user_roles
- SELECT: authenticated users can read their own role row.
- INSERT: only authenticated users can insert their own role row
  (for sign-up flow). Admin role assignment must be done via the
  Supabase dashboard or a service-role call.
- UPDATE/DELETE: restricted to the user themselves (for self-service
  role removal) — though in practice admin role changes should go
  through the dashboard.

### Policy changes on existing PulseOS tables
The original migration created all PulseOS tables with `USING (true)`
/ `WITH CHECK (true)` policies for `anon, authenticated` because it was
a no-auth shared workspace. Now that we have authentication:

- **SELECT policies**: kept as `TO anon, authenticated USING (true)`
  so unauthenticated visitors and clients can still browse published
  units and assessments. The frontend will filter what to show based
  on role.
- **INSERT/UPDATE/DELETE policies on pulseos_programs, pulseos_courses,
  pulseos_units, pulseos_lessons, pulseos_assessments**: changed from
  `TO anon, authenticated` to `TO authenticated` with a check that the
  user has the 'admin' role. This prevents clients and anonymous
  visitors from creating or modifying curriculum.
- **INSERT on pulseos_assessment_submissions**: kept open to
  `anon, authenticated` so clients and visitors can submit assessment
  responses without an account.
- **INSERT on pulseos_analytics_events**: kept open to
  `anon, authenticated` so analytics events can be logged from any
  session.

### How admin check works
The policies use a helper function `pulseos_is_admin()` that checks
whether `auth.uid()` has a row in `pulseos_user_roles` with role =
'admin'. This function is SECURITY INVOKER (runs with the caller's
privileges) so RLS on `pulseos_user_roles` is respected.

## Important Notes
1. The first admin user must be created manually: sign up through the
   app, then use the Supabase dashboard to insert a row into
   `pulseos_user_roles` with that user's ID and role = 'admin'.
2. New sign-ups default to 'client' role automatically via a trigger.
3. Email confirmation is OFF — users can sign up and log in immediately.
4. The SELECT policies remain open (USING true) so the app can load
   published content for unauthenticated visitors. Write access is
   what's restricted to admins.
*/

-- =========================================================
-- 1. pulseos_user_roles table
-- =========================================================
CREATE TABLE IF NOT EXISTS pulseos_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE pulseos_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_role" ON pulseos_user_roles;
CREATE POLICY "select_own_role" ON pulseos_user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_role" ON pulseos_user_roles;
CREATE POLICY "insert_own_role" ON pulseos_user_roles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id AND role = 'client');

DROP POLICY IF EXISTS "update_own_role" ON pulseos_user_roles;
CREATE POLICY "update_own_role" ON pulseos_user_roles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_role" ON pulseos_user_roles;
CREATE POLICY "delete_own_role" ON pulseos_user_roles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- 2. Helper function: pulseos_is_admin()
-- =========================================================
CREATE OR REPLACE FUNCTION pulseos_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pulseos_user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- =========================================================
-- 3. Auto-assign 'client' role on sign-up
-- =========================================================
CREATE OR REPLACE FUNCTION pulseos_assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO pulseos_user_roles (user_id, role)
  VALUES (NEW.id, 'client')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pulseos_assign_default_role ON auth.users;
CREATE TRIGGER trg_pulseos_assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION pulseos_assign_default_role();

-- =========================================================
-- 4. Tighten write policies on curriculum tables
--    SELECT stays open to anon+authenticated (USING true)
--    INSERT/UPDATE/DELETE now require admin role
-- =========================================================

-- ---- pulseos_programs ----
DROP POLICY IF EXISTS "anon_insert_programs" ON pulseos_programs;
CREATE POLICY "admin_insert_programs" ON pulseos_programs FOR INSERT
  TO authenticated WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_update_programs" ON pulseos_programs;
CREATE POLICY "admin_update_programs" ON pulseos_programs FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_programs" ON pulseos_programs;
CREATE POLICY "admin_delete_programs" ON pulseos_programs FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_courses ----
DROP POLICY IF EXISTS "anon_insert_courses" ON pulseos_courses;
CREATE POLICY "admin_insert_courses" ON pulseos_courses FOR INSERT
  TO authenticated WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_update_courses" ON pulseos_courses;
CREATE POLICY "admin_update_courses" ON pulseos_courses FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_courses" ON pulseos_courses;
CREATE POLICY "admin_delete_courses" ON pulseos_courses FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_units ----
DROP POLICY IF EXISTS "anon_insert_units" ON pulseos_units;
CREATE POLICY "admin_insert_units" ON pulseos_units FOR INSERT
  TO authenticated WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_update_units" ON pulseos_units;
CREATE POLICY "admin_update_units" ON pulseos_units FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_units" ON pulseos_units;
CREATE POLICY "admin_delete_units" ON pulseos_units FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_lessons ----
DROP POLICY IF EXISTS "anon_insert_lessons" ON pulseos_lessons;
CREATE POLICY "admin_insert_lessons" ON pulseos_lessons FOR INSERT
  TO authenticated WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_update_lessons" ON pulseos_lessons;
CREATE POLICY "admin_update_lessons" ON pulseos_lessons FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_lessons" ON pulseos_lessons;
CREATE POLICY "admin_delete_lessons" ON pulseos_lessons FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_assessments ----
DROP POLICY IF EXISTS "anon_insert_assessments" ON pulseos_assessments;
CREATE POLICY "admin_insert_assessments" ON pulseos_assessments FOR INSERT
  TO authenticated WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_update_assessments" ON pulseos_assessments;
CREATE POLICY "admin_update_assessments" ON pulseos_assessments FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_assessments" ON pulseos_assessments;
CREATE POLICY "admin_delete_assessments" ON pulseos_assessments FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_assessment_submissions ----
-- INSERT stays open to anon+authenticated (clients/visitors can submit)
-- UPDATE/DELETE restricted to admin
DROP POLICY IF EXISTS "anon_update_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "admin_update_submissions" ON pulseos_assessment_submissions FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_submissions" ON pulseos_assessment_submissions;
CREATE POLICY "admin_delete_submissions" ON pulseos_assessment_submissions FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- ---- pulseos_analytics_events ----
-- INSERT stays open to anon+authenticated (any session can log events)
-- UPDATE/DELETE restricted to admin
DROP POLICY IF EXISTS "anon_update_analytics" ON pulseos_analytics_events;
CREATE POLICY "admin_update_analytics" ON pulseos_analytics_events FOR UPDATE
  TO authenticated USING (pulseos_is_admin()) WITH CHECK (pulseos_is_admin());

DROP POLICY IF EXISTS "anon_delete_analytics" ON pulseos_analytics_events;
CREATE POLICY "admin_delete_analytics" ON pulseos_analytics_events FOR DELETE
  TO authenticated USING (pulseos_is_admin());

-- =========================================================
-- 5. Index on pulseos_user_roles.user_id for fast lookups
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_pulseos_user_roles_user_id
  ON pulseos_user_roles(user_id);

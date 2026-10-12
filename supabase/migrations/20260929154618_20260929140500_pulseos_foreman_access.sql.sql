-- Dedicated foreman access: each foreman may view and approve only OJT hours
-- for enrollments assigned to their authenticated email address.

ALTER TABLE pulseos_user_roles DROP CONSTRAINT IF EXISTS pulseos_user_roles_role_check;
ALTER TABLE pulseos_user_roles
  ADD CONSTRAINT pulseos_user_roles_role_check CHECK (role IN ('admin', 'client', 'foreman'));

ALTER TABLE pulseos_ojt_enrollments
  ADD COLUMN IF NOT EXISTS supervisor_email text;

CREATE INDEX IF NOT EXISTS idx_pulseos_ojt_enrollments_supervisor_email
  ON pulseos_ojt_enrollments (lower(supervisor_email));

CREATE OR REPLACE FUNCTION pulseos_is_foreman()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM pulseos_user_roles
    WHERE user_id = auth.uid() AND role = 'foreman'
  );
$$;

DROP POLICY IF EXISTS foreman_read_assigned_enrollments ON pulseos_ojt_enrollments;
CREATE POLICY foreman_read_assigned_enrollments ON pulseos_ojt_enrollments FOR SELECT TO authenticated
  USING (
    pulseos_is_foreman()
    AND lower(supervisor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS foreman_read_assigned_hours ON pulseos_ojt_hour_entries;
CREATE POLICY foreman_read_assigned_hours ON pulseos_ojt_hour_entries FOR SELECT TO authenticated
  USING (
    pulseos_is_foreman()
    AND EXISTS (
      SELECT 1 FROM pulseos_ojt_enrollments enrollment
      WHERE enrollment.id = pulseos_ojt_hour_entries.enrollment_id
        AND lower(enrollment.supervisor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

CREATE OR REPLACE FUNCTION pulseos_approve_ojt_hour(hour_entry_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pulseos_ojt_hour_entries entry
    JOIN pulseos_ojt_enrollments enrollment ON enrollment.id = entry.enrollment_id
    JOIN pulseos_user_roles role ON role.user_id = auth.uid() AND role.role = 'foreman'
    WHERE entry.id = hour_entry_id
      AND entry.supervisor_approved_at IS NULL
      AND lower(enrollment.supervisor_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ) THEN
    RETURN false;
  END IF;

  UPDATE pulseos_ojt_hour_entries
  SET supervisor_approved_at = now()
  WHERE id = hour_entry_id;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION pulseos_approve_ojt_hour(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pulseos_approve_ojt_hour(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION pulseos_approve_ojt_hour(uuid) TO authenticated;
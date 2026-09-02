/*
# PulseOS — One-time first-admin claim

## Purpose
Provides a safe one-time setup path for an existing account that was
created before automatic first-user admin assignment was enabled.

## Changes
- Adds `pulseos_claim_first_admin()`, a SECURITY DEFINER function that
  promotes the currently signed-in user only when no admin exists.
- The function returns true when the claim succeeds and false when an
  admin already exists.
- The function can be called by authenticated users only.

## Security
- The caller is always derived from `auth.uid()`.
- No user-supplied user ID or role is accepted.
- The function is atomic because the admin existence check and role
  update happen in one database function call.
- Anonymous users cannot execute it.
*/

CREATE OR REPLACE FUNCTION pulseos_claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pulseos_user_roles WHERE role = 'admin'
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO pulseos_user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id)
  DO UPDATE SET role = 'admin';

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION pulseos_claim_first_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pulseos_claim_first_admin() FROM anon;
GRANT EXECUTE ON FUNCTION pulseos_claim_first_admin() TO authenticated;

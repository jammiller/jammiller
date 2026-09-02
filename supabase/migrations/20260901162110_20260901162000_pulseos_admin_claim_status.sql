/*
# PulseOS — Admin claim availability status

## Purpose
Adds a read-only status function so the frontend can show the
one-time admin setup prompt only while no admin exists.

## Security
- The function is SECURITY DEFINER with a fixed search path.
- It returns only whether an admin exists, not any user identity.
- It is callable by authenticated users and not by anonymous visitors.
*/

CREATE OR REPLACE FUNCTION pulseos_admin_claim_available()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM pulseos_user_roles WHERE role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION pulseos_admin_claim_available() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION pulseos_admin_claim_available() FROM anon;
GRANT EXECUTE ON FUNCTION pulseos_admin_claim_available() TO authenticated;

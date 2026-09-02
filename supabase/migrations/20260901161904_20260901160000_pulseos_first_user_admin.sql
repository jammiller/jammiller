/*
# PulseOS — First user auto-admin

## Purpose
Updates the `pulseos_assign_default_role` trigger so that the very
first user to sign up is automatically assigned the 'admin' role.
All subsequent users get 'client'. This removes the need for the
owner to manually open the Supabase dashboard Table Editor to
promote themselves to admin.

## Changes
- Replaces `pulseos_assign_default_role()` trigger function: it now
  checks whether any rows exist in `pulseos_user_roles`. If the table
  is empty, the new user gets 'admin'. Otherwise, 'client'.
- The trigger itself is not recreated (the existing trigger on
  auth.users already calls this function).

## Security notes
- This is safe because the trigger runs as SECURITY DEFINER (elevated
  privileges) on INSERT to auth.users, which only Supabase Auth can
  trigger. A user cannot directly call this function.
- The first-user-wins approach means whoever signs up first owns the
  workspace. This is appropriate for a single-tenant app.
*/

CREATE OR REPLACE FUNCTION pulseos_assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_count int;
BEGIN
  SELECT count(*) INTO existing_count FROM pulseos_user_roles;
  IF existing_count = 0 THEN
    INSERT INTO pulseos_user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO pulseos_user_roles (user_id, role)
    VALUES (NEW.id, 'client')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

/*
# Fix RLS always-true policies and SECURITY DEFINER exposure

## Summary
Resolves database security advisor warnings on three fronts:
1. Removes unrestricted authenticated write policies on blog_posts
   (no admin UI exists; posts are managed via migrations / dashboard).
2. Replaces always-true WITH CHECK clauses on the public contact and
   newsletter insert policies with meaningful data-quality predicates.
3. Converts update_updated_at_column() from SECURITY DEFINER to
   SECURITY INVOKER and revokes EXECUTE from PUBLIC so the trigger
   helper can no longer be invoked via the REST API by any role.

## Changes by table / object

### blog_posts
- DROP policy blog_posts_authenticated_insert  (was WITH CHECK (true) for authenticated)
- DROP policy blog_posts_authenticated_update  (was USING (true) WITH CHECK (true))
- DROP policy blog_posts_authenticated_delete  (was USING (true))
- KEEP blog_posts_public_read (anon + authenticated SELECT where is_published = true)
- Effect: blog posts are read-only via the API. Writes happen through
  the Supabase dashboard / migrations (service role bypasses RLS).
  If an admin UI is added later, scoped policies should be created then.

### contact_inquiries
- DROP + RECREATE contact_inquiries_public_insert
  with WITH CHECK (name <> '' AND email <> '' AND message <> '')
  instead of WITH CHECK (true). The predicate enforces non-empty
  required fields, preventing empty-string garbage submissions while
  still allowing any visitor to submit a legitimate inquiry.

### newsletter_subscribers
- DROP + RECREATE newsletter_public_insert
  with WITH CHECK (email <> '' AND email ~ '@')
  instead of WITH CHECK (true). The predicate enforces a non-empty
  email containing an '@' character, preventing garbage signups
  while still allowing anonymous subscription.

### update_updated_at_column()
- ALTER FUNCTION to SECURITY INVOKER (it only sets NEW.updated_at = now();
  no elevated privileges are needed — trigger functions run with the
  invoking user's privileges, and UPDATE already passed RLS).
- REVOKE EXECUTE FROM PUBLIC so the function is not callable via
  /rest/v1/rpc/update_updated_at_column by any client role.

## Security notes
- The "Anonymous Access Policies" advisor warnings (0012_auth_allow_anonymous_sign_ins)
  are expected and intentional for this no-auth, single-tenant site. The frontend
  uses the anon key for its entire lifetime; every read/write policy must list anon.
  These warnings are informational and do not indicate a vulnerability.
- blog_posts write policies were removed rather than tightened because there is no
  sign-in / admin UI in the app. The service role (used by migrations and the
  Supabase dashboard) bypasses RLS and remains the correct path for content management.
*/

-- -----------------------------------------------------------------------
-- 1. blog_posts — remove unrestricted authenticated write policies
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "blog_posts_authenticated_insert" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_authenticated_update" ON public.blog_posts;
DROP POLICY IF EXISTS "blog_posts_authenticated_delete" ON public.blog_posts;

-- -----------------------------------------------------------------------
-- 2. contact_inquiries — meaningful WITH CHECK on public insert
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "contact_inquiries_public_insert" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_public_insert"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (name <> '' AND email <> '' AND message <> '');

-- -----------------------------------------------------------------------
-- 3. newsletter_subscribers — meaningful WITH CHECK on public insert
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email <> '' AND email ~ '@');

-- -----------------------------------------------------------------------
-- 4. update_updated_at_column — SECURITY INVOKER + revoke EXECUTE
-- -----------------------------------------------------------------------
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

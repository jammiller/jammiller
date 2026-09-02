/*
# Security hardening: function execute revoke + policy clarification

## Changes

### 1. Revoke EXECUTE on trigger helper from public roles
`update_updated_at_column()` is an internal trigger function used by `BEFORE UPDATE`
triggers. It should never be callable via the REST API (`/rest/v1/rpc/`). We revoke
EXECUTE from both `anon` and `authenticated` so it is inaccessible from the client.

### 2. contact_inquiries INSERT policy
The existing `WITH CHECK (true)` is intentionally correct: this is a public contact form
with no authentication. Any visitor must be able to submit an inquiry. We drop and
recreate the policy scoped to `anon, authenticated` with an explicit comment documenting
the intentional design.

### 3. newsletter_subscribers INSERT policy
Same rationale as contact_inquiries — unauthenticated newsletter signup is the expected
flow. We drop and recreate the policy with the same explicit scope.

### Security notes
- The trigger function exposure is the higher-risk item; it allowed anyone to invoke
  `SECURITY DEFINER` code via RPC. Revoking EXECUTE closes that surface entirely.
- The always-true INSERT policies are intentional for a no-auth, single-tenant app.
  They do not grant SELECT, UPDATE, or DELETE — write-only public access is acceptable
  for submission forms.
*/

-- -----------------------------------------------------------------------
-- 1. Revoke EXECUTE on the trigger helper from client-facing roles
-- -----------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

-- -----------------------------------------------------------------------
-- 2. contact_inquiries — re-create INSERT policy with explicit intent
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "contact_inquiries_public_insert" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_public_insert"
  ON public.contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
-- Intentionally public: this table only accepts submissions from the public contact form.
-- No SELECT, UPDATE, or DELETE is granted; the only risk is spam, which is mitigated
-- at the application layer (validation + rate limiting on the client side).

-- -----------------------------------------------------------------------
-- 3. newsletter_subscribers — re-create INSERT policy with explicit intent
-- -----------------------------------------------------------------------
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_public_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
-- Intentionally public: anonymous newsletter sign-up is the expected flow.
-- No SELECT, UPDATE, or DELETE is granted to anonymous users.

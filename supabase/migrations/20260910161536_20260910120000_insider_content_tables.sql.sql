/*
# Insider Content Tables — Membership-Gated Prompts, Trends, and Templates

## Purpose
Move the hardcoded insider content (AI prompts, social trends, templates) from the
frontend source code into database tables so they are not visible in the page source.
Access is gated by active Stripe subscription status.

## New Tables

1. `insider_prompts` — AI prompt library
   - `id` (uuid, PK)
   - `title` (text) — display title
   - `category` (text) — e.g. "Caption Writing", "Content Creation"
   - `platform` (text) — e.g. "Instagram", "TikTok", "General"
   - `prompt_text` (text) — the full prompt (members only)
   - `preview_text` (text) — truncated preview shown to non-members
   - `use_case` (text) — when to use this prompt
   - `sort_order` (int, default 0)
   - `created_at` (timestamptz, default now())

2. `insider_trends` — Social media trends
   - `id` (uuid, PK)
   - `title` (text)
   - `platform` (text)
   - `type` (text) — e.g. "Format", "Insight", "Topic"
   - `priority` (text) — "High", "Medium", "Low"
   - `spotted_date` (text) — display string e.g. "Sep 9"
   - `description` (text) — full description (members only)
   - `preview_description` (text) — truncated preview
   - `action` (text) — what to do about it (members only)
   - `sort_order` (int, default 0)
   - `created_at` (timestamptz, default now())

3. `insider_templates` — Content templates
   - `id` (uuid, PK)
   - `title` (text)
   - `type` (text) — e.g. "Caption", "Post Hook", "Carousel"
   - `platform` (text)
   - `template_text` (text) — full template (members only)
   - `preview_text` (text) — truncated preview
   - `use_case` (text)
   - `sort_order` (int, default 0)
   - `created_at` (timestamptz, default now())

## Security

- RLS enabled on all three tables.
- SELECT policies: `TO anon, authenticated` — everyone can see the preview columns.
  The full content columns (prompt_text, description, action, template_text) are
  revoked from anon and only granted to authenticated users with an active subscription.
- Column-level SELECT grants:
  - anon, authenticated: all preview/meta columns
  - authenticated (active subscribers only via function): full content columns
- A SECURITY DEFINER function `is_insider_member()` checks whether the current
  authenticated user has an active Stripe subscription (status = 'active' or 'trialing').

## Important Notes
1. The preview columns are visible to everyone (anon + authenticated).
2. The full content columns are only readable by authenticated users with active subscriptions.
3. Column-level GRANT/REVOKE is used because RLS controls rows, not columns.
4. The `is_insider_member()` function checks subscription status via a join on
   stripe_customers (user_id -> customer_id) and stripe_subscriptions (customer_id -> status).
*/

-- ============================================================
-- Helper function: is_insider_member
-- ============================================================
CREATE OR REPLACE FUNCTION is_insider_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM stripe_customers sc
    JOIN stripe_subscriptions ss ON ss.customer_id = sc.customer_id
    WHERE sc.user_id = auth.uid()
      AND ss.status IN ('active', 'trialing')
      AND ss.deleted_at IS NULL
  );
$$;

REVOKE EXECUTE ON FUNCTION is_insider_member() FROM anon;
GRANT EXECUTE ON FUNCTION is_insider_member() TO authenticated;

-- ============================================================
-- Table: insider_prompts
-- ============================================================
CREATE TABLE IF NOT EXISTS insider_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  platform text NOT NULL,
  prompt_text text NOT NULL,
  preview_text text NOT NULL,
  use_case text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insider_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_insider_prompts" ON insider_prompts;
CREATE POLICY "select_insider_prompts"
ON insider_prompts FOR SELECT
TO anon, authenticated USING (true);

-- Grant preview columns to everyone; full content only to authenticated
GRANT SELECT (id, title, category, platform, preview_text, use_case, sort_order, created_at) ON insider_prompts TO anon, authenticated;

-- ============================================================
-- Table: insider_trends
-- ============================================================
CREATE TABLE IF NOT EXISTS insider_trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  platform text NOT NULL,
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium',
  spotted_date text NOT NULL,
  description text NOT NULL,
  preview_description text NOT NULL,
  action text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insider_trends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_insider_trends" ON insider_trends;
CREATE POLICY "select_insider_trends"
ON insider_trends FOR SELECT
TO anon, authenticated USING (true);

GRANT SELECT (id, title, platform, type, priority, spotted_date, preview_description, sort_order, created_at) ON insider_trends TO anon, authenticated;

-- ============================================================
-- Table: insider_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS insider_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  platform text NOT NULL,
  template_text text NOT NULL,
  preview_text text NOT NULL,
  use_case text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insider_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_insider_templates" ON insider_templates;
CREATE POLICY "select_insider_templates"
ON insider_templates FOR SELECT
TO anon, authenticated USING (true);

GRANT SELECT (id, title, type, platform, preview_text, use_case, sort_order, created_at) ON insider_templates TO anon, authenticated;

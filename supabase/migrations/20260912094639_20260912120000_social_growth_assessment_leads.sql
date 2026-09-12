/*
# Social Growth Assessment Leads Table

1. Purpose
- Stores lead submissions from the free Social Growth Assessment tool.
- Each row captures the visitor's contact info, their assessment score,
  the prospect tier (based on score range), and the answers they selected.

2. New Tables
- `social_growth_assessment_leads`
  - `id` (uuid, primary key)
  - `full_name` (text, not null)
  - `business_name` (text, not null)
  - `email` (text, not null)
  - `phone` (text, nullable)
  - `website` (text, nullable)
  - `industry` (text, nullable)
  - `score` (integer, not null, 0-100)
  - `prospect_tier` (text, not null — 'High Priority Prospect', 'Growth Opportunity Prospect', 'Optimization Prospect', 'Advanced Prospect')
  - `answers` (jsonb, nullable — stores the 10 selected answers)
  - `created_at` (timestamptz, default now())

3. Security
- Enable RLS.
- Allow anon + authenticated INSERT (public form, no login required).
- No SELECT/UPDATE/DELETE from the anon key — leads are managed server-side.
*/

CREATE TABLE IF NOT EXISTS social_growth_assessment_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  business_name text NOT NULL,
  email text NOT NULL,
  phone text,
  website text,
  industry text,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  prospect_tier text NOT NULL,
  answers jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE social_growth_assessment_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_assessment_leads" ON social_growth_assessment_leads;
CREATE POLICY "anon_insert_assessment_leads"
ON social_growth_assessment_leads FOR INSERT
TO anon, authenticated WITH CHECK (true);

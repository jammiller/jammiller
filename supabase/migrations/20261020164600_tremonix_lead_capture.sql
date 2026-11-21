CREATE TABLE IF NOT EXISTS public.tremonix_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  email text NOT NULL CHECK (length(btrim(email)) > 0),
  company text NOT NULL CHECK (length(btrim(company)) > 0),
  phone text NOT NULL CHECK (length(btrim(phone)) > 0),
  service_interest text NOT NULL DEFAULT 'Revenue Recovery Audit',
  message text NOT NULL,
  source text NOT NULL DEFAULT 'tremonix_website',
  campaign text,
  marketing_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  crm_sync_status text NOT NULL DEFAULT 'pending' CHECK (crm_sync_status IN ('pending', 'sent', 'failed', 'not_configured')),
  welcome_email_status text NOT NULL DEFAULT 'pending' CHECK (welcome_email_status IN ('pending', 'sent', 'failed', 'not_configured')),
  notification_status text NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'failed', 'not_configured')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tremonix_leads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.tremonix_leads FROM anon, authenticated;
GRANT ALL ON TABLE public.tremonix_leads TO service_role;

CREATE INDEX IF NOT EXISTS idx_tremonix_leads_created
  ON public.tremonix_leads (created_at DESC);

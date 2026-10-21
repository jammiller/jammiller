create table if not exists public.tremonix_audit_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  phone text not null,
  source text not null default 'tremonix_audit_inquiry',
  campaign text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page text,
  referrer text,
  quiz_answers jsonb not null default '{}'::jsonb,
  quiz_score integer not null default 0 check (quiz_score between 0 and 300),
  leak_severity text check (leak_severity in ('critical', 'moderate', 'manageable')),
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  engagement_score integer not null default 30 check (engagement_score between 0 and 100),
  tags text[] not null default array['tremonix', 'audit-inquiry'],
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed')),
  crm_sync_status text not null default 'pending'
    check (crm_sync_status in ('pending', 'sent', 'failed', 'not_configured')),
  welcome_email_status text not null default 'pending'
    check (welcome_email_status in ('pending', 'sent', 'failed', 'not_configured')),
  notification_email_status text not null default 'pending'
    check (notification_email_status in ('pending', 'sent', 'failed', 'not_configured')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tremonix_audit_leads_created_at_idx
  on public.tremonix_audit_leads (created_at desc);
create index if not exists tremonix_audit_leads_email_idx
  on public.tremonix_audit_leads (lower(email));
create index if not exists tremonix_audit_leads_crm_sync_status_idx
  on public.tremonix_audit_leads (crm_sync_status)
  where crm_sync_status in ('pending', 'failed');

alter table public.tremonix_audit_leads enable row level security;
revoke all on public.tremonix_audit_leads from anon, authenticated;
grant all on public.tremonix_audit_leads to service_role;

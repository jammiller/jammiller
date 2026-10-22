-- DataPulse Command Center schema. Run in the SQL editor of a dedicated Supabase project.
create extension if not exists "pgcrypto";

do $$ begin
  create type asset_name as enum ('DataPulse Social','PulseOS','Tremonix','VoltEcho');
exception when duplicate_object then null; end $$;

create table if not exists cc_leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  asset asset_name,
  contact text,
  email text,
  phone text,
  website text,
  source text,
  industry text,
  opportunity_value numeric(12,2) not null default 0,
  status text not null default 'New'
    check (status in ('New','Contacted','Qualified','Proposal','Won','Lost')),
  notes text,
  employee_count integer check (employee_count >= 0),
  annual_revenue numeric(14,2) check (annual_revenue >= 0),
  industry_match boolean not null default false,
  email_opens integer not null default 0 check (email_opens >= 0),
  pages_visited integer not null default 0 check (pages_visited >= 0),
  time_on_site_seconds integer not null default 0 check (time_on_site_seconds >= 0),
  form_completeness integer not null default 0 check (form_completeness between 0 and 100),
  engagement_score integer not null default 0 check (engagement_score between 0 and 100),
  budget_indicator boolean not null default false,
  purchase_intent boolean not null default false,
  qualification_score integer not null default 0 check (qualification_score between 0 and 100),
  intent_tier text not null default 'Unqualified'
    check (intent_tier in ('High', 'Medium', 'Low', 'Unqualified')),
  routing_queue text not null default 'Suppression - Remove from Sequence',
  qualified_at timestamptz,
  next_follow_up_at date,
  audit_status text not null default 'Not Started'
    check (audit_status in ('Not Started','Requested','Booked','Completed','Paid','Declined')),
  audit_booked_at date,
  audit_paid_at date,
  created_at timestamptz not null default now()
);

alter table cc_leads
  add column if not exists asset asset_name,
  add column if not exists website text,
  add column if not exists industry text,
  add column if not exists employee_count integer check (employee_count >= 0),
  add column if not exists annual_revenue numeric(14,2) check (annual_revenue >= 0),
  add column if not exists industry_match boolean not null default false,
  add column if not exists email_opens integer not null default 0 check (email_opens >= 0),
  add column if not exists pages_visited integer not null default 0 check (pages_visited >= 0),
  add column if not exists time_on_site_seconds integer not null default 0 check (time_on_site_seconds >= 0),
  add column if not exists form_completeness integer not null default 0 check (form_completeness between 0 and 100),
  add column if not exists engagement_score integer not null default 0 check (engagement_score between 0 and 100),
  add column if not exists budget_indicator boolean not null default false,
  add column if not exists purchase_intent boolean not null default false,
  add column if not exists qualification_score integer not null default 0 check (qualification_score between 0 and 100),
  add column if not exists intent_tier text not null default 'Unqualified'
    check (intent_tier in ('High', 'Medium', 'Low', 'Unqualified')),
  add column if not exists routing_queue text not null default 'Suppression - Remove from Sequence',
  add column if not exists qualified_at timestamptz,
  add column if not exists next_follow_up_at date,
  add column if not exists audit_status text not null default 'Not Started'
    check (audit_status in ('Not Started','Requested','Booked','Completed','Paid','Declined')),
  add column if not exists audit_booked_at date,
  add column if not exists audit_paid_at date;

create or replace function cc_score_lead()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  company_score integer;
begin
  new.engagement_score := round(
    least(new.email_opens, 10) * 3
    + least(new.pages_visited, 5) * 5
    + least(new.time_on_site_seconds, 300) / 300.0 * 25
    + new.form_completeness * 0.2
  )::integer;

  company_score := greatest(
    case
      when coalesce(new.employee_count, 0) >= 500 then 20
      when coalesce(new.employee_count, 0) >= 100 then 16
      when coalesce(new.employee_count, 0) >= 20 then 12
      when coalesce(new.employee_count, 0) > 0 then 5
      else 0
    end,
    case
      when coalesce(new.annual_revenue, 0) >= 10000000 then 20
      when coalesce(new.annual_revenue, 0) >= 1000000 then 16
      when coalesce(new.annual_revenue, 0) >= 100000 then 12
      when coalesce(new.annual_revenue, 0) > 0 then 5
      else 0
    end
  );

  new.qualification_score := least(100,
    company_score
    + case when new.industry_match then 20 else 0 end
    + round(new.engagement_score * 0.25)::integer
    + case when new.budget_indicator then 15 else 0 end
    + case when new.purchase_intent then 20 else 0 end
  );

  new.intent_tier := case
    when new.qualification_score >= 75 then 'High'
    when new.qualification_score >= 50 then 'Medium'
    when new.qualification_score >= 25 then 'Low'
    else 'Unqualified'
  end;

  new.routing_queue := case new.intent_tier
    when 'High' then 'Sales - Immediate Outreach'
    when 'Medium' then 'Lifecycle - Extended Email Sequence'
    when 'Low' then 'Marketing - Content Nurture'
    else 'Suppression - Remove from Sequence'
  end;

  if new.intent_tier = 'High' then
    if tg_op = 'UPDATE' then
      if old.intent_tier = 'High' then
        new.qualified_at := old.qualified_at;
      else
        new.qualified_at := now();
      end if;
    else
      new.qualified_at := now();
    end if;
  else
    new.qualified_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists cc_leads_score_before_write on cc_leads;
create trigger cc_leads_score_before_write
before insert or update on cc_leads
for each row execute function cc_score_lead();

update cc_leads set qualification_score = qualification_score;

create table if not exists cc_revenue (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  amount numeric(12,2) not null,
  asset asset_name not null,
  revenue_type text not null default 'One-time'
    check (revenue_type in ('Recurring','One-time','Affiliate','Other')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists cc_clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  service text,
  monthly_value numeric(12,2) not null default 0,
  start_date date default current_date,
  status text not null default 'Active'
    check (status in ('Active','Paused','Churned')),
  created_at timestamptz not null default now()
);

create table if not exists cc_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  ssl_status text not null default 'Valid'
    check (ssl_status in ('Valid','Expiring','Expired','None')),
  renewal_date date,
  health_status text not null default 'Healthy'
    check (health_status in ('Healthy','Warning','Critical')),
  created_at timestamptz not null default now()
);

create table if not exists cc_agents (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  status text not null default 'Idle'
    check (status in ('Running','Idle','Error','Disabled')),
  last_run timestamptz,
  health_score int not null default 100 check (health_score between 0 and 100),
  created_at timestamptz not null default now()
);

-- Row Level Security: authenticated users only
do $$
declare t text;
begin
  foreach t in array array['cc_leads','cc_revenue','cc_clients','cc_domains','cc_agents'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth full access" on %I', t);
    execute format(
      'create policy "auth full access" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- DEV ONLY (uncomment to use without auth; remove before production):
-- do $$ declare t text; begin
--   foreach t in array array['cc_leads','cc_revenue','cc_clients','cc_domains','cc_agents'] loop
--     execute format('create policy "dev anon" on %I for all to anon using (true) with check (true)', t);
--   end loop; end $$;

-- DataPulse Command Center schema. Run in the SQL editor of a dedicated Supabase project.
create extension if not exists "pgcrypto";

do $$ begin
  create type asset_name as enum ('DataPulse Social','PulseOS','Tremonix','VoltEcho');
exception when duplicate_object then null; end $$;

create table if not exists cc_leads (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact text,
  email text,
  phone text,
  source text,
  opportunity_value numeric(12,2) not null default 0,
  status text not null default 'New'
    check (status in ('New','Contacted','Qualified','Proposal','Won','Lost')),
  notes text,
  created_at timestamptz not null default now()
);

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

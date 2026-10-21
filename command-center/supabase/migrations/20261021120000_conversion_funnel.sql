create table if not exists cc_conversion_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references cc_leads(id) on delete cascade,
  event_name text not null check (event_name in (
    'page_view',
    'form_submission',
    'lead_created',
    'lead_stage_changed',
    'lead_qualified',
    'customer_acquired',
    'email_open',
    'audit_completed',
    'booking_completed',
    'payment_completed'
  )),
  source text not null default 'crm',
  external_event_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  unique (source, external_event_id)
);

create index if not exists cc_conversion_events_created_at_idx
  on cc_conversion_events (created_at desc);
create index if not exists cc_conversion_events_name_created_at_idx
  on cc_conversion_events (event_name, created_at desc);
create index if not exists cc_conversion_events_lead_id_idx
  on cc_conversion_events (lead_id);

alter table cc_conversion_events enable row level security;
drop policy if exists "auth read conversion events" on cc_conversion_events;
create policy "auth read conversion events" on cc_conversion_events
  for select to authenticated using (true);
grant select on cc_conversion_events to authenticated;

create or replace function cc_log_lead_conversion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into cc_conversion_events (lead_id, event_name, metadata)
    values (new.id, 'lead_created', jsonb_build_object('status', new.status));

    if new.status = 'Qualified' then
      insert into cc_conversion_events (lead_id, event_name, metadata)
      values (new.id, 'lead_qualified', jsonb_build_object('status', new.status));
    elsif new.status = 'Won' then
      insert into cc_conversion_events (lead_id, event_name, metadata)
      values (new.id, 'customer_acquired', jsonb_build_object('status', new.status));
    end if;
  elsif old.status is distinct from new.status then
    insert into cc_conversion_events (lead_id, event_name, metadata)
    values (
      new.id,
      'lead_stage_changed',
      jsonb_build_object('from', old.status, 'to', new.status)
    );

    if new.status = 'Qualified' then
      insert into cc_conversion_events (lead_id, event_name, metadata)
      values (new.id, 'lead_qualified', jsonb_build_object('status', new.status));
    elsif new.status = 'Won' then
      insert into cc_conversion_events (lead_id, event_name, metadata)
      values (new.id, 'customer_acquired', jsonb_build_object('status', new.status));
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function cc_log_lead_conversion() from public, anon, authenticated;

drop trigger if exists cc_leads_conversion_after_write on cc_leads;
create trigger cc_leads_conversion_after_write
after insert or update of status on cc_leads
for each row execute function cc_log_lead_conversion();

create or replace function cc_apply_conversion_event_to_crm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_name = 'email_open' and new.lead_id is not null then
    update cc_leads
    set email_opens = email_opens + 1
    where id = new.lead_id;
  elsif new.event_name = 'payment_completed' and new.lead_id is not null then
    update cc_leads
    set status = 'Won'
    where id = new.lead_id and status <> 'Won';
  end if;
  return new;
end;
$$;

revoke execute on function cc_apply_conversion_event_to_crm() from public, anon, authenticated;

drop trigger if exists cc_conversion_events_apply_to_crm on cc_conversion_events;
create trigger cc_conversion_events_apply_to_crm
after insert on cc_conversion_events
for each row execute function cc_apply_conversion_event_to_crm();

create or replace view cc_conversion_daily with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  event_name,
  count(*)::bigint as event_count,
  count(distinct lead_id)::bigint as lead_count
from cc_conversion_events
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at)::date, event_name;

create or replace view cc_conversion_summary with (security_invoker = true) as
select
  event_name,
  count(*)::bigint as event_count,
  count(distinct lead_id)::bigint as lead_count
from cc_conversion_events
where created_at >= current_date - interval '30 days'
group by event_name;

create or replace view cc_conversion_drop_alerts with (security_invoker = true) as
with event_totals as (
  select
    event_name,
    count(*) filter (where created_at >= now() - interval '7 days') as current_count,
    count(*) filter (
      where created_at >= now() - interval '14 days'
        and created_at < now() - interval '7 days'
    ) as previous_count
  from cc_conversion_events
  where created_at >= now() - interval '14 days'
    and event_name in ('page_view', 'lead_created', 'lead_qualified', 'customer_acquired')
  group by event_name
)
select
  event_name,
  current_count,
  previous_count,
  round(100.0 * (previous_count - current_count) / nullif(previous_count, 0), 1) as drop_percent
from event_totals
where previous_count > 0
  and current_count < previous_count * 0.75;

grant select on cc_conversion_daily, cc_conversion_summary, cc_conversion_drop_alerts to authenticated;

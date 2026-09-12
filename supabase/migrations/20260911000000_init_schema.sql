-- MyTechz CRM — initial schema
-- Mirrors the domain model in lib/types.ts. Generated for Phase 2 backend wiring.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------------
-- Lookup tables (editable from Settings: Lead Status / Industries /
-- Lead Sources / Call Status)
-- ------------------------------------------------------------------
create table industries (
  name text primary key,
  sort_order int not null default 0
);

create table lead_statuses (
  name text primary key,
  sort_order int not null default 0
);

create table lead_sources (
  name text primary key,
  sort_order int not null default 0
);

create table call_statuses (
  name text primary key,
  sort_order int not null default 0
);

-- ------------------------------------------------------------------
-- employees
-- ------------------------------------------------------------------
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('Admin','Manager','Sales','Marketing','Viewer')),
  avatar_color text,
  joined_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger employees_set_updated_at
  before update on employees
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- companies
-- ------------------------------------------------------------------
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null references industries(name),
  website text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  country text,
  status text not null default 'Prospect' check (status in ('Active','Inactive','Prospect')),
  last_contact date,
  created_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_industry_idx on companies(industry);
create index companies_status_idx on companies(status);

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- contacts
-- ------------------------------------------------------------------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  designation text,
  phone text,
  email text,
  industry text references industries(name),
  city text,
  lead_status text references lead_statuses(name),
  is_primary boolean not null default false,
  created_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_company_id_idx on contacts(company_id);

create trigger contacts_set_updated_at
  before update on contacts
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- leads
-- ------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  designation text,
  industry text references industries(name),
  phone text,
  email text,
  website text,
  city text,
  state text,
  status text not null default 'New' references lead_statuses(name),
  interest text check (interest in ('High','Medium','Low','Not Interested')),
  source text references lead_sources(name),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  assigned_to_id uuid references employees(id),
  value numeric(12,2) not null default 0,
  created_date date not null default current_date,
  last_contact date,
  next_follow_up date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_company_id_idx on leads(company_id);
create index leads_contact_id_idx on leads(contact_id);
create index leads_assigned_to_id_idx on leads(assigned_to_id);
create index leads_status_idx on leads(status);

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- calls
-- ------------------------------------------------------------------
create table calls (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  employee_id uuid references employees(id),
  occurred_at timestamptz not null default now(),
  status text not null references call_statuses(name),
  interest text check (interest in ('High','Medium','Low','Not Interested')),
  duration_seconds int not null default 0,
  remarks text,
  created_at timestamptz not null default now()
);

create index calls_lead_id_idx on calls(lead_id);
create index calls_employee_id_idx on calls(employee_id);
create index calls_occurred_at_idx on calls(occurred_at);

-- ------------------------------------------------------------------
-- follow_ups
-- ------------------------------------------------------------------
create table follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  employee_id uuid references employees(id),
  date date not null,
  time time,
  reason text,
  status text not null default 'Pending' check (status in ('Pending','Completed','Missed','Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index follow_ups_lead_id_idx on follow_ups(lead_id);
create index follow_ups_employee_id_idx on follow_ups(employee_id);
create index follow_ups_date_idx on follow_ups(date);

create trigger follow_ups_set_updated_at
  before update on follow_ups
  for each row execute function set_updated_at();

-- ------------------------------------------------------------------
-- notifications (per employee/user)
-- ------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('lead','call','followup','system')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_employee_id_idx on notifications(employee_id);
create index notifications_unread_idx on notifications(employee_id, read);

-- ------------------------------------------------------------------
-- Derived reporting views (README §7: "move derived datasets into SQL
-- views"). Replaces the aggregation logic in mock/index.ts.
-- ------------------------------------------------------------------
create view company_stats as
select
  c.id as company_id,
  (select count(*) from contacts ct where ct.company_id = c.id) as contact_count,
  (select count(*) from leads l where l.company_id = c.id) as lead_count
from companies c;

create view employee_performance as
select
  e.id as employee_id,
  e.name,
  count(l.id) as leads_assigned,
  count(distinct call.id) as calls,
  count(l.id) filter (where l.interest = 'High') as interested,
  count(l.id) filter (where l.status = 'Qualified') as qualified,
  count(l.id) filter (where l.status = 'Won') as won
from employees e
left join leads l on l.assigned_to_id = e.id
left join calls call on call.employee_id = e.id
group by e.id, e.name;

create view leads_by_industry as
select industry, count(*) as lead_count
from leads
group by industry;

create view conversion_funnel as
select status, count(*) as lead_count
from leads
group by status;

create view calls_per_day as
select date_trunc('day', occurred_at)::date as day, count(*) as call_count
from calls
group by 1
order by 1;

-- ------------------------------------------------------------------
-- Row Level Security — locked down by default. No auth is wired up
-- yet (see README §7 "Auth"); once Supabase Auth is added, replace
-- these permissive policies with role-aware ones. service_role
-- (used by server code) always bypasses RLS.
-- ------------------------------------------------------------------
alter table industries enable row level security;
alter table lead_statuses enable row level security;
alter table lead_sources enable row level security;
alter table call_statuses enable row level security;
alter table employees enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table calls enable row level security;
alter table follow_ups enable row level security;
alter table notifications enable row level security;

create policy "authenticated read/write" on industries for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on lead_statuses for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on lead_sources for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on call_statuses for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on employees for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on companies for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on contacts for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on leads for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on calls for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on follow_ups for all to authenticated, anon using (true) with check (true);
create policy "authenticated read/write" on notifications for all to authenticated, anon using (true) with check (true);

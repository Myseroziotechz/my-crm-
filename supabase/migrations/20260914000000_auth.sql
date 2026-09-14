-- MyTechz CRM — wire up Supabase Auth
--
-- 1. Link each `employees` row to a Supabase Auth user, so a logged-in
--    session can be resolved back to the CRM's own notion of who's
--    signed in (name, role, avatar).
-- 2. Auto-link new auth users to an existing employee by matching email
--    on sign-up (an admin still has to have added the employee row
--    first — this doesn't create employees out of thin air).
-- 3. Replace the placeholder "anon can do anything" policies from the
--    initial schema with authenticated-only access, now that there's
--    an actual login in front of the app.

alter table employees
  add column user_id uuid unique references auth.users (id) on delete set null;

create index employees_user_id_idx on employees (user_id);

-- ------------------------------------------------------------------
-- Auto-link on sign-up: when a new auth user is created, attach them
-- to the employee row with the same email (case-insensitive), if one
-- exists and isn't already linked to a different account.
-- ------------------------------------------------------------------
create or replace function link_employee_to_new_user()
returns trigger as $$
begin
  update employees
  set user_id = new.id
  where lower(email) = lower(new.email)
    and user_id is null;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function link_employee_to_new_user();

-- ------------------------------------------------------------------
-- RLS — drop the permissive anon policies, keep it to signed-in users.
-- Fine-grained per-role permissions (Admin/Manager/Sales/Marketing/
-- Viewer) are still a follow-up; this is the "must be logged in" gate.
-- ------------------------------------------------------------------
drop policy "authenticated read/write" on industries;
drop policy "authenticated read/write" on lead_statuses;
drop policy "authenticated read/write" on lead_sources;
drop policy "authenticated read/write" on call_statuses;
drop policy "authenticated read/write" on employees;
drop policy "authenticated read/write" on companies;
drop policy "authenticated read/write" on contacts;
drop policy "authenticated read/write" on leads;
drop policy "authenticated read/write" on calls;
drop policy "authenticated read/write" on follow_ups;
drop policy "authenticated read/write" on notifications;

create policy "authenticated read/write" on industries for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on lead_statuses for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on lead_sources for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on call_statuses for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on employees for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on companies for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on contacts for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on leads for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on calls for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on follow_ups for all to authenticated using (true) with check (true);
create policy "authenticated read/write" on notifications for all to authenticated using (true) with check (true);

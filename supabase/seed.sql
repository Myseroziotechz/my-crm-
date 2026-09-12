-- Lookup table seed data — kept in sync with lib/constants.ts.
-- Runs automatically on `supabase db reset`; run manually against a
-- linked project with: supabase db execute -f supabase/seed.sql

insert into industries (name, sort_order) values
  ('Real Estate', 0),
  ('Healthcare', 1),
  ('Education', 2),
  ('IT / Software', 3),
  ('Hospitality', 4),
  ('Manufacturing', 5),
  ('Retail', 6),
  ('Finance', 7),
  ('Automotive', 8),
  ('Other', 9)
on conflict (name) do nothing;

insert into lead_statuses (name, sort_order) values
  ('New', 0),
  ('Contacted', 1),
  ('Interested', 2),
  ('Follow-up', 3),
  ('Qualified', 4),
  ('Proposal', 5),
  ('Negotiation', 6),
  ('Won', 7),
  ('Lost', 8),
  ('Not Interested', 9)
on conflict (name) do nothing;

insert into lead_sources (name, sort_order) values
  ('Website', 0),
  ('Referral', 1),
  ('Cold Call', 2),
  ('Email Campaign', 3),
  ('Trade Show', 4),
  ('Social Media', 5),
  ('Partner', 6),
  ('Advertisement', 7)
on conflict (name) do nothing;

insert into call_statuses (name, sort_order) values
  ('Answered', 0),
  ('No Answer', 1),
  ('Busy', 2),
  ('Call Back', 3),
  ('Wrong Number', 4)
on conflict (name) do nothing;

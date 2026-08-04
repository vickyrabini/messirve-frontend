alter table public.services
  add column if not exists approved boolean not null default false;

comment on column public.services.approved is
  'True once an admin approves a service submitted via /register-client. Gates whether its owner (role=user) sees the payment option — separate from is_active, which gates public visibility and only flips to true after payment.';

-- Services already live before this column existed were implicitly approved (published under the old flow) —
-- backfill so they don't show up as pending in the new admin approval queue.
update public.services set approved = true where is_active = true;

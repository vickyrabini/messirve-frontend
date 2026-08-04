-- ===== 20260714000000_add_subscriptions.sql =====
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null check (status in ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

drop table if exists public.client_requests;

-- ===== 20260716000000_add_subscription_price_info.sql =====
alter table public.subscriptions
  add column if not exists amount integer,
  add column if not exists currency text;

comment on column public.subscriptions.amount is
  'Price snapshot in the currency''s smallest unit (e.g. cents), mirrors Stripe Price.unit_amount.';
comment on column public.subscriptions.currency is
  'Lowercase 3-letter ISO currency code, mirrors Stripe Price.currency.';

-- ===== 20260717000000_add_service_payment_suspension.sql =====
alter table public.services
  add column if not exists suspended_for_nonpayment boolean not null default false;

comment on column public.services.suspended_for_nonpayment is
  'True when is_active was set to false by the Stripe webhook due to a failed renewal charge (subscription past_due/unpaid). Used to know whether to auto re-enable on payment recovery, as opposed to services disabled for other reasons (pending admin review, manual deactivation).';

-- ===== 20260718000000_fix_services_insert_policy.sql =====
drop policy if exists "Clients insert own pending services" on public.services;

create policy "Clients insert own services"
  on public.services for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'client'
    )
  );

-- ===== 20260718000100_add_services_update_policy.sql =====
create policy "Clients update own services"
  on public.services for update
  to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'client'
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'client'
    )
  );

-- =============================================
-- Stripe subscriptions
-- =============================================

-- One row per user, created/updated exclusively by the Stripe webhook handler
-- via the service-role client. No insert/update RLS policies — same
-- "no admin policies, service-role only" precedent as client_requests had.
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

-- =============================================
-- Remove the manual client-request flow (replaced by Stripe Checkout)
-- =============================================
drop table if exists public.client_requests;

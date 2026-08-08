alter table public.profiles
  add column if not exists account_type text not null default 'paid'
  check (account_type in ('free', 'paid'));

comment on column public.profiles.account_type is
  'free = cuenta creada por invitación gratuita del admin, su servicio queda visible sin pasar por Stripe. paid = flujo normal (default para todo lo existente).';

-- Un token único por invitación, atado a un email específico, con vencimiento.
-- Sin policies de RLS: mismo precedente que `subscriptions`/`client_requests` — solo se
-- toca vía service-role (createAdminClient()), tanto desde el admin como desde la página
-- pública de registro (que valida el token antes de que exista sesión).
create table if not exists public.client_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired', 'revoked')),
  created_by uuid not null references auth.users(id),
  used_by uuid references auth.users(id),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.client_invites enable row level security;

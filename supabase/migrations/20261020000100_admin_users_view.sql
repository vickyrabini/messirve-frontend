-- =============================================
-- Vista para /admin/users: une auth.users + profiles (rol, tipo de cuenta) + estado de
-- pago (subscriptions) para que el buscador por email, el filtro por rol, la paginación
-- y la exportación se resuelvan en la base en vez de traer todo a Next.
-- subscriptions tiene user_id unique, así que el left join no duplica filas.
-- =============================================
create or replace view public.admin_users_view as
select
  u.id,
  u.email,
  coalesce(p.role, 'user') as role,
  coalesce(p.account_type, 'paid') as account_type,
  u.created_at,
  -- Mismo mapeo que paymentBadge en app/(protected)/admin/services/payment-status.ts.
  case
    when sub.status is null then 'none'
    when sub.status in ('active', 'trialing') then 'paid'
    when sub.status in ('past_due', 'unpaid') then 'overdue'
    when sub.status = 'canceled' then 'canceled'
    else 'pending' -- incomplete, incomplete_expired, paused
  end as payment_key
from auth.users u
left join public.profiles p on p.id = u.id
left join public.subscriptions sub on sub.user_id = u.id;

-- CRÍTICO: la vista corre con los permisos de su dueño (ignora RLS) y expone emails de
-- auth.users. Todo lo nuevo en `public` queda accesible por la REST API para anon y
-- authenticated, así que se revoca explícitamente: solo el service role (cliente admin
-- de Next) puede leerla.
revoke all on public.admin_users_view from public, anon, authenticated;
grant select on public.admin_users_view to service_role;

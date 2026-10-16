-- =============================================
-- Vista para /admin/services: une services + email del creador (auth.users) + estado
-- de pago (subscriptions) para que el buscador por email, el filtro de pago y la
-- paginación se resuelvan en la base en vez de traer todo a Next.
-- subscriptions tiene user_id unique, así que el left join no duplica filas.
-- =============================================
create or replace view public.admin_services_view as
select
  s.id,
  s.name,
  s.is_active,
  s.approved,
  s.user_id,
  s.created_at,
  c.name  as category_name,
  c.emoji as category_emoji,
  u.email,
  -- Mismo mapeo que paymentBadge en app/(protected)/admin/services/payment-status.ts.
  -- null = servicio creado desde el panel de admin (sin dueño, sin pago).
  case
    when s.user_id is null then null
    when sub.status is null then 'none'
    when sub.status in ('active', 'trialing') then 'paid'
    when sub.status in ('past_due', 'unpaid') then 'overdue'
    when sub.status = 'canceled' then 'canceled'
    else 'pending' -- incomplete, incomplete_expired, paused
  end as payment_key
from public.services s
left join public.categories c on c.id = s.category_id
left join auth.users u on u.id = s.user_id
left join public.subscriptions sub on sub.user_id = s.user_id;

-- CRÍTICO: la vista corre con los permisos de su dueño (ignora RLS) y expone emails de
-- auth.users. Todo lo nuevo en `public` queda accesible por la REST API para anon y
-- authenticated, así que se revoca explícitamente: solo el service role (cliente admin
-- de Next) puede leerla.
revoke all on public.admin_services_view from public, anon, authenticated;
grant select on public.admin_services_view to service_role;

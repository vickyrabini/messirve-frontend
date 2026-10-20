-- =============================================
-- Suma a admin_users_view los datos del servicio del usuario para la exportación.
-- Admins, usuarios comunes y clientes sin servicio quedan con las columnas service_* en null.
-- services.user_id NO es unique (el límite de 1 servicio por dueño lo impone
-- app/actions/services.ts), así que se usa un lateral con limit 1: nunca duplica usuarios.
-- `create or replace view` solo permite agregar columnas al final: las existentes van
-- en el mismo orden que en 20261020000100_admin_users_view.sql.
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
  end as payment_key,
  svc.name as service_name,
  svc.category_name as service_category,
  svc.description as service_description,
  svc.address as service_address,
  svc.city as service_city,
  svc.phone as service_phone,
  svc.website as service_website,
  svc.instagram as service_instagram,
  svc.price_info as service_price_info,
  svc.is_active as service_is_active,
  svc.approved as service_approved
from auth.users u
left join public.profiles p on p.id = u.id
left join public.subscriptions sub on sub.user_id = u.id
left join lateral (
  select s.name, c.name as category_name, s.description, s.address, s.city, s.phone,
         s.website, s.instagram, s.price_info, s.is_active, s.approved
  from public.services s
  left join public.categories c on c.id = s.category_id
  where s.user_id = u.id
  order by s.created_at desc
  limit 1
) svc on true;

-- CRÍTICO: expone emails de auth.users y datos de servicios ignorando RLS. Solo el
-- service role (cliente admin de Next) puede leerla.
revoke all on public.admin_users_view from public, anon, authenticated;
grant select on public.admin_users_view to service_role;

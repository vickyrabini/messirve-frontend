-- =============================================
-- admin_services_view + rubro, para mostrarlo en /admin/services y filtrar
-- "con rubro / sin rubro". Las columnas nuevas van AL FINAL: create or replace view
-- solo permite agregar columnas al final, nunca reordenar las existentes.
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
  end as payment_key,
  s.subcategory_id,
  sc.name as subcategory_name
from public.services s
left join public.categories c on c.id = s.category_id
left join public.subcategories sc on sc.id = s.subcategory_id
left join auth.users u on u.id = s.user_id
left join public.subscriptions sub on sub.user_id = s.user_id;

-- CRÍTICO (igual que 20261016000000): la vista expone emails de auth.users; solo el
-- service role puede leerla.
revoke all on public.admin_services_view from public, anon, authenticated;
grant select on public.admin_services_view to service_role;

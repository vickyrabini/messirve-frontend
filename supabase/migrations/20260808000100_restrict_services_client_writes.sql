-- =============================================
-- INSERT: se restaura la restricción que 20260718000000_fix_services_insert_policy.sql
-- sacó por error. createService (app/actions/services.ts) siempre inserta vía el
-- cliente admin (bypassea RLS) — esta policy es una segunda barrera para cualquiera
-- que llame a la REST API de Supabase directamente, no el camino real de la app.
-- Sin esta restricción, un usuario con role='client' podía insertar una segunda fila
-- de servicio ya activa y aprobada sin pasar nunca por Stripe.
-- =============================================
drop policy if exists "Clients insert own services" on public.services;

create policy "Clients insert own services"
  on public.services for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and is_active = false
    and approved = false
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'client'
    )
  );

-- =============================================
-- UPDATE: updateService() nunca escribe is_active/approved/suspended_for_nonpayment vía
-- este cliente — solo el webhook de Stripe y las acciones de admin lo hacen, ambos con
-- service-role. Restringir a nivel de columna cierra el hueco donde un cliente podía,
-- por ejemplo, reactivar directamente vía REST API un servicio que el webhook suspendió
-- por falta de pago, sin romper ninguna escritura legítima.
-- =============================================
revoke update on public.services from authenticated;

grant update (category_id, name, description, address, city, price_info, phone, website, instagram, photos, updated_at)
  on public.services to authenticated;

-- =============================================
-- The old "Clients insert own pending services" INSERT policy required
-- is_active = false, left over from when services were created pending
-- admin review. Since createService (app/actions/services.ts) now inserts
-- is_active: true directly (a service can only be created by a paying
-- 'client', so there's no review gate anymore), every insert was rejected
-- with "new row violates row-level security policy for table services".
-- =============================================
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

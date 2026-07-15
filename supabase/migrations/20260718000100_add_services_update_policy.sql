-- =============================================
-- services had no UPDATE policy at all, so RLS silently blocked every
-- edit from updateService (app/actions/services.ts) — no error, just
-- 0 rows affected. Mirrors the ownership + role check already used by
-- the INSERT policy ("Clients insert own services").
-- =============================================
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

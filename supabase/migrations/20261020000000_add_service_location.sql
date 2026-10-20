-- Ubicación opcional del servicio (pin elegido en el mapa por el dueño, solo desde la web).
alter table public.services
  add column latitude numeric(9,6),
  add column longitude numeric(9,6);

alter table public.services
  add constraint services_latitude_range check (latitude is null or latitude between -90 and 90),
  add constraint services_longitude_range check (longitude is null or longitude between -180 and 180),
  add constraint services_location_both_or_none check ((latitude is null) = (longitude is null));

-- Los dueños editan su servicio con la sesión del usuario; el whitelist de columnas de
-- 20260808000100_restrict_services_client_writes.sql exige habilitar las nuevas explícitamente.
grant update (latitude, longitude) on public.services to authenticated;

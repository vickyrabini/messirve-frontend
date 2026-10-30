-- Rubro del servicio. La FK compuesta (subcategory_id, category_id) garantiza en la base
-- que el rubro pertenece a la categoría del servicio; al borrar un rubro solo se limpia
-- subcategory_id (set null por columna, Postgres 15+), category_id queda intacto.
alter table public.subcategories add constraint subcategories_id_category_key unique (id, category_id);

alter table public.services add column subcategory_id uuid;

alter table public.services add constraint services_subcategory_fk
  foreign key (subcategory_id, category_id)
  references public.subcategories (id, category_id)
  on delete set null (subcategory_id);

create index services_subcategory_id_idx on public.services(subcategory_id);

-- El dueño edita con el cliente de sesión y el UPDATE está concedido por columna
-- (20260808000100_restrict_services_client_writes.sql).
grant update (subcategory_id) on public.services to authenticated;

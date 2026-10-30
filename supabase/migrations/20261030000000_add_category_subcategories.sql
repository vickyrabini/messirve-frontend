-- Rubros (subcategorías) de cada categoría, gestionados desde /admin/rubros.
-- Escritura solo vía service_role (server actions del admin), igual que categories.
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

create index subcategories_category_id_idx on public.subcategories(category_id);

alter table public.subcategories enable row level security;

create policy "Public read subcategories" on public.subcategories for select using (true);

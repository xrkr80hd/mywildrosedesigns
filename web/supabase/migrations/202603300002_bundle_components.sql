create extension if not exists pgcrypto;

create table if not exists public.bundle_components (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  bundle_product_id uuid not null references public.products(id) on update cascade on delete cascade,
  component_product_id uuid not null references public.products(id) on update cascade on delete restrict,
  component_variant_id uuid references public.product_variants(id) on update cascade on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  sort_order integer not null default 100
);

create index if not exists bundle_components_bundle_sort_idx
  on public.bundle_components (bundle_product_id, sort_order, created_at);

create index if not exists bundle_components_component_product_idx
  on public.bundle_components (component_product_id);

alter table public.bundle_components enable row level security;

drop policy if exists bundle_components_public_read on public.bundle_components;
create policy bundle_components_public_read
on public.bundle_components
for select
using (true);

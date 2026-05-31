create extension if not exists pgcrypto;

create table if not exists public.variant_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null,
  brand_name text not null,
  active boolean not null default true
);

create index if not exists variant_templates_active_name_idx
  on public.variant_templates (active, lower(name));

drop trigger if exists trg_variant_templates_updated_at on public.variant_templates;
create trigger trg_variant_templates_updated_at
before update on public.variant_templates
for each row
execute procedure public.set_updated_at();

create table if not exists public.variant_template_sizes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  template_id uuid not null references public.variant_templates(id) on update cascade on delete cascade,
  size_label text not null,
  size_sort_order integer not null default 100,
  price_cents integer not null check (price_cents > 0)
);

create index if not exists variant_template_sizes_template_sort_idx
  on public.variant_template_sizes (template_id, size_sort_order, size_label);

create unique index if not exists variant_template_sizes_template_label_unique
  on public.variant_template_sizes (template_id, lower(size_label));

alter table public.product_variants
  add column if not exists brand_name text,
  add column if not exists source_template_id uuid references public.variant_templates(id) on update cascade on delete set null;

drop index if exists public.product_variants_product_size_color_unique;
create unique index if not exists product_variants_product_size_color_brand_unique
  on public.product_variants (
    product_id,
    coalesce(lower(size_value), ''),
    coalesce(lower(color_value), ''),
    coalesce(lower(brand_name), '')
  );

alter table public.variant_templates enable row level security;
alter table public.variant_template_sizes enable row level security;

drop policy if exists variant_templates_public_read on public.variant_templates;
create policy variant_templates_public_read
on public.variant_templates
for select
using (active = true);

drop policy if exists variant_template_sizes_public_read on public.variant_template_sizes;
create policy variant_template_sizes_public_read
on public.variant_template_sizes
for select
using (
  exists (
    select 1
    from public.variant_templates
    where variant_templates.id = variant_template_sizes.template_id
      and variant_templates.active = true
  )
);

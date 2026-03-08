create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  size_value text,
  color_value text,
  sku text,
  price_override_cents integer check (price_override_cents is null or price_override_cents > 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  active boolean not null default true
);

create index if not exists product_variants_product_active_idx
  on public.product_variants (product_id, active, created_at);

create unique index if not exists product_variants_product_size_color_unique
  on public.product_variants (
    product_id,
    coalesce(lower(size_value), ''),
    coalesce(lower(color_value), '')
  );

create unique index if not exists product_variants_sku_unique
  on public.product_variants (sku)
  where sku is not null and length(trim(sku)) > 0;

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row
execute procedure public.set_updated_at();

alter table public.product_variants enable row level security;

drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read
on public.product_variants
for select
using (active = true);

alter table public.inventory_movements
  add column if not exists variant_id uuid references public.product_variants(id) on update cascade on delete set null;

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
as $$
begin
  if new.variant_id is not null then
    update public.product_variants
    set stock_on_hand = stock_on_hand + new.quantity_delta
    where id = new.variant_id
      and product_id = new.product_id
      and stock_on_hand + new.quantity_delta >= 0;

    if not found then
      raise exception 'Inventory movement would make variant stock negative for variant %', new.variant_id;
    end if;
  else
    update public.products
    set stock_on_hand = stock_on_hand + new.quantity_delta
    where id = new.product_id
      and stock_on_hand + new.quantity_delta >= 0;

    if not found then
      raise exception 'Inventory movement would make stock negative for product %', new.product_id;
    end if;
  end if;

  return new;
end;
$$;

drop index if exists public.inventory_movements_sale_order_product_unique;
create unique index if not exists inventory_movements_sale_order_variant_unique
  on public.inventory_movements (
    reference_order_id,
    product_id,
    coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid),
    movement_type
  )
  where reference_order_id is not null and movement_type = 'sale';

create table if not exists public.funnel_events (
  id bigserial primary key,
  created_at timestamptz not null default timezone('utc', now()),
  event_type text not null check (event_type in ('view_product', 'add_to_cart', 'start_checkout', 'paid')),
  session_id text,
  source_path text,
  product_id uuid references public.products(id) on update cascade on delete set null,
  product_slug text,
  variant_id uuid references public.product_variants(id) on update cascade on delete set null,
  order_id uuid references public.orders(id) on update cascade on delete set null,
  cart_size integer check (cart_size is null or cart_size >= 0),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists funnel_events_event_created_idx
  on public.funnel_events (event_type, created_at desc);
create index if not exists funnel_events_session_created_idx
  on public.funnel_events (session_id, created_at desc);
create index if not exists funnel_events_product_created_idx
  on public.funnel_events (product_id, created_at desc);
create index if not exists funnel_events_order_created_idx
  on public.funnel_events (order_id, created_at desc);

alter table public.funnel_events enable row level security;

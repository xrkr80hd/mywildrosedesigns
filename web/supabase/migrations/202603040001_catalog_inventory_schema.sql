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

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  name text not null unique,
  sort_order integer not null default 0,
  active boolean not null default true,
  check (slug ~ '^[a-z0-9-]+$')
);

create index if not exists categories_active_idx on public.categories (active);
create index if not exists categories_sort_order_idx on public.categories (sort_order, name);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row
execute procedure public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  sku text not null unique,
  slug text not null unique,
  title text not null,
  description text not null default '',
  category_id uuid not null references public.categories(id) on update cascade on delete restrict,
  price_cents integer not null check (price_cents > 0),
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  is_featured boolean not null default false,
  active boolean not null default true,
  image_url text
);

create index if not exists products_active_idx on public.products (active);
create index if not exists products_category_idx on public.products (category_id, active);
create index if not exists products_featured_idx on public.products (is_featured, active);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute procedure public.set_updated_at();

create table if not exists public.inventory_movements (
  id bigserial primary key,
  created_at timestamptz not null default timezone('utc', now()),
  product_id uuid not null references public.products(id) on update cascade on delete cascade,
  movement_type text not null check (movement_type in ('adjustment', 'sale', 'restock', 'return')),
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text,
  reference_order_id uuid references public.orders(id) on update cascade on delete set null,
  created_by text
);

create index if not exists inventory_movements_product_idx
  on public.inventory_movements (product_id, created_at desc);
create index if not exists inventory_movements_type_idx
  on public.inventory_movements (movement_type, created_at desc);

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
as $$
begin
  update public.products
  set stock_on_hand = stock_on_hand + new.quantity_delta
  where id = new.product_id
    and stock_on_hand + new.quantity_delta >= 0;

  if not found then
    raise exception 'Inventory movement would make stock negative for product %', new.product_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_inventory_movement on public.inventory_movements;
create trigger trg_apply_inventory_movement
before insert on public.inventory_movements
for each row
execute procedure public.apply_inventory_movement();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
on public.categories
for select
using (active = true);

drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
using (active = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.categories (slug, name, sort_order, active)
values
  ('apparel', 'Apparel', 10, true),
  ('school', 'School', 20, true),
  ('sports', 'Sports', 30, true),
  ('seasonal', 'Seasonal', 40, true),
  ('custom', 'Custom', 50, true),
  ('lifestyle', 'Lifestyle', 60, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.products (
  sku,
  slug,
  title,
  description,
  category_id,
  price_cents,
  stock_on_hand,
  is_featured,
  active,
  image_url
)
values
  (
    'WR-TEE-001',
    'wild-rose-script-tee',
    'Wild Rose Script Tee',
    'Soft cotton tee with signature Wild Rose script design.',
    (select id from public.categories where slug = 'apparel'),
    2400,
    50,
    true,
    true,
    '/assets/img/product-tee.svg'
  ),
  (
    'WR-HOOD-003',
    'school-spirit-hoodie',
    'School Spirit Hoodie',
    'Cozy hoodie customizable for school mascots and names.',
    (select id from public.categories where slug = 'school'),
    3800,
    35,
    true,
    true,
    '/assets/img/product-hoodie.svg'
  ),
  (
    'WR-MUG-002',
    'seasonal-mug',
    'Seasonal Mug',
    'Ceramic mug with seasonal designs for gifting or home.',
    (select id from public.categories where slug = 'seasonal'),
    1600,
    45,
    true,
    true,
    '/assets/img/product-mug.svg'
  ),
  (
    'WR-TEE-004',
    'team-practice-tee',
    'Team Practice Tee',
    'Lightweight team tee with optional number personalization.',
    (select id from public.categories where slug = 'sports'),
    2200,
    40,
    false,
    true,
    '/assets/img/product-tee.svg'
  ),
  (
    'WR-HOOD-005',
    'booster-club-hoodie',
    'Booster Club Hoodie',
    'Fundraiser-ready hoodie for schools, clubs, and organizations.',
    (select id from public.categories where slug = 'school'),
    4200,
    25,
    false,
    true,
    '/assets/img/product-hoodie.svg'
  ),
  (
    'WR-MUG-006',
    'holiday-gift-mug',
    'Holiday Gift Mug',
    'Personalized holiday mugs for families, teams, and staff gifts.',
    (select id from public.categories where slug = 'seasonal'),
    1800,
    60,
    false,
    true,
    '/assets/img/product-mug.svg'
  ),
  (
    'WR-TEE-007',
    'business-logo-tee',
    'Business Logo Tee',
    'Branded shirt option for local businesses and events.',
    (select id from public.categories where slug = 'custom'),
    2700,
    30,
    false,
    true,
    '/assets/img/product-tee.svg'
  ),
  (
    'WR-HOOD-008',
    'lifestyle-pullover',
    'Lifestyle Pullover',
    'Everyday pullover style with clean print placement options.',
    (select id from public.categories where slug = 'lifestyle'),
    4000,
    20,
    false,
    true,
    '/assets/img/product-hoodie.svg'
  )
on conflict (sku) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  category_id = excluded.category_id,
  price_cents = excluded.price_cents,
  stock_on_hand = excluded.stock_on_hand,
  is_featured = excluded.is_featured,
  active = excluded.active,
  image_url = excluded.image_url;


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

alter table public.products
  add column if not exists is_hot boolean not null default false,
  add column if not exists sale_enabled boolean not null default false,
  add column if not exists sale_percent_off integer not null default 0 check (sale_percent_off >= 0 and sale_percent_off <= 90),
  add column if not exists sale_label text not null default 'Sale',
  add column if not exists cart_cta_text text not null default 'Add to Cart';

create index if not exists products_hot_idx on public.products (is_hot, active);
create index if not exists products_sale_idx on public.products (sale_enabled, active);

create table if not exists public.homepage_settings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  singleton_key text not null unique default 'main',
  hero_badge text not null default 'Handmade with care',
  hero_title text not null default 'Wild Rose Design LLC',
  hero_description text not null default 'Custom apparel, school spirit wear, team merch, and seasonal drops.',
  primary_cta_label text not null default 'Shop Collections',
  primary_cta_href text not null default '/shop',
  secondary_cta_label text not null default 'Upload a Design',
  secondary_cta_href text not null default '/upload'
);

drop trigger if exists trg_homepage_settings_updated_at on public.homepage_settings;
create trigger trg_homepage_settings_updated_at
before update on public.homepage_settings
for each row
execute procedure public.set_updated_at();

create table if not exists public.welcome_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  title text not null,
  body text not null,
  cta_label text,
  cta_href text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists welcome_posts_active_idx
  on public.welcome_posts (active, sort_order, created_at desc);

drop trigger if exists trg_welcome_posts_updated_at on public.welcome_posts;
create trigger trg_welcome_posts_updated_at
before update on public.welcome_posts
for each row
execute procedure public.set_updated_at();

create table if not exists public.promo_popups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  singleton_key text not null unique default 'main',
  enabled boolean not null default false,
  show_cta boolean not null default true,
  promo_label text not null default 'Hot Item',
  title text not null default 'Get it now!',
  message text not null default 'Hot item just dropped.',
  cta_text text not null default 'I gotta have it!',
  cta_href text not null default '/shop',
  product_id uuid references public.products(id) on update cascade on delete set null
);

alter table public.promo_popups
  add column if not exists show_cta boolean not null default true,
  add column if not exists promo_label text not null default 'Hot Item',
  add column if not exists cta_href text not null default '/shop';

drop trigger if exists trg_promo_popups_updated_at on public.promo_popups;
create trigger trg_promo_popups_updated_at
before update on public.promo_popups
for each row
execute procedure public.set_updated_at();

alter table public.homepage_settings enable row level security;
alter table public.welcome_posts enable row level security;
alter table public.promo_popups enable row level security;

drop policy if exists homepage_settings_public_read on public.homepage_settings;
create policy homepage_settings_public_read
on public.homepage_settings
for select
using (true);

drop policy if exists welcome_posts_public_read on public.welcome_posts;
create policy welcome_posts_public_read
on public.welcome_posts
for select
using (active = true);

drop policy if exists promo_popups_public_read on public.promo_popups;
create policy promo_popups_public_read
on public.promo_popups
for select
using (enabled = true);

insert into public.homepage_settings (
  singleton_key,
  hero_badge,
  hero_title,
  hero_description,
  primary_cta_label,
  primary_cta_href,
  secondary_cta_label,
  secondary_cta_href
)
values (
  'main',
  'Handmade with care',
  'Wild Rose Design LLC',
  'Custom apparel, school spirit wear, team merch, and seasonal drops.',
  'Shop Collections',
  '/shop',
  'Upload a Design',
  '/upload'
)
on conflict (singleton_key) do update
set
  hero_badge = excluded.hero_badge,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_href = excluded.primary_cta_href,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_href = excluded.secondary_cta_href;

insert into public.welcome_posts (title, body, cta_label, cta_href, sort_order, active)
values
  (
    'Custom Designs',
    'Upload your artwork and get high-quality DTF prints with quick turnaround.',
    'Start Custom Order',
    '/upload',
    10,
    true
  ),
  (
    'School and Team Spirit',
    'Outfit schools, teams, clubs, and booster groups with consistent print quality.',
    'Shop School Gear',
    '/shop?category=School',
    20,
    true
  ),
  (
    'Seasonal Collections',
    'Launch limited seasonal drops and gifts with built-in sale controls.',
    'View Seasonal',
    '/shop?category=Seasonal',
    30,
    true
  )
on conflict do nothing;

insert into public.promo_popups (
  singleton_key,
  enabled,
  show_cta,
  promo_label,
  title,
  message,
  cta_text,
  cta_href,
  product_id
)
values (
  'main',
  false,
  true,
  'Hot Item',
  'Get it now!',
  'Hot item just dropped.',
  'I gotta have it!',
  '/shop',
  (
    select id
    from public.products
    where active = true
    order by is_hot desc, is_featured desc, created_at desc
    limit 1
  )
)
on conflict (singleton_key) do update
set
  promo_label = excluded.promo_label,
  title = excluded.title,
  message = excluded.message,
  cta_text = excluded.cta_text,
  cta_href = excluded.cta_href,
  show_cta = excluded.show_cta;


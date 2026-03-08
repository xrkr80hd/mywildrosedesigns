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

create table if not exists public.upload_product_options (
  id text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  sort_order integer not null default 0,
  name text not null,
  description text not null default '',
  amount_cents integer not null check (amount_cents > 0),
  active boolean not null default true
);

create index if not exists upload_product_options_active_idx
  on public.upload_product_options (active, sort_order);

drop trigger if exists trg_upload_product_options_updated_at on public.upload_product_options;
create trigger trg_upload_product_options_updated_at
before update on public.upload_product_options
for each row
execute procedure public.set_updated_at();

alter table public.upload_product_options enable row level security;

drop policy if exists upload_product_options_public_read on public.upload_product_options;
create policy upload_product_options_public_read
on public.upload_product_options
for select
using (active = true);

insert into public.upload_product_options (id, sort_order, name, description, amount_cents, active)
values
  ('single-transfer', 10, 'Single Transfer (up to 12")', 'Ideal for one-off shirt prints and logos.', 2500, true),
  ('gang-sheet-small', 20, 'Small Gang Sheet (22" x 24")', 'Great for batching several designs on one sheet.', 4500, true),
  ('gang-sheet-large', 30, 'Large Gang Sheet (22" x 60")', 'Best value for higher-volume custom orders.', 7500, true)
on conflict (id) do nothing;

create unique index if not exists inventory_movements_sale_order_product_unique
  on public.inventory_movements (reference_order_id, product_id, movement_type)
  where reference_order_id is not null and movement_type = 'sale';

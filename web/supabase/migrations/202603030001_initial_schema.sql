create extension if not exists pgcrypto;

do $$
begin
  create type public.order_status as enum (
    'pending_payment',
    'paid',
    'in_production',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  notes text,
  product_option text not null,
  quantity integer not null check (quantity > 0),
  amount_cents integer not null check (amount_cents > 0),
  design_path text not null,
  status public.order_status not null default 'pending_payment',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute procedure public.set_orders_updated_at();

alter table public.orders enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'design-uploads',
  'design-uploads',
  false,
  20971520,
  array['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf', 'application/postscript']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

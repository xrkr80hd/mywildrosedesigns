alter table public.orders
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by text;

create index if not exists orders_archived_created_idx
  on public.orders (archived_at, created_at desc);

create index if not exists orders_archived_status_idx
  on public.orders (archived_at, status, created_at desc);

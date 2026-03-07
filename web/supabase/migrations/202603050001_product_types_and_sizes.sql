alter table public.products
  add column if not exists product_type text not null default 'apparel',
  add column if not exists size_profiles text[] not null default '{}',
  add column if not exists size_values text[] not null default '{}';

alter table public.products
  drop constraint if exists products_product_type_check;

alter table public.products
  add constraint products_product_type_check
  check (product_type in ('apparel', 'accessory'));

create index if not exists products_product_type_idx
  on public.products (product_type, active);

update public.products
set product_type = 'accessory',
    size_profiles = '{}',
    size_values = '{}'
where title ilike '%mug%';

update public.products
set size_profiles = array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    size_values = array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
where product_type = 'apparel'
  and coalesce(array_length(size_values, 1), 0) = 0;

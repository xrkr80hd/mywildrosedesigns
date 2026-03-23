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
on conflict (singleton_key) do nothing;

insert into public.categories (slug, name, sort_order, active, image_url)
values
  ('apparel', 'Apparel', 10, true, null),
  ('school', 'School', 20, true, null),
  ('sports', 'Sports', 30, true, null),
  ('seasonal', 'Seasonal', 40, true, null),
  ('custom', 'Custom', 50, true, null),
  ('lifestyle', 'Lifestyle', 60, true, null)
on conflict (slug) do nothing;

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
  image_url,
  is_hot,
  sale_enabled,
  sale_percent_off,
  sale_label,
  cart_cta_text,
  product_type,
  size_profiles,
  size_values
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
    '/assets/img/product-tee.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    '/assets/img/product-hoodie.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    '/assets/img/product-mug.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'accessory',
    '{}'::text[],
    '{}'::text[]
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
    '/assets/img/product-tee.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    '/assets/img/product-hoodie.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    '/assets/img/product-mug.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'accessory',
    '{}'::text[],
    '{}'::text[]
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
    '/assets/img/product-tee.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
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
    '/assets/img/product-hoodie.svg',
    false,
    false,
    0,
    'Sale',
    'Add to Cart',
    'apparel',
    array['kids_boy', 'kids_girl', 'adult_male', 'adult_female'],
    array['YS', 'YM', 'YL', 'YXL', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
  )
on conflict (sku) do nothing;

insert into public.welcome_posts (title, body, cta_label, cta_href, sort_order, active)
select 'Custom Designs', 'Upload your artwork and get high-quality DTF prints with quick turnaround.', 'Start Custom Order', '/upload', 10, true
where not exists (
  select 1 from public.welcome_posts where title = 'Custom Designs'
);

insert into public.welcome_posts (title, body, cta_label, cta_href, sort_order, active)
select 'School and Team Spirit', 'Outfit schools, teams, clubs, and booster groups with consistent print quality.', 'Shop School Gear', '/shop?category=School', 20, true
where not exists (
  select 1 from public.welcome_posts where title = 'School and Team Spirit'
);

insert into public.welcome_posts (title, body, cta_label, cta_href, sort_order, active)
select 'Seasonal Collections', 'Launch limited seasonal drops and gifts with built-in sale controls.', 'View Seasonal', '/shop?category=Seasonal', 30, true
where not exists (
  select 1 from public.welcome_posts where title = 'Seasonal Collections'
);

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
on conflict (singleton_key) do nothing;

insert into public.upload_product_options (id, sort_order, name, description, amount_cents, active)
values
  ('single-transfer', 10, 'Single Transfer (up to 12")', 'Ideal for one-off shirt prints and logos.', 2500, true),
  ('gang-sheet-small', 20, 'Small Gang Sheet (22" x 24")', 'Great for batching several designs on one sheet.', 4500, true),
  ('gang-sheet-large', 30, 'Large Gang Sheet (22" x 60")', 'Best value for higher-volume custom orders.', 7500, true)
on conflict (id) do nothing;

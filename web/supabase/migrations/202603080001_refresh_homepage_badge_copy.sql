alter table public.homepage_settings
  alter column hero_badge set default 'Custom designs, made for you';

update public.homepage_settings
set hero_badge = 'Custom designs, made for you'
where singleton_key = 'main'
  and hero_badge = 'Handmade with care';

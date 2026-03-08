alter table public.homepage_settings
  alter column hero_badge set default 'Handmade with care';

update public.homepage_settings
set hero_badge = 'Handmade with care'
where singleton_key = 'main'
  and hero_badge ilike '%Fast Turnaround%';

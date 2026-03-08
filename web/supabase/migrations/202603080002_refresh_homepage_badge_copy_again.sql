alter table public.homepage_settings
  alter column hero_badge set default 'Custom Prints • Fast Turnaround';

update public.homepage_settings
set hero_badge = 'Custom Prints • Fast Turnaround'
where singleton_key = 'main'
  and (
    hero_badge ilike 'Handmade with care'
    or hero_badge ilike 'Custom designs, made for you'
  );

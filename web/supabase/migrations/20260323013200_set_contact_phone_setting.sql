insert into public.welcome_posts (title, body, cta_label, cta_href, sort_order, active)
values (
  'site-setting::contact_phone',
  '3182667346',
  null,
  null,
  9000,
  false
)
on conflict do nothing;

update public.welcome_posts
set
  body = '3182667346',
  cta_label = null,
  cta_href = null,
  sort_order = 9000,
  active = false
where title = 'site-setting::contact_phone';

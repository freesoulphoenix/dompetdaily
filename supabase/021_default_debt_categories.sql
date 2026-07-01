insert into public.categories (user_profile_id, name, type, sort_order)
select profiles.id, 'Debt', 'expense', 7
from public.user_profiles profiles
on conflict (user_profile_id, name, type) do nothing;

update public.categories
set sort_order = case name
  when 'Shopping' then 8
  when 'Health' then 9
  when 'Personal Care' then 10
  when 'Entertainment' then 11
  when 'Travel' then 12
  when 'Education' then 13
  when 'Music Project' then 14
  when 'Business' then 15
  when 'Other' then 16
  else sort_order
end
where type = 'expense'
  and parent_category_id is null
  and name in (
    'Shopping',
    'Health',
    'Personal Care',
    'Entertainment',
    'Travel',
    'Education',
    'Music Project',
    'Business',
    'Other'
  );

insert into public.categories (user_profile_id, name, type, parent_category_id, sort_order)
select
  profiles.id,
  defaults.name,
  'expense',
  debt.id,
  defaults.sort_order
from public.user_profiles profiles
join public.categories debt
  on debt.user_profile_id = profiles.id
 and debt.name = 'Debt'
 and debt.type = 'expense'
 and debt.parent_category_id is null
cross join (values
  ('Loan Payment', 1),
  ('Credit Card Payment', 2)
) as defaults(name, sort_order)
on conflict (user_profile_id, name, type) do nothing;

notify pgrst, 'reload schema';

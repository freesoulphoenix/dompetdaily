create temporary table clothing_fashion_category_pairs on commit drop as
select
  clothing.id as clothing_id,
  fashion.id as fashion_id,
  shopping.id as shopping_id,
  clothing.sort_order as clothing_sort_order
from public.categories clothing
join public.categories shopping
  on shopping.id = clothing.parent_category_id
 and shopping.name = 'Shopping'
join public.categories fashion
  on fashion.user_profile_id = clothing.user_profile_id
 and fashion.type = clothing.type
 and fashion.name = 'Fashion'
where clothing.name = 'Clothing';

update public.categories fashion
set
  parent_category_id = pairs.shopping_id,
  sort_order = coalesce(nullif(fashion.sort_order, 0), pairs.clothing_sort_order)
from clothing_fashion_category_pairs pairs
where fashion.id = pairs.fashion_id;

update public.transactions
set category_id = pairs.fashion_id
from clothing_fashion_category_pairs pairs
where transactions.category_id = pairs.clothing_id;

update public.upcoming_due
set category_id = pairs.fashion_id
from clothing_fashion_category_pairs pairs
where upcoming_due.category_id = pairs.clothing_id;

update public.imported_transactions
set category_id = pairs.fashion_id
from clothing_fashion_category_pairs pairs
where imported_transactions.category_id = pairs.clothing_id;

update public.categories
set parent_category_id = pairs.fashion_id
from clothing_fashion_category_pairs pairs
where categories.parent_category_id = pairs.clothing_id;

delete from public.categories
using clothing_fashion_category_pairs pairs
where categories.id = pairs.clothing_id;

update public.categories clothing
set name = 'Fashion'
from public.categories shopping
where clothing.parent_category_id = shopping.id
  and shopping.name = 'Shopping'
  and clothing.name = 'Clothing'
  and not exists (
    select 1
    from public.categories fashion
    where fashion.user_profile_id = clothing.user_profile_id
      and fashion.type = clothing.type
      and fashion.name = 'Fashion'
  );

notify pgrst, 'reload schema';

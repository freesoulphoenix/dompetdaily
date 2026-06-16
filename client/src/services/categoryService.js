import { supabase } from './supabaseClient.js';
import { getCurrentUserProfileId } from './userProfileService.js';

export async function getCategories() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const userProfileId = await getCurrentUserProfileId();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_profile_id', userProfileId)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createCategory({ name, type = 'expense', parent_category_id = null }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const userProfileId = await getCurrentUserProfileId();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_profile_id: userProfileId,
      name: name.trim(),
      type,
      parent_category_id: parent_category_id || null,
      sort_order: Date.now()
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategoryOrder(categories = []) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const updates = categories.map((category, index) => (
    supabase
      .from('categories')
      .update({ sort_order: index + 1 })
      .eq('id', category.id)
  ));

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }
}

export async function updateCategory(id, { name, type = 'expense', parent_category_id = null }) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: name.trim(),
      type,
      parent_category_id: parent_category_id || null
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCategory(id) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

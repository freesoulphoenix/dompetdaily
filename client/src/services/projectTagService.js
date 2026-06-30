import { supabase } from './supabaseClient.js';
import { getCurrentUserProfileId } from './userProfileService.js';

function normalizeTagName(name) {
  return (name || '').trim();
}

export async function getProjectTags() {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const userProfileId = await getCurrentUserProfileId();
  const { data, error } = await supabase
    .from('project_tags')
    .select('*')
    .eq('user_profile_id', userProfileId)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createProjectTag(name) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const tagName = normalizeTagName(name);

  if (!tagName) {
    throw new Error('Project tag name is required.');
  }

  const userProfileId = await getCurrentUserProfileId();
  const { data, error } = await supabase
    .from('project_tags')
    .insert({
      user_profile_id: userProfileId,
      name: tagName
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A project tag with this name already exists.');
    }

    throw error;
  }

  return data;
}

export async function updateProjectTag(id, name) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const tagName = normalizeTagName(name);

  if (!tagName) {
    throw new Error('Project tag name is required.');
  }

  const { data, error } = await supabase
    .from('project_tags')
    .update({ name: tagName })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('A project tag with this name already exists.');
    }

    throw error;
  }

  return data;
}

export async function deleteProjectTag(id) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('project_tags')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

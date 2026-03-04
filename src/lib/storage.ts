import { createClient } from '@supabase/supabase-js';
import { Story } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Story CRUD (via Supabase)

export async function saveStoryToSupabase(id: string | undefined, story: Story) {
  if (!supabase) return null;

  if (id) {
    const { data, error } = await supabase
      .from('stories')
      .update({ data: story, title: story.title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({ data: story, title: story.title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function loadStoryFromSupabase(id: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data?.data as Story;
}

export async function listStoriesFromSupabase() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('stories')
    .select('id, title, data, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    scenesCount: (row.data as Story)?.scenes?.length || 0,
    updatedAt: row.updated_at,
  }));
}

// Asset upload

export async function uploadAsset(
  file: File,
  type: 'sprite' | 'background'
) {
  if (!supabase) return null;

  const bucket = type === 'background' ? 'backgrounds' : 'sprites';
  const filePath = `${file.name}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

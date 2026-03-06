import { Story } from './types';
import { parseStory } from './parseStory';

// --- Supabase functions (only used when env vars are set) ---

async function getSupabase() {
  const { supabase } = await import('./storage');
  return supabase;
}

// --- Filesystem functions (dev local) ---

function getFsModules() {
  // Dynamic import to avoid bundling fs in client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');
  return { fs, path };
}

function getStoriesDir() {
  const { path } = getFsModules();
  return path.join(process.cwd(), 'data', 'stories');
}

function ensureDir() {
  const { fs } = getFsModules();
  const dir = getStoriesDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// --- Detect mode ---

function useSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// --- Public API ---

export interface StoryMeta {
  id: string;
  title: string;
  scenesCount: number;
  updatedAt?: string;
}

export async function listStories(): Promise<StoryMeta[]> {
  if (useSupabase()) {
    const supabase = await getSupabase();
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

  // Filesystem
  const { fs, path } = getFsModules();
  const dir = getStoriesDir();
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.json') || f.endsWith('.md'));
  const stories: StoryMeta[] = [];

  for (const f of files) {
    const ext = path.extname(f);
    const id = f.replace(ext, '');
    try {
      if (ext === '.json') {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
        stories.push({ id, title: data.title || 'Sem titulo', scenesCount: data.scenes?.length || 0 });
      } else {
        const md = fs.readFileSync(path.join(dir, f), 'utf-8');
        const story = parseStory(md);
        stories.push({ id, title: story.title, scenesCount: story.scenes.length });
      }
    } catch {
      stories.push({ id, title: `(erro ao ler ${f})`, scenesCount: 0 });
    }
  }
  return stories;
}

export async function getStory(id: string): Promise<Story | null> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data?.data as Story;
  }

  // Filesystem - try JSON first, then MD
  const { fs, path } = getFsModules();
  const dir = getStoriesDir();

  const jsonPath = path.join(dir, `${id}.json`);
  if (fs.existsSync(jsonPath)) {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  }

  const mdPath = path.join(dir, `${id}.md`);
  if (fs.existsSync(mdPath)) {
    const md = fs.readFileSync(mdPath, 'utf-8');
    return parseStory(md);
  }

  return null;
}

export async function saveStory(id: string | undefined, story: Story): Promise<string> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase nao configurado');

    if (id) {
      const { error } = await supabase
        .from('stories')
        .update({ data: story, title: story.title, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return id;
    }

    const { data, error } = await supabase
      .from('stories')
      .insert({ data: story, title: story.title })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  // Filesystem
  const { fs, path } = getFsModules();
  ensureDir();
  const finalId = id || crypto.randomUUID();
  const filePath = path.join(getStoriesDir(), `${finalId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(story, null, 2));
  return finalId;
}

export async function deleteStory(id: string): Promise<void> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return;
    await supabase.from('stories').delete().eq('id', id);
    return;
  }

  // Filesystem
  const { fs, path } = getFsModules();
  const filePath = path.join(getStoriesDir(), `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export interface AssetFile {
  filename: string;
  characterId: string;
}

export async function listAssets(type: 'sprite' | 'background'): Promise<AssetFile[]> {
  // Assets always come from public/ directory (both modes)
  // In Supabase mode, this could be extended to query storage buckets
  const { fs, path } = getFsModules();
  const { spriteIdFromFilename } = await import('./parseStory');
  const dir = type === 'background' ? 'backgrounds' : 'sprites';
  const fullPath = path.join(process.cwd(), 'public', dir);

  try {
    const files = fs.readdirSync(fullPath).filter((f: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    return files.map((filename: string) => ({
      filename,
      characterId: type === 'sprite' ? spriteIdFromFilename(filename) : filename.replace(/\.\w+$/, ''),
    }));
  } catch {
    return [];
  }
}

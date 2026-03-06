import { Story, CreativeProject, ProjectType } from './types';
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

function getProjectsDir() {
  const { path } = getFsModules();
  return path.join(process.cwd(), 'data', 'projects');
}

function ensureDir(dir?: string) {
  const { fs } = getFsModules();
  const target = dir || getStoriesDir();
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
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
  ensureDir(getStoriesDir());
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

// --- Creative Projects (Decoration, Construction, City) ---

export interface ProjectMeta {
  id: string;
  type: ProjectType;
  title: string;
  itemCount: number;
  updatedAt?: string;
}

export async function listProjects(type?: ProjectType): Promise<ProjectMeta[]> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return [];
    let query = supabase
      .from('projects')
      .select('id, title, data, created_at, updated_at')
      .order('updated_at', { ascending: false });
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) return [];
    return data.map((row) => ({
      id: row.id,
      type: (row.data as CreativeProject)?.type || 'decoration',
      title: row.title,
      itemCount: (row.data as CreativeProject)?.items?.length || 0,
      updatedAt: row.updated_at,
    }));
  }

  const { fs, path } = getFsModules();
  const dir = getProjectsDir();
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f: string) => f.endsWith('.json'));
  const projects: ProjectMeta[] = [];

  for (const f of files) {
    const id = f.replace('.json', '');
    try {
      const data: CreativeProject = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      if (type && data.type !== type) continue;
      projects.push({ id, type: data.type, title: data.title, itemCount: data.items?.length || 0 });
    } catch {
      projects.push({ id, type: 'decoration', title: `(erro ao ler ${f})`, itemCount: 0 });
    }
  }
  return projects;
}

export async function getProject(id: string): Promise<CreativeProject | null> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) return null;
    return data?.data as CreativeProject;
  }

  const { fs, path } = getFsModules();
  const filePath = path.join(getProjectsDir(), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export async function saveProject(id: string | undefined, project: CreativeProject): Promise<string> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) throw new Error('Supabase nao configurado');
    if (id) {
      const { error } = await supabase
        .from('projects')
        .update({ data: project, title: project.title, type: project.type, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return id;
    }
    const { data, error } = await supabase
      .from('projects')
      .insert({ data: project, title: project.title, type: project.type })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  const { fs, path } = getFsModules();
  ensureDir(getProjectsDir());
  const finalId = id || crypto.randomUUID();
  fs.writeFileSync(path.join(getProjectsDir(), `${finalId}.json`), JSON.stringify(project, null, 2));
  return finalId;
}

export async function deleteProject(id: string): Promise<void> {
  if (useSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return;
    await supabase.from('projects').delete().eq('id', id);
    return;
  }

  const { fs, path } = getFsModules();
  const filePath = path.join(getProjectsDir(), `${id}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// --- Creative Assets (items for decoration/construction/city) ---

export interface CreativeAssetCategory {
  category: string;
  files: string[];
}

export async function listCreativeAssets(mode: ProjectType): Promise<CreativeAssetCategory[]> {
  const { fs, path } = getFsModules();
  const baseDir = path.join(process.cwd(), 'public', 'assets', mode);

  const categories: CreativeAssetCategory[] = [];

  // Mode-specific assets from public/assets/<mode>/
  if (fs.existsSync(baseDir)) {
    const dirs = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory() || d.name === 'fundos') continue;
      const catPath = path.join(baseDir, d.name);
      const files = fs.readdirSync(catPath).filter((f: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
      if (files.length > 0) {
        categories.push({ category: d.name, files });
      }
    }
  }

  // Also include shared sprites from public/sprites/ (available in all modes)
  // These use special "sprites:" prefix in category to distinguish path
  const spritesDir = path.join(process.cwd(), 'public', 'sprites');
  if (fs.existsSync(spritesDir)) {
    const allSprites = fs.readdirSync(spritesDir).filter((f: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    const spriteCategories: Record<string, string[]> = { 'sprites:personagens': [] };
    const prefixMap: Record<string, string> = {
      animal: 'sprites:animais', natureza: 'sprites:natureza', comida: 'sprites:comida',
      movel: 'sprites:moveis', veiculo: 'sprites:veiculos', brinquedo: 'sprites:brinquedos',
      escola: 'sprites:escola', magia: 'sprites:magia', moda: 'sprites:moda_items',
    };
    for (const f of allSprites) {
      const prefix = f.split('_')[0];
      if (prefixMap[prefix]) {
        const cat = prefixMap[prefix];
        if (!spriteCategories[cat]) spriteCategories[cat] = [];
        spriteCategories[cat].push(f);
      } else {
        spriteCategories['sprites:personagens'].push(f);
      }
    }
    for (const [cat, files] of Object.entries(spriteCategories)) {
      if (files.length > 0) {
        categories.push({ category: cat, files });
      }
    }
  }

  return categories;
}

export interface CreativeBackground {
  filename: string;
  path: string; // full path from public/, e.g. "/assets/decoration/fundos/" or "/backgrounds/"
}

export async function listCreativeBackgrounds(mode: ProjectType): Promise<CreativeBackground[]> {
  const { fs, path } = getFsModules();
  const backgrounds: CreativeBackground[] = [];

  // Mode-specific backgrounds
  const bgDir = path.join(process.cwd(), 'public', 'assets', mode, 'fundos');
  if (fs.existsSync(bgDir)) {
    const files = fs.readdirSync(bgDir).filter((f: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    for (const f of files) {
      backgrounds.push({ filename: f, path: `/assets/${mode}/fundos/` });
    }
  }

  // Also include shared backgrounds from public/backgrounds/
  const sharedDir = path.join(process.cwd(), 'public', 'backgrounds');
  if (fs.existsSync(sharedDir)) {
    const shared = fs.readdirSync(sharedDir).filter((f: string) => /\.(png|jpg|jpeg|webp|svg)$/i.test(f));
    for (const f of shared) {
      if (!backgrounds.find((b) => b.filename === f)) {
        backgrounds.push({ filename: f, path: '/backgrounds/' });
      }
    }
  }

  return backgrounds;
}

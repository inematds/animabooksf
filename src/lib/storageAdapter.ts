'use client';

// Armazenamento do AnimaBook, todo no navegador (o site é estático, roda no GitHub Pages).
// - Com NEXT_PUBLIC_SUPABASE_URL/ANON_KEY no build: histórias e projetos vão para o Supabase.
// - Sem essas variáveis (padrão): ficam no localStorage deste aparelho.
// - Listas de imagens e histórias prontas vêm de /data/catalogo.json (scripts/gera-catalogo.mjs).
// Chame estas funções só no cliente (useEffect/handlers), nunca durante o render.

import { Story, CreativeProject, ProjectType } from './types';
import { parseStory, spriteIdFromFilename } from './parseStory';
import { withBase } from './base';

// --- Supabase (opcional) ---

function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getSupabase() {
  const { supabase } = await import('./storage');
  return supabase;
}

// --- localStorage ---

const KEY_STORIES = 'animabook:stories';
const KEY_PROJECTS = 'animabook:projects';

interface Saved<T> {
  data: T;
  updatedAt: string;
}

function readMap<T>(key: string): Record<string, Saved<T>> {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, map: Record<string, Saved<T>>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    throw new Error('Não deu para salvar: o espaço do navegador acabou. Exporte e apague histórias antigas.');
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// --- Catálogo estático ---

interface Catalogo {
  sprites: string[];
  backgrounds: string[];
  modos: Record<string, { categorias: { category: string; files: string[] }[]; fundos: string[] }>;
  historias: { id: string; markdown: string }[];
}

let catalogoPromise: Promise<Catalogo> | null = null;

export function getCatalogo(): Promise<Catalogo> {
  if (!catalogoPromise) {
    catalogoPromise = fetch(withBase('/data/catalogo.json'))
      .then((r) => {
        if (!r.ok) throw new Error(`catalogo ${r.status}`);
        return r.json();
      })
      .catch(() => {
        catalogoPromise = null;
        return { sprites: [], backgrounds: [], modos: {}, historias: [] };
      });
  }
  return catalogoPromise;
}

async function builtinStories(): Promise<Record<string, Story>> {
  const cat = await getCatalogo();
  const out: Record<string, Story> = {};
  for (const h of cat.historias) {
    try {
      out[h.id] = parseStory(h.markdown);
    } catch {
      // história pronta com erro de formato: ignora
    }
  }
  return out;
}

// --- Histórias ---

export interface StoryMeta {
  id: string;
  title: string;
  scenesCount: number;
  updatedAt?: string;
  /** História pronta que veio com o site (não dá para apagar, só editar uma cópia). */
  builtin?: boolean;
}

export async function listStories(): Promise<StoryMeta[]> {
  if (hasSupabase()) {
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

  const saved = readMap<Story>(KEY_STORIES);
  const own: StoryMeta[] = Object.entries(saved)
    .map(([id, s]) => ({
      id,
      title: s.data?.title || 'Sem titulo',
      scenesCount: s.data?.scenes?.length || 0,
      updatedAt: s.updatedAt,
    }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  const prontas = await builtinStories();
  const extras: StoryMeta[] = Object.entries(prontas)
    .filter(([id]) => !saved[id])
    .map(([id, s]) => ({ id, title: s.title, scenesCount: s.scenes.length, builtin: true }));

  return [...own, ...extras];
}

export async function getStory(id: string): Promise<Story | null> {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('stories').select('*').eq('id', id).single();
    if (error) return null;
    return data?.data as Story;
  }

  const saved = readMap<Story>(KEY_STORIES)[id];
  if (saved) return saved.data;
  const prontas = await builtinStories();
  return prontas[id] || null;
}

export async function saveStory(id: string | undefined, story: Story): Promise<string> {
  if (!story || typeof story.title !== 'string' || !story.title.trim()) {
    throw new Error('Historia precisa de um titulo');
  }
  if (!Array.isArray(story.scenes) || story.scenes.length === 0) {
    throw new Error('Historia precisa de pelo menos uma cena');
  }

  if (hasSupabase()) {
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

  const map = readMap<Story>(KEY_STORIES);
  const finalId = id || newId();
  map[finalId] = { data: story, updatedAt: new Date().toISOString() };
  writeMap(KEY_STORIES, map);
  return finalId;
}

export async function deleteStory(id: string): Promise<void> {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return;
    await supabase.from('stories').delete().eq('id', id);
    return;
  }
  const map = readMap<Story>(KEY_STORIES);
  delete map[id];
  writeMap(KEY_STORIES, map);
}

// --- Imagens (sprites e fundos das histórias) ---

export interface AssetFile {
  filename: string;
  characterId: string;
}

export async function listAssets(type: 'sprite' | 'background'): Promise<AssetFile[]> {
  const cat = await getCatalogo();
  const files = type === 'background' ? cat.backgrounds : cat.sprites;
  return files.map((filename) => ({
    filename,
    characterId: type === 'sprite' ? spriteIdFromFilename(filename) : filename.replace(/\.\w+$/, ''),
  }));
}

// --- Projetos criativos (decoração, construção, cidade, moda, campo) ---

export interface ProjectMeta {
  id: string;
  type: ProjectType;
  title: string;
  itemCount: number;
  updatedAt?: string;
}

export async function listProjects(type?: ProjectType): Promise<ProjectMeta[]> {
  if (hasSupabase()) {
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

  return Object.entries(readMap<CreativeProject>(KEY_PROJECTS))
    .filter(([, p]) => !type || p.data?.type === type)
    .map(([id, p]) => ({
      id,
      type: p.data?.type || 'decoration',
      title: p.data?.title || 'Sem titulo',
      itemCount: p.data?.items?.length || 0,
      updatedAt: p.updatedAt,
    }))
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

export async function getProject(id: string): Promise<CreativeProject | null> {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) return null;
    return data?.data as CreativeProject;
  }
  return readMap<CreativeProject>(KEY_PROJECTS)[id]?.data || null;
}

export async function saveProject(id: string | undefined, project: CreativeProject): Promise<string> {
  if (!project || !project.type || !project.title?.trim()) {
    throw new Error('Projeto precisa de titulo e tipo');
  }

  if (hasSupabase()) {
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

  const map = readMap<CreativeProject>(KEY_PROJECTS);
  const finalId = id || newId();
  map[finalId] = { data: project, updatedAt: new Date().toISOString() };
  writeMap(KEY_PROJECTS, map);
  return finalId;
}

export async function deleteProject(id: string): Promise<void> {
  if (hasSupabase()) {
    const supabase = await getSupabase();
    if (!supabase) return;
    await supabase.from('projects').delete().eq('id', id);
    return;
  }
  const map = readMap<CreativeProject>(KEY_PROJECTS);
  delete map[id];
  writeMap(KEY_PROJECTS, map);
}

// --- Itens dos modos criativos ---

export interface CreativeAssetCategory {
  category: string;
  files: string[];
}

const SPRITE_PREFIX_MAP: Record<string, string> = {
  animal: 'sprites:animais', natureza: 'sprites:natureza', comida: 'sprites:comida',
  movel: 'sprites:moveis', veiculo: 'sprites:veiculos', brinquedo: 'sprites:brinquedos',
  escola: 'sprites:escola', magia: 'sprites:magia', moda: 'sprites:moda_items',
};

export async function listCreativeAssets(mode: ProjectType): Promise<CreativeAssetCategory[]> {
  const cat = await getCatalogo();
  const categories: CreativeAssetCategory[] = [...(cat.modos[mode]?.categorias || [])];

  // Sprites compartilhados (prefixo "sprites:" na categoria indica o caminho /sprites/)
  const spriteCategories: Record<string, string[]> = { 'sprites:personagens': [] };
  for (const f of cat.sprites) {
    const c = SPRITE_PREFIX_MAP[f.split('_')[0]] || 'sprites:personagens';
    (spriteCategories[c] ||= []).push(f);
  }
  for (const [category, files] of Object.entries(spriteCategories)) {
    if (files.length > 0) categories.push({ category, files });
  }
  return categories;
}

export interface CreativeBackground {
  filename: string;
  path: string; // caminho a partir de public/, ex.: "/assets/decoration/fundos/" ou "/backgrounds/" (sem o prefixo do site)
}

export async function listCreativeBackgrounds(mode: ProjectType): Promise<CreativeBackground[]> {
  const cat = await getCatalogo();
  const backgrounds: CreativeBackground[] = (cat.modos[mode]?.fundos || []).map((f) => ({
    filename: f,
    path: `/assets/${mode}/fundos/`,
  }));
  for (const f of cat.backgrounds) {
    if (!backgrounds.find((b) => b.filename === f)) backgrounds.push({ filename: f, path: '/backgrounds/' });
  }
  return backgrounds;
}

// --- Cópia de segurança (exportar/importar .json) ---

export interface Backup {
  app: 'animabook';
  versao: 1;
  exportadoEm: string;
  stories: Record<string, Saved<Story>>;
  projects: Record<string, Saved<CreativeProject>>;
}

export function exportBackup(): Backup {
  return {
    app: 'animabook',
    versao: 1,
    exportadoEm: new Date().toISOString(),
    stories: readMap<Story>(KEY_STORIES),
    projects: readMap<CreativeProject>(KEY_PROJECTS),
  };
}

/** Junta a cópia com o que já existe (o item mais novo vence). Devolve quantos itens entraram. */
export function importBackup(raw: unknown): number {
  const b = raw as Partial<Backup>;
  if (!b || b.app !== 'animabook' || typeof b.stories !== 'object' || typeof b.projects !== 'object') {
    throw new Error('Esse arquivo não é uma cópia do AnimaBook.');
  }
  let n = 0;
  const merge = <T,>(key: string, incoming: Record<string, Saved<T>>) => {
    const map = readMap<T>(key);
    for (const [id, item] of Object.entries(incoming || {})) {
      if (!item || typeof item !== 'object' || !('data' in item)) continue;
      const atual = map[id];
      if (!atual || (item.updatedAt || '') >= (atual.updatedAt || '')) {
        map[id] = item;
        n++;
      }
    }
    writeMap(key, map);
  };
  merge(KEY_STORIES, b.stories as Record<string, Saved<Story>>);
  merge(KEY_PROJECTS, b.projects as Record<string, Saved<CreativeProject>>);
  return n;
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseStory } from '@/lib/parseStory';

const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');

function ensureDir() {
  if (!fs.existsSync(STORIES_DIR)) {
    fs.mkdirSync(STORIES_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    ensureDir();
    const files = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.json') || f.endsWith('.md'));
    const stories: Array<{ id: string; title: string; scenesCount: number }> = [];

    for (const f of files) {
      const ext = path.extname(f);
      const id = f.replace(ext, '');
      try {
        if (ext === '.json') {
          const data = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'));
          stories.push({ id, title: data.title || 'Sem titulo', scenesCount: data.scenes?.length || 0 });
        } else {
          const md = fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8');
          const story = parseStory(md);
          stories.push({ id, title: story.title, scenesCount: story.scenes.length });
        }
      } catch {
        stories.push({ id, title: `(erro ao ler ${f})`, scenesCount: 0 });
      }
    }

    return NextResponse.json({ stories });
  } catch (err) {
    console.error('GET /api/stories error:', err);
    return NextResponse.json({ stories: [], error: 'Erro ao listar historias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureDir();
    const body = await request.json();
    const id = body.id || crypto.randomUUID();
    const filePath = path.join(STORIES_DIR, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(body.story, null, 2));
    return NextResponse.json({ id, saved: true });
  } catch (err) {
    console.error('Save error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao salvar' },
      { status: 500 }
    );
  }
}

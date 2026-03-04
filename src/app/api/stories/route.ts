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
  ensureDir();
  const files = fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.json') || f.endsWith('.md'));
  const stories = files.map((f) => {
    const ext = path.extname(f);
    const id = f.replace(ext, '');

    if (ext === '.json') {
      const data = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'));
      return { id, title: data.title || 'Sem titulo', scenesCount: data.scenes?.length || 0 };
    }

    // .md file
    const md = fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8');
    const story = parseStory(md);
    return { id, title: story.title, scenesCount: story.scenes.length };
  });

  return NextResponse.json({ stories });
}

export async function POST(request: NextRequest) {
  ensureDir();
  const body = await request.json();
  const id = body.id || crypto.randomUUID();
  const filePath = path.join(STORIES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(body.story, null, 2));
  return NextResponse.json({ id, saved: true });
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseStory } from '@/lib/parseStory';

const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    // Try JSON first
    const jsonPath = path.join(STORIES_DIR, `${id}.json`);
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8');
      const story = JSON.parse(raw);
      return NextResponse.json({ story });
    }

    // Try Markdown
    const mdPath = path.join(STORIES_DIR, `${id}.md`);
    if (fs.existsSync(mdPath)) {
      const md = fs.readFileSync(mdPath, 'utf-8');
      const story = parseStory(md);
      return NextResponse.json({ story });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err) {
    console.error('GET /api/stories/[id] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao carregar historia' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const filePath = path.join(STORIES_DIR, `${id}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/stories/[id] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao deletar' },
      { status: 500 }
    );
  }
}

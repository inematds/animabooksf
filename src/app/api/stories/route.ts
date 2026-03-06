import { NextRequest, NextResponse } from 'next/server';
import { listStories, saveStory } from '@/lib/storageAdapter';
import { Story } from '@/lib/types';

export async function GET() {
  try {
    const stories = await listStories();
    return NextResponse.json({ stories });
  } catch (err) {
    console.error('GET /api/stories error:', err);
    return NextResponse.json({ stories: [], error: 'Erro ao listar historias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const story = body.story as Story | undefined;

    // Validacao
    if (!story || typeof story.title !== 'string' || !story.title.trim()) {
      return NextResponse.json({ error: 'Historia precisa de um titulo' }, { status: 400 });
    }
    if (!Array.isArray(story.scenes) || story.scenes.length === 0) {
      return NextResponse.json({ error: 'Historia precisa de pelo menos uma cena' }, { status: 400 });
    }

    const id = await saveStory(body.id || undefined, story);
    return NextResponse.json({ id, saved: true });
  } catch (err) {
    console.error('Save error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao salvar' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getStory, deleteStory } from '@/lib/storageAdapter';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const story = await getStory(id);

    if (!story) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ story });
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
    await deleteStory(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/stories/[id] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao deletar' },
      { status: 500 }
    );
  }
}

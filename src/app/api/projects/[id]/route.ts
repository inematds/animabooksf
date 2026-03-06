import { NextRequest, NextResponse } from 'next/server';
import { getProject, deleteProject } from '@/lib/storageAdapter';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return NextResponse.json({ error: 'Erro ao carregar projeto' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    await deleteProject(id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /api/projects/[id] error:', err);
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 });
  }
}

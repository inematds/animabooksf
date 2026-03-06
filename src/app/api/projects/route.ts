import { NextRequest, NextResponse } from 'next/server';
import { listProjects, saveProject } from '@/lib/storageAdapter';
import { CreativeProject, ProjectType } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') as ProjectType | null;
    const projects = await listProjects(type || undefined);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return NextResponse.json({ projects: [], error: 'Erro ao listar projetos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const project = body.project as CreativeProject | undefined;

    if (!project || !project.type || !project.title?.trim()) {
      return NextResponse.json({ error: 'Projeto precisa de titulo e tipo' }, { status: 400 });
    }

    const id = await saveProject(body.id || undefined, project);
    return NextResponse.json({ id, saved: true });
  } catch (err) {
    console.error('Save project error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao salvar' },
      { status: 500 }
    );
  }
}

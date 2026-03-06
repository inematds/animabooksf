'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreativeProject, ProjectType } from '@/lib/types';
import { useGame } from '@/lib/GameContext';
import CreativeEditor from '@/components/Creative/CreativeEditor';

const DEFAULT_BACKGROUNDS: Record<ProjectType, string> = {
  decoration: 'quarto.svg',
  construction: 'gramado.svg',
  city: 'cidade_base.svg',
  fashion: 'camarim.svg',
  countryside: 'pastagem.svg',
};

const MODE_TITLES: Record<ProjectType, string> = {
  decoration: 'Minha Decoracao',
  construction: 'Minha Construcao',
  city: 'Minha Cidade',
  fashion: 'Meu Look',
  countryside: 'Meu Campo',
};

function createDefaultProject(mode: ProjectType): CreativeProject {
  return {
    type: mode,
    title: MODE_TITLES[mode],
    background: DEFAULT_BACKGROUNDS[mode],
    items: [],
  };
}

export default function CreativeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { recordStoryCreated } = useGame();
  const mode = params.mode as ProjectType;
  const projectId = params.id as string;
  const [project, setProject] = useState<CreativeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const savedIdRef = useRef<string | null>(null);
  const hasRecordedCreate = useRef(false);

  useEffect(() => {
    if (projectId === 'new') {
      setProject(createDefaultProject(mode));
      setLoading(false);
      return;
    }

    fetch(`/api/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setProject(data.project || createDefaultProject(mode));
        setLoading(false);
      })
      .catch(() => {
        setProject(createDefaultProject(mode));
        setLoading(false);
      });
  }, [projectId, mode]);

  const handleSave = useCallback(
    async (updatedProject: CreativeProject) => {
      const id = projectId === 'new' ? savedIdRef.current || undefined : projectId;
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, project: updatedProject }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro de rede' }));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (data.id) {
        if (projectId === 'new' && !hasRecordedCreate.current) {
          hasRecordedCreate.current = true;
          recordStoryCreated();
        }
        savedIdRef.current = data.id;
      }
      if (projectId === 'new' && data.id) {
        router.replace(`/create/${mode}/${data.id}`);
      }
      return data.id || projectId;
    },
    [projectId, mode, router, recordStoryCreated]
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!project) return null;

  return <CreativeEditor initialProject={project} onSave={handleSave} />;
}

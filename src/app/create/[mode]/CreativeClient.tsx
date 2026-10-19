'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getProject, saveProject } from '@/lib/storageAdapter';
import Link from 'next/link';
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

export default function CreativeClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordStoryCreated } = useGame();
  const mode = params.mode as ProjectType;
  const projectId = searchParams.get('id') || 'new';
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

    getProject(projectId)
      .then((p) => {
        setProject(p || createDefaultProject(mode));
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
      const data = { id: await saveProject(id, updatedProject) };
      if (data.id) {
        if (projectId === 'new' && !hasRecordedCreate.current) {
          hasRecordedCreate.current = true;
          recordStoryCreated();
        }
        savedIdRef.current = data.id;
      }
      if (projectId === 'new' && data.id) {
        router.replace(`/create/${mode}/?id=${encodeURIComponent(data.id)}`);
      }
      return data.id || projectId;
    },
    [projectId, mode, router, recordStoryCreated]
  );

  // Modo desconhecido (ex.: /create/decoracao/) quebrava o editor: mostra aviso amigavel
  if (!(mode in MODE_TITLES)) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 p-6 text-center">
        <p className="text-5xl">🧭</p>
        <p className="text-lg font-semibold text-gray-700">Esse modo de criacao nao existe.</p>
        <Link href="/create" className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600">
          Escolher um modo
        </Link>
      </div>
    );
  }

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

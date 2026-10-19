'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getStory } from '@/lib/storageAdapter';
import { Story } from '@/lib/types';
import SceneView from '@/components/Reader/SceneView';

function Reader() {
  const id = useSearchParams().get('id') || '';
  const [storyCarregado, setStory] = useState<Story | null | undefined>(undefined);

  useEffect(() => {
    let vivo = true;
    if (!id) return;
    getStory(id).then((s) => vivo && setStory(s));
    return () => {
      vivo = false;
    };
  }, [id]);

  const story = !id ? null : storyCarregado;

  if (story === undefined) {
    return <div className="text-white/60 animate-pulse">Carregando...</div>;
  }

  if (story === null) {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-white p-6">
        <p className="text-5xl">📖</p>
        <p className="text-lg font-semibold">Essa historia nao esta neste aparelho.</p>
        <p className="text-sm text-white/60 max-w-sm">
          As historias ficam salvas no navegador de quem criou. Peca uma copia (.json) e use &quot;Importar&quot; na tela inicial.
        </p>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-purple-500 font-semibold hover:bg-purple-600">
          Voltar ao inicio
        </Link>
      </div>
    );
  }

  return <SceneView story={story} />;
}

export default function ReaderPage() {
  return (
    <main className="relative w-full h-screen flex items-center justify-center bg-black">
      <Link
        href="/"
        className="absolute top-3 left-3 z-50 px-3 py-1.5 text-sm rounded-full text-white/80 hover:text-white transition"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        ← Inicio
      </Link>
      <Suspense fallback={<div className="text-white/60 animate-pulse">Carregando...</div>}>
        <Reader />
      </Suspense>
    </main>
  );
}

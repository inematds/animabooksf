import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStory } from '@/lib/storageAdapter';
import SceneView from '@/components/Reader/SceneView';

interface Props {
  params: Promise<{ storyId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { storyId } = await params;
  const story = await getStory(storyId);

  if (!story) notFound();

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
      <SceneView story={story} />
    </main>
  );
}

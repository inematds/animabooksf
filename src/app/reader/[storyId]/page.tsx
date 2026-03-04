import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Story } from '@/lib/types';
import { parseStory } from '@/lib/parseStory';
import SceneView from '@/components/Reader/SceneView';

interface Props {
  params: Promise<{ storyId: string }>;
}

async function loadStory(storyId: string): Promise<Story | null> {
  try {
    // Try JSON first
    const jsonPath = path.join(process.cwd(), 'data', 'stories', `${storyId}.json`);
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    }

    // Try Markdown
    const mdPath = path.join(process.cwd(), 'data', 'stories', `${storyId}.md`);
    if (fs.existsSync(mdPath)) {
      const md = fs.readFileSync(mdPath, 'utf-8');
      return parseStory(md);
    }
  } catch (err) {
    console.error(`Error loading story "${storyId}":`, err);
  }

  return null;
}

export default async function ReaderPage({ params }: Props) {
  const { storyId } = await params;
  const story = await loadStory(storyId);

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

import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Story } from '@/lib/types';
import { parseStory } from '@/lib/parseStory';
import SceneView from '@/components/Reader/SceneView';

interface Props {
  params: Promise<{ storyId: string }>;
}

async function loadStory(storyId: string): Promise<Story | null> {
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

  return null;
}

export default async function ReaderPage({ params }: Props) {
  const { storyId } = await params;
  const story = await loadStory(storyId);

  if (!story) notFound();

  return (
    <main className="w-full h-screen flex items-center justify-center bg-black">
      <SceneView story={story} />
    </main>
  );
}

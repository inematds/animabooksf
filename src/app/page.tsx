import fs from 'fs';
import path from 'path';
import HomeContent from './HomeContent';
import { parseStory } from '@/lib/parseStory';

interface StoryMeta {
  id: string;
  title: string;
  scenesCount: number;
}

function getStories(): StoryMeta[] {
  const dir = path.join(process.cwd(), 'data', 'stories');
  if (!fs.existsSync(dir)) return [];
  const stories: StoryMeta[] = [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') || f.endsWith('.md'));

  for (const f of files) {
    const ext = path.extname(f);
    const id = f.replace(ext, '');
    try {
      if (ext === '.json') {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
        stories.push({ id, title: data.title || 'Sem titulo', scenesCount: data.scenes?.length || 0 });
      } else {
        const md = fs.readFileSync(path.join(dir, f), 'utf-8');
        const story = parseStory(md);
        stories.push({ id, title: story.title, scenesCount: story.scenes.length });
      }
    } catch {
      stories.push({ id, title: `(erro ao ler ${f})`, scenesCount: 0 });
    }
  }
  return stories;
}

export default function HomePage() {
  const stories = getStories();
  return <HomeContent stories={stories} />;
}

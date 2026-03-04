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
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') || f.endsWith('.md'))
    .map((f) => {
      const ext = path.extname(f);
      const id = f.replace(ext, '');

      if (ext === '.json') {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
        return {
          id,
          title: data.title || 'Sem titulo',
          scenesCount: data.scenes?.length || 0,
        };
      }

      const md = fs.readFileSync(path.join(dir, f), 'utf-8');
      const story = parseStory(md);
      return { id, title: story.title, scenesCount: story.scenes.length };
    });
}

export default function HomePage() {
  const stories = getStories();
  return <HomeContent stories={stories} />;
}

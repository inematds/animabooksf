import fs from 'fs';
import path from 'path';
import HomeContent from './HomeContent';

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
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return {
        id: f.replace('.json', ''),
        title: data.title || 'Sem titulo',
        scenesCount: data.scenes?.length || 0,
      };
    });
}

export default function HomePage() {
  const stories = getStories();
  return <HomeContent stories={stories} />;
}

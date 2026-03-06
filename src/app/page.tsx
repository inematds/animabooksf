import HomeContent from './HomeContent';
import { listStories } from '@/lib/storageAdapter';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stories = await listStories();
  return <HomeContent stories={stories} />;
}

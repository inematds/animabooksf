'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Story } from '@/lib/types';
import SceneEditor from '@/components/Editor/SceneEditor';

const DEFAULT_STORY: Story = {
  title: 'Nova Historia',
  scenes: [
    {
      id: 1,
      background: 'default_bg.png',
      sprites: [],
      dialogues: [],
    },
  ],
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storyId === 'new') {
      setStory(DEFAULT_STORY);
      setLoading(false);
      return;
    }

    fetch(`/api/stories`)
      .then((r) => r.json())
      .then((data) => {
        const found = data.stories?.find((s: { id: string }) => s.id === storyId);
        if (found) {
          return fetch(`/api/stories/${storyId}`).then((r) => r.json());
        }
        return DEFAULT_STORY;
      })
      .then((data) => {
        setStory(data.story || data || DEFAULT_STORY);
        setLoading(false);
      })
      .catch(() => {
        setStory(DEFAULT_STORY);
        setLoading(false);
      });
  }, [storyId]);

  const handleSave = useCallback(
    async (updatedStory: Story) => {
      const id = storyId === 'new' ? undefined : storyId;
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, story: updatedStory }),
      });
      const data = await res.json();
      if (storyId === 'new' && data.id) {
        router.replace(`/editor/${data.id}`);
      }
    },
    [storyId, router]
  );

  const handlePreview = useCallback(
    async (previewStory: Story) => {
      // Save first, then open reader
      await handleSave(previewStory);
      const id = storyId === 'new' ? 'preview' : storyId;
      window.open(`/reader/${id}`, '_blank');
    },
    [handleSave, storyId]
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-400 animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!story) return null;

  return <SceneEditor initialStory={story} onSave={handleSave} onPreview={handlePreview} />;
}

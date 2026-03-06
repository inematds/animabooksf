'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Story } from '@/lib/types';
import { useGame } from '@/lib/GameContext';
import SceneEditor from '@/components/Editor/SceneEditor';

const DEFAULT_STORY: Story = {
  title: 'Nova Historia',
  scenes: [
    {
      id: 1,
      background: 'default_bg.svg',
      sprites: [],
      dialogues: [],
    },
  ],
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.storyId as string;
  const { recordStoryCreated } = useGame();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const savedIdRef = useRef<string | null>(null);
  const hasRecordedCreate = useRef(false);

  useEffect(() => {
    if (storyId === 'new') {
      setStory(DEFAULT_STORY);
      setLoading(false);
      return;
    }

    // Try loading by ID (supports both .json and .md via the API)
    fetch(`/api/stories/${storyId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setStory(data.story || DEFAULT_STORY);
        setLoading(false);
      })
      .catch(() => {
        setStory(DEFAULT_STORY);
        setLoading(false);
      });
  }, [storyId]);

  const handleSave = useCallback(
    async (updatedStory: Story) => {
      const id = storyId === 'new' ? savedIdRef.current || undefined : storyId;
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, story: updatedStory }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro de rede' }));
        throw new Error(err.error || `Erro ${res.status}`);
      }
      const data = await res.json();
      if (data.id) {
        if (storyId === 'new' && !hasRecordedCreate.current) {
          hasRecordedCreate.current = true;
          recordStoryCreated();
        }
        savedIdRef.current = data.id;
      }
      if (storyId === 'new' && data.id) {
        router.replace(`/editor/${data.id}`);
      }
      return data.id || storyId;
    },
    [storyId, router]
  );

  const handlePreview = useCallback(
    async (previewStory: Story) => {
      const savedId = await handleSave(previewStory);
      window.open(`/reader/${savedId}`, '_blank');
    },
    [handleSave]
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

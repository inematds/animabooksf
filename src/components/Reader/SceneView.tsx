'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { LayoutGroup } from 'framer-motion';
import { Story } from '@/lib/types';
import SpriteLayer from './SpriteLayer';
import DialogueBox from './DialogueBox';

interface SceneViewProps {
  story: Story;
}

export default function SceneView({ story }: SceneViewProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = story.scenes[sceneIndex];
  const totalScenes = story.scenes.length;

  const goToScene = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalScenes) {
        setSceneIndex(index);
      }
    },
    [totalScenes]
  );

  const handleDialogueComplete = useCallback(() => {
    if (sceneIndex < totalScenes - 1) {
      goToScene(sceneIndex + 1);
    }
  }, [sceneIndex, totalScenes, goToScene]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToScene(sceneIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToScene(sceneIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneIndex, goToScene]);

  // Touch swipe support
  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToScene(sceneIndex + 1);
        else goToScene(sceneIndex - 1);
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sceneIndex, goToScene]);

  if (!scene) return null;

  return (
    <div className="flex flex-col items-center w-full h-full bg-black">
      {/* Scene container 16:9 */}
      <div className="relative w-full max-w-4xl aspect-video overflow-hidden bg-gray-900">
        {/* Background */}
        <Image
          src={`/backgrounds/${scene.background}`}
          alt="Cenario"
          fill
          className="object-cover z-0"
          priority
        />

        {/* Sprites */}
        <LayoutGroup>
          <SpriteLayer sprites={scene.sprites} />
        </LayoutGroup>

        {/* Dialogue */}
        <DialogueBox
          key={sceneIndex}
          dialogues={scene.dialogues}
          narrator={scene.narrator}
          onComplete={handleDialogueComplete}
        />

        {/* Navigation arrows */}
        {sceneIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToScene(sceneIndex - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition"
          >
            ←
          </button>
        )}
        {sceneIndex < totalScenes - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToScene(sceneIndex + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition"
          >
            →
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 py-3">
        {story.scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => goToScene(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === sceneIndex
                ? 'bg-purple-500 scale-125'
                : i < sceneIndex
                  ? 'bg-purple-300'
                  : 'bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

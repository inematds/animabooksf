'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Story } from '@/lib/types';
import { useGame } from '@/lib/GameContext';
import SpriteLayer from './SpriteLayer';
import DialogueBox, { DialogueBoxHandle } from './DialogueBox';

interface SceneViewProps {
  story: Story;
}

export default function SceneView({ story }: SceneViewProps) {
  const { recordStoryRead } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const hasMounted = useRef(false);
  const hasRecordedRead = useRef(false);
  const dialogueRef = useRef<DialogueBoxHandle>(null);
  useEffect(() => { hasMounted.current = true; }, []);
  const scene = story.scenes[sceneIndex];
  const totalScenes = story.scenes.length;

  /* ---------- Title intro splash ---------- */
  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(false), 2800);
    return () => clearTimeout(timer);
  }, []);

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
    } else if (!hasRecordedRead.current) {
      hasRecordedRead.current = true;
      recordStoryRead();
    }
  }, [sceneIndex, totalScenes, goToScene, recordStoryRead]);

  const advanceDialogue = useCallback(() => {
    dialogueRef.current?.advance();
  }, []);

  // Keyboard navigation — advance dialogue first, scene change happens via onComplete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        advanceDialogue();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToScene(sceneIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneIndex, goToScene, advanceDialogue]);

  // Touch swipe support — swipe right advances dialogue, swipe left goes back
  useEffect(() => {
    let startX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) advanceDialogue();
        else goToScene(sceneIndex - 1);
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sceneIndex, goToScene, advanceDialogue]);

  if (!scene) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Scene container 16:9 with rounded border */}
      <div
        className="relative w-full max-w-4xl aspect-video overflow-hidden"
        style={{
          borderRadius: '20px',
          border: '3px solid rgba(255,255,255,0.10)',
          boxShadow:
            '0 0 60px rgba(100,60,200,0.12), 0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Background with fade transition + subtle parallax offset */}
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.background}
            initial={hasMounted.current ? { opacity: 0, scale: 1.06 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={`/backgrounds/${scene.background}`}
              alt="Cenario"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)',
          }}
        />

        {/* Subtle bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[20%] z-[2] pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)',
          }}
        />

        {/* Title overlay on first load */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute top-0 left-0 right-0 z-[35] flex justify-center pt-6 pointer-events-none"
            >
              <div
                className="px-6 py-2.5 rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(120,60,220,0.85), rgba(200,80,180,0.80))',
                  backdropFilter: 'blur(12px)',
                  boxShadow:
                    '0 4px 24px rgba(120,60,220,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <h1 className="text-white text-lg sm:text-xl font-bold tracking-wide">
                  {story.title}
                </h1>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sprites */}
        <LayoutGroup>
          <SpriteLayer sprites={scene.sprites} />
        </LayoutGroup>

        {/* Dialogue bubbles */}
        <DialogueBox
          ref={dialogueRef}
          key={sceneIndex}
          dialogues={scene.dialogues}
          narrator={scene.narrator}
          sprites={scene.sprites}
          onComplete={handleDialogueComplete}
        />

        {/* Navigation arrows - larger and kid-friendly */}
        <AnimatePresence>
          {sceneIndex > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                goToScene(sceneIndex - 1);
              }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))',
                backdropFilter: 'blur(8px)',
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow:
                  '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <span className="mr-0.5">&#8249;</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right arrow: advances dialogue, then scene via onComplete */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            advanceDialogue();
          }}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,0.25)',
            boxShadow:
              '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          <span className="ml-0.5">&#8250;</span>
        </motion.button>
      </div>

      {/* Progress stars */}
      <div className="flex items-center gap-2 sm:gap-3 py-4">
        {story.scenes.map((_, i) => {
          const isActive = i === sceneIndex;
          const isVisited = i < sceneIndex;

          return (
            <motion.button
              key={i}
              onClick={() => goToScene(i)}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.85 }}
              animate={
                isActive
                  ? { scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }
                  : { scale: 1 }
              }
              transition={
                isActive
                  ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                  : { duration: 0.2 }
              }
              className="relative flex items-center justify-center"
              style={{ width: isActive ? 28 : 22, height: isActive ? 28 : 22 }}
            >
              {/* Glow behind active star */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(250,200,60,0.6) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                  }}
                />
              )}
              <span
                className="relative z-10 leading-none select-none"
                style={{
                  fontSize: isActive ? 22 : 16,
                  filter: isActive
                    ? 'drop-shadow(0 0 6px rgba(250,200,60,0.8))'
                    : isVisited
                      ? 'drop-shadow(0 0 2px rgba(200,160,60,0.4))'
                      : 'grayscale(0.6) opacity(0.5)',
                  opacity: !isActive && !isVisited ? 0.4 : 1,
                }}
              >
                {isActive || isVisited ? '\u2B50' : '\u2606'}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

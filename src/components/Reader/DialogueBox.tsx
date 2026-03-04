'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialogue } from '@/lib/types';

interface DialogueBoxProps {
  dialogues: Dialogue[];
  narrator?: string;
  onComplete: () => void;
}

/* ------------------------------------------------------------------ */
/*  Derive a soft pastel hue from the character name so each speaker  */
/*  gets a consistent personal color.                                 */
/* ------------------------------------------------------------------ */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const CHARACTER_PALETTES: Record<string, { hue: number; emoji: string }> = {};
function getCharacterPalette(name: string) {
  if (!CHARACTER_PALETTES[name]) {
    const hue = nameToHue(name);
    const emojis = ['🌟', '🦋', '🌸', '🐾', '💫', '🎀', '🍀', '🌈'];
    CHARACTER_PALETTES[name] = {
      hue,
      emoji: emojis[Math.abs(hue) % emojis.length],
    };
  }
  return CHARACTER_PALETTES[name];
}

/* ------------------------------------------------------------------ */

export default function DialogueBox({ dialogues, narrator, onComplete }: DialogueBoxProps) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = narrator
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const hasNarrator = !!narrator;
  const totalItems = dialogues.length + (hasNarrator ? 1 : 0);

  const getCurrentText = useCallback(() => {
    if (hasNarrator && currentIndex === -1) {
      return narrator!;
    }
    const dIdx = hasNarrator ? currentIndex : currentIndex + 1;
    if (dIdx >= 0 && dIdx < dialogues.length) {
      return dialogues[dIdx].text;
    }
    return '';
  }, [currentIndex, hasNarrator, narrator, dialogues]);

  const getCurrentCharacter = useCallback(() => {
    if (hasNarrator && currentIndex === -1) {
      return null; // narrator has no character name
    }
    const dIdx = hasNarrator ? currentIndex : currentIndex + 1;
    if (dIdx >= 0 && dIdx < dialogues.length) {
      return dialogues[dIdx].character;
    }
    return null;
  }, [currentIndex, hasNarrator, dialogues]);

  // Reset when dialogues change
  useEffect(() => {
    setCurrentIndex(hasNarrator ? -1 : 0);
    setDisplayedText('');
    setIsTyping(true);
  }, [dialogues, narrator, hasNarrator]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    const fullText = getCurrentText();
    if (!fullText) {
      setIsTyping(false);
      return;
    }

    if (displayedText.length >= fullText.length) {
      setIsTyping(false);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(fullText.slice(0, displayedText.length + 1));
    }, 30);

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, getCurrentText]);

  const handleClick = useCallback(() => {
    const fullText = getCurrentText();

    // If still typing, show full text immediately
    if (isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }

    // Advance to next dialogue
    const nextIndex = currentIndex + 1;
    const maxIndex = hasNarrator ? dialogues.length - 1 : dialogues.length;

    if (nextIndex <= maxIndex) {
      setCurrentIndex(nextIndex);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      onComplete();
    }
  }, [isTyping, currentIndex, dialogues.length, hasNarrator, getCurrentText, onComplete]);

  const character = getCurrentCharacter();
  const isNarrator = hasNarrator && currentIndex === -1;

  const palette = useMemo(
    () => (character ? getCharacterPalette(character) : null),
    [character]
  );

  if (totalItems === 0) return null;

  /* ---- Narrator overlay ----------------------------------------- */
  if (isNarrator) {
    return (
      <div
        className="absolute bottom-0 left-0 right-0 z-30 cursor-pointer"
        onClick={handleClick}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`narrator-${currentIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="mx-3 mb-3 sm:mx-6 sm:mb-5"
          >
            <div
              className="relative rounded-3xl px-6 py-5 sm:px-8 sm:py-6"
              style={{
                background: 'linear-gradient(135deg, rgba(15,10,40,0.88) 0%, rgba(40,20,80,0.85) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow:
                  '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              {/* Subtle sparkle accents */}
              <div className="absolute top-3 right-5 text-yellow-200/60 text-xs pointer-events-none select-none">
                ✦ ✧
              </div>

              <p className="text-base sm:text-lg leading-relaxed font-medium tracking-wide text-purple-100/95 italic">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-[2px] h-[1.1em] ml-0.5 align-text-bottom rounded-full"
                    style={{ background: 'rgba(200,180,255,0.7)' }}
                  />
                )}
              </p>

              {!isTyping && (
                <motion.div
                  className="flex items-center justify-end gap-1 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                    className="text-purple-300/80 text-lg"
                  >
                    ▾
                  </motion.span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  /* ---- Character dialogue bubble -------------------------------- */
  const hue = palette?.hue ?? 270;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 cursor-pointer"
      onClick={handleClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`dialogue-${currentIndex}`}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          className="mx-3 mb-3 sm:mx-6 sm:mb-5"
        >
          <div
            className="relative rounded-3xl px-5 py-4 sm:px-7 sm:py-5"
            style={{
              background: `linear-gradient(135deg,
                hsla(${hue}, 60%, 97%, 0.92) 0%,
                hsla(${hue}, 40%, 99%, 0.88) 100%)`,
              backdropFilter: 'blur(20px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
              boxShadow: `
                0 8px 32px hsla(${hue}, 50%, 30%, 0.15),
                0 2px 8px rgba(0,0,0,0.06),
                inset 0 1px 0 rgba(255,255,255,0.6)`,
              border: `1.5px solid hsla(${hue}, 50%, 85%, 0.5)`,
            }}
          >
            {/* Speech bubble pointer triangle */}
            <div
              className="absolute -bottom-[10px] left-8 sm:left-12 w-0 h-0"
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: `10px solid hsla(${hue}, 60%, 97%, 0.92)`,
                filter: `drop-shadow(0 2px 2px hsla(${hue}, 50%, 30%, 0.08))`,
              }}
            />

            {/* Character name badge */}
            {character && (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm select-none">{palette?.emoji}</span>
                <span
                  className="inline-block px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold tracking-wide text-white"
                  style={{
                    background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 30) % 360}, 60%, 50%))`,
                    boxShadow: `0 2px 8px hsla(${hue}, 60%, 40%, 0.3)`,
                  }}
                >
                  {character}
                </span>
              </div>
            )}

            {/* Dialogue text */}
            <p className="text-base sm:text-lg leading-relaxed font-medium text-gray-800">
              {displayedText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.55 }}
                  className="inline-block w-[2.5px] h-[1.1em] ml-0.5 align-text-bottom rounded-full"
                  style={{ background: `hsl(${hue}, 65%, 55%)` }}
                />
              )}
            </p>

            {/* Continue indicator */}
            {!isTyping && (
              <motion.div
                className="flex items-center justify-end gap-1 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                  className="text-lg"
                  style={{ color: `hsl(${hue}, 55%, 55%)` }}
                >
                  ▾
                </motion.span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

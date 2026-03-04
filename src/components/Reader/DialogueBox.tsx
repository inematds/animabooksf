'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Dialogue } from '@/lib/types';

interface DialogueBoxProps {
  dialogues: Dialogue[];
  narrator?: string;
  onComplete: () => void;
}

function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getCharacterPalette(name: string) {
  const hue = nameToHue(name);
  const emojis = ['🌟', '🦋', '🌸', '🐾', '💫', '🎀', '🍀', '🌈'];
  return { hue, emoji: emojis[Math.abs(hue) % emojis.length] };
}

export default function DialogueBox({ dialogues, narrator, onComplete }: DialogueBoxProps) {
  // Build ordered list: narrator first (if exists), then dialogues
  const items = useMemo(() => {
    const list: Array<{ type: 'narrator'; text: string } | { type: 'dialogue'; dialogue: Dialogue }> = [];
    if (narrator) {
      list.push({ type: 'narrator', text: narrator });
    }
    for (const d of dialogues) {
      list.push({ type: 'dialogue', dialogue: d });
    }
    return list;
  }, [narrator, dialogues]);

  const [itemIndex, setItemIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentItem = items[itemIndex];

  const fullText = useMemo(() => {
    if (!currentItem) return '';
    return currentItem.type === 'narrator' ? currentItem.text : currentItem.dialogue.text;
  }, [currentItem]);

  // Reset on new scene (new props)
  useEffect(() => {
    setItemIndex(0);
    setDisplayedText('');
    setIsTyping(true);
  }, [dialogues, narrator]);

  // Typewriter
  useEffect(() => {
    if (!isTyping || !fullText) return;
    if (displayedText.length >= fullText.length) {
      setIsTyping(false);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayedText(fullText.slice(0, displayedText.length + 1));
    }, 30);
    return () => clearTimeout(timer);
  }, [displayedText, isTyping, fullText]);

  const handleClick = useCallback(() => {
    // Still typing → show full text
    if (isTyping) {
      setDisplayedText(fullText);
      setIsTyping(false);
      return;
    }
    // Advance
    if (itemIndex < items.length - 1) {
      setItemIndex(itemIndex + 1);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      onComplete();
    }
  }, [isTyping, fullText, itemIndex, items.length, onComplete]);

  if (items.length === 0 || !currentItem) return null;

  const isNarrator = currentItem.type === 'narrator';
  const character = currentItem.type === 'dialogue' ? currentItem.dialogue.character : null;
  const palette = character ? getCharacterPalette(character) : null;
  const hue = palette?.hue ?? 270;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        key={`item-${itemIndex}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="mx-3 mb-3 sm:mx-6 sm:mb-5"
      >
        {isNarrator ? (
          /* ---- Narrator ---- */
          <div
            className="relative rounded-2xl px-5 py-4 sm:px-7 sm:py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(15,10,40,0.88), rgba(40,20,80,0.85))',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div className="absolute top-2 right-4 text-yellow-200/60 text-xs pointer-events-none select-none">
              ✦ ✧
            </div>
            <p className="text-base sm:text-lg leading-relaxed font-medium tracking-wide text-purple-100 italic">
              {displayedText}
              {isTyping && <span className="animate-pulse ml-0.5 text-purple-300">|</span>}
            </p>
            {!isTyping && (
              <div className="flex justify-end mt-2">
                <span className="animate-bounce text-purple-300/80 text-sm">▾</span>
              </div>
            )}
          </div>
        ) : (
          /* ---- Dialogue ---- */
          <div
            className="relative rounded-2xl px-5 py-4 sm:px-7 sm:py-5"
            style={{
              background: `linear-gradient(135deg, hsla(${hue}, 60%, 97%, 0.93), hsla(${hue}, 40%, 99%, 0.9))`,
              backdropFilter: 'blur(16px)',
              boxShadow: `0 8px 32px hsla(${hue}, 50%, 30%, 0.15), inset 0 1px 0 rgba(255,255,255,0.6)`,
              border: `1.5px solid hsla(${hue}, 50%, 85%, 0.5)`,
            }}
          >
            {/* Character name badge */}
            {character && (
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-sm">{palette?.emoji}</span>
                <span
                  className="inline-block px-3 py-0.5 rounded-full text-xs sm:text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 30) % 360}, 60%, 50%))`,
                  }}
                >
                  {character}
                </span>
              </div>
            )}
            <p className="text-base sm:text-lg leading-relaxed font-medium text-gray-800">
              {displayedText}
              {isTyping && (
                <span className="animate-pulse ml-0.5" style={{ color: `hsl(${hue}, 65%, 55%)` }}>|</span>
              )}
            </p>
            {!isTyping && (
              <div className="flex justify-end mt-2">
                <span className="animate-bounce text-sm" style={{ color: `hsl(${hue}, 55%, 55%)` }}>▾</span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

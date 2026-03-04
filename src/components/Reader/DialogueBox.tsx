'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialogue } from '@/lib/types';

interface DialogueBoxProps {
  dialogues: Dialogue[];
  narrator?: string;
  onComplete: () => void;
}

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

  if (totalItems === 0) return null;

  const character = getCurrentCharacter();
  const isNarrator = hasNarrator && currentIndex === -1;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 cursor-pointer"
      onClick={handleClick}
    >
      <div className="mx-4 mb-4 rounded-2xl bg-white/90 backdrop-blur-sm p-4 shadow-lg border border-white/50">
        {character && (
          <div className="text-sm font-bold text-purple-600 mb-1">
            {character}
          </div>
        )}
        <p className={`text-base leading-relaxed text-gray-800 ${isNarrator ? 'italic text-gray-600' : ''}`}>
          {displayedText}
          {isTyping && <span className="animate-pulse">|</span>}
        </p>
        {!isTyping && (
          <div className="text-right text-xs text-gray-400 mt-1">
            toque para continuar ▸
          </div>
        )}
      </div>
    </div>
  );
}

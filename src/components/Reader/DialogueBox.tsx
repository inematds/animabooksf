'use client';

import { useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dialogue, SpriteState } from '@/lib/types';

export interface DialogueBoxHandle {
  advance: () => void;
}

interface DialogueBoxProps {
  dialogues: Dialogue[];
  narrator?: string;
  sprites: SpriteState[];
  onComplete: () => void;
}

function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/* Default bubble positions distributed across the scene */
const DEFAULT_POSITIONS = [
  { left: 20, top: 15 },
  { left: 65, top: 12 },
  { left: 35, top: 8 },
  { left: 75, top: 20 },
  { left: 15, top: 25 },
];

function getBubblePosition(
  dialogue: Dialogue,
  index: number,
  sprites: SpriteState[]
): { left: number; top: number } {
  // Try to find the sprite matching this character
  const charLower = dialogue.character.toLowerCase();
  const sprite = sprites.find((s) => s.id.toLowerCase() === charLower);

  if (sprite) {
    const spriteX = parseFloat(sprite.x);
    const spriteY = parseFloat(sprite.y);
    // Position bubble above and slightly offset from sprite
    return {
      left: Math.max(5, Math.min(70, spriteX - 5)),
      top: Math.max(3, spriteY - 45),
    };
  }

  return DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length];
}

/* ---- Draggable Speech Bubble ---- */
function SpeechBubble({
  character,
  text,
  initialLeft,
  initialTop,
  index,
  visible,
}: {
  character: string;
  text: string;
  initialLeft: number;
  initialTop: number;
  index: number;
  visible: boolean;
}) {
  const hue = nameToHue(character);
  const [pos, setPos] = useState({ left: initialLeft, top: initialTop });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, left: pos.left, top: pos.top };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
    setPos({
      left: Math.max(0, Math.min(85, dragStart.current.left + dx)),
      top: Math.max(0, Math.min(80, dragStart.current.top + dy)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute z-20 select-none"
      style={{
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        maxWidth: '52%',
        cursor: 'grab',
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="px-3 py-2 select-none relative"
        style={{
          background: 'rgba(254,254,254,0.96)',
          border: `2px solid hsl(${hue}, 50%, 30%)`,
          borderRadius: '14px',
          boxShadow: `2px 3px 0px rgba(0,0,0,0.35)`,
        }}
      >
        {/* Triangle pointer */}
        <div
          style={{
            position: 'absolute',
            bottom: -13,
            left: 14,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `12px solid hsl(${hue}, 50%, 30%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            left: 16,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '10px solid rgba(254,254,254,0.96)',
          }}
        />
        {/* Character name */}
        <p
          className="font-bold tracking-wide mb-0.5"
          style={{
            fontSize: 'clamp(11px, 3vw, 14px)',
            color: `hsl(${hue}, 60%, 35%)`,
          }}
        >
          {character}
        </p>
        {/* Text */}
        <p
          className="leading-tight text-gray-900"
          style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
        >
          {text}
        </p>
      </div>
    </motion.div>
  );
}

const DialogueBox = forwardRef<DialogueBoxHandle, DialogueBoxProps>(
  function DialogueBox({ dialogues, narrator, sprites, onComplete }, ref) {
    // Show all dialogues as bubbles at once, narrator as top bar
    // "advance" just goes to next scene
    const [showNarrator, setShowNarrator] = useState(!!narrator);
    const [visibleCount, setVisibleCount] = useState(0);
    const totalSteps = (narrator ? 1 : 0) + dialogues.length;
    const allRevealed = visibleCount >= dialogues.length;

    // Reset when scene changes
    useEffect(() => {
      setShowNarrator(!!narrator);
      setVisibleCount(0);
    }, [dialogues, narrator]);

    // Auto-reveal bubbles one by one
    useEffect(() => {
      if (visibleCount >= dialogues.length) return;
      const timer = setTimeout(() => {
        setVisibleCount((c) => c + 1);
      }, 600);
      return () => clearTimeout(timer);
    }, [visibleCount, dialogues.length]);

    const advance = useCallback(() => {
      if (visibleCount < dialogues.length) {
        // Reveal all at once
        setVisibleCount(dialogues.length);
        return;
      }
      onComplete();
    }, [visibleCount, dialogues.length, onComplete]);

    useImperativeHandle(ref, () => ({ advance }), [advance]);

    const bubblePositions = useMemo(
      () => dialogues.map((d, i) => getBubblePosition(d, i, sprites)),
      [dialogues, sprites]
    );

    return (
      <>
        {/* Narrator bar at top */}
        {showNarrator && narrator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
          >
            <div
              className="mx-2 mt-2 sm:mx-4 sm:mt-3 px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(15,10,40,0.88), rgba(40,20,80,0.85))',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <p className="text-sm sm:text-base leading-relaxed font-medium tracking-wide text-purple-100 italic">
                {narrator}
              </p>
            </div>
          </motion.div>
        )}

        {/* Speech bubbles positioned on the scene */}
        {dialogues.map((d, i) => (
          <SpeechBubble
            key={`${d.character}-${i}`}
            character={d.character}
            text={d.text}
            initialLeft={bubblePositions[i].left}
            initialTop={bubblePositions[i].top}
            index={i}
            visible={i < visibleCount}
          />
        ))}

        {/* Tap zone for advancing — only when all bubbles shown */}
        {allRevealed && (
          <div
            className="absolute bottom-0 left-0 right-0 h-16 z-30 cursor-pointer flex items-center justify-center"
            onClick={advance}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white/80"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Toque para continuar ▸
            </motion.div>
          </div>
        )}
      </>
    );
  }
);

export default DialogueBox;

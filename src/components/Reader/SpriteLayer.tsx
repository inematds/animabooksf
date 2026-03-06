'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SpriteState } from '@/lib/types';

interface SpriteLayerProps {
  sprites: SpriteState[];
}

export default function SpriteLayer({ sprites }: SpriteLayerProps) {
  const [mounted, setMounted] = useState(false);
  const [errorSprites, setErrorSprites] = useState<Set<string>>(new Set());
  useEffect(() => setMounted(true), []);

  return (
    <AnimatePresence mode="popLayout">
      {sprites.map((sprite, idx) => (
        <motion.div
          key={sprite.id}
          layoutId={`sprite-${sprite.id}`}
          style={{
            position: 'absolute',
            left: sprite.x,
            bottom: `${100 - parseFloat(sprite.y)}%`,
            transform: 'translateX(-50%)',
            zIndex: 10 + sprite.zIndex,
          }}
          initial={mounted ? { opacity: 0, y: 60, scale: 0.7 } : false}
          animate={{
            opacity: 1,
            y: 0,
            scale: sprite.scale,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.85, filter: 'blur(2px)' }}
          transition={{
            type: 'spring',
            stiffness: 160,
            damping: 16,
            mass: 0.8,
            delay: mounted ? idx * 0.08 : 0,
          }}
          className="pointer-events-none select-none"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8 + idx * 0.4,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            {errorSprites.has(sprite.id) ? (
              <div className="w-[100px] h-[150px] bg-purple-200/50 rounded-xl flex items-center justify-center text-3xl">
                ?
              </div>
            ) : (
              <Image
                src={`/sprites/${sprite.filename}`}
                alt={sprite.id}
                width={200}
                height={300}
                className="object-contain"
                draggable={false}
                onError={() => setErrorSprites((prev) => new Set(prev).add(sprite.id))}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
                  height: 'auto',
                  maxHeight: '35vh',
                  width: 'auto',
                }}
              />
            )}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: '60%',
                height: '6px',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, transparent 70%)',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

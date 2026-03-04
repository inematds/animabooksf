'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SpriteState } from '@/lib/types';

interface SpriteLayerProps {
  sprites: SpriteState[];
}

export default function SpriteLayer({ sprites }: SpriteLayerProps) {
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
          initial={{ opacity: 0, y: 60, scale: 0.7 }}
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
            delay: idx * 0.08,
          }}
          className="h-[40%] w-auto max-w-[30%] pointer-events-none select-none"
        >
          {/* Idle floating animation wrapper */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2.8 + idx * 0.4,
              ease: 'easeInOut',
            }}
            className="w-full h-full relative"
          >
            {/* The sprite image */}
            <Image
              src={`/sprites/${sprite.filename}`}
              alt={sprite.id}
              fill
              className="object-contain"
              draggable={false}
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
              }}
            />

            {/* Ground shadow beneath the sprite */}
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

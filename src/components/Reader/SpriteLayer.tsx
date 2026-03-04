'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SpriteState } from '@/lib/types';

interface SpriteLayerProps {
  sprites: SpriteState[];
}

export default function SpriteLayer({ sprites }: SpriteLayerProps) {
  return (
    <AnimatePresence mode="popLayout">
      {sprites.map((sprite) => (
        <motion.img
          key={sprite.id}
          layoutId={`sprite-${sprite.id}`}
          src={`/sprites/${sprite.filename}`}
          alt={sprite.id}
          draggable={false}
          style={{
            position: 'absolute',
            left: sprite.x,
            bottom: `${100 - parseFloat(sprite.y)}%`,
            transform: `translateX(-50%)`,
            zIndex: 10 + sprite.zIndex,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: sprite.scale,
          }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="h-[30%] w-auto max-w-[25%] object-contain pointer-events-none select-none"
        />
      ))}
    </AnimatePresence>
  );
}

'use client';

import { ReactNode } from 'react';
import { GameProvider } from '@/lib/GameContext';
import AchievementPopup from '@/components/Gamification/AchievementPopup';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      {children}
      <AchievementPopup />
    </GameProvider>
  );
}

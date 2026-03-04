'use client';

import { useGame } from '@/lib/GameContext';
import { getXpProgress, getLevelTitle } from '@/lib/gamification';

export default function XPBar() {
  const { profile } = useGame();
  const progress = getXpProgress(profile.xp);
  const title = getLevelTitle(profile.level);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Level badge */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
        {profile.level}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-sm mb-0.5">
          <span className="font-semibold text-gray-700 truncate">{title}</span>
          <span className="text-xs text-gray-400">{progress.current}/{progress.needed} XP</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-yellow-500">🪙</span>
        <span className="font-semibold text-sm text-gray-700">{profile.coins}</span>
      </div>
    </div>
  );
}

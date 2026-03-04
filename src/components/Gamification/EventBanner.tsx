'use client';

import { useGame } from '@/lib/GameContext';

export default function EventBanner() {
  const { todayEvent } = useGame();

  if (!todayEvent) return null;

  const bonusText = () => {
    switch (todayEvent.bonusType) {
      case 'xp_multiplier':
        return `XP x${todayEvent.bonusValue}`;
      case 'coins_multiplier':
        return `Moedas x${todayEvent.bonusValue}`;
      case 'special_rewards':
        return 'Recompensas especiais';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{todayEvent.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{todayEvent.name}</h3>
          <p className="text-sm text-white/80">{todayEvent.description}</p>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
          {bonusText()}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Challenge } from '@/lib/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const progress = (challenge.current / challenge.target) * 100;
  const isComplete = challenge.current >= challenge.target;
  const isExpired = new Date(challenge.expiresAt) < new Date();

  const timeLeft = () => {
    const diff = new Date(challenge.expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h restantes`;
    const days = Math.floor(hours / 24);
    return `${days}d restantes`;
  };

  return (
    <div
      className={`rounded-xl p-4 border transition ${
        isComplete
          ? 'bg-green-50 border-green-200'
          : isExpired
            ? 'bg-gray-50 border-gray-200 opacity-60'
            : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm text-gray-800">{challenge.title}</h4>
          <p className="text-xs text-gray-500">{challenge.description}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            challenge.type === 'daily'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-purple-100 text-purple-600'
          }`}
        >
          {challenge.type === 'daily' ? 'Diario' : 'Semanal'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-0.5">
          <span>
            {challenge.current}/{challenge.target}
          </span>
          <span>{timeLeft()}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isComplete ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>+{challenge.rewardXp} XP</span>
        <span>+{challenge.rewardCoins} 🪙</span>
        {challenge.rewardSprite && <span>+ Sprite especial!</span>}
        {isComplete && <span className="ml-auto text-green-600 font-semibold">Completo!</span>}
      </div>
    </div>
  );
}

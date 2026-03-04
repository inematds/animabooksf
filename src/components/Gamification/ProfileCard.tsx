'use client';

import { useGame } from '@/lib/GameContext';
import { getXpProgress, getLevelTitle } from '@/lib/gamification';

export default function ProfileCard() {
  const { profile } = useGame();
  const progress = getXpProgress(profile.xp);
  const title = getLevelTitle(profile.level);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-lg text-gray-800">{profile.name}</h2>
          <p className="text-sm text-purple-500">{title} - Nivel {profile.level}</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>XP</span>
          <span>{progress.current}/{progress.needed}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{profile.storiesRead}</div>
          <div className="text-xs text-purple-400">Historias Lidas</div>
        </div>
        <div className="bg-pink-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">{profile.storiesCreated}</div>
          <div className="text-xs text-pink-400">Historias Criadas</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{profile.currentStreak}</div>
          <div className="text-xs text-orange-400">Dias Seguidos</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">🪙 {profile.coins}</div>
          <div className="text-xs text-yellow-500">Moedas</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          Conquistas ({profile.unlockedAchievements.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {profile.unlockedAchievements.length > 0 ? (
            profile.unlockedAchievements.map((id) => (
              <span key={id} className="text-xl" title={id}>
                {/* We'd look up the achievement icon here */}
                ⭐
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-400">Nenhuma conquista ainda. Continue lendo!</span>
          )}
        </div>
      </div>
    </div>
  );
}

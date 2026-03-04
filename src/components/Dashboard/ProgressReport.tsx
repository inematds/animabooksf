'use client';

import { useGame } from '@/lib/GameContext';
import { DEFAULT_ACHIEVEMENTS } from '@/lib/gamification';

export default function ProgressReport() {
  const { profile, missions, challenges } = useGame();

  const completedMissions = missions.filter((m) => m.completedAt).length;
  const completedChallenges = challenges.filter((c) => c.current >= c.target).length;
  const unlockedAchievements = profile.unlockedAchievements.length;
  const totalAchievements = DEFAULT_ACHIEVEMENTS.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Relatorio de Progresso</h3>

      <div className="space-y-3">
        {/* Reading stats */}
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="text-sm text-gray-700">Historias lidas</span>
          </div>
          <span className="font-bold text-purple-600">{profile.storiesRead}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <span className="text-sm text-gray-700">Historias criadas</span>
          </div>
          <span className="font-bold text-pink-600">{profile.storiesCreated}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span className="text-sm text-gray-700">Sequencia atual</span>
          </div>
          <span className="font-bold text-orange-600">{profile.currentStreak} dias</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <span className="text-sm text-gray-700">Recorde de sequencia</span>
          </div>
          <span className="font-bold text-blue-600">{profile.longestStreak} dias</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-sm text-gray-700">Missoes completas</span>
          </div>
          <span className="font-bold text-green-600">{completedMissions}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="text-sm text-gray-700">Desafios completos</span>
          </div>
          <span className="font-bold text-yellow-600">{completedChallenges}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎖️</span>
            <span className="text-sm text-gray-700">Conquistas</span>
          </div>
          <span className="font-bold text-indigo-600">
            {unlockedAchievements}/{totalAchievements}
          </span>
        </div>

        {/* XP total */}
        <div className="mt-2 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-700">{profile.xp} XP</div>
          <div className="text-xs text-purple-500">Total acumulado - Nivel {profile.level}</div>
        </div>
      </div>
    </div>
  );
}

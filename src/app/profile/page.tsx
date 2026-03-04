'use client';

import Link from 'next/link';
import { useGame } from '@/lib/GameContext';
import ProfileCard from '@/components/Gamification/ProfileCard';
import XPBar from '@/components/Gamification/XPBar';
import { DEFAULT_ACHIEVEMENTS } from '@/lib/gamification';

const RARITY_COLORS = {
  common: 'bg-gray-100 border-gray-200 text-gray-700',
  rare: 'bg-blue-50 border-blue-200 text-blue-700',
  epic: 'bg-purple-50 border-purple-200 text-purple-700',
  legendary: 'bg-yellow-50 border-yellow-200 text-yellow-700',
};

const RARITY_LABELS = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Lendario',
};

export default function ProfilePage() {
  const { profile } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Animabook SF
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-purple-600">
              Painel
            </Link>
            <Link href="/challenges" className="text-sm text-gray-600 hover:text-purple-600">
              Desafios
            </Link>
            <Link href="/events" className="text-sm text-gray-600 hover:text-purple-600">
              Eventos
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <XPBar />
        </div>

        <div className="mb-6">
          <ProfileCard />
        </div>

        {/* Achievements gallery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Todas as Conquistas ({profile.unlockedAchievements.length}/{DEFAULT_ACHIEVEMENTS.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEFAULT_ACHIEVEMENTS.map((ach) => {
              const unlocked = profile.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-3 rounded-xl border transition ${
                    unlocked
                      ? RARITY_COLORS[ach.rarity]
                      : 'bg-gray-50 border-gray-100 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>
                      {ach.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-sm">{ach.name}</div>
                      <div className="text-xs opacity-75">{ach.description}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] opacity-50">{RARITY_LABELS[ach.rarity]}</span>
                        <span className="text-[10px] opacity-50">
                          +{ach.rewardXp} XP, +{ach.rewardCoins} moedas
                        </span>
                      </div>
                    </div>
                    {unlocked && <span className="ml-auto text-green-500">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

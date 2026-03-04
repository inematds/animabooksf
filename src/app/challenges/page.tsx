'use client';

import Link from 'next/link';
import { useGame } from '@/lib/GameContext';
import XPBar from '@/components/Gamification/XPBar';
import ChallengeCard from '@/components/Gamification/ChallengeCard';

export default function ChallengesPage() {
  const { challenges } = useGame();

  const dailyChallenges = challenges.filter((c) => c.type === 'daily');
  const weeklyChallenges = challenges.filter((c) => c.type === 'weekly');

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

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Desafios</h1>

        {/* Daily */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-blue-500">&#9679;</span> Desafios Diarios
          </h2>
          <div className="space-y-3">
            {dailyChallenges.length > 0 ? (
              dailyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                Nenhum desafio diario disponivel.
              </p>
            )}
          </div>
        </section>

        {/* Weekly */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-purple-500">&#9679;</span> Desafios Semanais
          </h2>
          <div className="space-y-3">
            {weeklyChallenges.length > 0 ? (
              weeklyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                Nenhum desafio semanal disponivel.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

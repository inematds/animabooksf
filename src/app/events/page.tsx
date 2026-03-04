'use client';

import Link from 'next/link';
import { useGame } from '@/lib/GameContext';
import EventBanner from '@/components/Gamification/EventBanner';
import WeeklyCalendar from '@/components/Gamification/WeeklyCalendar';
import XPBar from '@/components/Gamification/XPBar';

const DAY_NAMES_FULL = [
  'Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sabado',
];

export default function EventsPage() {
  const { weeklyEvents, todayEvent } = useGame();
  const today = new Date().getDay();

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
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <XPBar />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Eventos da Semana</h1>

        {/* Today's event */}
        <div className="mb-6">
          <EventBanner />
        </div>

        {/* Calendar */}
        <div className="mb-6">
          <WeeklyCalendar />
        </div>

        {/* All events detail */}
        <div className="space-y-3">
          {weeklyEvents.map((event) => {
            const isToday = event.dayOfWeek === today;
            const bonusText =
              event.bonusType === 'xp_multiplier'
                ? `XP x${event.bonusValue}`
                : event.bonusType === 'coins_multiplier'
                  ? `Moedas x${event.bonusValue}`
                  : 'Recompensas especiais';

            return (
              <div
                key={event.id}
                className={`p-4 rounded-xl border transition ${
                  isToday
                    ? 'bg-purple-50 border-purple-200 shadow-md'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{event.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{event.name}</h3>
                      {isToday && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">
                          Hoje!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{DAY_NAMES_FULL[event.dayOfWeek]}</span>
                      <span className="text-purple-500 font-semibold">{bonusText}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

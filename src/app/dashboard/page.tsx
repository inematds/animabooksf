'use client';

import Link from 'next/link';
import { useGame } from '@/lib/GameContext';
import ProfileCard from '@/components/Gamification/ProfileCard';
import MissionManager from '@/components/Dashboard/MissionManager';
import UsageRulesEditor from '@/components/Dashboard/UsageRules';
import ProgressReport from '@/components/Dashboard/ProgressReport';
import EventBanner from '@/components/Gamification/EventBanner';
import WeeklyCalendar from '@/components/Gamification/WeeklyCalendar';

export default function DashboardPage() {
  const { profile } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Animabook SF
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/challenges" className="text-sm text-gray-600 hover:text-purple-600">
              Desafios
            </Link>
            <Link href="/events" className="text-sm text-gray-600 hover:text-purple-600">
              Eventos
            </Link>
            <Link href="/profile" className="text-sm text-gray-600 hover:text-purple-600">
              Perfil
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Painel do Educador
        </h1>

        {/* Event banner */}
        <div className="mb-6">
          <EventBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ProfileCard />
            <WeeklyCalendar />
          </div>

          {/* Center column */}
          <div className="space-y-6">
            <MissionManager />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <UsageRulesEditor childName={profile.name} />
            <ProgressReport />
          </div>
        </div>
      </div>
    </div>
  );
}

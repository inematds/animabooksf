'use client';

import { useState } from 'react';
import { UsageRule } from '@/lib/gamification';

interface UsageRulesProps {
  childName: string;
}

const STORAGE_KEY = 'animabook_sf_rules';

function loadRules(): UsageRule {
  if (typeof window === 'undefined') {
    return {
      childId: 'local',
      maxMinutesPerDay: 60,
      allowedHoursStart: '08:00',
      allowedHoursEnd: '20:00',
      creationAllowed: true,
      ageRating: 'all',
    };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          childId: 'local',
          maxMinutesPerDay: 60,
          allowedHoursStart: '08:00',
          allowedHoursEnd: '20:00',
          creationAllowed: true,
          ageRating: 'all',
        };
  } catch {
    return {
      childId: 'local',
      maxMinutesPerDay: 60,
      allowedHoursStart: '08:00',
      allowedHoursEnd: '20:00',
      creationAllowed: true,
      ageRating: 'all',
    };
  }
}

export default function UsageRulesEditor({ childName }: UsageRulesProps) {
  const [rules, setRules] = useState<UsageRule>(loadRules);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-4">
        Regras de Uso - {childName}
      </h3>

      <div className="space-y-4">
        {/* Max time */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">
            Tempo maximo por dia (minutos)
          </label>
          <input
            type="range"
            min={15}
            max={180}
            step={15}
            value={rules.maxMinutesPerDay}
            onChange={(e) =>
              setRules((p) => ({ ...p, maxMinutesPerDay: parseInt(e.target.value) }))
            }
            className="w-full"
          />
          <div className="text-sm text-purple-600 font-semibold">
            {rules.maxMinutesPerDay} minutos ({Math.floor(rules.maxMinutesPerDay / 60)}h
            {rules.maxMinutesPerDay % 60 > 0 ? `${rules.maxMinutesPerDay % 60}min` : ''})
          </div>
        </div>

        {/* Allowed hours */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Horario inicial</label>
            <input
              type="time"
              value={rules.allowedHoursStart}
              onChange={(e) => setRules((p) => ({ ...p, allowedHoursStart: e.target.value }))}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Horario final</label>
            <input
              type="time"
              value={rules.allowedHoursEnd}
              onChange={(e) => setRules((p) => ({ ...p, allowedHoursEnd: e.target.value }))}
              className="w-full text-sm px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Creation allowed */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Permitir criar historias</label>
          <button
            onClick={() => setRules((p) => ({ ...p, creationAllowed: !p.creationAllowed }))}
            className={`w-12 h-6 rounded-full transition ${
              rules.creationAllowed ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                rules.creationAllowed ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Age rating */}
        <div>
          <label className="text-sm text-gray-600 block mb-1">Classificacao etaria</label>
          <select
            value={rules.ageRating}
            onChange={(e) =>
              setRules((p) => ({ ...p, ageRating: e.target.value as UsageRule['ageRating'] }))
            }
            className="w-full text-sm px-3 py-2 border rounded-lg"
          >
            <option value="all">Todas as idades</option>
            <option value="3+">3+ anos</option>
            <option value="6+">6+ anos</option>
            <option value="9+">9+ anos</option>
            <option value="12+">12+ anos</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {saved ? 'Salvo!' : 'Salvar Regras'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Mission } from '@/lib/gamification';
import { useGame } from '@/lib/GameContext';

export default function MissionManager() {
  const { missions, addMission, completeMission } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    type: 'reading' as Mission['type'],
    rewardXp: 20,
    rewardCoins: 10,
    target: 1,
    dueDate: '',
  });

  const handleAdd = () => {
    if (!newMission.title) return;

    addMission({
      id: crypto.randomUUID(),
      title: newMission.title,
      description: newMission.description,
      type: newMission.type,
      rewardXp: newMission.rewardXp,
      rewardCoins: newMission.rewardCoins,
      target: newMission.target,
      current: 0,
      progress: 0,
      dueDate: newMission.dueDate || undefined,
    });

    setNewMission({
      title: '',
      description: '',
      type: 'reading',
      rewardXp: 20,
      rewardCoins: 10,
      target: 1,
      dueDate: '',
    });
    setShowForm(false);
  };

  const activeMissions = missions.filter((m) => !m.completedAt);
  const completedMissions = missions.filter((m) => m.completedAt);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Missoes</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          + Nova Missao
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Titulo da missao"
            value={newMission.title}
            onChange={(e) => setNewMission((p) => ({ ...p, title: e.target.value }))}
            className="w-full text-sm px-3 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Descricao"
            value={newMission.description}
            onChange={(e) => setNewMission((p) => ({ ...p, description: e.target.value }))}
            className="w-full text-sm px-3 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newMission.type}
              onChange={(e) =>
                setNewMission((p) => ({ ...p, type: e.target.value as Mission['type'] }))
              }
              className="text-sm px-3 py-2 border rounded-lg"
            >
              <option value="reading">Leitura</option>
              <option value="creation">Criacao</option>
              <option value="educational">Educativa</option>
            </select>
            <input
              type="date"
              value={newMission.dueDate}
              onChange={(e) => setNewMission((p) => ({ ...p, dueDate: e.target.value }))}
              className="text-sm px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-500">Meta</label>
              <input
                type="number"
                min={1}
                value={newMission.target}
                onChange={(e) => setNewMission((p) => ({ ...p, target: parseInt(e.target.value) || 1 }))}
                className="w-full text-sm px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">XP</label>
              <input
                type="number"
                min={0}
                value={newMission.rewardXp}
                onChange={(e) =>
                  setNewMission((p) => ({ ...p, rewardXp: parseInt(e.target.value) || 0 }))
                }
                className="w-full text-sm px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Moedas</label>
              <input
                type="number"
                min={0}
                value={newMission.rewardCoins}
                onChange={(e) =>
                  setNewMission((p) => ({ ...p, rewardCoins: parseInt(e.target.value) || 0 }))
                }
                className="w-full text-sm px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              className="text-sm px-4 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              Criar
            </button>
          </div>
        </div>
      )}

      {/* Active missions */}
      {activeMissions.length > 0 ? (
        <div className="space-y-2 mb-4">
          {activeMissions.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">
                {m.type === 'reading' ? '📖' : m.type === 'creation' ? '✍️' : '🧠'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800">{m.title}</div>
                <div className="text-xs text-gray-500">{m.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(m.current / m.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {m.current}/{m.target}
                  </span>
                </div>
              </div>
              <button
                onClick={() => completeMission(m.id)}
                className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Completar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">Nenhuma missao ativa.</p>
      )}

      {/* Completed */}
      {completedMissions.length > 0 && (
        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-gray-600">
            {completedMissions.length} missao(oes) completa(s)
          </summary>
          <div className="mt-2 space-y-1">
            {completedMissions.map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-2 bg-green-50 rounded text-green-700">
                <span>✅</span>
                <span className="truncate">{m.title}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

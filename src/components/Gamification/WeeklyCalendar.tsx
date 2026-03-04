'use client';

import { useGame } from '@/lib/GameContext';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function WeeklyCalendar() {
  const { weeklyEvents } = useGame();
  const today = new Date().getDay();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-700 mb-3">Eventos da Semana</h3>
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((day, i) => {
          const event = weeklyEvents.find((e) => e.dayOfWeek === i);
          const isToday = i === today;
          return (
            <div
              key={i}
              className={`flex flex-col items-center p-2 rounded-lg transition ${
                isToday
                  ? 'bg-purple-100 ring-2 ring-purple-400'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span
                className={`text-xs font-semibold mb-1 ${isToday ? 'text-purple-700' : 'text-gray-500'}`}
              >
                {day}
              </span>
              {event ? (
                <>
                  <span className="text-lg">{event.icon}</span>
                  <span className="text-[9px] text-center text-gray-500 mt-0.5 leading-tight">
                    {event.name.split(' ').slice(-1)[0]}
                  </span>
                </>
              ) : (
                <span className="text-lg text-gray-300">-</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

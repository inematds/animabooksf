'use client';

import { Scene } from '@/lib/types';

interface TimelineProps {
  scenes: Scene[];
  currentIndex: number;
  onSelectScene: (index: number) => void;
  onAddScene: () => void;
  onRemoveScene: (index: number) => void;
}

export default function Timeline({
  scenes,
  currentIndex,
  onSelectScene,
  onAddScene,
  onRemoveScene,
}: TimelineProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-t border-gray-200 overflow-x-auto">
      <span className="text-xs text-gray-500 shrink-0">Cenas:</span>
      {scenes.map((scene, i) => (
        <div key={i} className="relative group">
          <button
            onClick={() => onSelectScene(i)}
            className={`w-12 h-8 rounded text-xs font-semibold transition ${
              i === currentIndex
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-400'
            }`}
          >
            {i + 1}
          </button>
          {scenes.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveScene(i);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddScene}
        className="w-12 h-8 rounded border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-400 hover:text-purple-400 transition text-lg"
      >
        +
      </button>
    </div>
  );
}

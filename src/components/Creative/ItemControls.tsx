'use client';

import { PlacedItem } from '@/lib/types';

interface ItemControlsProps {
  item: PlacedItem;
  onUpdate: (updates: Partial<PlacedItem>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function ItemControls({ item, onUpdate, onDelete, onDuplicate }: ItemControlsProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border-t border-gray-200">
      {/* Scale */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
        <span className="text-[10px] text-gray-400">Tamanho</span>
        <button
          onClick={() => onUpdate({ scale: Math.max(0.2, item.scale - 0.15) })}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs text-gray-600"
        >
          -
        </button>
        <span className="text-xs text-gray-500 w-8 text-center">{item.scale.toFixed(1)}</span>
        <button
          onClick={() => onUpdate({ scale: Math.min(4, item.scale + 0.15) })}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs text-gray-600"
        >
          +
        </button>
      </div>

      {/* Rotation */}
      <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
        <span className="text-[10px] text-gray-400">Girar</span>
        <button
          onClick={() => onUpdate({ rotation: item.rotation - 15 })}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs text-gray-600"
        >
          ↺
        </button>
        <button
          onClick={() => onUpdate({ rotation: item.rotation + 15 })}
          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-xs text-gray-600"
        >
          ↻
        </button>
      </div>

      {/* Flip */}
      <button
        onClick={() => onUpdate({ flipped: !item.flipped })}
        className={`w-6 h-6 rounded text-xs mr-1 ${item.flipped ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        title="Espelhar"
      >
        ↔
      </button>

      {/* Layer */}
      <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
        <span className="text-[10px] text-gray-400">Camada</span>
        {(['back', 'main', 'front'] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => onUpdate({ layer })}
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              item.layer === layer
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {layer === 'back' ? 'Fundo' : layer === 'main' ? 'Meio' : 'Frente'}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="w-6 h-6 rounded bg-blue-100 hover:bg-blue-200 text-xs text-blue-600"
        title="Duplicar"
      >
        ⎘
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-6 h-6 rounded bg-red-100 hover:bg-red-200 text-xs text-red-600"
        title="Remover"
      >
        ✕
      </button>
    </div>
  );
}

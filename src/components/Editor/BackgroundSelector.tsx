'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BackgroundSelectorProps {
  currentBackground: string;
  onSelect: (filename: string) => void;
  onClose: () => void;
}

export default function BackgroundSelector({
  currentBackground,
  onSelect,
  onClose,
}: BackgroundSelectorProps) {
  const [backgrounds, setBackgrounds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/assets?type=background')
      .then((r) => r.json())
      .then((data) => setBackgrounds(data.files?.map((f: { filename: string }) => f.filename) || []))
      .catch(() => setBackgrounds([]));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Selecionar Fundo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto">
          {backgrounds.map((bg) => (
            <button
              key={bg}
              onClick={() => {
                onSelect(bg);
                onClose();
              }}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                bg === currentBackground
                  ? 'border-purple-500 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <Image src={`/backgrounds/${bg}`} alt={bg} fill className="object-cover" />
              <span className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/50 text-white text-center py-0.5 truncate">
                {bg}
              </span>
            </button>
          ))}
          {backgrounds.length === 0 && (
            <p className="col-span-3 text-sm text-gray-400 text-center py-8">
              Adicione PNGs em /public/backgrounds/
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

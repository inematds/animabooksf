'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SpritePanelProps {
  onAddSprite: (filename: string) => void;
}

interface SpriteFile {
  filename: string;
  characterId: string;
}

export default function SpritePanel({ onAddSprite }: SpritePanelProps) {
  const [sprites, setSprites] = useState<SpriteFile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/assets?type=sprite')
      .then((r) => r.json())
      .then((data) => setSprites(data.files || []))
      .catch(() => setSprites([]));
  }, []);

  const filtered = sprites.filter(
    (s) =>
      s.filename.toLowerCase().includes(search.toLowerCase()) ||
      s.characterId.toLowerCase().includes(search.toLowerCase())
  );

  // Group by character
  const grouped = filtered.reduce<Record<string, SpriteFile[]>>((acc, s) => {
    if (!acc[s.characterId]) acc[s.characterId] = [];
    acc[s.characterId].push(s);
    return acc;
  }, {});

  return (
    <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Sprites</h3>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm px-2 py-1 border rounded bg-white"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {Object.entries(grouped).map(([charId, files]) => (
          <div key={charId}>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">
              {charId}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {files.map((s) => (
                <button
                  key={s.filename}
                  onClick={() => onAddSprite(s.filename)}
                  className="relative aspect-square bg-white rounded border border-gray-200 hover:border-purple-400 hover:shadow transition p-1 group"
                  title={s.filename}
                >
                  <Image
                    src={`/sprites/${s.filename}`}
                    alt={s.filename}
                    fill
                    className="object-contain p-1"
                  />
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-white/80 truncate">
                    {s.filename.replace(/\.\w+$/, '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
        {sprites.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Adicione imagens em /public/sprites/
          </p>
        )}
      </div>
    </div>
  );
}

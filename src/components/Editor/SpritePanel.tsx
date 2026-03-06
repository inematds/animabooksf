'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface SpritePanelProps {
  onAddSprite: (filename: string) => void;
}

interface SpriteFile {
  filename: string;
  characterId: string;
}

/* Map filename prefix to category */
const CATEGORY_MAP: Record<string, { label: string; icon: string; order: number }> = {
  animal: { label: 'Animais', icon: '🐾', order: 2 },
  natureza: { label: 'Natureza', icon: '🌿', order: 3 },
  comida: { label: 'Comida', icon: '🍰', order: 4 },
  movel: { label: 'Moveis', icon: '🪑', order: 5 },
  veiculo: { label: 'Veiculos', icon: '🚗', order: 6 },
  brinquedo: { label: 'Brinquedos', icon: '🧸', order: 7 },
  escola: { label: 'Escola', icon: '📚', order: 8 },
  magia: { label: 'Magia', icon: '✨', order: 9 },
};

function getCategory(filename: string): string {
  const prefix = filename.split('_')[0];
  if (CATEGORY_MAP[prefix]) return prefix;
  return 'personagem';
}

function getCategoryMeta(cat: string) {
  if (cat === 'personagem') return { label: 'Personagens', icon: '👤', order: 1 };
  return CATEGORY_MAP[cat] || { label: cat, icon: '📦', order: 99 };
}

export default function SpritePanel({ onAddSprite }: SpritePanelProps) {
  const [sprites, setSprites] = useState<SpriteFile[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set());

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

  // Group by category
  const categories = useMemo(() => {
    const groups: Record<string, SpriteFile[]> = {};
    for (const s of filtered) {
      const cat = getCategory(s.filename);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    // Sort categories by order
    return Object.entries(groups)
      .map(([cat, files]) => ({ cat, meta: getCategoryMeta(cat), files }))
      .sort((a, b) => a.meta.order - b.meta.order);
  }, [filtered]);

  // If searching, show all; otherwise show selected category
  const showAll = search.length > 0;

  return (
    <div className="w-60 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Sprites & Objetos</h3>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm px-2 py-1.5 border rounded bg-white"
        />
      </div>

      {/* Category tabs */}
      {!showAll && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
          {categories.map(({ cat, meta }) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                activeCategory === cat
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
              title={meta.label}
            >
              {meta.icon} {meta.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {categories
          .filter(({ cat }) => showAll || !activeCategory || activeCategory === cat)
          .map(({ cat, meta, files }) => {
            // Within personagem category, sub-group by characterId
            if (cat === 'personagem') {
              const grouped = files.reduce<Record<string, SpriteFile[]>>((acc, s) => {
                if (!acc[s.characterId]) acc[s.characterId] = [];
                acc[s.characterId].push(s);
                return acc;
              }, {});

              return (
                <div key={cat}>
                  <div className="text-xs font-bold text-purple-600 uppercase mb-1.5 flex items-center gap-1">
                    <span>{meta.icon}</span> {meta.label}
                    <span className="text-gray-400 font-normal ml-auto">{files.length}</span>
                  </div>
                  {Object.entries(grouped).map(([charId, charFiles]) => (
                    <div key={charId} className="mb-2">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1 pl-1">
                        {charId}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {charFiles.map((s) => (
                          <SpriteButton
                            key={s.filename}
                            sprite={s}
                            hasError={errorImages.has(s.filename)}
                            onAdd={onAddSprite}
                            onError={() => setErrorImages((prev) => new Set(prev).add(s.filename))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            // Object categories - flat grid
            return (
              <div key={cat}>
                <div className="text-xs font-bold text-purple-600 uppercase mb-1.5 flex items-center gap-1">
                  <span>{meta.icon}</span> {meta.label}
                  <span className="text-gray-400 font-normal ml-auto">{files.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {files.map((s) => (
                    <SpriteButton
                      key={s.filename}
                      sprite={s}
                      hasError={errorImages.has(s.filename)}
                      onAdd={onAddSprite}
                      onError={() => setErrorImages((prev) => new Set(prev).add(s.filename))}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        {sprites.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">
            Carregando sprites...
          </p>
        )}
      </div>
    </div>
  );
}

function SpriteButton({
  sprite,
  hasError,
  onAdd,
  onError,
}: {
  sprite: SpriteFile;
  hasError: boolean;
  onAdd: (filename: string) => void;
  onError: () => void;
}) {
  const label = sprite.filename
    .replace(/\.\w+$/, '')
    .replace(/^(animal|natureza|comida|movel|veiculo|brinquedo|escola|magia)_/, '');

  return (
    <button
      onClick={() => onAdd(sprite.filename)}
      className="relative aspect-square bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition p-1 group"
      title={label}
    >
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">?</div>
      ) : (
        <Image
          src={`/sprites/${sprite.filename}`}
          alt={label}
          fill
          className="object-contain p-1"
          onError={onError}
        />
      )}
      <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-white/90 truncate rounded-b-lg px-0.5">
        {label}
      </span>
    </button>
  );
}

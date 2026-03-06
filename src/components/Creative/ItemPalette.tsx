'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProjectType } from '@/lib/types';

interface ItemPaletteProps {
  mode: ProjectType;
  onStartDrag: (assetPath: string, filename: string) => void;
}

interface CategoryData {
  category: string;
  files: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  moveis: 'Moveis',
  plantas: 'Plantas',
  decoracao: 'Decoracao',
  blocos: 'Blocos',
  telhados: 'Telhados',
  portas: 'Portas/Janelas',
  predios: 'Predios',
  natureza: 'Natureza',
  ruas: 'Ruas',
  veiculos: 'Veiculos',
  personagens: 'Personagens',
  roupas: 'Roupas',
  acessorios: 'Acessorios',
  calcados: 'Calcados',
  chapeus: 'Chapeus',
  bolsas: 'Bolsas',
  // Countryside categories
  animais: 'Animais',
  acampamento: 'Acampamento',
  agua: 'Agua',
  fazenda: 'Fazenda',
  // Sprite categories (shared assets)
  'sprites:personagens': 'Personagens',
  'sprites:animais': 'Animais',
  'sprites:natureza': 'Natureza',
  'sprites:comida': 'Comida',
  'sprites:moveis': 'Moveis',
  'sprites:veiculos': 'Veiculos',
  'sprites:brinquedos': 'Brinquedos',
  'sprites:escola': 'Escola',
  'sprites:magia': 'Magia',
  'sprites:moda_items': 'Moda',
};

const CATEGORY_ICONS: Record<string, string> = {
  moveis: '🪑',
  plantas: '🌿',
  decoracao: '🖼️',
  blocos: '🧱',
  telhados: '🏠',
  portas: '🚪',
  predios: '🏢',
  natureza: '🌳',
  ruas: '🛣️',
  veiculos: '🚗',
  personagens: '🧑',
  roupas: '👗',
  acessorios: '💍',
  calcados: '👟',
  chapeus: '🎩',
  bolsas: '👜',
  animais: '🐴',
  acampamento: '⛺',
  agua: '🌊',
  fazenda: '🚜',
  'sprites:personagens': '🧒',
  'sprites:animais': '🐾',
  'sprites:natureza': '🌿',
  'sprites:comida': '🍰',
  'sprites:moveis': '🪑',
  'sprites:veiculos': '🚗',
  'sprites:brinquedos': '🧸',
  'sprites:escola': '📚',
  'sprites:magia': '✨',
  'sprites:moda_items': '👗',
};

export default function ItemPalette({ mode, onStartDrag }: ItemPaletteProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/creative-assets?mode=${mode}`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (data.categories?.length > 0) setOpenCat(data.categories[0].category);
      })
      .catch(() => setCategories([]));
  }, [mode]);

  const filtered = search
    ? categories.map((c) => ({
        ...c,
        files: c.files.filter((f) => f.toLowerCase().includes(search.toLowerCase())),
      })).filter((c) => c.files.length > 0)
    : categories;

  return (
    <div className="w-56 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Itens</h3>
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm px-2 py-1.5 border rounded-lg bg-gray-50"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((cat) => (
          <div key={cat.category}>
            <button
              onClick={() => setOpenCat(openCat === cat.category ? null : cat.category)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border-b border-gray-100"
            >
              <span>{CATEGORY_ICONS[cat.category] || '📦'}</span>
              <span>{CATEGORY_LABELS[cat.category] || cat.category}</span>
              <span className="ml-auto text-xs text-gray-400">{cat.files.length}</span>
              <span className="text-xs text-gray-300">{openCat === cat.category ? '▾' : '▸'}</span>
            </button>
            {openCat === cat.category && (
              <div className="grid grid-cols-2 gap-1 p-2">
                {cat.files.map((filename) => {
                  const isSprite = cat.category.startsWith('sprites:');
                  const assetPath = isSprite ? 'sprites:' : `${mode}/${cat.category}`;
                  const imgSrc = isSprite
                    ? `/sprites/${filename}`
                    : `/assets/${mode}/${cat.category}/${filename}`;
                  return (
                    <div
                      key={filename}
                      draggable
                      onDragStart={() => onStartDrag(assetPath, filename)}
                      className="relative aspect-square bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow cursor-grab active:cursor-grabbing transition p-1"
                      title={filename.replace(/\.\w+$/, '')}
                    >
                      <Image
                        src={imgSrc}
                        alt={filename}
                        fill
                        className="object-contain p-1"
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-white/80 rounded-b truncate px-0.5">
                        {filename.replace(/\.\w+$/, '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">
            Nenhum item encontrado para este modo.
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CreativeProject, PlacedItem, ProjectType } from '@/lib/types';
import CreativeCanvas from './CreativeCanvas';
import ItemPalette from './ItemPalette';
import ItemControls from './ItemControls';

interface CreativeEditorProps {
  initialProject: CreativeProject;
  onSave: (project: CreativeProject) => Promise<string | void>;
}

const MODE_LABELS: Record<ProjectType, string> = {
  decoration: 'Decoracao',
  construction: 'Construcao',
  city: 'Cidade',
};

const MODE_ICONS: Record<ProjectType, string> = {
  decoration: '🏠',
  construction: '🔨',
  city: '🌆',
};

export default function CreativeEditor({ initialProject, onSave }: CreativeEditorProps) {
  const [project, setProject] = useState<CreativeProject>(initialProject);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [bgError, setBgError] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const pendingDrag = useRef<{ assetPath: string; filename: string } | null>(null);
  const projectRef = useRef(project);
  projectRef.current = project;

  const mode = project.type;
  const bgPath = `/assets/${mode}/fundos/`;

  // Load backgrounds
  useEffect(() => {
    fetch(`/api/creative-assets?mode=${mode}&type=backgrounds`)
      .then((r) => r.json())
      .then((data) => setBackgrounds(data.backgrounds || []))
      .catch(() => setBackgrounds([]));
  }, [mode]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await onSave(projectRef.current);
        setSaveMsg('Auto-salvo');
        setTimeout(() => setSaveMsg(''), 2000);
      } catch {
        setSaveMsg('Falha no auto-save');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [onSave]);

  const selectedItem = project.items.find((i) => i.id === selectedItemId) || null;

  const updateItem = useCallback((id: string, updates: Partial<PlacedItem>) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const addItem = useCallback((assetPath: string, filename: string, x: number, y: number) => {
    const newItem: PlacedItem = {
      id: crypto.randomUUID(),
      assetId: filename,
      category: assetPath,
      x,
      y,
      scale: 1,
      rotation: 0,
      zIndex: project.items.length,
      layer: 'main',
      flipped: false,
    };
    setProject((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedItemId(newItem.id);
  }, [project.items.length]);

  const handleStartDrag = useCallback((assetPath: string, filename: string) => {
    pendingDrag.current = { assetPath, filename };
  }, []);

  const handleDropNewItem = useCallback((x: number, y: number) => {
    if (pendingDrag.current) {
      addItem(pendingDrag.current.assetPath, pendingDrag.current.filename, x, y);
      pendingDrag.current = null;
    }
  }, [addItem]);

  const deleteItem = useCallback((id: string) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
    if (selectedItemId === id) setSelectedItemId(null);
  }, [selectedItemId]);

  const duplicateItem = useCallback((id: string) => {
    const item = project.items.find((i) => i.id === id);
    if (!item) return;
    const newItem: PlacedItem = {
      ...item,
      id: crypto.randomUUID(),
      x: Math.min(95, item.x + 3),
      y: Math.min(95, item.y + 3),
      zIndex: project.items.length,
    };
    setProject((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setSelectedItemId(newItem.id);
  }, [project.items]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await onSave(project);
      setSaveMsg('Salvo!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Erro ao salvar');
      setTimeout(() => setSaveMsg(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b shadow-sm">
        <Link
          href="/gallery"
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition flex items-center gap-1"
        >
          ← Voltar
        </Link>
        <span className="text-lg">{MODE_ICONS[mode]}</span>
        <span className="text-xs text-gray-400 font-semibold uppercase">{MODE_LABELS[mode]}</span>
        <input
          type="text"
          value={project.title}
          onChange={(e) => setProject((prev) => ({ ...prev, title: e.target.value }))}
          className="text-lg font-bold border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none px-1"
          placeholder="Nome do projeto"
        />
        <div className="flex-1" />
        <button
          onClick={() => setShowBgPicker(!showBgPicker)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
        >
          Fundo
        </button>
        <span className="text-xs text-gray-400">{project.items.length} itens</span>
        {saveMsg && (
          <span className={`text-xs animate-pulse ${
            saveMsg === 'Salvo!' || saveMsg === 'Auto-salvo' ? 'text-green-600' : 'text-yellow-500'
          }`}>{saveMsg}</span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-3 py-1.5 text-sm rounded transition ${
            saving ? 'bg-gray-300 text-gray-500' : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Item palette */}
        <ItemPalette mode={mode} onStartDrag={handleStartDrag} />

        {/* Canvas */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-4xl">
              <CreativeCanvas
                background={project.background}
                backgroundPath={bgPath}
                items={project.items}
                selectedItemId={selectedItemId}
                onSelectItem={setSelectedItemId}
                onUpdateItem={updateItem}
                onDropNewItem={handleDropNewItem}
                bgError={bgError}
                onBgError={() => setBgError(true)}
              />
            </div>
          </div>

          {/* Item controls (when selected) */}
          {selectedItem && (
            <ItemControls
              item={selectedItem}
              onUpdate={(updates) => updateItem(selectedItem.id, updates)}
              onDelete={() => deleteItem(selectedItem.id)}
              onDuplicate={() => duplicateItem(selectedItem.id)}
            />
          )}
        </div>
      </div>

      {/* Background picker modal */}
      {showBgPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowBgPicker(false)}>
          <div className="bg-white rounded-xl shadow-xl w-[600px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Selecionar Fundo</h3>
              <button onClick={() => setShowBgPicker(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3 overflow-y-auto">
              {backgrounds.map((bg) => (
                <button
                  key={bg}
                  onClick={() => {
                    setProject((prev) => ({ ...prev, background: bg }));
                    setBgError(false);
                    setShowBgPicker(false);
                  }}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                    bg === project.background ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Image src={`${bgPath}${bg}`} alt={bg} fill className="object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/50 text-white text-center py-0.5 truncate">
                    {bg.replace(/\.\w+$/, '')}
                  </span>
                </button>
              ))}
              {backgrounds.length === 0 && (
                <p className="col-span-3 text-sm text-gray-400 text-center py-8">Nenhum fundo disponivel.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

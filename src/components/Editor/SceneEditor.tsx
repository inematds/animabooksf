'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Story, Scene, SpriteState, Dialogue } from '@/lib/types';
import { spriteIdFromFilename } from '@/lib/parseStory';
import SpritePanel from './SpritePanel';
import DialogueEditor from './DialogueEditor';
import Timeline from './Timeline';
import BackgroundSelector from './BackgroundSelector';

interface SceneEditorProps {
  initialStory: Story;
  onSave: (story: Story) => Promise<string | void> | void;
  onPreview: (story: Story) => void;
}

function createEmptyScene(id: number): Scene {
  return {
    id,
    background: 'default_bg.svg',
    sprites: [],
    dialogues: [],
  };
}

// Capitalize first letter for display
function displayName(id: string): string {
  const name = id.replace(/^(animal|natureza|comida|movel|veiculo|brinquedo|escola|magia|moda)_/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function SceneEditor({ initialStory, onSave, onPreview }: SceneEditorProps) {
  const [story, setStory] = useState<Story>(initialStory);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
  const [showBgSelector, setShowBgSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [bgError, setBgError] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef(story);
  const didDragRef = useRef(false);
  storyRef.current = story;

  const scene = story.scenes[sceneIndex];

  // Keyboard shortcuts for scale
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSpriteId) return;
      // Ignore if focus is on input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '+' || e.key === '=' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleScaleChange(selectedSpriteId, Math.min(3, (getSprite(selectedSpriteId)?.scale ?? 1) + 0.1));
      } else if (e.key === '-' || e.key === '_' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleScaleChange(selectedSpriteId, Math.max(0.3, (getSprite(selectedSpriteId)?.scale ?? 1) - 0.1));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleRemoveSprite(selectedSpriteId);
      } else if (e.key === 'Escape') {
        setSelectedSpriteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSpriteId, sceneIndex]);

  const getSprite = (id: string): SpriteState | undefined => {
    return story.scenes[sceneIndex]?.sprites.find((s) => s.id === id);
  };

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await onSave(storyRef.current);
        setSaveMsg('Auto-salvo');
        setTimeout(() => setSaveMsg(''), 2000);
      } catch {
        setSaveMsg('Falha no auto-save');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [onSave]);

  const updateScene = useCallback(
    (updater: (scene: Scene) => Scene) => {
      setStory((prev) => {
        const scenes = [...prev.scenes];
        scenes[sceneIndex] = updater(scenes[sceneIndex]);
        return { ...prev, scenes };
      });
    },
    [sceneIndex]
  );

  const handleAddSprite = useCallback(
    (filename: string) => {
      const baseId = spriteIdFromFilename(filename);
      updateScene((s) => {
        const isCharacter = !filename.match(/^(animal|natureza|comida|movel|veiculo|brinquedo|escola|magia|moda)_/);
        if (isCharacter) {
          const existing = s.sprites.find((sp) => sp.id === baseId);
          if (existing) {
            return {
              ...s,
              sprites: s.sprites.map((sp) =>
                sp.id === baseId ? { ...sp, filename } : sp
              ),
            };
          }
        }
        const existingIds = s.sprites.filter((sp) => sp.id === baseId || sp.id.startsWith(baseId + '_'));
        const id = existingIds.length === 0 ? baseId : `${baseId}_${Date.now()}`;
        return {
          ...s,
          sprites: [
            ...s.sprites,
            {
              id,
              filename,
              x: `${30 + Math.random() * 40}%`,
              y: `${60 + Math.random() * 20}%`,
              scale: 1.0,
              zIndex: s.sprites.length,
            },
          ],
        };
      });
    },
    [updateScene]
  );

  const handleRemoveSprite = useCallback(
    (spriteId: string) => {
      updateScene((s) => ({
        ...s,
        sprites: s.sprites.filter((sp) => sp.id !== spriteId),
      }));
      if (selectedSpriteId === spriteId) setSelectedSpriteId(null);
    },
    [updateScene, selectedSpriteId]
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent, spriteId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedSpriteId(spriteId);
      setIsDragging(true);
      didDragRef.current = false;
    },
    []
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedSpriteId || !canvasRef.current) return;

      didDragRef.current = true;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.max(5, Math.min(95, x));
      const clampedY = Math.max(5, Math.min(95, y));

      updateScene((s) => ({
        ...s,
        sprites: s.sprites.map((sp) =>
          sp.id === selectedSpriteId
            ? { ...sp, x: `${clampedX.toFixed(1)}%`, y: `${clampedY.toFixed(1)}%` }
            : sp
        ),
      }));
    },
    [isDragging, selectedSpriteId, updateScene]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking empty area (not on a sprite)
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset?.canvasBg === 'true') {
      setSelectedSpriteId(null);
    }
  }, []);

  const handleScaleChange = useCallback(
    (spriteId: string, scale: number) => {
      updateScene((s) => ({
        ...s,
        sprites: s.sprites.map((sp) =>
          sp.id === spriteId ? { ...sp, scale } : sp
        ),
      }));
    },
    [updateScene]
  );

  const handleDialoguesChange = useCallback(
    (dialogues: Dialogue[], narrator?: string) => {
      updateScene((s) => ({ ...s, dialogues, narrator }));
    },
    [updateScene]
  );

  const handleAddScene = useCallback(() => {
    setStory((prev) => ({
      ...prev,
      scenes: [...prev.scenes, createEmptyScene(prev.scenes.length + 1)],
    }));
    setSceneIndex(story.scenes.length);
  }, [story.scenes.length]);

  const handleRemoveScene = useCallback(
    (index: number) => {
      if (story.scenes.length <= 1) return;
      if (!confirm(`Remover cena ${index + 1}?`)) return;
      setStory((prev) => ({
        ...prev,
        scenes: prev.scenes
          .filter((_, i) => i !== index)
          .map((s, i) => ({ ...s, id: i + 1 })),
      }));
      if (sceneIndex >= story.scenes.length - 1) {
        setSceneIndex(Math.max(0, sceneIndex - 1));
      }
    },
    [story.scenes.length, sceneIndex]
  );

  const handleSetBackground = useCallback(
    (bg: string) => {
      setBgError(false);
      updateScene((s) => ({ ...s, background: bg }));
    },
    [updateScene]
  );

  // Get sprite display names for dialogue character dropdown
  const spriteNames = scene
    ? scene.sprites.map((s) => displayName(s.id))
    : [];

  if (!scene) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b shadow-sm">
        <Link
          href="/"
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition flex items-center gap-1"
          title="Voltar ao menu principal"
        >
          &#8592; Inicio
        </Link>
        <input
          type="text"
          value={story.title}
          onChange={(e) => setStory((prev) => ({ ...prev, title: e.target.value }))}
          className="text-lg font-bold border-b border-transparent hover:border-gray-300 focus:border-purple-500 outline-none px-1"
          placeholder="Titulo da historia"
        />
        <div className="flex-1" />
        <button
          onClick={() => setShowBgSelector(true)}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
        >
          Fundo
        </button>
        <button
          onClick={() => onPreview(story)}
          className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 rounded transition"
          title="Abre a historia no leitor para ver como fica"
        >
          Ver Historia
        </button>
        {saveMsg && (
          <span className={`text-xs animate-pulse ${
            saveMsg === 'Salvo!' || saveMsg === 'Auto-salvo'
              ? 'text-green-600'
              : saveMsg === 'Falha no auto-save'
                ? 'text-yellow-500'
                : 'text-red-500'
          }`}>{saveMsg}</span>
        )}
        <button
          onClick={async () => {
            setSaving(true);
            setSaveMsg('');
            try {
              await onSave(story);
              setSaveMsg('Salvo!');
              setTimeout(() => setSaveMsg(''), 2000);
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Erro ao salvar';
              setSaveMsg(msg);
              console.error('Save failed:', err);
              setTimeout(() => setSaveMsg(''), 5000);
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className={`px-3 py-1.5 text-sm rounded transition ${
            saving
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Main area: sprites panel | canvas + timeline | right panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Sprite catalog */}
        <SpritePanel onAddSprite={handleAddSprite} />

        {/* Center: Canvas + Timeline */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 p-4 flex items-center justify-center overflow-auto">
            <div
              ref={canvasRef}
              className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={handleCanvasClick}
            >
              {/* Background */}
              {bgError ? (
                <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                  Fundo nao encontrado
                </div>
              ) : (
                <Image
                  src={`/backgrounds/${scene.background}`}
                  alt="Fundo"
                  fill
                  className="object-cover pointer-events-none"
                  data-canvas-bg="true"
                  onError={() => setBgError(true)}
                />
              )}

              {/* Sprites */}
              {scene.sprites.map((sprite) => (
                <div
                  key={sprite.id}
                  className={`absolute cursor-grab active:cursor-grabbing group ${
                    selectedSpriteId === sprite.id ? 'ring-2 ring-purple-500 ring-offset-2 rounded' : ''
                  }`}
                  style={{
                    left: sprite.x,
                    bottom: `${100 - parseFloat(sprite.y)}%`,
                    transform: `translateX(-50%) scale(${sprite.scale})`,
                    zIndex: 10 + sprite.zIndex,
                  }}
                  onMouseDown={(e) => handleCanvasMouseDown(e, sprite.id)}
                >
                  <Image
                    src={`/sprites/${sprite.filename}`}
                    alt={sprite.id}
                    width={120}
                    height={120}
                    className="object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                  {/* Sprite label */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                    {displayName(sprite.id)}
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSprite(sprite.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                  {/* Scale controls */}
                  {selectedSpriteId === sprite.id && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded shadow px-2 py-0.5 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScaleChange(sprite.id, Math.max(0.3, sprite.scale - 0.1));
                        }}
                        className="text-sm text-gray-600 hover:text-purple-600 w-5 h-5 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-[10px] text-gray-400 w-8 text-center">
                        {sprite.scale.toFixed(1)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScaleChange(sprite.id, Math.min(3, sprite.scale + 0.1));
                        }}
                        className="text-sm text-gray-600 hover:text-purple-600 w-5 h-5 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Live dialogue balloon preview */}
              {scene.narrator && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-100/90 border border-amber-300 text-amber-900 text-xs px-3 py-1.5 rounded-lg max-w-[80%] text-center italic pointer-events-none z-30">
                  {scene.narrator}
                </div>
              )}
              {scene.dialogues.map((d, i) => {
                if (!d.character || !d.text) return null;
                const sprite = scene.sprites.find(
                  (s) => displayName(s.id).toLowerCase() === d.character.toLowerCase()
                );
                const left = sprite ? parseFloat(sprite.x) : 30 + i * 20;
                const bottom = sprite ? 100 - parseFloat(sprite.y) + 18 : 40;
                return (
                  <div
                    key={`balloon-${i}`}
                    className="absolute pointer-events-none z-30"
                    style={{
                      left: `${Math.max(5, Math.min(75, left - 10))}%`,
                      bottom: `${Math.min(85, bottom)}%`,
                    }}
                  >
                    <div className="bg-white border-2 border-gray-700 rounded-xl px-2 py-1 max-w-[160px] shadow-md relative">
                      <div className="text-[9px] font-bold text-purple-600">{d.character}</div>
                      <div className="text-[10px] text-gray-800 leading-tight">{d.text}</div>
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-700" />
                      <div className="absolute -bottom-1.5 left-[17px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected sprite info bar */}
          {selectedSpriteId && (
            <div className="bg-purple-50 border-t border-purple-200 px-4 py-1.5 flex items-center gap-3 text-sm">
              <span className="font-medium text-purple-700">{displayName(selectedSpriteId)}</span>
              <span className="text-gray-500 text-xs">Arraste para mover | +/- para escala | Del para remover</span>
              <div className="flex-1" />
              <button
                onClick={() => handleScaleChange(selectedSpriteId, Math.max(0.3, (getSprite(selectedSpriteId)?.scale ?? 1) - 0.1))}
                className="px-2 py-0.5 bg-white border rounded text-purple-600 hover:bg-purple-100"
              >
                -
              </button>
              <span className="text-xs text-gray-500 w-8 text-center">
                {(getSprite(selectedSpriteId)?.scale ?? 1).toFixed(1)}
              </span>
              <button
                onClick={() => handleScaleChange(selectedSpriteId, Math.min(3, (getSprite(selectedSpriteId)?.scale ?? 1) + 0.1))}
                className="px-2 py-0.5 bg-white border rounded text-purple-600 hover:bg-purple-100"
              >
                +
              </button>
              <button
                onClick={() => handleRemoveSprite(selectedSpriteId)}
                className="px-2 py-0.5 bg-red-50 border border-red-200 rounded text-red-600 hover:bg-red-100 text-xs"
              >
                Remover
              </button>
            </div>
          )}

          {/* Timeline */}
          <Timeline
            scenes={story.scenes}
            currentIndex={sceneIndex}
            onSelectScene={setSceneIndex}
            onAddScene={handleAddScene}
            onRemoveScene={handleRemoveScene}
          />
        </div>

        {/* Right panel: Scene sprites + Dialogues */}
        <div className="w-64 border-l bg-white flex flex-col min-h-0">
          {/* Scene sprites list */}
          <div className="border-b p-2 space-y-1 max-h-[30%] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 px-1">Na cena</p>
            {scene.sprites.length === 0 && (
              <p className="text-xs text-gray-400 italic px-1">Nenhum sprite ainda.</p>
            )}
            {scene.sprites.map((sprite) => (
              <div
                key={sprite.id}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${
                  selectedSpriteId === sprite.id ? 'bg-purple-100 ring-1 ring-purple-300' : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSpriteId(sprite.id)}
              >
                <Image
                  src={`/sprites/${sprite.filename}`}
                  alt={sprite.id}
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-xs text-gray-700 flex-1 truncate">{displayName(sprite.id)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSprite(sprite.id);
                  }}
                  className="text-red-300 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Dialogues editor */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <DialogueEditor
              dialogues={scene.dialogues}
              narrator={scene.narrator}
              spriteNames={spriteNames}
              onChange={handleDialoguesChange}
            />
          </div>
        </div>
      </div>

      {/* Background selector modal */}
      {showBgSelector && (
        <BackgroundSelector
          currentBackground={scene.background}
          onSelect={handleSetBackground}
          onClose={() => setShowBgSelector(false)}
        />
      )}
    </div>
  );
}

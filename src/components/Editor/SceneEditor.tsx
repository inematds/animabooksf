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
  storyRef.current = story;

  const scene = story.scenes[sceneIndex];

  // Auto-save every 30s (uses ref to avoid interval recreation)
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
      const id = spriteIdFromFilename(filename);
      updateScene((s) => {
        // If sprite already exists, update filename (change expression)
        const existing = s.sprites.find((sp) => sp.id === id);
        if (existing) {
          return {
            ...s,
            sprites: s.sprites.map((sp) =>
              sp.id === id ? { ...sp, filename } : sp
            ),
          };
        }
        return {
          ...s,
          sprites: [
            ...s.sprites,
            {
              id,
              filename,
              x: '50%',
              y: '80%',
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
    },
    []
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedSpriteId || !canvasRef.current) return;

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
          ← Inicio
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

      {/* Main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sprite panel */}
        <SpritePanel onAddSprite={handleAddSprite} />

        {/* Canvas + Timeline + Dialogues */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 p-4 flex items-center justify-center overflow-auto">
            <div
              ref={canvasRef}
              className="relative w-full max-w-3xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-crosshair"
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={() => setSelectedSpriteId(null)}
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
                  onError={() => setBgError(true)}
                />
              )}

              {/* Sprites */}
              {scene.sprites.map((sprite) => (
                <div
                  key={sprite.id}
                  className={`absolute cursor-grab active:cursor-grabbing group ${
                    selectedSpriteId === sprite.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''
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
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded shadow px-2 py-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScaleChange(sprite.id, Math.max(0.3, sprite.scale - 0.1));
                        }}
                        className="text-xs text-gray-600 hover:text-purple-600"
                      >
                        −
                      </button>
                      <span className="text-[10px] text-gray-400 w-8 text-center">
                        {sprite.scale.toFixed(1)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScaleChange(sprite.id, Math.min(3, sprite.scale + 0.1));
                        }}
                        className="text-xs text-gray-600 hover:text-purple-600"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <Timeline
            scenes={story.scenes}
            currentIndex={sceneIndex}
            onSelectScene={setSceneIndex}
            onAddScene={handleAddScene}
            onRemoveScene={handleRemoveScene}
          />

          {/* Dialogue editor */}
          <DialogueEditor
            dialogues={scene.dialogues}
            narrator={scene.narrator}
            onChange={handleDialoguesChange}
          />
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

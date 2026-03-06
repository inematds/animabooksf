'use client';

import { Dialogue } from '@/lib/types';

interface DialogueEditorProps {
  dialogues: Dialogue[];
  narrator?: string;
  spriteNames: string[];
  onChange: (dialogues: Dialogue[], narrator?: string) => void;
}

export default function DialogueEditor({
  dialogues,
  narrator,
  spriteNames,
  onChange,
}: DialogueEditorProps) {
  const updateDialogue = (index: number, field: keyof Dialogue, value: string) => {
    const updated = [...dialogues];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated, narrator);
  };

  const removeDialogue = (index: number) => {
    onChange(
      dialogues.filter((_, i) => i !== index),
      narrator
    );
  };

  const addDialogue = () => {
    onChange([...dialogues, { character: '', text: '' }], narrator);
  };

  const moveDialogue = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= dialogues.length) return;
    const updated = [...dialogues];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated, narrator);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <h3 className="text-sm font-semibold text-gray-700 px-3 pt-3 pb-1">Dialogos</h3>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
        {/* Narrator */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500 italic">Narrador</label>
          <textarea
            value={narrator || ''}
            onChange={(e) => onChange(dialogues, e.target.value || undefined)}
            placeholder="Texto do narrador (opcional)..."
            className="w-full text-sm px-2 py-1.5 border rounded resize-none italic bg-amber-50 border-amber-200 focus:border-amber-400 outline-none"
            rows={2}
          />
        </div>

        {/* Dialogues */}
        {dialogues.map((d, i) => (
          <div key={`${i}-${d.character}`} className="border rounded-lg p-2 space-y-1.5 bg-gray-50 group relative">
            <div className="flex items-center gap-1">
              <div className="flex flex-col mr-1">
                <button
                  onClick={() => moveDialogue(i, -1)}
                  className="text-gray-300 hover:text-gray-600 text-[10px] leading-none"
                  disabled={i === 0}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDialogue(i, 1)}
                  className="text-gray-300 hover:text-gray-600 text-[10px] leading-none"
                  disabled={i === dialogues.length - 1}
                >
                  ▼
                </button>
              </div>
              {spriteNames.length > 0 ? (
                <select
                  value={d.character}
                  onChange={(e) => updateDialogue(i, 'character', e.target.value)}
                  className="flex-1 text-sm px-2 py-1 border rounded font-semibold text-purple-600 bg-white"
                >
                  <option value="">Personagem...</option>
                  {spriteNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={d.character}
                  onChange={(e) => updateDialogue(i, 'character', e.target.value)}
                  placeholder="Personagem"
                  className="flex-1 text-sm px-2 py-1 border rounded font-semibold text-purple-600"
                />
              )}
              <button
                onClick={() => removeDialogue(i)}
                className="text-red-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
            <textarea
              value={d.text}
              onChange={(e) => updateDialogue(i, 'text', e.target.value)}
              placeholder="Fala do personagem..."
              className="w-full text-sm px-2 py-1.5 border rounded resize-none bg-white focus:border-purple-400 outline-none"
              rows={2}
            />
          </div>
        ))}

        <button
          onClick={addDialogue}
          className="w-full text-sm text-purple-500 hover:text-purple-700 border border-dashed border-purple-300 rounded-lg py-2 hover:bg-purple-50 transition"
        >
          + Adicionar dialogo
        </button>
      </div>
    </div>
  );
}

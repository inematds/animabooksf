'use client';

import { Dialogue } from '@/lib/types';

interface DialogueEditorProps {
  dialogues: Dialogue[];
  narrator?: string;
  onChange: (dialogues: Dialogue[], narrator?: string) => void;
}

export default function DialogueEditor({
  dialogues,
  narrator,
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
    <div className="border-t border-gray-200 bg-white p-3 space-y-2 max-h-64 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700">Dialogos</h3>

      {/* Narrator */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-16 shrink-0 italic">Narrador:</span>
        <input
          type="text"
          value={narrator || ''}
          onChange={(e) => onChange(dialogues, e.target.value || undefined)}
          placeholder="Texto do narrador (opcional)"
          className="flex-1 text-sm px-2 py-1 border rounded italic"
        />
      </div>

      {/* Dialogues */}
      {dialogues.map((d, i) => (
        <div key={i} className="flex items-center gap-1 group">
          <div className="flex flex-col">
            <button
              onClick={() => moveDialogue(i, -1)}
              className="text-gray-300 hover:text-gray-600 text-xs"
              disabled={i === 0}
            >
              ▲
            </button>
            <button
              onClick={() => moveDialogue(i, 1)}
              className="text-gray-300 hover:text-gray-600 text-xs"
              disabled={i === dialogues.length - 1}
            >
              ▼
            </button>
          </div>
          <input
            type="text"
            value={d.character}
            onChange={(e) => updateDialogue(i, 'character', e.target.value)}
            placeholder="Personagem"
            className="w-24 text-sm px-2 py-1 border rounded font-semibold text-purple-600"
          />
          <input
            type="text"
            value={d.text}
            onChange={(e) => updateDialogue(i, 'text', e.target.value)}
            placeholder="Fala..."
            className="flex-1 text-sm px-2 py-1 border rounded"
          />
          <button
            onClick={() => removeDialogue(i)}
            className="text-red-300 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addDialogue}
        className="text-sm text-purple-500 hover:text-purple-700"
      >
        + Adicionar dialogo
      </button>
    </div>
  );
}

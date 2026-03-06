import { Story, Scene, SpriteState, Dialogue } from './types';

/**
 * Extrai o ID do sprite a partir do filename.
 * Para personagens: "lumi_feliz.svg" → "lumi" (permite trocar expressao)
 * Para objetos com prefixo de categoria: "animal_gato.svg" → "animal_gato" (cada objeto e unico)
 */
const OBJECT_PREFIXES = ['animal', 'natureza', 'comida', 'movel', 'veiculo', 'brinquedo', 'escola', 'magia', 'moda'];

export function spriteIdFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.\w+$/, '');
  const parts = withoutExt.split('_');
  // Objects use full name as ID (each is unique on the scene)
  if (OBJECT_PREFIXES.includes(parts[0])) {
    return withoutExt;
  }
  // Characters use first segment (allows expression swap: lumi_feliz → lumi)
  return parts[0];
}

const SCENE_RE = /<!--\s*scene:\s*(\S+)\s*-->/;
const SPRITE_RE = /<!--\s*sprite:\s*(\S+)\s+(.*?)-->/;
const DIALOGUE_RE = /^\*\*(.+?)\*\*:\s*"(.+)"$/;
const NARRATOR_RE = /^_(.+)_$/;

interface SpriteCommand {
  filename: string;
  exit: boolean;
  x?: string;
  y?: string;
  scale?: number;
}

function parseSpriteParams(filename: string, params: string): SpriteCommand {
  const trimmed = params.trim();

  if (trimmed === 'exit') {
    return { filename, exit: true };
  }

  const xMatch = trimmed.match(/x=([\d.]+%?)/);
  const yMatch = trimmed.match(/y=([\d.]+%?)/);
  const scaleMatch = trimmed.match(/scale=([\d.]+)/);

  const x = xMatch ? (xMatch[1].includes('%') ? xMatch[1] : `${xMatch[1]}%`) : '50%';
  const y = yMatch ? (yMatch[1].includes('%') ? yMatch[1] : `${yMatch[1]}%`) : '80%';
  const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1.0;

  return { filename, exit: false, x, y, scale };
}

export function parseStory(markdown: string): Story {
  const lines = markdown.split('\n');
  const scenes: Scene[] = [];
  let title = '';
  let currentBackground = '';
  let currentSprites: Map<string, SpriteState> = new Map();
  let currentDialogues: Dialogue[] = [];
  let currentNarrator: string | undefined;
  let sceneCount = 0;
  let spriteZIndex = 0;
  let pendingSpriteCommands: SpriteCommand[] = [];
  let exitIds: Set<string> = new Set();

  function flushScene() {
    if (sceneCount === 0 && currentBackground === '') return;

    // Apply sprite commands
    for (const cmd of pendingSpriteCommands) {
      const id = spriteIdFromFilename(cmd.filename);
      if (cmd.exit) {
        exitIds.add(id);
      } else {
        currentSprites.set(id, {
          id,
          filename: cmd.filename,
          x: cmd.x!,
          y: cmd.y!,
          scale: cmd.scale!,
          zIndex: spriteZIndex++,
        });
      }
    }

    // Remove exited sprites
    for (const id of exitIds) {
      currentSprites.delete(id);
    }

    sceneCount++;
    scenes.push({
      id: sceneCount,
      background: currentBackground,
      sprites: Array.from(currentSprites.values()),
      narrator: currentNarrator,
      dialogues: [...currentDialogues],
    });

    // Reset per-scene state (sprites persist)
    currentDialogues = [];
    currentNarrator = undefined;
    pendingSpriteCommands = [];
    exitIds = new Set();
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Title (first h1)
    if (!title && trimmed.startsWith('# ')) {
      title = trimmed.slice(2).trim();
      continue;
    }

    // Scene marker → flush previous scene, set new background
    const sceneMatch = trimmed.match(SCENE_RE);
    if (sceneMatch) {
      flushScene();
      currentBackground = sceneMatch[1];
      spriteZIndex = 0;
      continue;
    }

    // Sprite command
    const spriteMatch = trimmed.match(SPRITE_RE);
    if (spriteMatch) {
      const cmd = parseSpriteParams(spriteMatch[1], spriteMatch[2]);
      pendingSpriteCommands.push(cmd);
      continue;
    }

    // Dialogue: **Character**: "text"
    const dialogueMatch = trimmed.match(DIALOGUE_RE);
    if (dialogueMatch) {
      currentDialogues.push({
        character: dialogueMatch[1],
        text: dialogueMatch[2],
      });
      continue;
    }

    // Narrator: _text_
    const narratorMatch = trimmed.match(NARRATOR_RE);
    if (narratorMatch) {
      currentNarrator = narratorMatch[1];
      continue;
    }
  }

  // Flush last scene
  flushScene();

  return { title: title || 'Historia sem titulo', scenes };
}

/**
 * Gera Markdown a partir de uma Story (inverso do parser).
 */
export function storyToMarkdown(story: Story): string {
  const lines: string[] = [];
  lines.push(`# ${story.title}`);
  lines.push('');

  let prevSprites: Map<string, SpriteState> = new Map();

  for (const scene of story.scenes) {
    lines.push(`<!-- scene: ${scene.background} -->`);
    lines.push('');

    const currentIds = new Set(scene.sprites.map((s) => s.id));

    // Sprites que sairam
    for (const [id] of prevSprites) {
      if (!currentIds.has(id)) {
        const prev = prevSprites.get(id)!;
        lines.push(`<!-- sprite: ${prev.filename} exit -->`);
      }
    }

    // Sprites atuais
    for (const sprite of scene.sprites) {
      const prev = prevSprites.get(sprite.id);
      const changed =
        !prev ||
        prev.filename !== sprite.filename ||
        prev.x !== sprite.x ||
        prev.y !== sprite.y ||
        prev.scale !== sprite.scale;

      if (changed) {
        let cmd = `<!-- sprite: ${sprite.filename} x=${sprite.x} y=${sprite.y}`;
        if (sprite.scale !== 1.0) {
          cmd += ` scale=${sprite.scale}`;
        }
        cmd += ' -->';
        lines.push(cmd);
      }
    }

    lines.push('');

    if (scene.narrator) {
      lines.push(`_${scene.narrator}_`);
      lines.push('');
    }

    for (const d of scene.dialogues) {
      lines.push(`**${d.character}**: "${d.text}"`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');

    prevSprites = new Map(scene.sprites.map((s) => [s.id, s]));
  }

  return lines.join('\n');
}

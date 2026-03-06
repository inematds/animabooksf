export interface SpriteState {
  id: string;           // derivado do prefixo do filename (ex: "lumi")
  filename: string;     // ex: "lumi_feliz.svg"
  x: string;            // ex: "35%"
  y: string;            // ex: "72%"
  scale: number;        // default: 1.0
  zIndex: number;       // ordem de declaracao
}

export interface Dialogue {
  character: string;    // ex: "Lumi"
  text: string;
  emotion?: string;     // ex: "feliz"
}

export interface Scene {
  id: number;
  background: string;   // ex: "sala_aula.svg"
  sprites: SpriteState[];
  narrator?: string;
  dialogues: Dialogue[];
}

export interface Story {
  title: string;
  scenes: Scene[];
}

// --- Creative Modes (Decoration, Construction, City) ---

export type ProjectType = 'decoration' | 'construction' | 'city' | 'fashion';

export interface PlacedItem {
  id: string;
  assetId: string;      // filename do asset
  category: string;     // ex: "movel", "planta", "predio"
  x: number;            // 0-100 (%)
  y: number;            // 0-100 (%)
  scale: number;
  rotation: number;     // graus
  zIndex: number;
  layer: 'back' | 'main' | 'front';
  flipped: boolean;
}

export interface CreativeProject {
  id?: string;
  type: ProjectType;
  title: string;
  background: string;
  items: PlacedItem[];
  createdAt?: string;
  updatedAt?: string;
}

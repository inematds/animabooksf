export interface SpriteState {
  id: string;           // derivado do prefixo do filename (ex: "lumi")
  filename: string;     // ex: "lumi_feliz.png"
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
  background: string;   // ex: "sala_aula_fundo.png"
  sprites: SpriteState[];
  narrator?: string;
  dialogues: Dialogue[];
}

export interface Story {
  title: string;
  scenes: Scene[];
}

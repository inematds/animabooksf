// Gera public/data/catalogo.json antes do build: lista de sprites, fundos,
// itens dos modos criativos e as histórias prontas de data/stories/*.md.
// Substitui as antigas rotas /api/assets e /api/creative-assets (o site é estático).
import fs from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const pub = path.join(raiz, 'public');
const IMG = /\.(png|jpg|jpeg|webp|svg)$/i;
const MODOS = ['decoration', 'construction', 'city', 'fashion', 'countryside'];

const imagens = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMG.test(f)).sort() : [];

const sprites = imagens(path.join(pub, 'sprites'));
const backgrounds = imagens(path.join(pub, 'backgrounds'));

const modos = {};
for (const modo of MODOS) {
  const base = path.join(pub, 'assets', modo);
  const categorias = [];
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!d.isDirectory() || d.name === 'fundos') continue;
      const files = imagens(path.join(base, d.name));
      if (files.length) categorias.push({ category: d.name, files });
    }
  }
  modos[modo] = { categorias, fundos: imagens(path.join(base, 'fundos')) };
}

const pastaHist = path.join(raiz, 'data', 'stories');
const historias = fs.existsSync(pastaHist)
  ? fs.readdirSync(pastaHist)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => ({ id: f.replace(/\.md$/, ''), markdown: fs.readFileSync(path.join(pastaHist, f), 'utf-8') }))
  : [];

const saida = path.join(pub, 'data');
fs.mkdirSync(saida, { recursive: true });
fs.writeFileSync(
  path.join(saida, 'catalogo.json'),
  JSON.stringify({ sprites, backgrounds, modos, historias })
);
console.log(
  `catalogo.json: ${sprites.length} sprites, ${backgrounds.length} fundos, ${historias.length} histórias prontas`
);

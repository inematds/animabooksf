# Plano de Expansao - Modos Criativos (tipo Toca Life World)

## Visao Geral

Expandir de "app de historias" para **plataforma criativa infantil** com 4 modos:

| Modo | Descricao | Exemplo |
|------|-----------|---------|
| Historias | Montar cenas narrativas com dialogos (ja existe) | Livro animado |
| Decoracao | Decorar ambientes arrastando moveis/objetos | Decorar um quarto |
| Construcao | Montar estruturas com pecas/blocos | Construir uma casa |
| Cidades | Criar mundos com predios, ruas, personagens | Mini cidade |

## Mecanica comum (todos os modos)

- Canvas central com background
- Paleta lateral de itens arrastando para o canvas
- Drag & drop livre no canvas
- Scale (pinch/botoes) e rotacao dos itens
- Camadas (fundo, meio, frente) para profundidade
- Salvar/carregar projetos
- Gamificacao integrada (XP ao criar)

## Arquitetura

### Tipos compartilhados

```typescript
type ProjectType = 'story' | 'decoration' | 'construction' | 'city';

interface PlacedItem {
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

interface CreativeProject {
  id?: string;
  type: ProjectType;
  title: string;
  background: string;
  items: PlacedItem[];
  createdAt?: string;
  updatedAt?: string;
}
```

### Componentes compartilhados

1. `CreativeCanvas` - Canvas com drag/drop/scale/rotate
2. `ItemPalette` - Sidebar com itens por categoria
3. `ItemControls` - Controles de scale/rotate/flip/delete do item selecionado
4. `LayerSelector` - Escolher camada (fundo/meio/frente)
5. `ProjectToolbar` - Toolbar com titulo, save, undo, voltar

### Assets organizados por modo

```
public/
  assets/
    decoration/
      moveis/       (sofa.svg, mesa.svg, cama.svg...)
      plantas/      (vaso.svg, arvore.svg...)
      decoracao/    (quadro.svg, tapete.svg, luminaria.svg...)
      fundos/       (quarto.svg, sala.svg, cozinha.svg...)
    construction/
      blocos/       (tijolo.svg, madeira.svg, vidro.svg...)
      telhados/     (telhado_vermelho.svg...)
      portas/       (porta.svg, janela.svg...)
      fundos/       (terreno.svg, gramado.svg...)
    city/
      predios/      (casa.svg, predio.svg, loja.svg...)
      natureza/     (arvore.svg, lago.svg, morro.svg...)
      ruas/         (rua.svg, calcada.svg, ponte.svg...)
      veiculos/     (carro.svg, onibus.svg...)
      personagens/  (pessoa1.svg, pessoa2.svg...)
      fundos/       (cidade_base.svg, campo_base.svg...)
```

### Rotas

- `/create` - Hub de criacao (escolher modo)
- `/create/decoration/[id]` - Editor de decoracao
- `/create/construction/[id]` - Editor de construcao
- `/create/city/[id]` - Editor de cidades
- `/gallery` - Galeria de todos os projetos criados
- `/view/[id]` - Visualizar projeto criado

### API

- `GET/POST /api/projects` - Listar/criar projetos criativos
- `GET/DELETE /api/projects/[id]` - Ler/deletar projeto
- `GET /api/creative-assets?mode=decoration&category=moveis` - Listar assets por modo

### Storage

Reutilizar o storageAdapter existente, adicionando tabela `projects` no Supabase e pasta `data/projects/` no filesystem.

---

## Versionamento

Formato: `MAJOR.RECURSO.BUG`

- **v1.x.x** - Versao atual (historias + modos criativos basicos)
- **v2.x.x** - Quando todos os recursos planejados estiverem prontos

Exemplos:
- 1.0.0 → versao base
- 1.1.0 → novo recurso (ex: modo cidade melhorado)
- 1.1.1 → bugfix

---

## V3 - Recursos Futuros

### Snap-to-Place (Encaixar Objetos)
- Objetos tem pontos de encaixe (snap points) pre-definidos
- Cenarios tem zonas de encaixe (ex: mesa tem zona para objetos em cima)
- Quando o item se aproxima de uma zona compativel, ele "gruda" automaticamente
- Validacao: certos itens so encaixam em certos lugares (movel no chao, quadro na parede)
- Feedback visual: zonas brilham quando item compativel esta proximo

### Criacao de Assets Incriveis

Para criar fundos, personagens e objetos de alta qualidade:

1. **SVG vetorial** - Escalavel, leve, perfeito para web
   - Ferramentas: Figma, Inkscape (gratis), Adobe Illustrator
   - Estilo sugerido: flat design colorido, tracos arredondados (infantil)

2. **AI generativa** - Para prototipar rapidamente
   - Gerar conceitos com DALL-E, Midjourney, Stable Diffusion
   - Vetorizar com ferramentas como Vectorizer.ai ou SVGcode
   - Refinar manualmente no Figma/Inkscape

3. **Sprites animados** - Para personagens com expressoes
   - Criar sprite sheets (feliz, triste, surpreso, etc)
   - Nomear: `personagem_emocao.svg` (ex: lumi_feliz.svg)
   - Manter proporcoes consistentes entre personagens

4. **Fundos panoramicos** - Para cenarios imersivos
   - Resolucao: aspecto 16:9, minimo 1920x1080
   - Camadas: ceu, fundo, meio, frente (parallax)
   - Paleta de cores harmonica por tema (escola=azul/verde, floresta=verde/marrom)

5. **Objetos interativos** - Para modos criativos
   - Cada objeto em arquivo separado (.svg)
   - Fundo transparente
   - Tamanho consistente dentro da categoria
   - Metadados futuros: snap points, zona permitida, tags

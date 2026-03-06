# Animabook SF

Plataforma criativa infantil para criar e ler historias interativas com personagens animados, montar cenarios e explorar modos criativos.

**Publico-alvo:** criancas (3-12 anos) consomem as historias; educadores e pais criam conteudo.

**Versao atual:** 1.1.0 | **Deploy:** [animabooksf.vercel.app](https://animabooksf.vercel.app)

---

## Funcionalidades

### Leitor de Historias (`/reader/[id]`)
- Fundo de cena em tela cheia (16:9) com transicoes suaves
- Sprites animados com Framer Motion
- **Dialogos estilo HQ** - baloes de fala posicionados sobre os personagens, arrastáveis
- Narrador como barra no topo da cena
- Navegacao: setas, teclado, swipe touch, clique
- Indicador de progresso por estrelas

### Editor Visual (`/editor/[id]`)
- Canvas interativo com drag-and-drop de sprites
- **Painel lateral categorizado** com 10 categorias:
  - Personagens, Animais, Natureza, Comida, Moveis
  - Veiculos, Brinquedos, Escola, Magia, Moda
- Controles de escala por sprite (zoom +/-)
- Seletor de fundos com 14 opcoes
- Editor de dialogos com narrador + falas + reordenacao
- Timeline de cenas
- Auto-save a cada 30s
- Preview direto no leitor

### Modos Criativos (`/create`) - tipo Toca Life World
| Modo | Descricao |
|------|-----------|
| Decoracao | Decorar quartos, salas e jardins com moveis e objetos |
| Construcao | Montar estruturas com blocos, portas e telhados |
| Cidades | Criar mundos com predios, ruas e personagens |

- Canvas com drag & drop livre
- Controles: escala, rotacao, flip, camadas (fundo/meio/frente)
- Galeria de projetos (`/gallery`) com filtros por tipo

### Gamificacao (`/challenges`, `/profile`, `/events`)
- XP, 10 niveis, moedas, 10 conquistas (4 raridades)
- Streak diario, desafios diarios/semanais
- Eventos semanais com bonus de XP/moedas
- Painel do educador (`/dashboard`) com missoes e regras

---

## Biblioteca de Assets (97 SVGs)

### Personagens (23)
Lumi, Caio, Sofia, Pedro, Luna, Teo, Mia, Ravi, Alice, Leo, Nina, Davi, Yuki, Kai, Rosa, Enzo, Maya, Tom, Iris, Beto, Lila, Gael + variante Lumi feliz

### Objetos (60) - 10 categorias
| Categoria | Qtd | Exemplos |
|-----------|-----|----------|
| Animais | 5 | Gato, Cachorro, Coelho, Passaro, Borboleta |
| Natureza | 5 | Arvore, Flor, Arbusto, Sol, Nuvem |
| Comida | 5 | Bolo, Maca, Sorvete, Pizza, Cupcake |
| Moveis | 5 | Mesa, Cadeira, Sofa, Estante, Cama |
| Veiculos | 5 | Carro, Bicicleta, Onibus, Aviao, Barco |
| Brinquedos | 5 | Bola, Ursinho, Pipa, Boneca, Robo |
| Escola | 5 | Livro, Mochila, Lapis, Globo, Lousa |
| Magia | 5 | Varinha, Chapeu, Pocao, Cristal, Estrela |
| Moda | 20 | Vestido, Coroa, Oculos, Bolsa, Bota, Tiara, Mascara... |

### Fundos (14)
Sala de aula, Patio, Biblioteca, Floresta, Praia, Castelo, Espaco, Cidade, Fazenda, Parque, Quarto, Cozinha, Circo, Default

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Animacao | Framer Motion |
| Storage | Filesystem local / Supabase (dual-mode, auto-detecta) |
| Deploy | Vercel |

## Estrutura do Projeto

```
src/
  app/
    page.tsx, HomeContent.tsx              # Home
    reader/[storyId]/page.tsx              # Leitor (baloes HQ)
    editor/[storyId]/page.tsx              # Editor de historias
    create/page.tsx                        # Hub de modos criativos
    create/[mode]/[id]/page.tsx            # Editor criativo
    gallery/page.tsx                       # Galeria de projetos
    view/[id]/page.tsx                     # Visualizar projeto
    dashboard/, challenges/, events/, profile/
    api/stories/, api/projects/, api/assets/, api/creative-assets/
  components/
    Reader/       SceneView, SpriteLayer, DialogueBox (baloes HQ draggable)
    Editor/       SceneEditor, SpritePanel (categorizado), Timeline, DialogueEditor
    Creative/     CreativeCanvas, CreativeEditor, ItemPalette, ItemControls
    Gamification/ XPBar, AchievementPopup, ChallengeCard, ProfileCard
  lib/
    types.ts            # Story, Scene, Dialogue, CreativeProject, PlacedItem
    parseStory.ts       # Parser MD <-> JSON
    storageAdapter.ts   # Dual-mode storage (FS + Supabase)
    GameContext.tsx      # Gamificacao (React Context + localStorage)
public/
  sprites/       83 SVGs (personagens + objetos)
  backgrounds/   14 SVGs (cenarios)
  assets/        SVGs para modos criativos
data/
  stories/       Historias salvas (.json, .md)
  projects/      Projetos criativos salvos (.json)
```

## Formato das Historias (Markdown)

```markdown
# Titulo da Historia

<!-- scene: sala_aula.svg -->
<!-- sprite: lumi.svg x=30% y=75% -->
<!-- sprite: caio.svg x=70% y=78% -->

_Era uma vez, em uma escola muito colorida..._

**Lumi**: "Oi! Eu sou a Lumi!"
**Caio**: "Bem-vinda!"

---

<!-- scene: patio.svg -->
<!-- sprite: lumi_feliz.svg x=40% y=72% -->
<!-- sprite: caio.svg exit -->

_Lumi foi explorar o patio sozinha._
```

**Convencoes:**
- `<!-- scene: fundo.svg -->` — define fundo da cena
- `<!-- sprite: arquivo.svg x=% y=% scale=1.5 -->` — posiciona sprite
- `<!-- sprite: arquivo.svg exit -->` — remove sprite
- `**Nome**: "fala"` — dialogo (aparece como balao HQ no leitor)
- `_texto_` — narrador (barra no topo)
- Para personagens: `lumi_feliz.svg` → id `lumi` (troca expressao)
- Para objetos: `animal_gato.svg` → id `animal_gato` (cada um e unico)

## Instalacao

```bash
git clone git@github.com:inematds/animabooksf.git
cd animabooksf
npm install
npm run dev
```

### Supabase (opcional)

O app funciona sem Supabase (usa filesystem local). Para cloud:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### Adicionar Assets

- `public/sprites/` — personagens e objetos SVG
- `public/backgrounds/` — cenarios SVG (16:9)
- Personagens: `nome.svg`, `nome_expressao.svg`
- Objetos: `categoria_nome.svg` (animal_, natureza_, comida_, movel_, veiculo_, brinquedo_, escola_, magia_, moda_)

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Home com lista de historias |
| `/reader/[id]` | Leitor com baloes HQ |
| `/editor/new` | Criar nova historia |
| `/editor/[id]` | Editar historia |
| `/create` | Hub de modos criativos |
| `/create/[mode]/[id]` | Editor criativo |
| `/gallery` | Galeria de projetos |
| `/view/[id]` | Visualizar projeto |
| `/dashboard` | Painel educador |
| `/challenges` | Desafios |
| `/events` | Eventos semanais |
| `/profile` | Perfil e conquistas |
| `/api/stories` | CRUD de historias |
| `/api/projects` | CRUD de projetos criativos |
| `/api/assets` | Lista sprites e fundos |
| `/api/creative-assets` | Lista assets criativos por modo |

## Versionamento

Formato: `MAJOR.RECURSO.BUG`

| Versao | Descricao |
|--------|-----------|
| 1.1.0 | 97 SVGs, painel categorizado, baloes HQ draggable, moda |
| 1.0.1 | Fix navegacao de dialogos |
| 1.0.0 | Modos criativos, gamificacao conectada, storage adapter |

## Roadmap

- [ ] Editor lateral de dialogos (estilo animabook referencia)
- [ ] Expressoes para todos os personagens
- [ ] Autenticacao (Supabase Auth)
- [ ] Galeria publica de historias
- [ ] Audio: vozes com TTS
- [ ] Geracao de historias com IA
- [ ] PWA com suporte offline
- [ ] v3: Snap-to-place (objetos encaixam nos lugares certos)
- [ ] v3: Marketplace de sprites e fundos
- [ ] v3: Editor de personagens customizaveis

## Documentacao

- `doc/RELATORIO_V1.1.md` — Relatorio completo da versao atual
- `PLANO_EXPANSAO.md` — Plano de expansao e roadmap v2/v3
- `TODO.md` — Checklist de tarefas (fases 1-4 concluidas)
- `REVISAO_COMPLETA.md` — Auditoria inicial do projeto

## Licenca

Projeto privado.

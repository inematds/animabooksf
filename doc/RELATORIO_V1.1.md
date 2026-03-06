# Relatorio Animabook SF - v1.1.0

Data: 2026-03-06

## Resumo

O Animabook SF evoluiu de um app basico de historias para uma plataforma criativa infantil completa com 4 modos de criacao, 97 assets SVG, sistema de gamificacao funcional e dialogos estilo HQ.

---

## Versao Atual: 1.1.0

Formato de versionamento: `MAJOR.RECURSO.BUG`
- v1.x.x = versao atual (historias + modos criativos + assets)
- v2.x.x = quando todos os recursos planejados estiverem prontos
- v3.x.x = snap-to-place, assets avancados, marketplace

---

## Funcionalidades Implementadas

### 1. Leitor de Historias (Reader)
- Fundo de cena em tela cheia (16:9) com transicoes suaves
- Sprites animados com Framer Motion (bounce, entrada/saida)
- **Dialogos estilo HQ** - baloes de fala posicionados sobre os personagens
  - Baloes arrastáveis (drag) pelo leitor
  - Posicionamento automatico baseado na posicao do sprite
  - Narrador como barra no topo da cena
  - Baloes aparecem um a um com animacao
  - Triangulo/ponteiro apontando para o personagem
- Navegacao: setas, teclado (espaco/setas), swipe touch
- Seta direita avanca dialogos antes de mudar de cena
- Indicador de progresso por estrelas
- Titulo animado na entrada

### 2. Editor Visual de Historias
- Canvas interativo com drag-and-drop de sprites
- **Painel lateral com categorias**:
  - Personagens (agrupados por nome)
  - Animais, Natureza, Comida, Moveis
  - Veiculos, Brinquedos, Escola, Magia, Moda
- Abas de filtro por categoria
- Busca por nome
- Controles de escala por sprite
- Seletor de fundos com galeria visual (14 fundos)
- Editor de dialogos com narrador + falas + reordenacao
- Timeline de cenas (adicionar/remover)
- Auto-save a cada 30s
- Preview direto no leitor
- Objetos podem ser adicionados multiplas vezes (IDs unicos)

### 3. Modos Criativos (tipo Toca Life World)
- **Decoracao** - decorar quartos, salas e jardins
- **Construcao** - montar estruturas com pecas e blocos
- **Cidades** - criar mundos com predios, ruas, personagens
- Canvas com drag & drop livre
- Paleta lateral de itens por categoria
- Controles: escala, rotacao, flip, camadas (fundo/meio/frente)
- Sistema de camadas com z-index
- Salvar/carregar projetos
- Galeria de projetos com filtros

### 4. Gamificacao
- XP e 10 niveis progressivos
- Moedas e economia interna
- 10 conquistas com 4 raridades
- Streak diario de leitura
- Desafios diarios e semanais com renovacao automatica
- Notificacoes animadas de conquista e level up
- Conexao com Reader (recordStoryRead) e Editor (recordStoryCreated)

### 5. Storage Dual-Mode
- **Filesystem** (dev local): `data/stories/`, `data/projects/`
- **Supabase** (cloud): detecta automaticamente via env vars
- Adapter transparente (`storageAdapter.ts`)
- Suporta Markdown (.md) e JSON (.json) para historias

---

## Biblioteca de Assets (97 SVGs)

### Personagens (23)
| Nome | Descricao |
|------|-----------|
| Lumi | Menina, cabelo roxo com rabos de cavalo |
| Lumi (feliz) | Variante com expressao feliz |
| Caio | Menino, cabelo castanho, camiseta azul |
| Sofia | Menina, cabelo castanho longo, vestido amarelo |
| Pedro | Menino, cabelo preto curto, camiseta vermelha |
| Luna | Menina, cabelo azul em coque, roupa espacial |
| Teo | Menino, cabelo ruivo cacheado, moletom verde |
| Mia | Menina, cabelo rosa curto, macacao |
| Ravi | Menino, pele escura, oculos, camisa laranja |
| Alice | Menina, cabelo loiro com laco, vestido rosa |
| Leo | Menino, cabelo espetado, roupa esportiva |
| Nina | Menina, pele escura, cabelo afro com flor |
| Davi | Menino, cabelo loiro liso, camisa listrada |
| Yuki | Menina, inspiracao japonesa, kimono |
| Kai | Menino, pele bronzeada, estilo surfista |
| Rosa | Menina, cabelo cacheado, vestido floral |
| Enzo | Menino, jaleco de cientista, oculos |
| Maya | Menina, trancas longas, roupa terrosa |
| Tom | Menino, ruivo, bone azul, estilo skate |
| Iris | Menina, mechas arco-iris, roupa artistica |
| Beto | Menino, pele escura, uniforme de futebol |
| Lila | Menina, cabelo lavanda, vestido de conto de fadas |
| Gael | Menino, pele morena, fones de ouvido, musico |

### Objetos por Categoria

| Categoria | Itens |
|-----------|-------|
| Animais (5) | Gato, Cachorro, Coelho, Passaro, Borboleta |
| Natureza (5) | Arvore, Flor, Arbusto, Sol, Nuvem |
| Comida (5) | Bolo, Maca, Sorvete, Pizza, Cupcake |
| Moveis (5) | Mesa, Cadeira, Sofa, Estante, Cama |
| Veiculos (5) | Carro, Bicicleta, Onibus, Aviao, Barco |
| Brinquedos (5) | Bola, Ursinho, Pipa, Boneca, Robo |
| Escola (5) | Livro, Mochila, Lapis, Globo, Lousa |
| Magia (5) | Varinha, Chapeu, Pocao, Cristal, Estrela |
| Moda (20) | Vestido, Camiseta, Saia, Calcado, Bone, Oculos, Coroa, Colar, Bolsa, Laco, Jaqueta, Bota, Tiara, Relogio, Cachecol, Chapeu, Pulseira, Tenis, Saia Tutu, Mascara |

### Fundos (14)
| Fundo | Descricao |
|-------|-----------|
| sala_aula.svg | Sala de aula com lousa e carteiras |
| patio.svg | Patio da escola com brinquedos |
| biblioteca.svg | Biblioteca com estantes de livros |
| floresta.svg | Floresta encantada com cogumelos e vagalumes |
| praia.svg | Praia com oceano, palmeira e conchas |
| castelo.svg | Interior de castelo com trono e tochas |
| espaco.svg | Espaco sideral com planetas e estrelas |
| cidade.svg | Rua da cidade com lojas e predios |
| fazenda.svg | Fazenda com celeiro, cerca e animais |
| parque.svg | Parque com playground e lago |
| quarto.svg | Quarto infantil com cama e brinquedos |
| cozinha.svg | Cozinha com fogao, geladeira e mesa |
| circo.svg | Interior de tenda de circo com luzes |
| default_bg.svg | Fundo padrao neutro |

---

## Arquitetura Tecnica

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Animacao | Framer Motion |
| Storage | Filesystem local / Supabase (dual-mode) |
| Deploy | Vercel |

### Estrutura de Arquivos
```
src/
  app/
    page.tsx, HomeContent.tsx          # Home com lista de historias
    reader/[storyId]/page.tsx          # Leitor de historias
    editor/[storyId]/page.tsx          # Editor de historias
    create/page.tsx                    # Hub de criacao (modos criativos)
    create/[mode]/[id]/page.tsx        # Editor criativo
    gallery/page.tsx                   # Galeria de projetos criativos
    view/[id]/page.tsx                 # Visualizar projeto criativo
    dashboard/, challenges/, events/, profile/  # Gamificacao
    api/stories/, api/projects/, api/assets/, api/creative-assets/
  components/
    Reader/   SceneView, SpriteLayer, DialogueBox (baloes HQ)
    Editor/   SceneEditor, SpritePanel (categorizado), Timeline, DialogueEditor
    Creative/ CreativeCanvas, CreativeEditor, ItemPalette, ItemControls
    Gamification/ XPBar, AchievementPopup, ChallengeCard, ProfileCard
  lib/
    types.ts           # Story, Scene, Dialogue, CreativeProject, PlacedItem
    parseStory.ts      # Parser MD <-> JSON, spriteIdFromFilename
    storageAdapter.ts  # Dual-mode storage (FS + Supabase)
    GameContext.tsx     # Gamificacao (React Context + localStorage)
    gamification.ts    # XP, niveis, conquistas, eventos
public/
  sprites/   83 SVGs (personagens + objetos)
  backgrounds/  14 SVGs (cenarios)
  assets/    SVGs para modos criativos (decoracao, construcao, cidade)
data/
  stories/   Historias salvas (.json, .md)
  projects/  Projetos criativos salvos (.json)
```

### Rotas
| Rota | Descricao |
|------|-----------|
| `/` | Home com lista de historias e navegacao |
| `/reader/[id]` | Leitor com baloes HQ |
| `/editor/new` | Criar nova historia |
| `/editor/[id]` | Editar historia |
| `/create` | Hub de modos criativos |
| `/create/[mode]/[id]` | Editor criativo (decoration/construction/city) |
| `/gallery` | Galeria de projetos criativos |
| `/view/[id]` | Visualizar projeto |
| `/dashboard` | Painel educador |
| `/challenges` | Desafios |
| `/events` | Eventos semanais |
| `/profile` | Perfil e conquistas |

---

## Historico de Versoes

### v1.1.0 (2026-03-06)
- 80+ novos SVGs: 20 personagens, 60 objetos em 9 categorias, 20 moda, 10 fundos
- Painel de sprites categorizado com abas
- Fix: objetos nao sobrescrevem uns aos outros (IDs unicos)
- Dialogos estilo HQ com baloes draggable

### v1.0.1 (2026-03-06)
- Fix: setas de navegacao agora avancam dialogos antes de mudar cena
- Baloes de dialogo posicionados sobre personagens (estilo comic/HQ)

### v1.0.0 (2026-03-06)
- Modos criativos: Decoracao, Construcao, Cidades
- Canvas drag & drop com paleta de itens
- Galeria de projetos com filtros
- Gamificacao conectada (XP ao criar/ler)
- Storage adapter dual-mode (filesystem + Supabase)
- Auto-save, delete, error handling

---

## Proximos Passos

### v1.2.0 (planejado)
- Editor lateral de dialogos (inspirado no animabook de referencia)
- Expressoes para todos os personagens (feliz, triste, surpreso)
- Mais fundos tematicos

### v2.0.0 (planejado)
- Todos os recursos do plano de expansao implementados
- Autenticacao e galeria publica
- Audio e vozes

### v3.0.0 (futuro)
- Snap-to-place: objetos encaixam em zonas pre-definidas
- Validacao de posicionamento (movel no chao, quadro na parede)
- Marketplace de assets
- Editor de personagens customizaveis

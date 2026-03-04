# Animabook SF

Leitor e editor de historias infantis interativas onde personagens (sprites PNG) se movem sobre fundos de cena, com animacoes fluidas, dialogos com efeito typewriter e um sistema completo de gamificacao.

**Publico-alvo:** criancas (3-12 anos) consomem as historias; educadores e pais criam conteudo e gerenciam o uso.

## Demonstracao

| Leitor | Editor | Painel Educador |
|--------|--------|-----------------|
| Sprites animados com Framer Motion | Drag-and-drop visual | Missoes, regras e relatorios |
| Dialogos com typewriter | Timeline de cenas | Controle de tempo de tela |
| Navegacao por swipe/teclado | Seletor de fundos e sprites | Classificacao etaria |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS |
| Animacao | Framer Motion (layoutId + FLIP) |
| Drag & Drop | Nativo (mouse events) + @dnd-kit/core |
| Storage | Supabase (opcional) / Filesystem local |
| Deploy | Vercel |

## Funcionalidades

### Leitor de Historias (`/reader/[id]`)
- Fundo de cena em tela cheia (16:9)
- Sprites animados com transicoes suaves entre cenas (Framer Motion)
- Dialogos com efeito typewriter caractere por caractere
- Narrador em italico
- Navegacao: swipe, setas do teclado, botoes, ou clique para avancar
- Indicador de progresso por cena

### Editor Visual (`/editor/[id]`)
- Canvas interativo com drag-and-drop de sprites
- Painel lateral com galeria de sprites agrupados por personagem
- Controles de escala (zoom +/-) por sprite
- Seletor de fundo com galeria visual
- Editor de dialogos com reordenacao
- Timeline de cenas com adicionar/remover
- Auto-save a cada 30 segundos
- Botao de preview que abre o leitor
- Exporta para Markdown automaticamente

### Gamificacao (`/challenges`, `/profile`)
- **XP e Niveis:** 10 titulos progressivos (Iniciante → Mestre Supremo)
- **Moedas:** economia interna para desbloquear conteudo
- **Conquistas:** 10 badges com 4 raridades (comum, raro, epico, lendario)
- **Sequencia de leitura:** streak diario com recordes
- **Desafios diarios e semanais:** metas com recompensas
- **Notificacoes animadas:** popups de conquista e level up

### Eventos Semanais (`/events`)
| Dia | Evento | Bonus |
|-----|--------|-------|
| Segunda | Dia do Conto | XP x2 |
| Terca | Dia do Criador | Moedas x2 |
| Quarta | Desafio do Vocabulario | Recompensas especiais |
| Quinta | Dia da Aventura | XP x1.5 + sprites tematicos |
| Sexta | Sexta Social | Moedas x2 |
| Sabado | Sabado de Missoes | Recompensas x2 |
| Domingo | Domingo em Familia | XP x3 |

### Painel do Educador (`/dashboard`)
- **Missoes personalizadas:** criar tarefas de leitura, criacao ou educativas
- **Regras de uso:** tempo maximo diario, horarios permitidos, classificacao etaria
- **Toggle de criacao:** permitir ou bloquear criacao de historias
- **Relatorio de progresso:** historias lidas/criadas, sequencia, conquistas, XP total

## Estrutura do Projeto

```
animabook/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home
│   │   ├── layout.tsx                  # Layout global com GameProvider
│   │   ├── providers.tsx               # Client providers (GameContext)
│   │   ├── reader/[storyId]/page.tsx   # Leitor
│   │   ├── editor/[storyId]/page.tsx   # Editor
│   │   ├── dashboard/page.tsx          # Painel educador
│   │   ├── challenges/page.tsx         # Desafios
│   │   ├── events/page.tsx             # Eventos semanais
│   │   ├── profile/page.tsx            # Perfil e conquistas
│   │   └── api/
│   │       ├── assets/route.ts         # Lista sprites/fundos
│   │       └── stories/                # CRUD de historias
│   ├── components/
│   │   ├── Reader/                     # SceneView, SpriteLayer, DialogueBox
│   │   ├── Editor/                     # SceneEditor, SpritePanel, Timeline, etc.
│   │   ├── Gamification/               # XPBar, AchievementPopup, ChallengeCard, etc.
│   │   └── Dashboard/                  # MissionManager, UsageRules, ProgressReport
│   └── lib/
│       ├── types.ts                    # Interfaces: Story, Scene, Sprite, Dialogue
│       ├── parseStory.ts               # Parser Markdown <-> JSON
│       ├── gamification.ts             # XP, niveis, conquistas, eventos, desafios
│       ├── GameContext.tsx              # React Context (estado global, localStorage)
│       ├── storage.ts                  # Cliente Supabase (opcional)
│       └── supabase-schema.sql         # Schema SQL para Supabase
├── data/stories/                       # Historias salvas (JSON e Markdown)
├── public/
│   ├── sprites/                        # PNGs/SVGs dos personagens
│   └── backgrounds/                    # PNGs/SVGs dos cenarios
└── doc/
    ├── PLANO_ANIMABOOK.md              # Plano de implementacao
    └── FEATURES_FUTURAS.md             # Roadmap detalhado
```

## Formato das Historias (Markdown)

As historias usam comentarios HTML em Markdown:

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

**Regras do parser:**
- `<!-- scene: fundo.svg -->` — define o fundo da cena
- `<!-- sprite: arquivo.svg x=% y=% -->` — posiciona sprite
- `<!-- sprite: arquivo.svg x=% y=% scale=1.5 -->` — com escala
- `<!-- sprite: arquivo.svg exit -->` — remove sprite da cena
- `**Nome**: "fala"` — dialogo
- `_texto_` — narrador
- `---` — separador de cenas
- O ID do sprite vem do prefixo do filename (`lumi_feliz.svg` → id `lumi`), garantindo animacao continua ao trocar expressao

## Instalacao

```bash
# Clonar
git clone git@github.com:inematds/animabooksf.git
cd animabooksf

# Instalar dependencias
npm install

# Rodar em desenvolvimento
npm run dev

# Build de producao
npm run build
npm start
```

## Configuracao (Opcional)

### Supabase

O app funciona sem Supabase (usa filesystem local). Para habilitar persistencia na nuvem:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o schema SQL em `src/lib/supabase-schema.sql`
3. Crie os buckets de storage: `sprites`, `backgrounds`, `thumbnails`
4. Copie `.env.local.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### Adicionar Sprites e Fundos

Coloque os arquivos PNG/SVG/WebP em:
- `public/sprites/` — personagens (transparentes, preferencialmente 1024x1024)
- `public/backgrounds/` — cenarios (16:9, preferencialmente 1920x1080)

**Convencao de nomes para sprites:**
- `nomePersonagem.png` — expressao neutra
- `nomePersonagem_feliz.png` — expressao feliz
- `nomePersonagem_triste.png` — expressao triste
- O prefixo antes do `_` define o ID do personagem

## Rotas

| Rota | Tipo | Descricao |
|------|------|-----------|
| `/` | Pagina | Home com lista de historias e navegacao |
| `/reader/[id]` | Pagina | Leitor de historia (SSR) |
| `/editor/new` | Pagina | Criar nova historia |
| `/editor/[id]` | Pagina | Editar historia existente |
| `/dashboard` | Pagina | Painel do educador |
| `/challenges` | Pagina | Desafios diarios e semanais |
| `/events` | Pagina | Calendario de eventos da semana |
| `/profile` | Pagina | Perfil, XP e conquistas |
| `/api/assets` | API | Lista sprites (`?type=sprite`) ou fundos (`?type=background`) |
| `/api/stories` | API | GET lista historias, POST salva historia |
| `/api/stories/[id]` | API | GET/DELETE historia individual |

## Roadmap

- [ ] Integracao com Telegram Bot (historias via chat)
- [ ] Integracao com WhatsApp Business API
- [ ] Geracao de historias com IA (LLM)
- [ ] Audio: vozes com ElevenLabs/TTS
- [ ] Galeria publica de historias
- [ ] Autenticacao (Supabase Auth)
- [ ] PWA com suporte offline
- [ ] Marketplace de sprites e fundos
- [ ] Troca de figurinhas entre criancas
- [ ] Editor de personagens (customizar aparencia)

## Licenca

Projeto privado.

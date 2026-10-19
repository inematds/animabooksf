# Revisão de qualidade — outubro de 2026 (v1.1.0 → v1.2.0)

## Resumo para o Nei

1. O app roda bem no computador e, sem Supabase, guarda tudo em arquivos na pasta `data/`. Montar e compilar funcionam sem erro.
2. Ler uma história, criar outra no editor (personagem, fundo, fala, nova cena, salvar), os modos criativos e a gamificação (XP, conquistas, desafios) funcionam.
3. No celular estava ruim: no leitor tudo ficava sobreposto e os editores nem cabiam na tela. Agora dá para ler e criar pelo celular.
4. Também corrigi um erro que aparecia em todas as páginas, coloquei uma tela de "Fim!" no leitor e o salvamento automático parou de criar histórias vazias.
5. Hoje o site está fora do ar (o Vercel responde 402). Dá para publicar no GitHub Pages, de graça, com 1 a 2 dias de trabalho. Mas aí cada aparelho guarda só as próprias histórias.

## Como foi testado

- `npm run build` (Next 16.1.6, Turbopack) e `next start` numa cópia do repositório na pasta temporária, sem `.env.local`. Assim, as histórias de teste não caíram no `data/` do repo.
- Playwright com Chromium headless, em 390×844 (celular, com toque) e 1366×800, cobrindo `/`, `/reader/demo` do começo ao fim, `/editor/new` (título, personagem Alice, fundo, narrador, fala, arrastar sprite, nova cena, salvar), a home depois de salvar, `/create` e `/create/decoration/new` (adicionar item), `/gallery`, `/challenges`, `/events`, `/profile` e `/dashboard`, além de rotas inexistentes.
- Antes das correções: erro de hidratação React #418 em quase todas as páginas, um `pageerror` em `/create/<modo-inválido>/new`, rolagem lateral no celular no editor (581 px), na galeria (411 px) e no modo criativo (662 px), e o seletor de fundo no celular não abria para clique.
- Depois das correções: nenhum `pageerror`, nenhuma rolagem lateral nas 24 combinações de rota e tela, e o fluxo completo do editor passa nos dois tamanhos. Os únicos "erros" que sobraram são prefetch `_rsc` cancelado ao fechar a aba e o 404 esperado das rotas inexistentes.
- Lint: 21 → 12 problemas (16 → 7 erros). Os 7 que restam são regras do React Compiler sobre padrões antigos e não afetam o build.
- O projeto não tem testes automatizados nem CHANGELOG. O histórico de versões fica na tabela do README, que foi atualizada.
- Screenshots em `revisao/shots/`, fora do git: os `ANTES-*` mostram como era, os outros mostram o estado atual.

## O que funciona

- Leitor: fundo com transição, sprites animados, narrador, balões estilo HQ (no desktop), legenda, setas, teclado, swipe e estrelas de progresso.
- Editor de histórias: 10 categorias de sprites, busca, 15 fundos, diálogos com seletor de personagem, timeline de cenas, salvar (grava `data/stories/<uuid>.json`) e "Ver história".
- Modos criativos (decoração, construção, cidade, moda, campo), com galeria de projetos.
- Gamificação local (localStorage): XP, nível, moedas, conquistas com popup, desafios diários e semanais que se renovam, eventos da semana e perfil.
- Painel do educador (missões e regras de uso).
- Sem Supabase, o `storageAdapter` cai automaticamente no armazenamento em arquivo. O Supabase não é obrigatório.

## O que estava quebrado e foi corrigido

| # | Problema | Correção (arquivo:linha) |
|---|----------|--------------------------|
| 1 | Erro de hidratação React #418 em todas as páginas depois de ler ou criar algo. O `GameProvider` lia o `localStorage` já no primeiro render. | Estado neutro no servidor e carregamento do progresso só depois de montar. A gravação só começa depois de carregar, para não apagar o progresso salvo. `src/lib/GameContext.tsx:111`, `:122`, `:170` |
| 2 | `/create/<modo-inexistente>/new` quebrava a página (`Cannot read properties of undefined (reading 'includes')`). | Aviso amigável "Esse modo de criação não existe" com botão para `/create`. `src/app/create/[mode]/[id]/page.tsx:97` |
| 3 | Leitor sem fim: na última cena o botão "Toque para continuar" não fazia nada. | Tela "Fim! ⭐" com "Ler de novo" e "Início". `src/components/Reader/SceneView.tsx:50`, `:247` |
| 4 | Leitor no celular: sprites com `35vh` (~295 px) dentro de uma cena de ~219 px, cobrindo tudo. | `maxHeight: min(35vh, 30vw)`. No desktop nada muda. `src/components/Reader/SpriteLayer.tsx:71` |
| 5 | Leitor no celular: narrador, dois balões, legenda e título ficavam sobrepostos. | No celular as falas aparecem só na legenda (os balões continuam no `sm+`), e o título de abertura foi para o centro. `src/components/Reader/DialogueBox.tsx:120`, `SceneView.tsx:162` |
| 6 | A legenda trocava a cada 600 ms e o primeiro toque revelava todas as falas de uma vez, então a criança não conseguia ler. | Fala seguinte a cada 2,2 s, e cada toque mostra a próxima fala. `src/components/Reader/DialogueBox.tsx:215`, `:222` |
| 7 | O botão "Toque para continuar" ficava em cima da legenda. | A área de toque ficou mais alta, com o botão acima da legenda. `src/components/Reader/DialogueBox.tsx:306` |
| 8 | Editor de histórias e modo criativo inutilizáveis no celular: 3 colunas em 390 px, rolagem lateral e o modal de fundo fora da tela. | Layout empilhado abaixo de `md` (canvas primeiro, painéis depois), toolbar com quebra de linha e modais com largura máxima. `src/components/Editor/SceneEditor.tsx:333`, `SpritePanel.tsx:76`, `BackgroundSelector.tsx:36`, `src/components/Creative/CreativeEditor.tsx:206`, `ItemPalette.tsx:110`, `ItemControls.tsx:14` |
| 9 | Arrastar sprites ou itens só funcionava com mouse. | Eventos de mouse trocados por pointer events, com `touchAction: none`. `src/components/Editor/SceneEditor.tsx:343`, `:376`, `src/components/Creative/CreativeCanvas.tsx:97`, `:136` |
| 10 | No modo criativo só dava para adicionar item arrastando (HTML5 drag, que não existe no toque). | Tocar ou clicar no item da paleta coloca o item no centro. `src/components/Creative/ItemPalette.tsx:146`, `CreativeEditor.tsx:208` |
| 11 | Botões de remover (✕ do sprite, da cena e da fala) só apareciam com hover, invisíveis no toque. | `pointer-coarse:opacity-100`. `src/components/Editor/SceneEditor.tsx:398`, `Timeline.tsx:41`, `DialogueEditor.tsx:102` |
| 12 | O auto-save gravava a cada 30 s mesmo sem mudança: só abrir `/editor/new` já criava uma "Nova História" vazia. | Só salva se o conteúdo mudou. `src/components/Editor/SceneEditor.tsx:85`, `src/components/Creative/CreativeEditor.tsx:72` |
| 13 | Popups de conquista cobriam o botão Salvar no topo. | Popups movidos para baixo. `src/components/Gamification/AchievementPopup.tsx:25` |
| 14 | Filtros da galeria estouravam a largura no celular. | `flex-wrap`. `src/app/gallery/page.tsx:81` |
| 15 | Estrelas de cenas não visitadas quase invisíveis no fundo escuro. | Opacidade de 0,4 para 0,7. `src/components/Reader/SceneView.tsx:332` |
| 16 | Lint: `useSupabase()` disparava rules-of-hooks (8 erros), mais um `prefer-const`. | Renomeado para `hasSupabase()`. `src/lib/storageAdapter.ts:42`, `src/lib/parseStory.ts:60` |

Versão: `1.1.0 → 1.2.0` em `package.json`, `package-lock.json` (estava 0.1.0) e no README.

## O que continua pendente

**Alta**
- O site está fora do ar (Vercel 402, Pages 404). É preciso decidir onde publicar (ver avaliação abaixo).
- Há só uma história de exemplo (`data/stories/demo.md`). Para crianças, faltam 3 a 5 histórias prontas, curtas e de temas variados.
- Não há autenticação nem moderação. Qualquer pessoa com acesso à URL pode apagar ou alterar histórias pela API (`DELETE /api/stories/[id]`). Isso é aceitável em uso local, não em público.

**Média**
- No editor do celular, o sprite tem tamanho fixo (120 px) num canvas de ~210 px de altura e passa da borda de cima. Seria preciso dimensionar em relação ao canvas.
- No celular as falas aparecem só na legenda. Uma opção de "balões no celular" com fonte maior ajudaria quem tem tablet.
- Não há desfazer (undo) no editor.
- O `router.replace` depois do primeiro save remonta o editor e recarrega a história da API. Funciona, mas pisca.
- A gamificação é por navegador (localStorage). O painel do educador não enxerga o progresso das crianças.

**Baixa**
- Restam 7 erros de lint do React Compiler (setState em effect no `SpriteLayer`/`AchievementPopup`, ref lida no render em `SceneEditor`, `Date.now()` no render em `ChallengeCard`) e 5 warnings.
- Textos sem acento ("Historia", "Inicio", "Voce"). Vale uma passada de revisão de texto.
- `@supabase/supabase-js` continua como dependência mesmo quando não é usado.
- `doc/RELATORIO_V1.1.md` e o `PLANO_EXPANSAO.md` estão desatualizados em relação ao código.

## Avaliação: publicar no GitHub Pages como site estático

**É viável. Esforço médio: 1 a 2 dias de trabalho.** Não foi implementado.

O que precisa mudar:
1. `next.config.ts`: `output: 'export'`, `basePath: '/animabooksf'` e `images.unoptimized: true`, porque o `next/image` não otimiza sem servidor.
2. As 7 rotas de `src/app/api/*` e o `force-dynamic` não existem em export estático. Seria preciso criar um adaptador cliente (`localStorage`/IndexedDB) com a mesma interface do `storageAdapter.ts` (`listStories`, `getStory`, `saveStory`, `deleteStory`, `listProjects`…), que já está isolado. São 8 arquivos com `fetch(`.
3. A história de exemplo e as listas de assets (`/api/assets`, `/api/creative-assets`, que hoje leem pastas do disco) viram JSON estático gerado no build: um script lê `public/` e `data/stories/*.md` e grava `public/data/*.json`.
4. As rotas dinâmicas `[storyId]`, `[id]` e `[mode]/[id]` precisam de `generateStaticParams` para as fixas (`demo`, `new`, os 5 modos). Histórias criadas pelo usuário passam a abrir por `?id=` ou hash (`/reader/?id=...`).
5. Há cerca de 30 caminhos literais `/sprites/`, `/backgrounds/`, `/assets/` e `/api/` no `src` que quebram sob `/animabooksf/` sem um helper de prefixo (`withBase()`). Essa é a maior parte do trabalho braçal.
6. Workflow do Pages (Actions) ou build para `docs/`. Lembrete: o push de workflow pela conta `inematds` vai por SSH.

Limites depois da migração:
- Cada aparelho e navegador guarda só as suas histórias. Não há compartilhamento entre crianças nem turma, e limpar o navegador apaga tudo. Exportar e importar `.json` seria um paliativo barato.
- O painel do educador não agrega o progresso dos alunos.
- O `localStorage` aguenta poucos MB. Para histórias só com referências a SVG, dá folga.
- Para ter compartilhamento de verdade, voltar a um backend (o Supabase já está preparado em `src/lib/storage.ts` + `supabase-schema.sql`) ou usar Vercel ou outra hospedagem com servidor.

## Ideias de melhoria para crianças e educadores (8)

1. **Narração em voz alta**: botão 🔊 que lê narrador e falas com `speechSynthesis` do navegador (pt-BR, grátis, offline). Ajuda muito quem ainda não lê (3 a 6 anos).
2. **Destaque da palavra lida** (karaokê) na legenda, junto com a narração, para treinar leitura.
3. **Pergunta no fim da história**: o editor permite cadastrar 1 a 3 perguntas de múltipla escolha, que aparecem na tela "Fim!" e dão XP. Vira atividade de interpretação de texto.
4. **Pacote de histórias prontas** por faixa etária (3–5, 6–8, 9–12), já que o app abre com uma só.
5. **Exportar e importar história (.json) e "imprimir como livrinho"** (PDF com uma cena por página), para o educador levar para a sala sem servidor.
6. **Modo turma no painel do educador**: código de turma e lista de histórias criadas pelos alunos (exige backend; dá para começar só com exportar e importar).
7. **Gravar a própria voz** na fala do personagem (MediaRecorder), guardada junto com a história, para a criança narrar a própria história.
8. **Fonte e tamanho acessíveis**: opção de letra maior e fonte bastão (caixa alta) no leitor, para alfabetização inicial.

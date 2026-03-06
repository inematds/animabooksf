# TODO - Animabook SF

Plano de execucao em 4 fases. Cada fase resulta em algo testavel.

---

## FASE 1: Gamificacao Conectada + Bugs de State -- CONCLUIDA

### 1.1 Conectar `recordStoryRead()` ao Reader
- [x] `src/components/Reader/SceneView.tsx` - Chama `recordStoryRead()` ao concluir ultima cena (com useRef anti-duplicata)

### 1.2 Conectar `recordStoryCreated()` ao Editor
- [x] `src/app/editor/[storyId]/page.tsx` - Chama `recordStoryCreated()` apenas na primeira vez que salva historia nova

### 1.3 Corrigir mutacao direta de state
- [x] `src/lib/GameContext.tsx` - Clona array unlockedAchievements antes de modificar, usa spread imutavel em recordStoryRead e recordStoryCreated

### 1.4 Renovar desafios expirados
- [x] `src/lib/GameContext.tsx` - Na inicializacao, detecta challenges expirados e gera novos daily/weekly automaticamente

### 1.5 Corrigir AchievementPopup
- [x] `src/components/Gamification/AchievementPopup.tsx` - Usa interval de 1s que limpa notificacoes com mais de 4s por timestamp

### 1.6 Corrigir ProfileCard icones
- [x] `src/components/Gamification/ProfileCard.tsx` - Faz lookup em DEFAULT_ACHIEVEMENTS para mostrar icone real

---

## FASE 2: Storage Adapter Dual-Mode (FS + Supabase) -- CONCLUIDA

### 2.1 Criar adapter de storage
- [x] `src/lib/storageAdapter.ts` - Detecta automaticamente se usa Supabase (env vars) ou filesystem

### 2.2 Refatorar API routes
- [x] `src/app/api/stories/route.ts` - Usa adapter + validacao de POST
- [x] `src/app/api/stories/[id]/route.ts` - Usa adapter
- [x] `src/app/api/assets/route.ts` - Usa adapter

### 2.3 Refatorar pages server-side
- [x] `src/app/page.tsx` - Usa adapter + `dynamic = 'force-dynamic'`
- [x] `src/app/reader/[storyId]/page.tsx` - Usa adapter

### 2.4 Validacao no POST
- [x] `src/app/api/stories/route.ts` - Valida title e scenes antes de salvar

---

## FASE 3: UI de Gestao + Imagens -- CONCLUIDA

### 3.1 Botao deletar historia
- [x] `src/app/HomeContent.tsx` - Botao com confirmacao, remove da lista e chama router.refresh()

### 3.2 Home page dinamica
- [x] `src/app/page.tsx` - `export const dynamic = 'force-dynamic'`

### 3.3 Fallback para imagens inexistentes
- [x] `src/components/Reader/SpriteLayer.tsx` - Placeholder com onError por sprite
- [x] `src/components/Editor/SceneEditor.tsx` - Placeholder para background inexistente

---

## FASE 4: Auto-save + Limpeza -- CONCLUIDA

### 4.1 Auto-save com feedback visual
- [x] `src/components/Editor/SceneEditor.tsx` - Mostra "Auto-salvo" (verde) ou "Falha no auto-save" (amarelo)

### 4.2 Remover @dnd-kit/core
- [x] `package.json` - Removida dependencia nao utilizada

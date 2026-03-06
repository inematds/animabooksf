# Revisao Completa - Animabook SF

Data: 2026-03-06
Status do build: COMPILA SEM ERROS (mas tem problemas funcionais graves)

---

## O QUE E O PROJETO

Plataforma de historias infantis interativas onde criancas podem criar e ler historias com personagens animados (sprites) sobre cenarios ilustrados.

**Diferenciais planejados:**
- Sprites reutilizaveis com expressoes (lumi.svg, lumi_feliz.svg) que entram/saem das cenas
- Crianca como autora (editor visual de cenas + dialogos)
- Gamificacao profunda (XP, streaks, eventos tematicos por dia, conquistas por raridade, sprites desbloqueaveis)
- Controle parental integrado (tempo, horarios, classificacao etaria)
- Formato aberto Markdown (versionavel, editavel em qualquer editor)
- Dual storage: filesystem local + Supabase para deploy

---

## PROBLEMAS CRITICOS (app nao funciona como planejado)

### 1. Gamificacao totalmente desconectada das funcionalidades

O sistema de gamificacao (XP, conquistas, desafios, streaks) esta 100% implementado no GameContext, mas NADA no app aciona ele:

- `recordStoryRead()` - NUNCA e chamado no Reader. Quando o usuario le uma historia, nenhum XP e dado, nenhum streak e contado, nenhum desafio progride.
- `recordStoryCreated()` - NUNCA e chamado no Editor. Quando o usuario salva/cria uma historia, nenhuma recompensa e dada.
- `unlockSprite()` - NUNCA e chamado em nenhum lugar.

**Arquivos afetados:**
- `src/app/reader/[storyId]/page.tsx` - nao chama recordStoryRead
- `src/app/editor/[storyId]/page.tsx` - nao chama recordStoryCreated
- `src/components/Reader/SceneView.tsx` - nao interage com GameContext

**Impacto:** Toda a aba de Desafios, Eventos, Perfil e Dashboard mostra zeros eternamente. O sistema de gamificacao e decorativo.

---

### 2. Supabase totalmente morto (codigo existe mas nunca e usado)

O arquivo `src/lib/storage.ts` implementa:
- `saveStoryToSupabase()`
- `loadStoryFromSupabase()`
- `listStoriesFromSupabase()`
- `uploadAsset()`

Mas NENHUMA dessas funcoes e importada ou chamada em qualquer lugar do app. O app usa exclusivamente filesystem local (`data/stories/` + `fs.readFileSync`).

**Impacto:** O schema SQL, o .env.local.example, e toda a infraestrutura Supabase sao inuteis. Mesmo configurando as env vars, nada muda.

---

### 3. Deploy impossivel (dependencia de filesystem)

Todas as operacoes de leitura/escrita usam `fs` diretamente:
- `src/app/page.tsx` - le historias com `fs.readdirSync`
- `src/app/reader/[storyId]/page.tsx` - le historia com `fs.readFileSync`
- `src/app/api/stories/route.ts` - salva com `fs.writeFileSync`
- `src/app/api/stories/[id]/route.ts` - le com `fs.readFileSync`
- `src/app/api/assets/route.ts` - lista sprites com `fs.readdirSync`

**Impacto:** Em plataformas serverless (Vercel, Netlify, etc.), arquivos escritos pela API sao efemeros. Historias criadas desaparecem entre deploys ou entre invocacoes de funcoes. O app so funciona em desenvolvimento local.

---

### 4. Desafios expiram e nunca se renovam

`generateDailyChallenges()` e `generateWeeklyChallenges()` sao chamados uma unica vez na inicializacao do GameProvider. Quando os desafios expiram, o usuario ve "Expirado" para sempre. Nao ha logica para detectar desafios expirados e gerar novos.

**Arquivo:** `src/lib/GameContext.tsx:121-129`

---

## PROBLEMAS MEDIOS (bugs e UX quebrada)

### 5. Mutacao direta do state React no GameContext

Em `recordStoryRead()` e `recordStoryCreated()`, o codigo faz:
```typescript
updatedProfile.unlockedAchievements.push(ach.id);
```
Isso muta o array do state anterior diretamente (spread copia a referencia do array, nao o array em si). Pode causar bugs de renderizacao e comportamento imprevisivel.

**Arquivo:** `src/lib/GameContext.tsx:258, 300`

---

### 6. ProfileCard mostra icone generico para conquistas

Em `ProfileCard.tsx:66`, conquistas desbloqueadas mostram sempre uma estrela generica em vez do icone real da conquista:
```tsx
{/* We'd look up the achievement icon here */}
```
O TODO nunca foi implementado.

**Arquivo:** `src/components/Gamification/ProfileCard.tsx:64-69`

---

### 7. Sem botao de deletar historias na UI

A API tem endpoint `DELETE /api/stories/[id]` implementado, mas a interface (HomeContent) nao tem nenhum botao ou acao para deletar historias.

---

### 8. Dependencia `@dnd-kit/core` instalada mas nunca usada

Listada no `package.json` mas nao importada em nenhum arquivo. Aumenta o tamanho do bundle desnecessariamente.

---

### 9. Sem fallback para imagens inexistentes

Se um sprite ou background referenciado nao existe em `/public/sprites/` ou `/public/backgrounds/`, o componente `Image` do Next.js quebra com erro 404. Nao ha tratamento de erro ou imagem placeholder.

---

### 10. AchievementPopup pode perder notificacoes

O `useEffect` que auto-dispensa notificacoes sempre referencia a ultima da lista. Se multiplas notificacoes chegam rapidamente, as anteriores ficam presas na tela.

**Arquivo:** `src/components/Gamification/AchievementPopup.tsx:11-17`

---

## PROBLEMAS MENORES

### 11. Auto-save silencioso pode confundir

O auto-save a cada 30s falha silenciosamente. O usuario nao tem indicacao visual de que o auto-save esta funcionando ou falhando.

### 12. Editor nao tem "desfazer" (undo)

Nenhum historico de acoes. Uma vez que o usuario remove uma cena ou sprite, nao ha como voltar (alem de recarregar sem salvar).

### 13. Sem validacao no save

O POST /api/stories aceita qualquer JSON sem validar a estrutura da Story. Body malformado e salvo no disco.

### 14. Home page e reader sao server components mas nao revalidam

A home page e estatica (prerendered). Historias criadas via editor so aparecem na home depois de um refresh completo ou rebuild. Falta `revalidatePath` ou `dynamic = 'force-dynamic'`.

---

## RESUMO DO ESTADO

| Funcionalidade | Status |
|---|---|
| Home page (listar historias) | Funciona local, mas estatica (nao atualiza sem rebuild) |
| Editor (criar/editar cenas) | Funciona local |
| Reader (ler historias) | Funciona local |
| Salvar historias | Funciona local, perde dados em deploy |
| Supabase | Codigo morto - nunca chamado |
| Gamificacao (XP/Nivel/Streak) | UI existe, mas contadores nunca incrementam |
| Desafios | Mostram, mas expiram e nunca renovam |
| Conquistas | Logica existe, mas nunca e disparada |
| Eventos semanais | Mostram corretamente (hardcoded) |
| Dashboard educador | UI funciona, dados sempre zerados |
| Missoes | Funcionam (criacao manual) |
| Deletar historias | API existe, UI nao |
| Deploy (Vercel) | Impossivel sem migrar para Supabase |

# Animabook SF - Features Futuras

## 1. Acesso via Telegram / WhatsApp

### Telegram Bot
- Bot que envia as historias como mensagens interativas
- Cada cena = uma imagem (composicao sprite+fundo) + texto do dialogo
- Botoes inline para "Proximo" / "Anterior"
- Pai/educador cria a historia no web editor, crianca consome via Telegram
- Possibilidade de respostas interativas (crianca escolhe opcoes)
- Vantagem: Telegram suporta bots ricos com imagens, botoes, e quizzes nativos

### WhatsApp (via API Business)
- Similar ao Telegram mas via WhatsApp Business API
- Envio de imagens com legenda (cena + dialogo)
- Botoes de resposta rapida para navegacao
- Mais restritivo que Telegram, mas alcance maior no Brasil

### Arquitetura de Integracao
```
Editor Web → Salva historia no Supabase
                    ↓
Bot Telegram / WhatsApp API ← Le historia do Supabase
                    ↓
Gera imagem composta (sprite sobre fundo) com Sharp/Canvas
                    ↓
Envia para crianca via chat
```

---

## 2. Gestao por Pais/Educadores

### Painel de Controle
- Dashboard para pai/educador gerenciar criancas vinculadas
- Definir **regras de uso**: tempo maximo por dia, horarios permitidos
- Ver **relatorio de progresso**: historias lidas, missoes completadas

### Regras Configuraveis
- Tempo de tela maximo (ex: 30 min/dia)
- Horarios permitidos (ex: 14h-18h)
- Historias liberadas/bloqueadas por faixa etaria
- Modo "so leitura" vs "criacao permitida"

### Missoes/Tarefas
- Pai cria missoes: "Leia 3 historias esta semana"
- Missoes com recompensas: desbloqueia sprites/fundos novos
- Missoes educativas: "Crie uma historia sobre amizade"

---

## 3. Gamificacao

### Sistema de Pontos e Niveis
- **Estrelas**: ganhas ao completar historias
- **Moedas**: ganhas ao completar missoes, usadas para desbloquear conteudo
- **Niveis**: Iniciante → Leitor → Contador → Mestre das Historias
- **XP progressivo**: barra de experiencia visual

### Conquistas/Badges
- "Primeiro Conto" - leu sua primeira historia
- "Autor Iniciante" - criou sua primeira historia
- "Explorador" - leu historias de 5 temas diferentes
- "Social" - compartilhou uma historia
- "Colecionador" - desbloqueou 10 sprites
- "Maratonista" - leu 3 historias em um dia

### Colecao de Sprites
- Sprites desbloqueaveis como recompensa
- Album de figurinhas digital
- Sprites raros em eventos especiais
- Troca de figurinhas entre criancas (futuro)

---

## 4. Desafios Semanais

### Desafios de Leitura
- "Leia uma historia de aventura"
- "Leia uma historia antes de dormir 3 dias seguidos"
- "Descubra o final secreto"

### Desafios de Criacao
- "Crie uma historia com 3 personagens"
- "Invente uma historia sobre um animal"
- "Crie uma historia com começo, meio e fim"
- "Use pelo menos 2 cenarios diferentes"

### Desafios Educativos
- "Encontre 5 palavras novas na historia"
- "Reconte a historia com suas palavras"
- "Desenhe seu personagem favorito" (upload de foto)

---

## 5. Dias de Eventos Semanais

### Calendario Semanal
| Dia | Evento | Descricao |
|-----|--------|-----------|
| Segunda | Dia do Conto | Historia em destaque, bonus de XP por leitura |
| Terca | Dia do Criador | Bonus duplo por criar historias |
| Quarta | Desafio do Vocabulario | Quiz de palavras das historias lidas |
| Quinta | Dia da Aventura | Historias de aventura em destaque, sprites tematicos |
| Sexta | Sexta Social | Compartilhe historias com amigos, bonus por compartilhar |
| Sabado | Sabado de Missoes | Missoes especiais com recompensas raras |
| Domingo | Domingo em Familia | Modo "leitura em familia" com 2+ jogadores |

### Eventos Especiais (Mensais/Sazonais)
- Natal: personagens e cenarios natalinos exclusivos
- Halloween: historias de "terror leve" para criancas
- Dia das Criancas: competicao de criacao, votacao da melhor historia
- Volta as Aulas: historias sobre escola, amizade
- Ferias: maratona de leitura com premios

### Sistema de Eventos
- Notificacao push/Telegram quando evento comecar
- Timer countdown na tela inicial
- Recompensas exclusivas que so aparecem durante o evento
- Ranking dos participantes do evento

---

## Prioridade de Implementacao

| Feature | Prioridade | Complexidade | Fase |
|---------|-----------|--------------|------|
| Gamificacao (pontos, niveis) | Alta | Media | 2 |
| Desafios semanais | Alta | Media | 2 |
| Painel educador | Alta | Alta | 2 |
| Dias de eventos | Media | Media | 3 |
| Bot Telegram | Media | Media | 3 |
| WhatsApp API | Baixa | Alta | 4 |
| Troca de figurinhas | Baixa | Alta | 4+ |

---

## Modelos de Banco Adicionais (Supabase)

```sql
-- Perfis de criancas
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  parent_id UUID REFERENCES auth.users(id),
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  coins INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Missoes
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'reading', 'creation', 'educational'
  reward_xp INT DEFAULT 10,
  reward_coins INT DEFAULT 5,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES children(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Conquistas
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB NOT NULL -- ex: {"type": "stories_read", "count": 5}
);

-- Conquistas desbloqueadas
CREATE TABLE child_achievements (
  child_id UUID REFERENCES children(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (child_id, achievement_id)
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'weekly', 'monthly', 'seasonal'
  day_of_week INT, -- 0=domingo, 1=segunda, etc
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  rewards JSONB,
  active BOOLEAN DEFAULT true
);

-- Regras de uso (definidas pelos pais)
CREATE TABLE usage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id),
  max_minutes_per_day INT DEFAULT 60,
  allowed_hours_start TIME DEFAULT '08:00',
  allowed_hours_end TIME DEFAULT '20:00',
  creation_allowed BOOLEAN DEFAULT true,
  age_rating TEXT DEFAULT 'all'
);
```

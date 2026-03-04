// Gamification types and logic

export interface ChildProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  coins: number;
  storiesRead: number;
  storiesCreated: number;
  currentStreak: number; // dias seguidos lendo
  longestStreak: number;
  lastActiveDate?: string; // ISO date string (YYYY-MM-DD) for streak tracking
  challengesCompleted: number;
  eventsParticipated: number;
  unlockedSprites: string[];
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  criteria: AchievementCriteria;
  rewardXp: number;
  rewardCoins: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: 'stories_read' | 'stories_created' | 'streak' | 'challenges_completed' | 'sprites_collected' | 'events_participated';
  count: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'creation' | 'educational';
  rewardXp: number;
  rewardCoins: number;
  assignedTo?: string; // child ID
  createdBy?: string; // parent ID
  dueDate?: string;
  completedAt?: string;
  progress: number; // 0-100
  target: number;
  current: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  rewardXp: number;
  rewardCoins: number;
  rewardSprite?: string;
  target: number;
  current: number;
  expiresAt: string;
}

export interface WeeklyEvent {
  id: string;
  name: string;
  description: string;
  dayOfWeek: number; // 0=domingo
  icon: string;
  bonusType: 'xp_multiplier' | 'coins_multiplier' | 'special_rewards';
  bonusValue: number;
  specialSprites?: string[];
  active: boolean;
}

export interface UsageRule {
  childId: string;
  maxMinutesPerDay: number;
  allowedHoursStart: string; // "08:00"
  allowedHoursEnd: string;   // "20:00"
  creationAllowed: boolean;
  ageRating: 'all' | '3+' | '6+' | '9+' | '12+';
}

// Level calculation
export function getLevelFromXp(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450...
  let level = 1;
  let required = 0;
  while (required <= xp) {
    level++;
    required += level * 50;
  }
  return level - 1;
}

export function getXpForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += i * 50;
  }
  return total;
}

export function getXpForNextLevel(level: number): number {
  return getXpForLevel(level + 1);
}

export function getXpProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForNextLevel(level);
  const current = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { current, needed, percentage: Math.min(100, (current / needed) * 100) };
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Leitor Curioso',
  3: 'Contador de Historias',
  4: 'Explorador',
  5: 'Aventureiro',
  6: 'Mestre dos Contos',
  7: 'Lenda Viva',
  8: 'Guardiao das Historias',
  9: 'Sabio das Palavras',
  10: 'Mestre Supremo',
};

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, 10)] || `Nivel ${level}`;
}

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_read',
    name: 'Primeiro Conto',
    description: 'Leu sua primeira historia',
    icon: '📖',
    criteria: { type: 'stories_read', count: 1 },
    rewardXp: 20,
    rewardCoins: 10,
    rarity: 'common',
  },
  {
    id: 'bookworm',
    name: 'Rato de Biblioteca',
    description: 'Leu 10 historias',
    icon: '🐛',
    criteria: { type: 'stories_read', count: 10 },
    rewardXp: 100,
    rewardCoins: 50,
    rarity: 'rare',
  },
  {
    id: 'first_story',
    name: 'Autor Iniciante',
    description: 'Criou sua primeira historia',
    icon: '✍️',
    criteria: { type: 'stories_created', count: 1 },
    rewardXp: 30,
    rewardCoins: 15,
    rarity: 'common',
  },
  {
    id: 'prolific',
    name: 'Escritor Prolifico',
    description: 'Criou 5 historias',
    icon: '📚',
    criteria: { type: 'stories_created', count: 5 },
    rewardXp: 150,
    rewardCoins: 75,
    rarity: 'rare',
  },
  {
    id: 'streak_3',
    name: 'Constancia',
    description: '3 dias seguidos lendo',
    icon: '🔥',
    criteria: { type: 'streak', count: 3 },
    rewardXp: 50,
    rewardCoins: 25,
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Semana de Ouro',
    description: '7 dias seguidos lendo',
    icon: '⭐',
    criteria: { type: 'streak', count: 7 },
    rewardXp: 200,
    rewardCoins: 100,
    rarity: 'epic',
  },
  {
    id: 'streak_30',
    name: 'Lenda da Leitura',
    description: '30 dias seguidos lendo',
    icon: '👑',
    criteria: { type: 'streak', count: 30 },
    rewardXp: 1000,
    rewardCoins: 500,
    rarity: 'legendary',
  },
  {
    id: 'collector_10',
    name: 'Colecionador',
    description: 'Desbloqueou 10 sprites',
    icon: '🎭',
    criteria: { type: 'sprites_collected', count: 10 },
    rewardXp: 100,
    rewardCoins: 50,
    rarity: 'rare',
  },
  {
    id: 'challenger',
    name: 'Desafiante',
    description: 'Completou 5 desafios',
    icon: '🏆',
    criteria: { type: 'challenges_completed', count: 5 },
    rewardXp: 150,
    rewardCoins: 75,
    rarity: 'rare',
  },
  {
    id: 'event_lover',
    name: 'Faca Chuva ou Faca Sol',
    description: 'Participou de 10 eventos',
    icon: '🎪',
    criteria: { type: 'events_participated', count: 10 },
    rewardXp: 200,
    rewardCoins: 100,
    rarity: 'epic',
  },
];

// Default weekly events
export const DEFAULT_WEEKLY_EVENTS: WeeklyEvent[] = [
  {
    id: 'monday_tales',
    name: 'Dia do Conto',
    description: 'Historia em destaque! XP em dobro por leitura.',
    dayOfWeek: 1,
    icon: '📖',
    bonusType: 'xp_multiplier',
    bonusValue: 2,
    active: true,
  },
  {
    id: 'tuesday_creator',
    name: 'Dia do Criador',
    description: 'Crie historias e ganhe moedas em dobro!',
    dayOfWeek: 2,
    icon: '✨',
    bonusType: 'coins_multiplier',
    bonusValue: 2,
    active: true,
  },
  {
    id: 'wednesday_vocab',
    name: 'Desafio do Vocabulario',
    description: 'Quiz de palavras das historias lidas. Recompensas especiais!',
    dayOfWeek: 3,
    icon: '🧠',
    bonusType: 'special_rewards',
    bonusValue: 1,
    active: true,
  },
  {
    id: 'thursday_adventure',
    name: 'Dia da Aventura',
    description: 'Historias de aventura em destaque. Sprites tematicos!',
    dayOfWeek: 4,
    icon: '🗺️',
    bonusType: 'xp_multiplier',
    bonusValue: 1.5,
    specialSprites: ['aventureiro_chapeu', 'mapa_tesouro'],
    active: true,
  },
  {
    id: 'friday_social',
    name: 'Sexta Social',
    description: 'Compartilhe historias e ganhe bonus!',
    dayOfWeek: 5,
    icon: '🤝',
    bonusType: 'coins_multiplier',
    bonusValue: 2,
    active: true,
  },
  {
    id: 'saturday_missions',
    name: 'Sabado de Missoes',
    description: 'Missoes especiais com recompensas raras!',
    dayOfWeek: 6,
    icon: '🎯',
    bonusType: 'special_rewards',
    bonusValue: 2,
    active: true,
  },
  {
    id: 'sunday_family',
    name: 'Domingo em Familia',
    description: 'Leitura em familia! XP triplo para todos.',
    dayOfWeek: 0,
    icon: '👨‍👩‍👧‍👦',
    bonusType: 'xp_multiplier',
    bonusValue: 3,
    active: true,
  },
];

// Default challenges generator
export function generateWeeklyChallenges(): Challenge[] {
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  return [
    {
      id: `weekly_read_${now.getTime()}`,
      title: 'Leitor da Semana',
      description: 'Leia 3 historias esta semana',
      type: 'weekly',
      rewardXp: 100,
      rewardCoins: 50,
      target: 3,
      current: 0,
      expiresAt: endOfWeek.toISOString(),
    },
    {
      id: `weekly_create_${now.getTime()}`,
      title: 'Criador da Semana',
      description: 'Crie 1 historia esta semana',
      type: 'weekly',
      rewardXp: 80,
      rewardCoins: 40,
      target: 1,
      current: 0,
      expiresAt: endOfWeek.toISOString(),
    },
    {
      id: `weekly_streak_${now.getTime()}`,
      title: 'Fogo na Leitura',
      description: 'Leia historias 5 dias seguidos',
      type: 'weekly',
      rewardXp: 150,
      rewardCoins: 75,
      rewardSprite: 'badge_fogo',
      target: 5,
      current: 0,
      expiresAt: endOfWeek.toISOString(),
    },
  ];
}

export function generateDailyChallenges(): Challenge[] {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: `daily_read_${now.getTime()}`,
      title: 'Leitura do Dia',
      description: 'Leia 1 historia hoje',
      type: 'daily',
      rewardXp: 20,
      rewardCoins: 10,
      target: 1,
      current: 0,
      expiresAt: endOfDay.toISOString(),
    },
  ];
}

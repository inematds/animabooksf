'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  ChildProfile,
  Challenge,
  Mission,
  Achievement,
  WeeklyEvent,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_WEEKLY_EVENTS,
  generateWeeklyChallenges,
  generateDailyChallenges,
  getLevelFromXp,
  getLevelTitle,
} from './gamification';

interface GameState {
  profile: ChildProfile;
  challenges: Challenge[];
  missions: Mission[];
  achievements: Achievement[];
  weeklyEvents: WeeklyEvent[];
  todayEvent: WeeklyEvent | null;
  notifications: GameNotification[];
}

export interface GameNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'reward' | 'challenge_complete' | 'event';
  title: string;
  message: string;
  icon: string;
  timestamp: number;
}

interface GameContextType extends GameState {
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  recordStoryRead: () => void;
  recordStoryCreated: () => void;
  updateChallenge: (challengeId: string, progress: number) => void;
  completeMission: (missionId: string) => void;
  addMission: (mission: Mission) => void;
  dismissNotification: (id: string) => void;
  unlockSprite: (spriteId: string) => void;
}

const DEFAULT_PROFILE: ChildProfile = {
  id: 'local-child',
  name: 'Jogador',
  xp: 0,
  level: 1,
  coins: 0,
  storiesRead: 0,
  storiesCreated: 0,
  currentStreak: 0,
  longestStreak: 0,
  unlockedSprites: [],
  unlockedAchievements: [],
};

const STORAGE_KEY = 'animabook_sf_game';

function loadState(): GameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState(state: GameState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadState();
    const today = new Date().getDay();
    const todayEvent = DEFAULT_WEEKLY_EVENTS.find((e) => e.dayOfWeek === today && e.active) || null;

    if (saved) {
      return { ...saved, todayEvent, weeklyEvents: DEFAULT_WEEKLY_EVENTS };
    }

    return {
      profile: DEFAULT_PROFILE,
      challenges: [...generateDailyChallenges(), ...generateWeeklyChallenges()],
      missions: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      weeklyEvents: DEFAULT_WEEKLY_EVENTS,
      todayEvent,
      notifications: [],
    };
  });

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addNotification = useCallback((notif: Omit<GameNotification, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        { ...notif, id: crypto.randomUUID(), timestamp: Date.now() },
      ],
    }));
  }, []);

  const checkAchievements = useCallback(
    (profile: ChildProfile) => {
      const newUnlocks: Achievement[] = [];

      for (const achievement of DEFAULT_ACHIEVEMENTS) {
        if (profile.unlockedAchievements.includes(achievement.id)) continue;

        let achieved = false;
        switch (achievement.criteria.type) {
          case 'stories_read':
            achieved = profile.storiesRead >= achievement.criteria.count;
            break;
          case 'stories_created':
            achieved = profile.storiesCreated >= achievement.criteria.count;
            break;
          case 'streak':
            achieved = profile.currentStreak >= achievement.criteria.count;
            break;
          case 'sprites_collected':
            achieved = profile.unlockedSprites.length >= achievement.criteria.count;
            break;
        }

        if (achieved) {
          newUnlocks.push(achievement);
        }
      }

      return newUnlocks;
    },
    []
  );

  const addXp = useCallback(
    (amount: number) => {
      setState((prev) => {
        // Apply event multiplier
        let finalAmount = amount;
        if (prev.todayEvent?.bonusType === 'xp_multiplier') {
          finalAmount = Math.round(amount * prev.todayEvent.bonusValue);
        }

        const newXp = prev.profile.xp + finalAmount;
        const newLevel = getLevelFromXp(newXp);
        const leveledUp = newLevel > prev.profile.level;

        const updatedProfile = {
          ...prev.profile,
          xp: newXp,
          level: newLevel,
        };

        const newNotifs = [...prev.notifications];

        if (leveledUp) {
          newNotifs.push({
            id: crypto.randomUUID(),
            type: 'level_up',
            title: 'Subiu de Nivel!',
            message: `Voce agora e ${getLevelTitle(newLevel)} (Nivel ${newLevel})!`,
            icon: '🎉',
            timestamp: Date.now(),
          });
        }

        return { ...prev, profile: updatedProfile, notifications: newNotifs };
      });
    },
    []
  );

  const addCoins = useCallback((amount: number) => {
    setState((prev) => {
      let finalAmount = amount;
      if (prev.todayEvent?.bonusType === 'coins_multiplier') {
        finalAmount = Math.round(amount * prev.todayEvent.bonusValue);
      }
      return {
        ...prev,
        profile: { ...prev.profile, coins: prev.profile.coins + finalAmount },
      };
    });
  }, []);

  const recordStoryRead = useCallback(() => {
    setState((prev) => {
      const updatedProfile = {
        ...prev.profile,
        storiesRead: prev.profile.storiesRead + 1,
        currentStreak: prev.profile.currentStreak + 1,
        longestStreak: Math.max(prev.profile.longestStreak, prev.profile.currentStreak + 1),
      };

      // Check achievements
      const newAchievements = checkAchievements(updatedProfile);
      const notifs = [...prev.notifications];

      for (const ach of newAchievements) {
        updatedProfile.unlockedAchievements.push(ach.id);
        updatedProfile.xp += ach.rewardXp;
        updatedProfile.coins += ach.rewardCoins;
        notifs.push({
          id: crypto.randomUUID(),
          type: 'achievement',
          title: 'Conquista Desbloqueada!',
          message: `${ach.icon} ${ach.name}: ${ach.description}`,
          icon: ach.icon,
          timestamp: Date.now(),
        });
      }

      // Update challenges
      const challenges = prev.challenges.map((c) => {
        if (c.title.includes('Leitura') || c.title.includes('Leitor')) {
          return { ...c, current: Math.min(c.target, c.current + 1) };
        }
        if (c.title.includes('Fogo') || c.title.includes('streak')) {
          return { ...c, current: updatedProfile.currentStreak };
        }
        return c;
      });

      return { ...prev, profile: updatedProfile, challenges, notifications: notifs };
    });

    addXp(15);
    addCoins(5);
  }, [addXp, addCoins, checkAchievements]);

  const recordStoryCreated = useCallback(() => {
    setState((prev) => {
      const updatedProfile = {
        ...prev.profile,
        storiesCreated: prev.profile.storiesCreated + 1,
      };

      const newAchievements = checkAchievements(updatedProfile);
      const notifs = [...prev.notifications];

      for (const ach of newAchievements) {
        updatedProfile.unlockedAchievements.push(ach.id);
        updatedProfile.xp += ach.rewardXp;
        updatedProfile.coins += ach.rewardCoins;
        notifs.push({
          id: crypto.randomUUID(),
          type: 'achievement',
          title: 'Conquista Desbloqueada!',
          message: `${ach.icon} ${ach.name}: ${ach.description}`,
          icon: ach.icon,
          timestamp: Date.now(),
        });
      }

      const challenges = prev.challenges.map((c) => {
        if (c.title.includes('Criador') || c.title.includes('Cria')) {
          return { ...c, current: Math.min(c.target, c.current + 1) };
        }
        return c;
      });

      return { ...prev, profile: updatedProfile, challenges, notifications: notifs };
    });

    addXp(25);
    addCoins(15);
  }, [addXp, addCoins, checkAchievements]);

  const updateChallenge = useCallback((challengeId: string, progress: number) => {
    setState((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) =>
        c.id === challengeId ? { ...c, current: Math.min(c.target, progress) } : c
      ),
    }));
  }, []);

  const completeMission = useCallback((missionId: string) => {
    setState((prev) => {
      const mission = prev.missions.find((m) => m.id === missionId);
      if (!mission || mission.completedAt) return prev;

      return {
        ...prev,
        missions: prev.missions.map((m) =>
          m.id === missionId ? { ...m, completedAt: new Date().toISOString(), progress: 100 } : m
        ),
        profile: {
          ...prev.profile,
          xp: prev.profile.xp + mission.rewardXp,
          coins: prev.profile.coins + mission.rewardCoins,
        },
        notifications: [
          ...prev.notifications,
          {
            id: crypto.randomUUID(),
            type: 'reward' as const,
            title: 'Missao Completa!',
            message: `+${mission.rewardXp} XP, +${mission.rewardCoins} moedas`,
            icon: '🎯',
            timestamp: Date.now(),
          },
        ],
      };
    });
  }, []);

  const addMission = useCallback((mission: Mission) => {
    setState((prev) => ({
      ...prev,
      missions: [...prev.missions, mission],
    }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const unlockSprite = useCallback((spriteId: string) => {
    setState((prev) => {
      if (prev.profile.unlockedSprites.includes(spriteId)) return prev;
      return {
        ...prev,
        profile: {
          ...prev.profile,
          unlockedSprites: [...prev.profile.unlockedSprites, spriteId],
        },
      };
    });
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        addXp,
        addCoins,
        recordStoryRead,
        recordStoryCreated,
        updateChallenge,
        completeMission,
        addMission,
        dismissNotification,
        unlockSprite,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

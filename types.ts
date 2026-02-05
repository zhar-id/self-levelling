
export enum QuestType {
  DAILY = 'DAILY',
  SIDE = 'SIDE',
  ROUTINE = 'ROUTINE',
  WORKOUT = 'WORKOUT',
  MAIN = 'MAIN'
}

export enum QuestRank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export enum HabitLevel {
  A = 'A',
  B = 'B',
  C = 'C'
}

export interface Habit {
  id: string;
  title: string;
  level: HabitLevel;
  completedToday: boolean;
  streak: number;
}

export interface Stats {
  strength: number;
  vitality: number;
  agility: number;
  intelligence: number;
  unspentPoints: number;
}

export interface CurrentBoss {
  name: string;
  image: string;
  hp: number;
  maxHp: number;
  rank: QuestRank;
  defeated: boolean;
  id: string;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  rank: QuestRank; 
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  coins: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  inventory: any[];
  stats: Stats;
  monthlyIncome: number;
  totalSpentThisMonth: number;
  dailySavingsBalance: number; // Saldo akumulasi dari hari sebelumnya
  lastResetDate: string; // Format YYYY-MM-DD
  hasPenalty: boolean;
  penaltyExpiry: number;
  lastResetWeek: number;
  currentBoss?: CurrentBoss;
  startDate: number;
  lastActiveDate: string;
  missionStreak: number;
  routineStreak: number;
  questsCleared: number;
  habitsCleared: number;
  mainMissionsCleared: number;
  bossKills: number;
  activityHistory: Record<string, number>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  rank: QuestRank;
  rewardExp: number;
  rewardGold: number;
  completed: boolean;
  createdAt: number;
  targetDate: string;
  isRoutine: boolean;
  isMain: boolean;
  scheduledDays?: number[];
}

export interface Transaction {
  id: string;
  amount: number;
  note: string;
  category: string;
  date: number; // timestamp
  dateString: string; // YYYY-MM-DD untuk filtering
}

export interface JournalEntry {
  id: string;
  content: string;
  date: number;
  tags: string[];
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  rewardExp: number;
  rewardGold: number;
  image: string;
}

export interface Card {
  id: string;
  name: string;
  damage: number;
  manaCost: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description: string;
}

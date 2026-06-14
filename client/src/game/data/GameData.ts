export interface PlayerStats {
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface GameProgress {
  currentDungeon: number;
  dungeonsCompleted: number[];
  bossDefeated: boolean;
  totalPlayTime: number;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  level: number;
  questionsAnswered: number;
  accuracy: number;
  completionTime: number;
  date: string;
}

export interface GameSave {
  id: string;
  playerName: string;
  stats: PlayerStats;
  progress: GameProgress;
  createdAt: string;
  updatedAt: string;
}

// Default player stats
export const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  health: 100,
  maxHealth: 100,
  experience: 0,
  score: 0,
  questionsAnswered: 0,
  correctAnswers: 0
};

// Default game progress
export const DEFAULT_GAME_PROGRESS: GameProgress = {
  currentDungeon: 1,
  dungeonsCompleted: [],
  bossDefeated: false,
  totalPlayTime: 0
};

// Dungeon configurations
export interface DungeonConfig {
  id: number;
  name: string;
  requiredLevel: number;
  enemyCount: number;
  questionDifficulty: number;
  bossType?: string;
}

export const DUNGEON_CONFIGS: DungeonConfig[] = [
  {
    id: 1,
    name: "Skeleton Crypt",
    requiredLevel: 1,
    enemyCount: 8,
    questionDifficulty: 1
  },
  {
    id: 2,
    name: "Zombie Graveyard",
    requiredLevel: 3,
    enemyCount: 12,
    questionDifficulty: 2
  },
  {
    id: 3,
    name: "Bat Caverns",
    requiredLevel: 5,
    enemyCount: 15,
    questionDifficulty: 3
  },
  {
    id: 4,
    name: "Shadow Depths",
    requiredLevel: 7,
    enemyCount: 18,
    questionDifficulty: 4
  },
  {
    id: 5,
    name: "Boss Chamber",
    requiredLevel: 10,
    enemyCount: 1,
    questionDifficulty: 5,
    bossType: "FinalBoss"
  }
];

// Enemy configurations
export interface EnemyConfig {
  type: string;
  health: number;
  damage: number;
  speed: number;
  attackRange: number;
  detectionRange: number;
  experienceReward: number;
  scoreReward: number;
}

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  skeleton: {
    type: "skeleton",
    health: 30,
    damage: 15,
    speed: 60,
    attackRange: 32,
    detectionRange: 160,
    experienceReward: 10,
    scoreReward: 50
  },
  zombie: {
    type: "zombie",
    health: 50,
    damage: 20,
    speed: 30,
    attackRange: 32,
    detectionRange: 170,
    experienceReward: 15,
    scoreReward: 75
  },
  bat: {
    type: "bat",
    health: 20,
    damage: 10,
    speed: 80,
    attackRange: 64,
    detectionRange: 180,
    experienceReward: 8,
    scoreReward: 40
  },
  boss: {
    type: "boss",
    health: 200,
    damage: 35,
    speed: 90,
    attackRange: 64,
    detectionRange: 100,
    experienceReward: 100,
    scoreReward: 1000
  }
};

// Game constants
export const GAME_CONFIG = {
  PLAYER_SPEED: 120,
  BULLET_SPEED: 500,
  BULLET_DAMAGE: 25,
  LEVEL_UP_EXP: 100,
  QUESTION_SCORE_BONUS: 100,
  WRONG_ANSWER_PENALTY: -20,
  HEALTH_POTION_HEAL: 30,
  MAX_BULLETS: 5
};
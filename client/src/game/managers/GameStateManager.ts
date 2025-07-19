import { PlayerStats, GameProgress, GameSave, HighScore } from '../data/GameData';

export class GameStateManager {
  private static instance: GameStateManager;
  private currentSave: GameSave | null = null;
  private highScores: HighScore[] = [];

  private constructor() {
    this.loadHighScores();
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  // Save Management
  public createNewSave(playerName: string): GameSave {
    const newSave: GameSave = {
      id: Date.now().toString(),
      playerName,
      stats: {
        level: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        score: 0,
        questionsAnswered: 0,
        correctAnswers: 0
      },
      progress: {
        currentDungeon: 1,
        dungeonsCompleted: [],
        bossDefeated: false,
        totalPlayTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.currentSave = newSave;
    this.saveToPersistence();
    return newSave;
  }

  public loadSave(saveId: string): GameSave | null {
    const saves = this.getAllSaves();
    const save = saves.find(s => s.id === saveId);
    if (save) {
      this.currentSave = save;
    }
    return save;
  }

  public updateCurrentSave(stats: Partial<PlayerStats>, progress?: Partial<GameProgress>): void {
    if (!this.currentSave) return;

    this.currentSave.stats = { ...this.currentSave.stats, ...stats };
    if (progress) {
      this.currentSave.progress = { ...this.currentSave.progress, ...progress };
    }
    this.currentSave.updatedAt = new Date().toISOString();
    this.saveToPersistence();
  }

  public getCurrentSave(): GameSave | null {
    return this.currentSave;
  }

  public getAllSaves(): GameSave[] {
    const saves = localStorage.getItem('gameSaves');
    return saves ? JSON.parse(saves) : [];
  }

  public deleteSave(saveId: string): void {
    const saves = this.getAllSaves();
    const filteredSaves = saves.filter(save => save.id !== saveId);
    localStorage.setItem('gameSaves', JSON.stringify(filteredSaves));

    if (this.currentSave && this.currentSave.id === saveId) {
      this.currentSave = null;
    }
  }

  private saveToPersistence(): void {
    if (!this.currentSave) return;

    const saves = this.getAllSaves();
    const existingIndex = saves.findIndex(save => save.id === this.currentSave!.id);

    if (existingIndex >= 0) {
      saves[existingIndex] = this.currentSave;
    } else {
      saves.push(this.currentSave);
    }

    localStorage.setItem('gameSaves', JSON.stringify(saves));
  }

  // High Score Management
  public addHighScore(score: HighScore): void {
    this.highScores.push(score);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 50); // Keep top 50
    this.saveHighScores();
  }

  public getHighScores(limit: number = 10): HighScore[] {
    return this.highScores.slice(0, limit);
  }

  public getPlayerHighScore(playerName: string): HighScore | null {
    return this.highScores.find(score => score.playerName === playerName) || null;
  }

  private loadHighScores(): void {
    const scores = localStorage.getItem('highScores');
    this.highScores = scores ? JSON.parse(scores) : [];
  }

  private saveHighScores(): void {
    localStorage.setItem('highScores', JSON.stringify(this.highScores));
  }

  // Game Progress Helpers
  public isDungeonUnlocked(dungeonId: number): boolean {
    if (!this.currentSave) return dungeonId === 1;
    return this.currentSave.progress.dungeonsCompleted.includes(dungeonId - 1) || dungeonId === 1;
  }

  public completeDungeon(dungeonId: number): void {
    if (!this.currentSave) return;

    if (!this.currentSave.progress.dungeonsCompleted.includes(dungeonId)) {
      this.currentSave.progress.dungeonsCompleted.push(dungeonId);
    }

    if (dungeonId === 5) {
      this.currentSave.progress.bossDefeated = true;
    }

    this.saveToPersistence();
  }

  public resetProgress(): void {
    if (!this.currentSave) return;

    this.currentSave.progress = {
      currentDungeon: 1,
      dungeonsCompleted: [],
      bossDefeated: false,
      totalPlayTime: 0
    };

    this.saveToPersistence();
  }

  // Export/Import functionality for potential cloud saves
  public exportSave(): string {
    if (!this.currentSave) return '';
    return btoa(JSON.stringify(this.currentSave));
  }

  public importSave(exportedData: string): boolean {
    try {
      const saveData = JSON.parse(atob(exportedData));
      if (this.validateSaveData(saveData)) {
        this.currentSave = saveData;
        this.saveToPersistence();
        return true;
      }
    } catch (error) {
      console.error('Failed to import save data:', error);
    }
    return false;
  }

  private validateSaveData(data: any): boolean {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.playerName === 'string' &&
      data.stats &&
      data.progress &&
      typeof data.createdAt === 'string' &&
      typeof data.updatedAt === 'string'
    );
  }

  // Statistics
  public getGameStatistics(): any {
    const saves = this.getAllSaves();
    const totalPlayers = saves.length;
    const totalGamesCompleted = saves.filter(save => save.progress.bossDefeated).length;
    const averageScore = saves.reduce((sum, save) => sum + save.stats.score, 0) / totalPlayers || 0;
    const averageLevel = saves.reduce((sum, save) => sum + save.stats.level, 0) / totalPlayers || 0;

    return {
      totalPlayers,
      totalGamesCompleted,
      averageScore: Math.round(averageScore),
      averageLevel: Math.round(averageLevel),
      completionRate: totalPlayers > 0 ? Math.round((totalGamesCompleted / totalPlayers) * 100) : 0
    };
  }
}
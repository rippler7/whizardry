import { GameScene } from './GameScene';

export class DungeonScene extends GameScene {
  constructor() {
    super();
    this.scene.key = 'DungeonScene';
  }

  init(data: any): void {
    // Increment dungeon ID for progression
    (this as any).dungeonId = (data.dungeonId || 1) + 1;
    (this as any).difficulty = data.difficulty || 1;
    
    if (data.playerStats) {
      (this as any).restorePlayerStats = data.playerStats;
    }
  }
}
import { GameScene } from './GameScene';

export class BossScene extends GameScene {
  constructor() {
    super();
    this.scene.key = 'BossScene';
  }

  init(data: any): void {
    // Boss level is always dungeon 5
    (this as any).dungeonId = 5;
    (this as any).difficulty = data.difficulty || 1;
    
    if (data.playerStats) {
      (this as any).restorePlayerStats = data.playerStats;
    }
  }

  create(): void {
    super.create();
    
    // Play boss music
    this.sound.stopAll();
    const bossMusic = this.sound.add('bossTheme', {
      loop: true,
      volume: 0.3
    });
    bossMusic.play();
    
    // Show boss introduction
    this.showBossIntro();
  }

  private showBossIntro(): void {
    const introText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'FINAL BOSS BATTLE!\nDefeat the Orc Lord to complete your quest!',
      {
        fontSize: '28px',
        fill: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
    
    this.time.delayedCall(4000, () => {
      introText.destroy();
    });
  }

  private onBossDefeated(): void {
    // Override parent completion logic
    this.scene.start('GameOverScene', {
      victory: true,
      playerStats: {
        level: (this as any).player.level,
        health: (this as any).player.health,
        maxHealth: (this as any).player.maxHealth,
        experience: (this as any).player.experience,
        score: (this as any).player.score,
        questionsAnswered: (this as any).player.questionsAnswered,
        correctAnswers: (this as any).player.correctAnswers
      }
    });
  }
}
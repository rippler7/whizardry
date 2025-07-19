import * as Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any) {
    this.registry.set('gameData', data);
  }

  create() {
    const { width, height } = this.scale;
    const gameData = this.registry.get('gameData');
    const victory = gameData?.victory || false;
    const stats = gameData?.playerStats || {};

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, victory ? 0x0a4a0a : 0x4a0a0a);

    // Title
    const title = victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = victory ? '#00ff00' : '#ff4444';
    
    this.add.text(width / 2, height / 4, title, {
      fontSize: '48px',
      fill: titleColor,
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);

    // Stats
    const statsY = height / 2 - 50;
    this.add.text(width / 2, statsY, 'Final Statistics:', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const statLines = [
      `Score: ${stats.score || 0}`,
      `Health: ${stats.health || 0}`,
      `Questions Answered: ${stats.questionsAnswered || 0}`,
      `Correct Answers: ${stats.correctAnswers || 0}`
    ];

    statLines.forEach((line, index) => {
      this.add.text(width / 2, statsY + 40 + (index * 25), line, {
        fontSize: '18px',
        fill: '#cccccc',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });

    // Buttons
    const buttonY = height * 0.8;

    // Play Again button
    const playAgainButton = this.add.text(width / 2 - 100, buttonY, 'PLAY AGAIN', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    playAgainButton.on('pointerdown', () => {
      this.scene.start('DungeonGameScene', { dungeon: 1, health: 100, score: 0 });
    });

    playAgainButton.on('pointerover', () => {
      playAgainButton.setScale(1.1);
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setScale(1.0);
    });

    // Main Menu button
    const menuButton = this.add.text(width / 2 + 100, buttonY, 'MAIN MENU', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      backgroundColor: '#333300',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });

    menuButton.on('pointerout', () => {
      menuButton.setScale(1.0);
    });

    // Victory message
    if (victory) {
      this.add.text(width / 2, height / 3, 'You have completed all dungeons and defeated the boss!', {
        fontSize: '16px',
        fill: '#88ff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 3, 'Better luck next time! Keep learning and try again.', {
        fontSize: '16px',
        fill: '#ff8888',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }
}
import * as Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private victory: boolean = false;
  private playerStats: any = {};

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any): void {
    this.victory = data.victory || false;
    this.playerStats = data.playerStats || {};
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Background
    this.cameras.main.setBackgroundColor(this.victory ? '#1a4d1a' : '#4d1a1a');
    
    // Title
    const titleText = this.victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = this.victory ? '#00ff00' : '#ff0000';
    
    this.add.text(width / 2, height / 4, titleText, {
      fontSize: '64px',
      fill: titleColor,
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.victory 
      ? 'Congratulations! You have completed all dungeons!'
      : 'Better luck next time!';
    
    this.add.text(width / 2, height / 4 + 80, subtitle, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Stats display
    this.displayStats();
    
    // Buttons
    this.createButtons();
    
    // Save high score
    this.saveHighScore();
    
    // Play appropriate sound
    this.sound.stopAll();
    if (this.victory) {
      // Play victory music if available
      this.sound.play('star', { volume: 0.6 });
    }
  }

  private displayStats(): void {
    const { width, height } = this.scale;
    const stats = this.playerStats;
    
    const accuracy = stats.questionsAnswered > 0 
      ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
      : 0;
    
    const statsText = [
      `Final Level: ${stats.level || 1}`,
      `Final Score: ${stats.score || 0}`,
      `Questions Answered: ${stats.questionsAnswered || 0}`,
      `Correct Answers: ${stats.correctAnswers || 0}`,
      `Accuracy: ${accuracy}%`,
    ].join('\n');
    
    this.add.text(width / 2, height / 2, statsText, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 10,
      backgroundColor: '#000000',
      padding: { x: 20, y: 15 }
    }).setOrigin(0.5);
  }

  private createButtons(): void {
    const { width, height } = this.scale;
    
    // Play Again button
    const playAgainButton = this.add.text(width / 2, height * 0.75, 'PLAY AGAIN', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // Main Menu button
    const mainMenuButton = this.add.text(width / 2, height * 0.85, 'MAIN MENU', {
      fontSize: '24px',
      fill: '#ffaa00',
      fontFamily: 'Arial',
      backgroundColor: '#332200',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // High Scores button
    const highScoresButton = this.add.text(width / 2, height * 0.95, 'HIGH SCORES', {
      fontSize: '20px',
      fill: '#44ddff',
      fontFamily: 'Arial',
      backgroundColor: '#002233',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // Button interactions
    this.setupButtonInteractions(playAgainButton, () => {
      this.scene.start('MainMenuScene');
    });
    
    this.setupButtonInteractions(mainMenuButton, () => {
      this.scene.start('MainMenuScene');
    });
    
    this.setupButtonInteractions(highScoresButton, () => {
      this.showHighScores();
    });
  }

  private setupButtonInteractions(button: Phaser.GameObjects.Text, callback: () => void): void {
    const originalStyle = { ...button.style };
    
    button.on('pointerover', () => {
      button.setStyle({ fill: '#ffff00' });
      button.setScale(1.05);
    });
    
    button.on('pointerout', () => {
      button.setStyle(originalStyle);
      button.setScale(1.0);
    });
    
    button.on('pointerdown', callback);
  }

  private saveHighScore(): void {
    if (!this.victory) return;
    
    const stats = this.playerStats;
    const accuracy = stats.questionsAnswered > 0 
      ? (stats.correctAnswers / stats.questionsAnswered) * 100
      : 0;
    
    const highScore = {
      id: Date.now().toString(),
      playerName: 'Player', // TODO: Get from user input
      score: stats.score || 0,
      level: stats.level || 1,
      questionsAnswered: stats.questionsAnswered || 0,
      accuracy: Math.round(accuracy),
      completionTime: Date.now(), // TODO: Track actual play time
      date: new Date().toISOString()
    };
    
    // Save to localStorage for now (will be replaced with proper backend)
    const existingScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    existingScores.push(highScore);
    
    // Keep only top 10 scores
    existingScores.sort((a: any, b: any) => b.score - a.score);
    existingScores.splice(10);
    
    localStorage.setItem('highScores', JSON.stringify(existingScores));
    
    // Emit event for potential React state updates
    if (window.gameEventEmitter) {
      window.gameEventEmitter('highScoreAdded', highScore);
    }
  }

  private showHighScores(): void {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    
    if (highScores.length === 0) {
      this.showMessage('No high scores yet!');
      return;
    }
    
    const { width, height } = this.scale;
    
    // Create modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, width * 0.8, height * 0.8, 0x000000, 0.9);
    
    // Title
    const title = this.add.text(width / 2, height * 0.2, 'HIGH SCORES', {
      fontSize: '32px',
      fill: '#ffdd44',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    // Score list
    const scoreTexts = highScores.slice(0, 10).map((score: any, index: number) => {
      return `${index + 1}. ${score.playerName} - ${score.score} pts (Lv.${score.level})`;
    }).join('\n');
    
    const scoreList = this.add.text(width / 2, height / 2, scoreTexts, {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    
    // Close button
    const closeButton = this.add.text(width / 2, height * 0.8, 'CLOSE', {
      fontSize: '20px',
      fill: '#ff4444',
      fontFamily: 'Arial',
      backgroundColor: '#330000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    closeButton.on('pointerdown', () => {
      modalBg.destroy();
      title.destroy();
      scoreList.destroy();
      closeButton.destroy();
    });
  }

  private showMessage(message: string): void {
    const { width, height } = this.scale;
    
    const messageText = this.add.text(width / 2, height / 2, message, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }
}
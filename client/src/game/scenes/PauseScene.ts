import * as Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Semi-transparent background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1c1917, 0.85)
      .setScrollFactor(0);
    
    // Pause title
    this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '48px',
      fill: '#fbbf24',
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
      stroke: '#78350f',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Resume button
    const resumeButton = this.add.text(width / 2, height / 2, 'RESUME', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
      backgroundColor: '#92400e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Main menu button
    const mainMenuButton = this.add.text(width / 2, height / 2 + 60, 'MAIN MENU', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
      backgroundColor: '#78350f',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Quit button
    const quitButton = this.add.text(width / 2, height / 2 + 120, 'QUIT GAME', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
      backgroundColor: '#78350f',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Button interactions
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ fill: '#fbbf24', backgroundColor: '#b45309' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ fill: '#fef3c7', backgroundColor: '#92400e' });
    });
    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });
    
    mainMenuButton.on('pointerover', () => {
      mainMenuButton.setStyle({ fill: '#fbbf24', backgroundColor: '#92400e' });
    });
    mainMenuButton.on('pointerout', () => {
      mainMenuButton.setStyle({ fill: '#fef3c7', backgroundColor: '#78350f' });
    });
    mainMenuButton.on('pointerdown', () => {
      this.goToMainMenu();
    });
    
    quitButton.on('pointerover', () => {
      quitButton.setStyle({ fill: '#f87171', backgroundColor: '#92400e' });
    });
    quitButton.on('pointerout', () => {
      quitButton.setStyle({ fill: '#fef3c7', backgroundColor: '#78350f' });
    });
    quitButton.on('pointerdown', () => {
      this.quitGame();
    });
    
    // Keyboard controls
    this.input.keyboard!.on('keydown-ESC', () => {
      this.resumeGame();
    });
    
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.resumeGame();
    });
  }
  
  private resumeGame(): void {
    this.scene.stop();
    this.scene.resume('GameScene');
    
    // Notify the game scene it's resumed
    const gameScene = this.scene.get('GameScene') as any;
    if (gameScene && gameScene.resume) {
      gameScene.resume();
    }
  }
  
  private goToMainMenu(): void {
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MainMenuScene');
  }
  
  private quitGame(): void {
    // Close the game (works in desktop environments)
    if (this.game.device.os.desktop) {
      this.game.destroy(true);
    } else {
      // On web, just go to main menu
      this.goToMainMenu();
    }
  }
}
import * as Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Semi-transparent background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setScrollFactor(0);
    
    // Pause title
    this.add.text(width / 2, height / 2 - 100, 'PAUSED', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Resume button
    const resumeButton = this.add.text(width / 2, height / 2, 'RESUME', {
      fontSize: '24px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Main menu button
    const mainMenuButton = this.add.text(width / 2, height / 2 + 60, 'MAIN MENU', {
      fontSize: '24px',
      fill: '#ffaa00',
      fontFamily: 'Arial',
      backgroundColor: '#332200',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Quit button
    const quitButton = this.add.text(width / 2, height / 2 + 120, 'QUIT GAME', {
      fontSize: '24px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      backgroundColor: '#330000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    
    // Button interactions
    resumeButton.on('pointerover', () => {
      resumeButton.setStyle({ fill: '#88ff88' });
    });
    resumeButton.on('pointerout', () => {
      resumeButton.setStyle({ fill: '#00ff00' });
    });
    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });
    
    mainMenuButton.on('pointerover', () => {
      mainMenuButton.setStyle({ fill: '#ffdd88' });
    });
    mainMenuButton.on('pointerout', () => {
      mainMenuButton.setStyle({ fill: '#ffaa00' });
    });
    mainMenuButton.on('pointerdown', () => {
      this.goToMainMenu();
    });
    
    quitButton.on('pointerover', () => {
      quitButton.setStyle({ fill: '#ff8888' });
    });
    quitButton.on('pointerout', () => {
      quitButton.setStyle({ fill: '#ff0000' });
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
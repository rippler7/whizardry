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
    const resumeBtnBg = this.add.rectangle(width / 2, height / 2, 220, 50, 0x92400e)
      .setRounded(12).setInteractive({ useHandCursor: true }).setScrollFactor(0);
      
    const resumeButton = this.add.text(width / 2, height / 2, 'RESUME', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Main menu button
    const mainMenuBtnBg = this.add.rectangle(width / 2, height / 2 + 70, 220, 50, 0x78350f)
      .setRounded(12).setInteractive({ useHandCursor: true }).setScrollFactor(0);
      
    const mainMenuButton = this.add.text(width / 2, height / 2 + 70, 'MAIN MENU', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Quit button
    const quitBtnBg = this.add.rectangle(width / 2, height / 2 + 140, 220, 50, 0x78350f)
      .setRounded(12).setInteractive({ useHandCursor: true }).setScrollFactor(0);
      
    const quitButton = this.add.text(width / 2, height / 2 + 140, 'QUIT GAME', {
      fontSize: '24px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
    }).setOrigin(0.5).setScrollFactor(0);
    
    // Button interactions
    resumeBtnBg.on('pointerover', () => {
      resumeBtnBg.setScale(1.05); resumeButton.setScale(1.05); resumeBtnBg.setFillStyle(0xb45309);
    });
    resumeBtnBg.on('pointerout', () => {
      resumeBtnBg.setScale(1.0); resumeButton.setScale(1.0); resumeBtnBg.setFillStyle(0x92400e);
    });
    resumeBtnBg.on('pointerdown', () => {
      this.resumeGame();
    });
    
    mainMenuBtnBg.on('pointerover', () => {
      mainMenuBtnBg.setScale(1.05); mainMenuButton.setScale(1.05); mainMenuBtnBg.setFillStyle(0x92400e);
    });
    mainMenuBtnBg.on('pointerout', () => {
      mainMenuBtnBg.setScale(1.0); mainMenuButton.setScale(1.0); mainMenuBtnBg.setFillStyle(0x78350f);
    });
    mainMenuBtnBg.on('pointerdown', () => {
      this.goToMainMenu();
    });
    
    quitBtnBg.on('pointerover', () => {
      quitBtnBg.setScale(1.05); quitButton.setScale(1.05); quitBtnBg.setFillStyle(0x92400e);
    });
    quitBtnBg.on('pointerout', () => {
      quitBtnBg.setScale(1.0); quitButton.setScale(1.0); quitBtnBg.setFillStyle(0x78350f);
    });
    quitBtnBg.on('pointerdown', () => {
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
    const gameScene = this.scene.manager.getScenes(false).find(s => s.sys.isPaused());
    this.scene.stop();
    if (gameScene) {
      this.scene.resume(gameScene.scene.key);
    }
  }
  
  private goToMainMenu(): void {
    const gameScene = this.scene.manager.getScenes(false).find(s => s.sys.isPaused());
    if (gameScene) {
      this.scene.stop(gameScene.scene.key);
    }
    this.scene.stop();
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
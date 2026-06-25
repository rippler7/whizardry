import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startButton?: Phaser.GameObjects.Text;
  private instructionsText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload(): void {
    // Load menu assets
    this.load.audio('air_fight', 'assets/audio/moodmode-8-bit-air-fight-158813.mp3');
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Add background
    const bg = this.add.tileSprite(0, 0, width, height, 'cobbledsquare');
    bg.setOrigin(0, 0);
    
    // Logo
    const logo = this.add.image(width / 2, height / 4, 'logo');
    logo.setOrigin(0.5);
    logo.setScale(0.8); // Adjust scale as needed
    
    // Subtitle
    this.add.text(width / 2, height / 4 + 100, 'Educational RPG Adventure', { // Adjusted position
      fontSize: '22px',
      fill: '#fde68a',
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    // Instructions
    this.instructionsText = this.add.text(width / 2, height / 2, 
      'Explore dungeons, defeat enemies, and answer questions to progress!\n\n' +
      'Controls:\n' +
      '• Arrow Keys or WASD - Move\n' +
      '• SPACE - Shoot\n' +
      '• Mouse - Aim\n' +
      '• Numbers 1-4 - Answer questions',
      {
        fontSize: '18px',
        fill: '#d6d3d1',
        fontFamily: '"Georgia", "Times New Roman", serif',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);
    
    // Start button
    this.startButton = this.add.text(width / 2, height * 0.8, 'START GAME', {
      fontSize: '28px',
      fill: '#fef3c7',
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
      backgroundColor: '#92400e',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive();
    
    // Difficulty buttons
    const easyButton = this.add.text(width / 2 - 150, height * 0.9, 'EASY', {
      fontSize: '20px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
      backgroundColor: '#78350f',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    const hardButton = this.add.text(width / 2 + 150, height * 0.9, 'HARD', {
      fontSize: '20px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
      backgroundColor: '#78350f',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // Button interactions
    this.setupButtonInteractions();
    
    // Button events
    this.startButton.on('pointerdown', () => {
      this.startGame(1);
    });
    
    easyButton.on('pointerdown', () => {
      this.startGame(0);
    });
    
    hardButton.on('pointerdown', () => {
      this.startGame(2);
    });
    
    // Keyboard input
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.startGame(1);
    });
    
    // Start background music
    this.playBackgroundMusic();
    
    // Logo animation
    this.tweens.add({
      targets: logo,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
  
  private setupButtonInteractions(): void {
    const buttons = [this.startButton];
    
    buttons.forEach(button => {
      if (!button) return;
      
      button.on('pointerover', () => {
        button.setStyle({ fill: '#fbbf24', backgroundColor: '#b45309' });
        button.setScale(1.1);
      });
      
      button.on('pointerout', () => {
        button.setStyle({ fill: '#fef3c7', backgroundColor: '#92400e' });
        button.setScale(1.0);
      });
    });
  }
  
  private playBackgroundMusic(): void {
    if (!this.sound.get('air_fight')) {
      const music = this.sound.add('air_fight', {
        loop: true,
        volume: 0.3
      });
      music.play();
    }
  }
  
  private startGame(difficulty: number): void {
    // Stop menu music
    this.sound.stopAll();
    
    // Start the first dungeon scene
    this.scene.start('GameScene', { 
      difficulty: difficulty,
      dungeonId: 1,
      playerStats: {
        level: 1,
        health: 100,
        maxHealth: 100,
        experience: 0,
        score: 0,
        questionsAnswered: 0,
        correctAnswers: 0
      }
    });
  }
}
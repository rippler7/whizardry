import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private startButton?: Phaser.GameObjects.Text;
  private titleText?: Phaser.GameObjects.Text;
  private instructionsText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload(): void {
    // Load menu assets
    this.load.audio('menuMusic', [
      'assets/audio/enchanted_forest.mp3',
      'assets/audio/enchanted_forest_loop.ogg'
    ]);
  }

  create(): void {
    const { width, height } = this.scale;
    
    // Add background color
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // Title
    this.titleText = this.add.text(width / 2, height / 4, 'DUNGEON QUEST', {
      fontSize: '48px',
      fill: '#ffdd44',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Subtitle
    this.add.text(width / 2, height / 4 + 80, 'Educational RPG Adventure', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
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
        fill: '#cccccc',
        fontFamily: 'Arial',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);
    
    // Start button
    this.startButton = this.add.text(width / 2, height * 0.8, 'START GAME', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial Black',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // Difficulty buttons
    const easyButton = this.add.text(width / 2 - 150, height * 0.9, 'EASY', {
      fontSize: '20px',
      fill: '#88ff88',
      fontFamily: 'Arial',
      backgroundColor: '#002200',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    const hardButton = this.add.text(width / 2 + 150, height * 0.9, 'HARD', {
      fontSize: '20px',
      fill: '#ff8888',
      fontFamily: 'Arial',
      backgroundColor: '#220000',
      padding: { x: 15, y: 8 }
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
    
    // Title animation
    this.tweens.add({
      targets: this.titleText,
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
        button.setStyle({ fill: '#ffff00' });
        button.setScale(1.1);
      });
      
      button.on('pointerout', () => {
        button.setStyle({ fill: '#00ff00' });
        button.setScale(1.0);
      });
    });
  }
  
  private playBackgroundMusic(): void {
    if (!this.sound.get('menuMusic')) {
      const music = this.sound.add('menuMusic', {
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
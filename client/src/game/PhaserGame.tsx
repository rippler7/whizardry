import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DungeonGameScene } from './scenes/DungeonGameScene';
import { GameOverScene } from './scenes/GameOverScene';

interface PhaserGameProps {
  onGameEvent: (event: string, data: any) => void;
}

// Main Menu Scene
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    
    // Title
    this.add.text(width / 2, height / 3, 'DUNGEON QUEST', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    
    this.add.text(width / 2, height / 3 + 60, 'Educational RPG Adventure', {
      fontSize: '20px',
      fill: '#ffaa00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Start button
    const startButton = this.add.text(width / 2, height / 2, 'START GAME', {
      fontSize: '28px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    startButton.on('pointerdown', () => {
      this.scene.start('DungeonGameScene', { dungeon: 1, health: 100, score: 0 });
    });
    
    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
    });
    
    startButton.on('pointerout', () => {
      startButton.setScale(1.0);
    });
    
    // Instructions
    this.add.text(width / 2, height * 0.75, 'Instructions:', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const instructions = [
      'Use WASD or Arrow Keys to move',
      'SPACE to shoot (aim with mouse)',
      'Click chests to answer questions',
      'Answer all 4 questions to unlock the door',
      'Reach dungeon 5 and defeat the boss!'
    ];
    
    instructions.forEach((instruction, index) => {
      this.add.text(width / 2, height * 0.75 + 30 + (index * 20), instruction, {
        fontSize: '14px',
        fill: '#cccccc',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });
  }
}

// Legacy demo scene (keeping for reference)
class DemoScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key };
  private treasures: Phaser.GameObjects.GameObject[] = [];
  private enemies: Phaser.GameObjects.GameObject[] = [];
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private level: number = 1;
  private questionsAnswered: number = 0;

  constructor() {
    super({ key: 'DemoScene' });
  }

  preload() {
    // Create simple colored rectangles for demo
    this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d4a22);

    // Title
    this.add.text(width / 2, 50, 'Dungeon Quest - Modernized', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'Educational Phaser 3 RPG', {
      fontSize: '16px',
      fill: '#ffff99',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Player character (blue square)
    this.player = this.add.rectangle(width / 2, height / 2, 32, 32, 0x4a90e2);
    this.player.setStrokeStyle(2, 0xffffff);

    // Create some walls/obstacles
    this.add.rectangle(200, 200, 64, 64, 0x8b4513).setStrokeStyle(2, 0x654321);
    this.add.rectangle(400, 300, 64, 64, 0x8b4513).setStrokeStyle(2, 0x654321);
    this.add.rectangle(600, 150, 64, 64, 0x8b4513).setStrokeStyle(2, 0x654321);

    // Create some enemies (red squares)
    this.add.rectangle(150, 350, 24, 24, 0xe74c3c).setStrokeStyle(2, 0x8b0000);
    this.add.rectangle(450, 200, 24, 24, 0xe74c3c).setStrokeStyle(2, 0x8b0000);
    this.add.rectangle(550, 400, 24, 24, 0xe74c3c).setStrokeStyle(2, 0x8b0000);

    // Create interactive treasures (yellow circles)
    const treasure1 = this.add.circle(100, 100, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12).setInteractive();
    const treasure2 = this.add.circle(700, 100, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12).setInteractive();
    const treasure3 = this.add.circle(100, 450, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12).setInteractive();
    const treasure4 = this.add.circle(700, 450, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12).setInteractive();
    
    this.treasures = [treasure1, treasure2, treasure3, treasure4];
    
    // Add treasure interaction
    this.treasures.forEach((treasure, index) => {
      treasure.on('pointerdown', () => this.collectTreasure(treasure, index));
    });

    // Controls
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };

    // Instructions
    this.add.text(width / 2, height - 80, 'Use WASD or Arrow Keys to Move', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 60, 'Features: Enhanced AI • Dungeon Progression • Educational Content', {
      fontSize: '12px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 40, 'Modernized from PHP/SQL to React/JSON Architecture', {
      fontSize: '12px',
      fill: '#99ff99',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Dynamic game stats
    this.add.text(20, 20, `Level: ${this.level}`, { fontSize: '16px', fill: '#ffffff' });
    this.add.text(20, 40, 'Health: 100/100', { fontSize: '16px', fill: '#ff6b6b' });
    this.scoreText = this.add.text(20, 60, `Score: ${this.score}`, { fontSize: '16px', fill: '#4ecdc4' });
    this.add.text(20, 80, `Questions: ${this.questionsAnswered}/20`, { fontSize: '16px', fill: '#ffe66d' });
    
    // Click instructions
    this.add.text(width / 2, height - 20, 'Click on treasures to answer questions!', {
      fontSize: '12px',
      fill: '#ffdd00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  update() {
    if (!this.player || !this.cursors || !this.wasd) return;

    const speed = 3;
    let moving = false;

    // Movement with WASD or arrow keys
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.x -= speed;
      moving = true;
    }
    if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.x += speed;
      moving = true;
    }
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.y -= speed;
      moving = true;
    }
    if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.y += speed;
      moving = true;
    }

    // Keep player in bounds
    const margin = 16;
    this.player.x = Phaser.Math.Clamp(this.player.x, margin, this.scale.width - margin);
    this.player.y = Phaser.Math.Clamp(this.player.y, margin, this.scale.height - margin);

    // Visual feedback when moving
    if (moving) {
      this.player.setFillStyle(0x5dade2);
    } else {
      this.player.setFillStyle(0x4a90e2);
    }
  }

  private collectTreasure(treasure: Phaser.GameObjects.GameObject, index: number) {
    // Sample educational questions
    const questions = [
      { q: "What is 5 + 3?", options: ["6", "7", "8", "9"], correct: "8" },
      { q: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: "Paris" },
      { q: "What is 2 × 6?", options: ["10", "12", "14", "16"], correct: "12" },
      { q: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correct: "Mercury" }
    ];

    const question = questions[index % questions.length];
    
    // Simple question modal using browser prompt (in a real game, this would be a proper UI)
    const userAnswer = prompt(`Educational Question:\n\n${question.q}\n\nOptions: ${question.options.join(', ')}\n\nEnter your answer:`);
    
    if (userAnswer === question.correct) {
      // Correct answer
      this.score += 100;
      this.questionsAnswered++;
      
      // Remove treasure and add particle effect
      treasure.destroy();
      this.createSuccessEffect(treasure.x as number, treasure.y as number);
      
      // Update score display
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${this.score}`);
      }
      
      // Show success message
      const successText = this.add.text(treasure.x as number, treasure.y as number - 30, '+100!', {
        fontSize: '20px',
        fill: '#00ff00',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: successText,
        y: successText.y - 50,
        alpha: 0,
        duration: 1500,
        onComplete: () => successText.destroy()
      });
      
    } else {
      // Wrong answer
      const wrongText = this.add.text(treasure.x as number, treasure.y as number - 30, 'Try Again!', {
        fontSize: '16px',
        fill: '#ff4444',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: wrongText,
        y: wrongText.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => wrongText.destroy()
      });
    }
  }

  private createSuccessEffect(x: number, y: number) {
    // Create sparkle effect
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(x, y, 3, 0xffff00);
      const angle = (i / 8) * Math.PI * 2;
      const distance = 50;
      
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 800,
        ease: 'Power2',
        onComplete: () => spark.destroy()
      });
    }
  }
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onGameEvent }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      scene: [MainMenuScene, DungeonGameScene, GameOverScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center bg-black"
      style={{ minHeight: '600px' }}
    />
  );
};

export default PhaserGame;
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserGameProps {
  onGameEvent: (event: string, data: any) => void;
}

// Simple demo scene to show the game is working
class DemoScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: { [key: string]: Phaser.Input.Keyboard.Key };

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

    // Create treasures (yellow circles)
    this.add.circle(100, 100, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12);
    this.add.circle(700, 100, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12);
    this.add.circle(100, 450, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12);
    this.add.circle(700, 450, 16, 0xf1c40f).setStrokeStyle(2, 0xf39c12);

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

    // Simple game stats
    this.add.text(20, 20, 'Level: 1', { fontSize: '16px', fill: '#ffffff' });
    this.add.text(20, 40, 'Health: 100/100', { fontSize: '16px', fill: '#ff6b6b' });
    this.add.text(20, 60, 'Score: 0', { fontSize: '16px', fill: '#4ecdc4' });
    this.add.text(20, 80, 'Questions: 0/20', { fontSize: '16px', fill: '#ffe66d' });
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
      backgroundColor: '#2d4a22',
      scene: [DemoScene],
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
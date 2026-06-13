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

  preload() {
    this.load.image('logo', 'assets/sprites/logo.png');
  }

  create() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
    
    // Logo
    this.add.image(width / 2, height / 3, 'logo').setOrigin(0.5);
    
    // Difficulty selection buttons
    const createButton = (yOffset: number, text: string, color: string, diff: string) => {
      const btn = this.add.text(width / 2, height / 2 + yOffset, text, {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: color,
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
      btn.on('pointerdown', () => {
        this.scene.start('DungeonGameScene', { dungeon: 1, health: 100, score: 0, difficulty: diff });
      });
      
      btn.on('pointerover', () => btn.setScale(1.1));
      btn.on('pointerout', () => btn.setScale(1.0));
    };

    createButton(-20, 'EASY', '#2d4a22', 'easy');
    createButton(40, 'MEDIUM', '#8b7355', 'medium');
    createButton(100, 'HARD', '#4a148c', 'hard');
    
    // Instructions
    this.add.text(width / 2, height * 0.75, 'Instructions:', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const isDesktop = this.sys.game.device.os.desktop;
    const instructions = [
      isDesktop ? 'Use WASD or Arrow Keys to move' : 'Use the Left Side of screen to move',
      isDesktop ? 'SPACE/Click to shoot (aim with mouse)' : 'Tap the Right Side of screen to shoot',
      isDesktop ? 'Click chests to answer questions' : 'Tap chests to answer questions',
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

const PhaserGame: React.FC<PhaserGameProps> = ({ onGameEvent }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1600,
      height: 1000,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      pixelArt: false,
      roundPixels: true,
      resolution: window.devicePixelRatio || 1,
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
        width: 1600,
        height: 1000,
        expandParent: false
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
      className="bg-black flex items-center justify-center"
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden' 
      }}
    />
  );
};

export default PhaserGame;
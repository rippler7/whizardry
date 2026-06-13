import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DungeonGameScene } from './scenes/DungeonGameScene';
import { GameOverScene } from './scenes/GameOverScene';

interface PhaserGameProps {
  onGameEvent: (event: string, data: any) => void;
}

// Preloader Scene
class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  preload() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1c1917);

    // Create a medieval themed loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x292524, 0.85); // stone-800
    progressBox.lineStyle(4, 0xb45309, 1); // amber-700
    progressBox.strokeRect(width / 2 - 160, height / 2 - 25, 320, 50);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Downloading Game Assets...', {
      fontSize: '24px', fill: '#fde68a', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px', fill: '#fbbf24', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xf59e0b, 1); // Amber-500
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.scene.start('MainMenuScene');
    });

    // Load all assets here so there is zero delay when starting the game
    this.load.image('logo', 'assets/sprites/logo.png');
    this.load.spritesheet('player', 'assets/sprites/mageHero.png', { frameWidth: 32, frameHeight: 48, endFrame: 15 });
    this.load.spritesheet('skeleton', 'assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', 'assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', 'assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('spider', 'assets/sprites/spider2.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', 'assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', 'assets/sprites/rpg_gate5.png', { frameWidth: 145, frameHeight: 96, endFrame: 15 });
    this.load.image('wall_texture', 'textures/cobbledsquare.jpg');
    this.load.spritesheet('tilea2', 'assets/sprites/tilea2.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ground_easy', 'textures/mixgrass.jpg');
    this.load.image('ground_medium', 'textures/mixrock.jpg');
    this.load.image('ground_hard', 'textures/asphalt.png');
    this.load.spritesheet('redcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-red.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('bluecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-blue.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('greencrystal', 'assets/sprites/crystal-qubodup-ccby3-32-green.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('yellowcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('chestRed', 'assets/sprites/chestRed_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestBlue', 'assets/sprites/chestBlue_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestGreen', 'assets/sprites/chestGreen_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestYellow', 'assets/sprites/chestYellow_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    
    // Load other sprites
    this.load.image('bullet', 'assets/sprites/bullet.png');
    this.load.image('door', 'assets/sprites/gameDoor1.png');
    
    // Load audio files
    this.load.audio('enchanted_forest', ['assets/audio/enchanted_forest.mp3', 'assets/audio/enchanted_forest_loop.ogg']);
    this.load.audio('boss_battle', ['assets/audio/BoxCat_Games_-_05_-_Battle_Boss.mp3', 'assets/audio/BoxCat_Games_-_05_-_Battle_Boss.ogg']);
    this.load.audio('spit', ['assets/audio/spit.mp3', 'assets/audio/spit.ogg']);
    this.load.audio('star', 'assets/audio/star.ogg');
    this.load.audio('hurt', ['assets/audio/hurt.mp3', 'assets/audio/hurt.ogg']);
    this.load.audio('enemy-death', ['assets/audio/enemy-death.mp3', 'assets/audio/enemy-death.ogg']);
    this.load.audio('hurt_male', 'assets/audio/hurt_male.ogg');
    this.load.audio('zombienoise', 'assets/audio/zombienoise.ogg');
    this.load.audio('burst', 'assets/audio/burst.ogg');
    this.load.audio('gameover_theme', 'assets/audio/Kevin MacLeod - Teller of the Tales.ogg');
    this.load.audio('victory_theme', 'assets/audio/BoxCat_Games_-_25_-_Victory.ogg');
    this.load.audio('close_door', 'assets/audio/close_door.ogg');
    this.load.audio('open_door', 'assets/audio/open_door.ogg');
    this.load.audio('door_lock', 'assets/audio/door_lock.ogg');
    this.load.audio('arcade1', 'assets/audio/arcade1.ogg');
  }
}

// Main Menu Scene
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1c1917);
    
    // Logo
    this.add.image(width / 2, height / 3, 'logo').setOrigin(0.5);
    
    // Audio Controls
    const audioY = 40;
    const sliderWidth = 100;
    const sliderX = width - 140;
    const iconX = sliderX - 35;

    // --- Mute Button Container ---
    const muteBtn = this.add.container(iconX, audioY);
    const muteBg = this.add.rectangle(0, 0, 40, 40, 0x4a2511).setStrokeStyle(2, 0xd4af37);
    const muteIcon = this.add.text(0, 0, this.sound.mute || this.sound.volume === 0 ? '🔇' : '🔊', { fontSize: '20px', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5);
    muteBtn.add([muteBg, muteIcon]);
    muteBtn.setSize(40, 40);
    muteBtn.setInteractive({ useHandCursor: true });

    muteBtn.on('pointerover', () => muteBg.setFillStyle(0x6b3619));
    muteBtn.on('pointerout', () => muteBg.setFillStyle(0x4a2511));

    // --- Volume Slider ---
    const trackHitArea = this.add.rectangle(sliderX, audioY, sliderWidth, 30, 0x000000, 0).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    const track = this.add.rectangle(sliderX, audioY, sliderWidth, 6, 0x444444).setOrigin(0, 0.5).setStrokeStyle(1, 0x888888);
    const fill = this.add.rectangle(sliderX, audioY, this.sound.volume * sliderWidth, 6, 0xd4af37).setOrigin(0, 0.5);
    const handle = this.add.circle(sliderX + this.sound.volume * sliderWidth, audioY, 10, 0xffffff).setInteractive({ draggable: true, useHandCursor: true });

    const syncAudioUI = () => {
      fill.width = this.sound.volume * sliderWidth;
      handle.x = sliderX + (this.sound.volume * sliderWidth);
    };
    
    syncAudioUI(); // Instantly sync on load in case the game is already muted

    // Continuously listen to the actual audio state to sync the icon perfectly
    this.events.on('update', () => {
      if (muteIcon && muteIcon.active) {
        const isMuted = this.sound.mute || this.sound.volume === 0;
        muteIcon.setText(isMuted ? '🔇' : '🔊');
      }
    });

    muteBtn.on('pointerdown', () => {
      if (this.sound.volume === 0) {
        this.sound.volume = 0.5;
        this.sound.mute = false;
      } else {
        this.sound.mute = !this.sound.mute;
      }
      syncAudioUI();
    });

    const updateVolumeFromPointer = (pointerX: number) => {
      const newX = Phaser.Math.Clamp(pointerX, sliderX, sliderX + sliderWidth);
      const newVol = (newX - sliderX) / sliderWidth;
      this.sound.volume = newVol;
      if (newVol > 0 && this.sound.mute) {
        this.sound.mute = false;
      }
      syncAudioUI();
    };

    trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => updateVolumeFromPointer(pointer.x));
    
    this.input.setDraggable(handle);
    handle.on('drag', (pointer: Phaser.Input.Pointer) => updateVolumeFromPointer(pointer.x));

    // Difficulty selection buttons
    const createButton = (yOffset: number, text: string, color: string, diff: string) => {
      const btn = this.add.text(width / 2, height / 2 + yOffset, text, {
        fontSize: '24px',
        fill: '#fef3c7',
        fontFamily: '"Georgia", "Times New Roman", serif',
        backgroundColor: color,
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
      btn.on('pointerdown', () => {
        this.scene.start('DungeonGameScene', { dungeon: 1, health: 100, score: 0, difficulty: diff });
      });
      
      btn.on('pointerover', () => btn.setScale(1.1));
      btn.on('pointerout', () => btn.setScale(1.0));
    };

    createButton(-20, 'EASY', '#92400e', 'easy'); // amber-800
    createButton(40, 'MEDIUM', '#78350f', 'medium'); // amber-900
    createButton(100, 'HARD', '#451a03', 'hard'); // orange-950
    
    // Instructions
    this.add.text(width / 2, height * 0.75, 'Instructions:', {
      fontSize: '20px',
      fill: '#fde68a',
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif'
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
        fontSize: '16px',
        fill: '#d6d3d1',
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontStyle: 'italic'
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
      backgroundColor: '#1c1917',
      pixelArt: false,
      roundPixels: true,
      resolution: window.devicePixelRatio || 1,
      scene: [PreloaderScene, MainMenuScene, DungeonGameScene, GameOverScene],
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
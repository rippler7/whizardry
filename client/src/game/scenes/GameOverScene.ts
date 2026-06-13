import * as Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any) {
    this.registry.set('gameData', data);
  }

  create() {
    const { width, height } = this.scale;
    const gameData = this.registry.get('gameData');
    const victory = gameData?.victory || false;
    const stats = gameData?.playerStats || {};

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, victory ? 0x0a4a0a : 0x4a0a0a);

    // Title
    const title = victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = victory ? '#00ff00' : '#ff4444';
    
    this.add.text(width / 2, height / 4, title, {
      fontSize: '48px',
      fill: titleColor,
      fontFamily: 'Arial Black'
    }).setOrigin(0.5);

    // Audio Controls
    const audioY = 40;
    const sliderWidth = 100;
    const sliderX = width - 140;
    const iconX = sliderX - 35;

    // --- Mute Button Container ---
    const muteBtn = this.add.container(iconX, audioY);
    const muteBg = this.add.rectangle(0, 0, 40, 40, 0x4a2511).setStrokeStyle(2, 0xd4af37);
    const muteIcon = this.add.text(0, 0, this.sound.mute || this.sound.volume === 0 ? '🔇' : '🔊', { fontSize: '20px', fontFamily: 'Arial' }).setOrigin(0.5);
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

    // Stats
    const statsY = height / 2 - 50;
    this.add.text(width / 2, statsY, 'Final Statistics:', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const statLines = [
      `Score: ${stats.score || 0}`,
      `Health: ${stats.health || 0}`,
      `Questions Answered: ${stats.questionsAnswered || 0}`,
      `Correct Answers: ${stats.correctAnswers || 0}`
    ];

    statLines.forEach((line, index) => {
      this.add.text(width / 2, statsY + 40 + (index * 25), line, {
        fontSize: '18px',
        fill: '#cccccc',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });

    // Buttons
    const buttonY = height * 0.8;

    // Play Again button
    const playAgainButton = this.add.text(width / 2 - 100, buttonY, 'PLAY AGAIN', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      backgroundColor: '#003300',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    playAgainButton.on('pointerdown', () => {
      this.scene.start('DungeonGameScene', { 
        dungeon: 1, 
        health: 100, 
        score: 0,
        difficulty: stats.difficulty || 'easy'
      });
    });

    playAgainButton.on('pointerover', () => {
      playAgainButton.setScale(1.1);
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setScale(1.0);
    });

    // Main Menu button
    const menuButton = this.add.text(width / 2 + 100, buttonY, 'MAIN MENU', {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      backgroundColor: '#333300',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    menuButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    menuButton.on('pointerover', () => {
      menuButton.setScale(1.1);
    });

    menuButton.on('pointerout', () => {
      menuButton.setScale(1.0);
    });

    // Victory message
    if (victory) {
      this.add.text(width / 2, height / 3, 'You have completed all dungeons and defeated the boss!', {
        fontSize: '16px',
        fill: '#88ff88',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 3, 'Better luck next time! Keep learning and try again.', {
        fontSize: '16px',
        fill: '#ff8888',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }
}
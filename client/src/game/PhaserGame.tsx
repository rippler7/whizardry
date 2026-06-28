import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DungeonGameScene } from './scenes/DungeonGameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { InventoryUIScene } from './scenes/InventoryUIScene';

interface PhaserGameProps {
  onGameEvent: (event: string, data: any) => void;
  playerName?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://jermsancog.com/dungeongame';

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
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 12);
    progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 12);

    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Downloading Game Assets...', {
      fontSize: '24px', fill: '#fde68a', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px', fill: '#fbbf24', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xf59e0b, 1); // Amber-500
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.scene.start('MainMenuScene');
    });

    // Load all assets here so there is zero delay when starting the game
    this.load.image('logo', 'assets/sprites/logo.png');
    this.load.spritesheet('player', 'assets/sprites/mageHero2.png', { frameWidth: 32, frameHeight: 48, endFrame: 31 });
    this.load.spritesheet('skeleton', 'assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', 'assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', 'assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('spider', 'assets/sprites/spider2.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', 'assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', 'assets/sprites/rpg_gate5.png', { frameWidth: 145, frameHeight: 96, endFrame: 15 });
    this.load.image('cobbledsquare', 'textures/cobbledsquare.jpg');
    this.load.image('cobbledsquare2', 'textures/cobbledsquare2.png');
    this.load.image('cobbledsquare3', 'textures/cobbledsquare3.png');
    this.load.image('cobbledsquare4', 'textures/cobbledsquare4.png');
    this.load.image('cobbledsquare6', 'textures/cobbledsquare6.png');
    this.load.image('cobbledsquare7', 'textures/cobbledsquare7.png');
    this.load.image('cobbledsquare8', 'textures/cobbledsquare8.png');
    this.load.image('cobbledsquare9', 'textures/cobbledsquare9.png');
    this.load.image('cobbledsquare10', 'textures/cobbledsquare10.png');
    this.load.image('ground_easy', 'textures/mixgrass.jpg');
    this.load.image('ground_medium', 'textures/mixrock.jpg');
    this.load.image('ground_hard', 'textures/asphalt.png');
    this.load.spritesheet('redcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-red.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('bluecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-blue.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('greencrystal', 'assets/sprites/crystal-qubodup-ccby3-32-green.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('yellowcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('orangecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-orange.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('chestRed', 'assets/sprites/chestRed_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestBlue', 'assets/sprites/chestBlue_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestGreen', 'assets/sprites/chestGreen_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestYellow', 'assets/sprites/chestYellow_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.image('Bush_blue_flowers1', 'assets/sprites/Bush_blue_flowers1.png');
    this.load.image('Bush_blue_flowers2', 'assets/sprites/Bush_blue_flowers2.png');
    this.load.image('Bush_blue_flowers3', 'assets/sprites/Bush_blue_flowers3.png');
    this.load.image('Bush_orange_flowers1', 'assets/sprites/Bush_orange_flowers1.png');
    this.load.image('Bush_orange_flowers2', 'assets/sprites/Bush_orange_flowers2.png');
    this.load.image('Bush_orange_flowers3', 'assets/sprites/Bush_orange_flowers3.png');
    this.load.image('Bush_pink_flowers1', 'assets/sprites/Bush_pink_flowers1.png');
    this.load.image('Bush_pink_flowers2', 'assets/sprites/Bush_pink_flowers2.png');
    this.load.image('Bush_pink_flowers3', 'assets/sprites/Bush_pink_flowers3.png');
    this.load.image('Bush_red_flowers1', 'assets/sprites/Bush_red_flowers1.png');
    this.load.image('Bush_red_flowers2', 'assets/sprites/Bush_red_flowers2.png');
    this.load.image('Bush_red_flowers3', 'assets/sprites/Bush_red_flowers3.png');
    this.load.image('Bush_simple_1_1', 'assets/sprites/Bush_simple1_1.png');
    this.load.image('Bush_simple_1_2', 'assets/sprites/Bush_simple1_2.png');
    this.load.image('Bush_simple_1_3', 'assets/sprites/Bush_simple1_3.png');
    this.load.image('Bush_simple_2_1', 'assets/sprites/Bush_simple2_1.png');
    this.load.image('Bush_simple_2_2', 'assets/sprites/Bush_simple2_2.png');
    this.load.image('Bush_simple_2_3', 'assets/sprites/Bush_simple2_3.png');

    this.load.image('Rock1_1', 'assets/sprites/Rock1_1.png');
    this.load.image('Rock1_2', 'assets/sprites/Rock1_2.png');
    this.load.image('Rock1_3', 'assets/sprites/Rock1_3.png');
    this.load.image('Rock1_4', 'assets/sprites/Rock1_4.png');
    this.load.image('Rock1_5', 'assets/sprites/Rock1_5.png');

    this.load.image('Rock1_grass_shadow_dark1', 'assets/sprites/Rock1_grass_shadow_dark1.png');
    this.load.image('Rock1_grass_shadow_dark2', 'assets/sprites/Rock1_grass_shadow_dark2.png');
    this.load.image('Rock1_grass_shadow_dark3', 'assets/sprites/Rock1_grass_shadow_dark3.png');
    this.load.image('Rock1_grass_shadow_dark4', 'assets/sprites/Rock1_grass_shadow_dark4.png');
    this.load.image('Rock1_grass_shadow_dark5', 'assets/sprites/Rock1_grass_shadow_dark5.png');

    this.load.image('Rock2_grass_shadow_dark1', 'assets/sprites/Rock2_grass_shadow_dark1.png');
    this.load.image('Rock2_grass_shadow_dark2', 'assets/sprites/Rock2_grass_shadow_dark2.png');
    this.load.image('Rock2_grass_shadow_dark3', 'assets/sprites/Rock2_grass_shadow_dark3.png');
    this.load.image('Rock2_grass_shadow_dark4', 'assets/sprites/Rock2_grass_shadow_dark4.png');
    this.load.image('Rock2_grass_shadow_dark5', 'assets/sprites/Rock2_grass_shadow_dark5.png');

    this.load.image('Rock4_1', 'assets/sprites/Rock4_1.png');
    this.load.image('Rock4_2', 'assets/sprites/Rock4_2.png');
    this.load.image('Rock4_3', 'assets/sprites/Rock4_3.png');
    this.load.image('Rock4_4', 'assets/sprites/Rock4_4.png');
    this.load.image('Rock4_5', 'assets/sprites/Rock4_5.png');

    this.load.image('Rock5_1', 'assets/sprites/Rock5_1.png');
    this.load.image('Rock5_2', 'assets/sprites/Rock5_2.png');
    this.load.image('Rock5_3', 'assets/sprites/Rock5_3.png');
    this.load.image('Rock5_4', 'assets/sprites/Rock5_4.png');
    this.load.image('Rock5_5', 'assets/sprites/Rock5_5.png');

    this.load.image('Rock6_1', 'assets/sprites/Rock6_1.png');
    this.load.image('Rock6_2', 'assets/sprites/Rock6_2.png');
    this.load.image('Rock6_3', 'assets/sprites/Rock6_3.png');
    this.load.image('Rock6_4', 'assets/sprites/Rock6_4.png');
    this.load.image('Rock6_5', 'assets/sprites/Rock6_5.png');

    this.load.image('Rock6_grass_shadow_dark1', 'assets/sprites/Rock6_grass_shadow_dark1.png');
    this.load.image('Rock6_grass_shadow_dark2', 'assets/sprites/Rock6_grass_shadow_dark2.png');
    this.load.image('Rock6_grass_shadow_dark3', 'assets/sprites/Rock6_grass_shadow_dark3.png');
    this.load.image('Rock6_grass_shadow_dark4', 'assets/sprites/Rock6_grass_shadow_dark4.png');
    this.load.image('Rock6_grass_shadow_dark5', 'assets/sprites/Rock6_grass_shadow_dark5.png');
    
    // Load other sprites
    this.load.image('bullet', 'assets/sprites/bullet.png');
    
    // Load audio files
    this.load.audio('air_fight', 'assets/audio/moodmode-8-bit-air-fight-158813.mp3');
    this.load.audio('the_tournament', 'assets/audio/emmraan-the-tournament-280277.mp3');
    this.load.audio('spit', ['assets/audio/spit.mp3', 'assets/audio/spit.ogg']);
    this.load.audio('star', 'assets/audio/star.ogg');
    this.load.audio('enemy-death', ['assets/audio/enemy-death.mp3', 'assets/audio/enemy-death.ogg']);
    this.load.audio('zombienoise', 'assets/audio/zombienoise.ogg');
    this.load.audio('burst', 'assets/audio/burst.ogg');
    this.load.audio('hurt_male', 'assets/audio/hurt_male.ogg');
    this.load.audio('gameover_theme', 'assets/audio/Kevin MacLeod - Teller of the Tales.ogg');
    this.load.audio('victory_theme', 'assets/audio/BoxCat_Games_-_25_-_Victory.ogg');
    this.load.audio('close_door', 'assets/audio/close_door.ogg');
    this.load.audio('open_door', 'assets/audio/open_door.ogg');
    this.load.audio('door_lock', 'assets/audio/door_lock.ogg');
    this.load.audio('war_of_the_crown', 'assets/audio/war-of-the-crown.mp3');
    this.load.audio('fireball_shoot', 'assets/audio/dragon-studio-flame-spell-impact-393919.mp3');
    this.load.audio('chest_sparkle', 'assets/audio/koiroylers-sparkle-355937.mp3');
    this.load.audio('bat_burst', 'assets/audio/humordome-magic-burst-452852.mp3');
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
    const bg = this.add.image(width / 2, height / 2, 'logo').setOrigin(0.5);
    bg.setDisplaySize(width, height);
    
    // Audio Controls
    const audioY = 50;
    const sliderWidth = 150;
    const sliderX = width - 180;
    const iconX = sliderX - 52;
    const fsX = iconX - 75;
    const helpX = fsX - 75;

    let helpModal: Phaser.GameObjects.Container;

    // --- Help Button ---
    const helpBtn = this.add.container(helpX, audioY);
    const helpBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const helpIcon = this.add.text(0, 0, '?', { fontSize: '36px', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', fill: '#fde68a' }).setOrigin(0.5);
    helpBtn.add([helpBg, helpIcon]);
    helpBtn.setSize(60, 60);
    helpBtn.setInteractive({ useHandCursor: true });

    helpBtn.on('pointerover', () => helpBg.setFillStyle(0x6b3619));
    helpBtn.on('pointerout', () => helpBg.setFillStyle(0x4a2511));
    helpBtn.on('pointerup', () => {
      if (helpModal) helpModal.setVisible(true);
    });

    // --- Fullscreen Button ---
    const fsBtn = this.add.container(fsX, audioY);
    const fsBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const fsIcon = this.add.text(0, 0, this.scale.isFullscreen ? '⤡' : '⤢', { fontSize: '36px', fontFamily: 'Arial' }).setOrigin(0.5);
    fsBtn.add([fsBg, fsIcon]);
    fsBtn.setSize(60, 60);
    fsBtn.setInteractive({ useHandCursor: true });

    fsBtn.on('pointerover', () => fsBg.setFillStyle(0x6b3619));
    fsBtn.on('pointerout', () => fsBg.setFillStyle(0x4a2511));
    fsBtn.on('pointerup', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    const enterFs = () => { if (fsIcon.active) fsIcon.setText('⤡'); };
    const leaveFs = () => { if (fsIcon.active) fsIcon.setText('⤢'); };
    this.scale.on('enterfullscreen', enterFs);
    this.scale.on('leavefullscreen', leaveFs);
    this.events.once('destroy', () => {
      this.scale.off('enterfullscreen', enterFs);
      this.scale.off('leavefullscreen', leaveFs);
    });

    // --- Mute Button Container ---
    const muteBtn = this.add.container(iconX, audioY);
    const muteBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const muteIcon = this.add.text(0, 0, this.sound.mute || this.sound.volume === 0 ? '🔇' : '🔊', { fontSize: '30px', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5);
    muteBtn.add([muteBg, muteIcon]);
    muteBtn.setSize(60, 60);
    muteBtn.setInteractive({ useHandCursor: true });

    muteBtn.on('pointerover', () => muteBg.setFillStyle(0x6b3619));
    muteBtn.on('pointerout', () => muteBg.setFillStyle(0x4a2511));

    // --- Volume Slider ---
    const trackHitArea = this.add.rectangle(sliderX, audioY, sliderWidth, 45, 0x000000, 0).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    const track = this.add.rectangle(sliderX, audioY, sliderWidth, 9, 0x444444).setOrigin(0, 0.5).setStrokeStyle(1, 0x888888).setRounded(4);
    const fill = this.add.rectangle(sliderX, audioY, this.sound.volume * sliderWidth, 9, 0xd4af37).setOrigin(0, 0.5).setRounded(4);
    const handle = this.add.circle(sliderX + this.sound.volume * sliderWidth, audioY, 15, 0xffffff).setInteractive({ draggable: true, useHandCursor: true });

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
    const createButton = (yOffset: number, text: string, color: number, hoverColor: number, diff: string) => {
      const btnBg = this.add.rectangle(width / 2, height / 2 + yOffset, 180, 50, color)
        .setRounded(12)
        .setInteractive({ useHandCursor: true });
        
      const btnText = this.add.text(width / 2, height / 2 + yOffset, text, {
        fontSize: '24px',
        fill: '#fef3c7',
        fontFamily: '"Georgia", "Times New Roman", serif'
      }).setOrigin(0.5);
      
      btnBg.on('pointerdown', () => {
        this.scene.start('DungeonGameScene', { dungeon: 1, health: 100, score: 0, difficulty: diff });
      });
      
      btnBg.on('pointerover', () => { btnBg.setScale(1.05); btnBg.setFillStyle(hoverColor); btnText.setScale(1.05); });
      btnBg.on('pointerout', () => { btnBg.setScale(1.0); btnBg.setFillStyle(color); btnText.setScale(1.0); });
    };

    createButton(-20, 'EASY', 0x92400e, 0xb45309, 'easy'); // amber-800
    createButton(40, 'MEDIUM', 0x78350f, 0x92400e, 'medium'); // amber-900
    createButton(100, 'HARD', 0x451a03, 0x78350f, 'hard'); // orange-950

    // --- Leaderboard Button & Modal ---
    const lbBtnBg = this.add.rectangle(width / 2, height / 2 + 170, 220, 50, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12).setInteractive({ useHandCursor: true });
    const lbBtnText = this.add.text(width / 2, height / 2 + 170, 'LEADERBOARD', { fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5);
    
    lbBtnBg.on('pointerover', () => { lbBtnBg.setScale(1.05); lbBtnText.setScale(1.05); lbBtnBg.setFillStyle(0x6b3619); });
    lbBtnBg.on('pointerout', () => { lbBtnBg.setScale(1.0); lbBtnText.setScale(1.0); lbBtnBg.setFillStyle(0x4a2511); });

    const leaderboardModal = this.add.container(0, 0).setDepth(2000).setVisible(false);
    const lbOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setInteractive();
    const lbBox = this.add.rectangle(width / 2, height / 2, Math.min(width * 0.9, 700), 550, 0x1c1917, 0.95).setStrokeStyle(2, 0xb45309).setRounded(16);
    const lbTitle = this.add.text(width / 2, height / 2 - 230, 'Top Wizards', { fontSize: '32px', fill: '#fbbf24', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold' }).setOrigin(0.5);
    
    const lbCloseBtn = this.add.rectangle(width / 2, height / 2 + 220, 180, 50, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12).setInteractive({ useHandCursor: true });
    const lbCloseText = this.add.text(width / 2, height / 2 + 220, 'CLOSE', { fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5);
    
    lbCloseBtn.on('pointerover', () => { lbCloseBtn.setScale(1.05); lbCloseText.setScale(1.05); lbCloseBtn.setFillStyle(0x6b3619); });
    lbCloseBtn.on('pointerout', () => { lbCloseBtn.setScale(1.0); lbCloseText.setScale(1.0); lbCloseBtn.setFillStyle(0x4a2511); });
    lbCloseBtn.on('pointerdown', () => leaderboardModal.setVisible(false));

    const lbContent = this.add.container(0, 0);
    leaderboardModal.add([lbOverlay, lbBox, lbTitle, lbCloseBtn, lbCloseText, lbContent]);

    lbBtnBg.on('pointerdown', () => {
      leaderboardModal.setVisible(true);
      lbContent.removeAll(true); // Clear previous entries

      const loadingText = this.add.text(width / 2, height / 2, 'Summoning scores...', { fontSize: '24px', fill: '#94a3b8', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'italic' }).setOrigin(0.5);
      lbContent.add(loadingText);

      fetch(`${API_URL}/leaderboard.php`)
        .then(res => res.json())
        .then(data => {
          loadingText.destroy();
          if (data.error) {
            lbContent.add(this.add.text(width / 2, height / 2, 'Failed to read the ancient scrolls.', { fontSize: '24px', fill: '#ef4444', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5));
            return;
          }

          const headerY = height / 2 - 160;
          const colRank = width / 2 - 280;
          const colName = width / 2 - 180;
          const colScore = width / 2 + 30;
          const colLevel = width / 2 + 140;
          const colDiff = width / 2 + 230;

          const headerStyle = { fontSize: '20px', fill: '#94a3b8', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold' };
          lbContent.add([
            this.add.text(colRank, headerY, 'Rank', headerStyle),
            this.add.text(colName, headerY, 'Wizard Name', headerStyle),
            this.add.text(colScore, headerY, 'Score', headerStyle),
            this.add.text(colLevel, headerY, 'Dungeon', headerStyle),
            this.add.text(colDiff, headerY, 'Mode', headerStyle)
          ]);

          data.forEach((entry: any, index: number) => {
            const rowY = headerY + 40 + (index * 30);
            const rowStyle = { fontSize: '20px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif' };
            const rankColor = index === 0 ? '#fbbf24' : index === 1 ? '#cbd5e1' : index === 2 ? '#b45309' : '#fef3c7'; // Gold, Silver, Bronze
            
            const diffText = (entry.difficulty || 'easy').toUpperCase();
            let diffColor = '#fef3c7';
            if (diffText === 'MEDIUM') diffColor = '#f59e0b';
            if (diffText === 'HARD') diffColor = '#ef4444';

            lbContent.add([
              this.add.text(colRank, rowY, `#${index + 1}`, { ...rowStyle, fill: rankColor }),
              this.add.text(colName, rowY, (entry.player_name || 'Unknown').substring(0, 15), rowStyle),
              this.add.text(colScore, rowY, entry.score.toString(), { ...rowStyle, fill: '#fbbf24', fontStyle: 'bold' }),
              this.add.text(colLevel, rowY, `Lvl ${entry.level}`, rowStyle),
              this.add.text(colDiff, rowY, diffText, { ...rowStyle, fill: diffColor })
            ]);
          });
        })
        .catch(err => {
          loadingText.destroy();
          lbContent.add(this.add.text(width / 2, height / 2, 'The server connection was lost.', { fontSize: '24px', fill: '#ef4444', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5));
        });
    });
    
    // --- Help Modal ---
    helpModal = this.add.container(0, 0).setDepth(2000).setVisible(false);
    
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive(); // Blocks underlying clicks

    const modalBox = this.add.rectangle(width / 2, height / 2, Math.min(width * 0.9, 640), 550, 0x1c1917, 0.95)
      .setStrokeStyle(2, 0xb45309).setRounded(16);

    const helpTitle = this.add.text(width / 2, height / 2 - 210, 'How to Play', {
      fontSize: '32px', fill: '#fbbf24', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const isDesktop = this.sys.game.device.os.desktop;
    const helpTextContent = [
      isDesktop ? '• Use WASD or Arrow Keys to move' : '• Use the Left Side of screen to move',
      isDesktop ? '• SPACE or Click to shoot (aim with mouse)' : '• Tap the Right Side of screen to shoot',
      isDesktop ? '• Click chests when near them to open' : '• Tap chests when near them to open',
      '• Answer all 4 questions to unlock the door',
      '• Reach dungeon 5 and defeat the boss!'
    ].join('\n\n');

    const helpText = this.add.text(width / 2, height / 2 - 140, helpTextContent, {
      fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif', lineSpacing: 10, wordWrap: { width: Math.min(width * 0.8, 560) }
    }).setOrigin(0.5, 0);

    const closeBtnBg = this.add.rectangle(width / 2, height / 2 + 200, 180, 50, 0x78350f).setRounded(12).setInteractive({ useHandCursor: true });
    const closeBtnText = this.add.text(width / 2, height / 2 + 200, 'CLOSE', { fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif' }).setOrigin(0.5);

    closeBtnBg.on('pointerover', () => { closeBtnBg.setScale(1.05); closeBtnText.setScale(1.05); closeBtnBg.setFillStyle(0x92400e); });
    closeBtnBg.on('pointerout', () => { closeBtnBg.setScale(1.0); closeBtnText.setScale(1.0); closeBtnBg.setFillStyle(0x78350f); });
    closeBtnBg.on('pointerdown', () => { helpModal.setVisible(false); });

    helpModal.add([overlay, modalBox, helpTitle, helpText, closeBtnBg, closeBtnText]);
  }
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onGameEvent, playerName }) => {
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
      scene: [PreloaderScene, MainMenuScene, DungeonGameScene, GameOverScene, InventoryUIScene],
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

    if (playerName) {
      gameRef.current.registry.set('playerName', playerName);
    }

    // Listen for global game events to pass up to React
    gameRef.current.events.on('gameComplete', (data: any) => {
      onGameEvent('gameComplete', data);
      
      const stats = data?.playerStats || data || {};

      // Securely post the score to our new Leaderboard API
      fetch(`${API_URL}/leaderboard.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName || 'Anonymous',
          score: stats.score || 0,
          level: stats.level || 1,
          questionsAnswered: stats.questionsAnswered || 0,
          correctAnswers: stats.correctAnswers || 0,
          enemiesKilled: stats.enemiesKilled || 0,
          difficulty: stats.difficulty || 'easy'
        })
      }).catch(err => console.warn('Failed to submit score to leaderboard.', err));
    });
    gameRef.current.events.on('dungeonComplete', (data: any) => {
      onGameEvent('dungeonComplete', data);
    });

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameRef.current && playerName) {
      gameRef.current.registry.set('playerName', playerName);
    }
  }, [playerName]);

  // Explicitly calculate and set height based on width to maintain aspect ratio
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.clientWidth;
        const parentHeight = containerRef.current.parentElement.clientHeight;
        
        let targetWidth = parentWidth;
        let targetHeight = parentWidth / 1.6; // 1600 / 1000 = 1.6

        // If the calculated height exceeds the available height, scale down based on height instead
        if (targetHeight > parentHeight) {
          targetHeight = parentHeight;
          targetWidth = parentHeight * 1.6;
        }

        containerRef.current.style.width = `${targetWidth}px`;
        containerRef.current.style.height = `${targetHeight}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Fire once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <div ref={containerRef} />
    </div>
  );
};

export default PhaserGame;
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
    const playerName = this.registry.get('playerName') || 'Hero';

    // Emit event to React to save the high score
    if (stats.score > 0 || stats.questionsAnswered > 0) {
      this.game.events.emit('gameComplete', {
        score: stats.score || 0,
        level: stats.level || 1,
        questionsAnswered: stats.questionsAnswered || 0,
        correctAnswers: stats.correctAnswers || 0,
        enemiesKilled: stats.enemiesKilled || 0,
        difficulty: stats.difficulty || 'easy'
      });
    }

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, victory ? 0x1c1917 : 0x292524);

    // Title
    const title = victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = victory ? '#fbbf24' : '#f87171';
    
    this.add.text(width / 2, height / 4, title, {
      fontSize: '48px',
      fill: titleColor,
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif'
    }).setOrigin(0.5);

    // Audio Controls
    const audioY = 50;
    const sliderWidth = 150;
    const sliderX = width - 180;
    const iconX = sliderX - 52;
    const fsX = iconX - 75;

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
    this.events.once('shutdown', () => {
      this.scale.off('enterfullscreen', enterFs);
      this.scale.off('leavefullscreen', leaveFs);
    });

    // --- Mute Button Container ---
    const muteBtn = this.add.container(iconX, audioY);
    const muteBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const muteIcon = this.add.text(0, 0, this.sound.mute || this.sound.volume === 0 ? '🔇' : '🔊', { fontSize: '30px', fontFamily: 'Arial' }).setOrigin(0.5);
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
    const syncAudioIcon = () => {
      if (muteIcon && muteIcon.active) {
        const isMuted = this.sound.mute || this.sound.volume === 0;
        muteIcon.setText(isMuted ? '🔇' : '🔊');
      }
    };
    this.events.on('update', syncAudioIcon);
    this.events.once('shutdown', () => this.events.off('update', syncAudioIcon));

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
    const statsY = height / 2 - 120; // Shifted up to make room for 5 records
    this.add.text(width / 2, statsY, 'Final Statistics:', {
      fontSize: '28px',
      fill: '#fde68a',
      fontFamily: '"Georgia", "Times New Roman", serif'
    }).setOrigin(0.5);

    const statLines = [
      `Mode: ${(stats.difficulty || 'easy').toUpperCase()}`,
      `Score: ${stats.score || 0}`,
      `Enemies Killed: ${stats.enemiesKilled || 0}`,
      `Health: ${stats.health || 0}`,
      `Questions Answered: ${stats.questionsAnswered || 0}`,
      `Correct Answers: ${stats.correctAnswers || 0}`
    ];

    // Read and save personal history to localStorage
    try {
      const historyKey = `whizardy_history_${playerName}`;
      let playerHistory: any[] = [];
      
      const historyStr = localStorage.getItem(historyKey);
      if (historyStr) {
        playerHistory = JSON.parse(historyStr);
      }
      
      const currentScoreObj = {
        id: Date.now().toString(),
        playerName: playerName,
        score: stats.score || 0,
        level: stats.level || 1,
        questionsAnswered: stats.questionsAnswered || 0,
        correctAnswers: stats.correctAnswers || 0,
        enemiesKilled: stats.enemiesKilled || 0,
        difficulty: stats.difficulty || 'easy',
        accuracy: stats.questionsAnswered > 0 ? Math.round(((stats.correctAnswers || 0) / stats.questionsAnswered) * 100) : 0,
        completionTime: Date.now(),
        date: new Date().toISOString()
      };
      
      // Only add to history if score/questions were achieved
      if (currentScoreObj.score > 0 || currentScoreObj.questionsAnswered > 0) {
        // Prevent duplicate saves from rapid scene transitions
        const alreadySaved = playerHistory.some((s: any) => 
          s.score === currentScoreObj.score && 
          s.enemiesKilled === currentScoreObj.enemiesKilled && 
          Math.abs(new Date(s.date).getTime() - new Date(currentScoreObj.date).getTime()) < 5000
        );
        
        if (!alreadySaved) {
          playerHistory.push(currentScoreObj);
          playerHistory = playerHistory
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 5);
            
          localStorage.setItem(historyKey, JSON.stringify(playerHistory));
        }
      }

      if (playerHistory.length > 0) {
        statLines.push(''); // blank line
        statLines.push(`--- ${playerName}'s Top 5 Score Records ---`);
        playerHistory.forEach((top: any, i: number) => {
          const dateStr = new Date(top.completionTime || top.date).toLocaleString([], {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
          });
          const correctQs = top.questionsAnswered > 0 ? Math.round((top.accuracy / 100) * top.questionsAnswered) : 0;
          const diffStr = top.difficulty ? ` | Mode: ${top.difficulty.toUpperCase()}` : '';
          statLines.push(`${i + 1}. Score: ${top.score.toLocaleString()}${diffStr} | Kills: ${top.enemiesKilled || 0} | Correct: ${correctQs}/${top.questionsAnswered || 0} | ${dateStr}`);
        });
      }
    } catch (e) {
      console.warn("Could not handle player history", e);
    }

    statLines.forEach((line, index) => {
      this.add.text(width / 2, statsY + 40 + (index * 25), line, {
        fontSize: line.includes('Record') ? '20px' : '16px',
        fill: line.includes('Record') ? '#fbbf24' : '#d6d3d1',
        fontStyle: line.includes('Record') ? 'bold' : 'normal',
        fontFamily: '"Georgia", "Times New Roman", serif'
      }).setOrigin(0.5);
    });

    // Buttons
    const buttonY = height * 0.8;

    // Play Again button
    const playAgainBtnBg = this.add.rectangle(width / 2 - 100, buttonY, 180, 50, 0x92400e)
      .setRounded(12).setInteractive({ useHandCursor: true });
      
    const playAgainButton = this.add.text(width / 2 - 100, buttonY, 'PLAY AGAIN', {
      fontSize: '22px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
    }).setOrigin(0.5);

    playAgainBtnBg.on('pointerdown', () => {
      this.scene.start('DungeonGameScene', { 
        dungeon: 1, 
        health: 100, 
        score: 0,
        difficulty: stats.difficulty || 'easy'
      });
    });

    playAgainBtnBg.on('pointerover', () => { playAgainBtnBg.setScale(1.05); playAgainButton.setScale(1.05); });
    playAgainBtnBg.on('pointerout', () => { playAgainBtnBg.setScale(1.0); playAgainButton.setScale(1.0); });

    // Main Menu button
    const menuBtnBg = this.add.rectangle(width / 2 + 100, buttonY, 180, 50, 0x78350f)
      .setRounded(12).setInteractive({ useHandCursor: true });
      
    const menuButton = this.add.text(width / 2 + 100, buttonY, 'MAIN MENU', {
      fontSize: '22px',
      fill: '#fef3c7',
      fontFamily: '"Georgia", "Times New Roman", serif',
    }).setOrigin(0.5);

    menuBtnBg.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    menuBtnBg.on('pointerover', () => { menuBtnBg.setScale(1.05); menuButton.setScale(1.05); });
    menuBtnBg.on('pointerout', () => { menuBtnBg.setScale(1.0); menuButton.setScale(1.0); });

    // Victory message
    if (victory) {
      this.add.text(width / 2, height / 3, 'You have completed all dungeons and defeated the boss!', {
        fontSize: '18px',
        fill: '#fde68a',
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, height / 3, 'Better luck next time! Keep learning and try again.', {
        fontSize: '18px',
        fill: '#d6d3d1',
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
  }
}
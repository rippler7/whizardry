import * as Phaser from 'phaser';
import { Player } from './Player';
// import { Question, getRandomQuestion } from '../data/Questions';

export abstract class Collectible extends Phaser.Physics.Arcade.Sprite {
  protected collected: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setImmovable(true);
    this.setDepth(this.y);
  }
  
  public abstract onCollect(player: Player): void;
  
  protected playCollectEffect(): void {
    // Scale up briefly
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}

export class HealthPotion extends Collectible {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'health_potion');
    this.setTint(0xff4444);
  }
  
  public onCollect(player: Player): void {
    if (this.collected) return;
    this.collected = true;
    
    player.heal(30);
    this.scene.sound.play('star', { volume: 0.4 });
    this.playCollectEffect();
  }
}

export class Chest extends Collectible {
  private question: Question;
  private isOpen: boolean = false;
  private questionModal: any = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number, difficulty: number) {
    super(scene, x, y, 'chestRed');
    
    this.question = getRandomQuestion(difficulty);
    this.createIdleAnimation();
  }
  
  private createIdleAnimation(): void {
    if (!this.scene.anims.exists('chest_idle')) {
      this.scene.anims.create({
        key: 'chest_idle',
        frames: this.scene.anims.generateFrameNumbers('chestRed', { start: 0, end: 0 }),
        frameRate: 1
      });
    }
    
    if (!this.scene.anims.exists('chest_open')) {
      this.scene.anims.create({
        key: 'chest_open',
        frames: this.scene.anims.generateFrameNumbers('chestRed', { start: 1, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    this.anims.play('chest_idle');
  }
  
  public onCollect(player: Player): void {
    if (this.collected || this.isOpen) return;
    
    this.isOpen = true;
    this.showQuestionModal(player);
  }
  
  private showQuestionModal(player: Player): void {
    // Pause the game
    this.scene.scene.pause();
    
    // Create modal background
    const modalBg = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      600, 400,
      0x000000, 0.8
    ).setScrollFactor(0).setDepth(1000);
    
    // Question text
    const questionText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY - 120,
      this.question.question,
      {
        fontSize: '24px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 500 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    
    // Answer buttons
    const buttons: Phaser.GameObjects.Text[] = [];
    this.question.options.forEach((option, index) => {
      const button = this.scene.add.text(
        this.scene.cameras.main.centerX,
        this.scene.cameras.main.centerY - 20 + (index * 60),
        `${index + 1}. ${option}`,
        {
          fontSize: '20px',
          fill: '#00ff00',
          backgroundColor: '#333333',
          padding: { x: 20, y: 10 }
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setInteractive();
      
      button.on('pointerover', () => {
        button.setStyle({ fill: '#ffff00' });
      });
      
      button.on('pointerout', () => {
        button.setStyle({ fill: '#00ff00' });
      });
      
      button.on('pointerdown', () => {
        this.handleAnswer(option, player, [modalBg, questionText, ...buttons]);
      });
      
      buttons.push(button);
    });
    
    this.questionModal = {
      elements: [modalBg, questionText, ...buttons],
      player: player
    };

    // Keyboard input for answers
    this.scene.input.keyboard!.once('keydown-ONE', () => this.answerFromKey(0));
    this.scene.input.keyboard!.once('keydown-TWO', () => this.answerFromKey(1));
    this.scene.input.keyboard!.once('keydown-THREE', () => this.answerFromKey(2));
    this.scene.input.keyboard!.once('keydown-FOUR', () => this.answerFromKey(3));
    
    // Cleanup on scene shutdown
    this.scene.events.once('shutdown', () => {
      this.scene.input.keyboard?.off('keydown-ONE');
      this.scene.input.keyboard?.off('keydown-TWO');
      this.scene.input.keyboard?.off('keydown-THREE');
      this.scene.input.keyboard?.off('keydown-FOUR');
    });
  }
    
  private answerFromKey(index: number): void {
    this.scene.input.keyboard!.off('keydown-ONE');
    this.scene.input.keyboard!.off('keydown-TWO');
    this.scene.input.keyboard!.off('keydown-THREE');
    this.scene.input.keyboard!.off('keydown-FOUR');
    if (this.questionModal && index < this.question.options.length) {
      this.handleAnswer(this.question.options[index], this.questionModal.player, this.questionModal.elements);
    }
  }
  
  private handleAnswer(selectedAnswer: string, player: Player, modalElements: Phaser.GameObjects.GameObject[]): void {
    this.scene.input.keyboard!.off('keydown-ONE');
    this.scene.input.keyboard!.off('keydown-TWO');
    this.scene.input.keyboard!.off('keydown-THREE');
    this.scene.input.keyboard!.off('keydown-FOUR');
    const isCorrect = this.normalizeAnswer(selectedAnswer) === this.normalizeAnswer(this.question.correctAnswer);
    
    // Update player stats
    player.answerQuestion(isCorrect);
    
    // Show result
    const resultText = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY + 120,
      isCorrect ? 'Correct! +100 points' : `Wrong! Correct answer: ${this.question.correctAnswer}`,
      {
        fontSize: '20px',
        fill: isCorrect ? '#00ff00' : '#ff0000',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
    
    // Clean up after delay
    this.scene.time.delayedCall(2000, () => {
      modalElements.forEach(element => element.destroy());
      resultText.destroy();
      this.scene.scene.resume();
      
      if (isCorrect) {
        this.openChest(player);
      } else {
        this.isOpen = false; // Allow retry
      }
    });
  }
  
  private normalizeAnswer(value: unknown): string {
    return String(value ?? '')
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private openChest(player: Player): void {
    this.collected = true;
    this.anims.play('chest_open');
    
    // Give rewards
    player.addScore(100);
    player.gainExperience(50);
    
    // Chance for health potion
    if (Math.random() < 0.3) {
      const potion = new HealthPotion(this.scene, this.x + 32, this.y);
      this.scene.physics.add.overlap(player, potion, () => {
        potion.onCollect(player);
      });
    }
    
    this.scene.sound.play('doorOpen', { volume: 0.5 });
    this.playCollectEffect();
  }
}

export class Door extends Collectible {
  private isLocked: boolean = true;
  private requiredLevel: number;
  private targetScene: string;
  
  constructor(scene: Phaser.Scene, x: number, y: number, requiredLevel: number, targetScene: string) {
    super(scene, x, y, 'gate');
    this.requiredLevel = requiredLevel;
    this.targetScene = targetScene;
    
    this.createAnimations();
  }
  
  private createAnimations(): void {
    if (!this.scene.anims.exists('door_closed')) {
      this.scene.anims.create({
        key: 'door_closed',
        frames: [{ key: 'gate', frame: 0 }],
        frameRate: 1
      });
    }
    
    if (!this.scene.anims.exists('door_open')) {
      this.scene.anims.create({
        key: 'door_open',
        frames: this.scene.anims.generateFrameNumbers('gate', { start: 1, end: 3 }),
        frameRate: 8,
        repeat: 0
      });
    }
    
    this.anims.play('door_closed');
  }
  
  public onCollect(player: Player): void {
    if (this.collected) return;
    
    if (player.level >= this.requiredLevel) {
      this.unlock(player);
    } else {
      this.showLevelRequirement(player);
    }
  }
  
  private unlock(player: Player): void {
    this.isLocked = false;
    this.collected = true;
    
    this.anims.play('door_open');
    this.scene.sound.play('doorOpen', { volume: 0.5 });
    
    // Transition to next scene after animation
    this.scene.time.delayedCall(1000, () => {
      this.scene.scene.start(this.targetScene, { 
        playerStats: {
          level: player.level,
          health: player.health,
          maxHealth: player.maxHealth,
          experience: player.experience,
          score: player.score,
          questionsAnswered: player.questionsAnswered,
          correctAnswers: player.correctAnswers
        }
      });
    });
  }
  
  private showLevelRequirement(player: Player): void {
    const warningText = this.scene.add.text(
      this.x, this.y - 50,
      `Level ${this.requiredLevel} required`,
      {
        fontSize: '16px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5).setDepth(200);
    
    this.scene.sound.play('doorLock', { volume: 0.4 });
    
    this.scene.time.delayedCall(2000, () => {
      warningText.destroy();
    });
  }
}

export class Crystal extends Collectible {
  private crystalType: 'red' | 'blue' | 'green' | 'yellow';
  
  constructor(scene: Phaser.Scene, x: number, y: number, type: 'red' | 'blue' | 'green' | 'yellow') {
    super(scene, x, y, `${type}crystal`);
    this.crystalType = type;
    
    this.createGlowAnimation();
  }
  
  private createGlowAnimation(): void {
    const animKey = `${this.crystalType}_crystal_glow`;
    
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(`${this.crystalType}crystal`, { start: 0, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    this.anims.play(animKey);
  }
  
  public onCollect(player: Player): void {
    if (this.collected) return;
    this.collected = true;
    
    // Different crystals give different bonuses
    switch (this.crystalType) {
      case 'red':
        player.addScore(25);
        break;
      case 'blue':
        player.gainExperience(10);
        break;
      case 'green':
        player.heal(15);
        break;
      case 'yellow':
        player.addScore(50);
        player.gainExperience(5);
        break;
    }
    
    this.scene.sound.play('star', { volume: 0.3 });
    this.playCollectEffect();
  }
}
import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameData';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public maxHealth: number = 100;
  public level: number = 1;
  public experience: number = 0;
  public score: number = 0;
  public questionsAnswered: number = 0;
  public correctAnswers: number = 0;
  public enemiesKilled: number = 0;
  
  private keys: any;
  private lastFired: number = 0;
  private fireRate: number = 250;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    this.setCollideWorldBounds(true);
    this.setSize(24, 32);
    this.setOffset(4, 16);
    
    // Set depth for layering
    this.setDepth(100);
    
    // Initialize input
    this.setupInput();
    
    // Create animations
    this.createAnimations();
  }
  
  private setupInput(): void {
    this.keys = this.scene.input.keyboard!.createCursorKeys();
    
    // Add WASD keys
    this.keys.W = this.scene.input.keyboard!.addKey('W');
    this.keys.A = this.scene.input.keyboard!.addKey('A');
    this.keys.S = this.scene.input.keyboard!.addKey('S');
    this.keys.D = this.scene.input.keyboard!.addKey('D');
    this.keys.SPACE = this.scene.input.keyboard!.addKey('SPACE');
  }
  
  private createAnimations(): void {
    const anims = this.scene.anims;
    
    // Walking animations
    if (!anims.exists('player_walk_down')) {
      anims.create({
        key: 'player_walk_down',
        frames: anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    if (!anims.exists('player_walk_left')) {
      anims.create({
        key: 'player_walk_left',
        frames: anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    if (!anims.exists('player_walk_right')) {
      anims.create({
        key: 'player_walk_right',
        frames: anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    if (!anims.exists('player_walk_up')) {
      anims.create({
        key: 'player_walk_up',
        frames: anims.generateFrameNumbers('player', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Idle animations
    if (!anims.exists('player_idle_down')) {
      anims.create({
        key: 'player_idle_down',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1
      });
    }
    
    if (!anims.exists('player_idle_left')) {
      anims.create({
        key: 'player_idle_left',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 1
      });
    }
    
    if (!anims.exists('player_idle_right')) {
      anims.create({
        key: 'player_idle_right',
        frames: [{ key: 'player', frame: 8 }],
        frameRate: 1
      });
    }
    
    if (!anims.exists('player_idle_up')) {
      anims.create({
        key: 'player_idle_up',
        frames: [{ key: 'player', frame: 12 }],
        frameRate: 1
      });
    }
  }
  
  public update(): void {
    this.handleMovement();
    this.handleShooting();
    this.updateDepth();
  }
  
  private handleMovement(): void {
    const speed = GAME_CONFIG.PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;
    let direction = 'down';
    
    // Handle input
    if (this.keys.left.isDown || this.keys.A.isDown) {
      velocityX = -speed;
      direction = 'left';
      isMoving = true;
    } else if (this.keys.right.isDown || this.keys.D.isDown) {
      velocityX = speed;
      direction = 'right';
      isMoving = true;
    }
    
    if (this.keys.up.isDown || this.keys.W.isDown) {
      velocityY = -speed;
      direction = 'up';
      isMoving = true;
    } else if (this.keys.down.isDown || this.keys.S.isDown) {
      velocityY = speed;
      direction = 'down';
      isMoving = true;
    }
    
    // Set velocity
    this.setVelocity(velocityX, velocityY);
    
    // Play appropriate animation
    if (isMoving) {
      this.anims.play(`player_walk_${direction}`, true);
    } else {
      this.anims.play(`player_idle_${direction}`, true);
    }
  }
  
  private handleShooting(): void {
    if (this.keys.SPACE.isDown && this.scene.time.now > this.lastFired + this.fireRate) {
      this.shoot();
      this.lastFired = this.scene.time.now;
    }
  }
  
  private shoot(): void {
    // Get mouse position or default direction
    const pointer = this.scene.input.activePointer;
    const targetX = pointer.worldX;
    const targetY = pointer.worldY;
    
    // Calculate direction
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    
    // Create bullet
    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    bullet.setScale(0.05);
    bullet.setDepth(50);
    
    // Set bullet velocity
    const bulletSpeed = GAME_CONFIG.BULLET_SPEED;
    bullet.setVelocity(
      Math.cos(angle) * bulletSpeed,
      Math.sin(angle) * bulletSpeed
    );
    
    // Destroy bullet after time
    this.scene.time.delayedCall(4000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
    
    // Store bullet reference for collision detection
    (this.scene as any).bullets = (this.scene as any).bullets || [];
    (this.scene as any).bullets.push(bullet);
    
    // Play sound effect
    this.scene.sound.play('fire', { volume: 0.3 });
  }
  
  private updateDepth(): void {
    this.setDepth(this.y + 100);
  }
  
  public takeDamage(amount: number): boolean {
    this.health = Math.max(0, this.health - amount);
    
    // Flash effect
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });
    
    // Play hurt sound
    this.scene.sound.play('playerHurt', { volume: 0.4 });
    
    // Emit health update event
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
    
    return this.health <= 0;
  }
  
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
  }
  
  public gainExperience(amount: number): void {
    this.experience += amount;
    
    // Check for level up
    const expNeeded = this.level * GAME_CONFIG.LEVEL_UP_EXP;
    if (this.experience >= expNeeded) {
      this.levelUp();
    }
    
    this.scene.events.emit('playerExpChanged', this.experience, expNeeded);
  }
  
  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.maxHealth += 20;
    this.health = this.maxHealth; // Full heal on level up
    
    // Visual effect
    this.setTint(0x00ff00);
    this.scene.time.delayedCall(500, () => {
      this.clearTint();
    });
    
    this.scene.events.emit('playerLevelUp', this.level);
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
  }
  
  public addScore(amount: number): void {
    this.score += amount;
    this.scene.events.emit('playerScoreChanged', this.score);
  }
  
  public answerQuestion(correct: boolean): void {
    this.questionsAnswered++;
    if (correct) {
      this.correctAnswers++;
      this.addScore(GAME_CONFIG.QUESTION_SCORE_BONUS);
      this.gainExperience(20);
    } else {
      this.addScore(GAME_CONFIG.WRONG_ANSWER_PENALTY);
    }
  }
  
  public getAccuracy(): number {
    return this.questionsAnswered > 0 ? (this.correctAnswers / this.questionsAnswered) * 100 : 0;
  }
}
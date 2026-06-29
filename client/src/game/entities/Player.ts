import * as Phaser from 'phaser';
import { GAME_CONFIG } from '../data/GameData';
import type { DungeonGameScene } from '../scenes/DungeonGameScene';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  iconTexture: string;
  onUse: (player: Player, scene: DungeonGameScene) => void;
}

export abstract class Hero extends Phaser.Physics.Arcade.Sprite {
  public health: number = 100;
  public maxHealth: number = 100;
  public level: number = 1;
  public experience: number = 0;
  public score: number = 0;
  public questionsAnswered: number = 0;
  public correctAnswers: number = 0;
  public enemiesKilled: number = 0;
  public isDead: boolean = false;
  public isInvincible: boolean = false;
  public isInvulnerable: boolean = false;
  public hasFireball: boolean = false;
  public joystickVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public baseDamage: number = 25;
  public inventory: Map<string, InventoryItem> = new Map();
  
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    this.setCollideWorldBounds(true);
    
    // Set depth for layering
    this.setDepth(100);
  }
  
  public abstract update(): void;
  protected abstract handleMovement(): void;
  protected abstract handleShooting(): void;

  protected updateDepth(): void {
    this.setDepth(this.y + (this.displayHeight / 2));
  }
  
  public takeDamage(amount: number): boolean {
    if (this.isDead || this.isInvincible || this.isInvulnerable) return false;

    this.health = Math.max(0, this.health - amount);
    
    // Flash effect
    this.isInvulnerable = true;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(1000, () => {
      if (this.active) {
        this.isInvulnerable = false;
        if (!this.isInvincible) {
          this.clearTint();
        }
      }
    });
    
    // Play hurt sound
    this.scene.sound.play('hurt_male', { volume: 0.4 });
    
    // Emit health update event
    this.scene.events.emit('playerHealthChanged', this.health, this.maxHealth);
    
    if (this.health <= 0) {
      this.isDead = true;
      this.body.enable = false;
      this.anims.stop();
      this.setTint(0xff0000);
    }

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
    
    const healthIncrease = Math.floor(this.maxHealth * 0.15);
    this.maxHealth += healthIncrease;
    this.health += healthIncrease;
    this.baseDamage = Math.floor(this.baseDamage * 1.10);
    
    // Visual effect
    this.setTint(0xffd700); // Gold tint instead of green to avoid confusion with healing
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
      // Big points: 20% of current level max life points
      this.gainExperience(Math.floor(this.maxHealth * 0.20));
    } else {
      this.addScore(GAME_CONFIG.WRONG_ANSWER_PENALTY);
    }
  }
  
  public getAccuracy(): number {
    return this.questionsAnswered > 0 ? (this.correctAnswers / this.questionsAnswered) * 100 : 0;
  }
  
  public forceLevelUp(): void {
    this.levelUp();
  }

  public addItem(item: Omit<InventoryItem, 'quantity'>): void {
    const existingItem = this.inventory.get(item.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.inventory.set(item.id, { ...item, quantity: 1 });
    }

    this.scene.events.emit('inventoryChanged');
  }

  public useItem(itemId: string): void {
    const item = this.inventory.get(itemId);

    if (item && item.quantity > 0) {
      this.consumeItem(itemId);
      item.onUse(this as Player, this.scene as DungeonGameScene);
    }
  }

  public removeItem(itemId: string): void {
    const item = this.inventory.get(itemId);
    if (item) {
      // The active scene is the UI scene, so we need to get the game scene from the scene manager
      const gameScene = this.scene.scene.get('DungeonGameScene') as DungeonGameScene;
      gameScene.dropItem(this.x, this.y, item.iconTexture);
      this.consumeItem(itemId);
    }
  }

  private consumeItem(itemId: string): void {
    const item = this.inventory.get(itemId);
    if (item && --item.quantity <= 0) {
      this.inventory.delete(itemId);
    }
    this.scene.events.emit('inventoryChanged');
  }
}

export class Mage extends Hero {
  private keys: any;
  private lastFired: number = 0;
  private fireRate: number = 250;
  private lastDirection: string = 'down';
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    this.setScale(1.6875); // 1.5x of original 1.125
    this.setSize(20, 24);
    this.setOffset(6, 24);
    
    this.setupInput();
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
    
    if (!anims.exists('player_walk_down')) {
      anims.create({ key: 'player_walk_down', frames: anims.generateFrameNumbers('player', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'player_walk_left', frames: anims.generateFrameNumbers('player', { start: 8, end: 15 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'player_walk_right', frames: anims.generateFrameNumbers('player', { start: 16, end: 23 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'player_walk_up', frames: anims.generateFrameNumbers('player', { start: 24, end: 31 }), frameRate: 8, repeat: -1 });
    }
    
    if (!anims.exists('player_idle_down')) {
      anims.create({ key: 'player_idle_down', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
      anims.create({ key: 'player_idle_left', frames: [{ key: 'player', frame: 8 }], frameRate: 1 });
      anims.create({ key: 'player_idle_right', frames: [{ key: 'player', frame: 16 }], frameRate: 1 });
      anims.create({ key: 'player_idle_up', frames: [{ key: 'player', frame: 24 }], frameRate: 1 });
    }
  }
  
  public update(): void {
    if (this.isDead || !this.body) return;

    this.handleMovement();
    this.handleShooting();
    this.updateDepth();
  }
  
  protected handleMovement(): void {
    const speed = GAME_CONFIG.PLAYER_SPEED * 1.5;
    const moveVector = new Phaser.Math.Vector2(0, 0);

    // Determine velocity from input
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      moveVector.x = this.joystickVector.x;
      moveVector.y = this.joystickVector.y;
    } else {
      if (this.keys.left.isDown || this.keys.A.isDown) {
        moveVector.x = -1;
      } else if (this.keys.right.isDown || this.keys.D.isDown) {
        moveVector.x = 1;
      }

      if (this.keys.up.isDown || this.keys.W.isDown) {
        moveVector.y = -1;
      } else if (this.keys.down.isDown || this.keys.S.isDown) {
        moveVector.y = 1;
      }
    }
    
    // Normalize the movement vector to prevent faster diagonal speed, then apply speed
    moveVector.normalize();
    this.setVelocity(moveVector.x * speed, moveVector.y * speed);
    
    // Determine animation based on velocity
    if (moveVector.y < 0) {
      this.anims.play('player_walk_up', true);
      this.lastDirection = 'up';
    } else if (moveVector.y > 0) {
      this.anims.play('player_walk_down', true);
      this.lastDirection = 'down';
    } else if (moveVector.x < 0) {
      this.anims.play('player_walk_left', true);
      this.lastDirection = 'left';
    } else if (moveVector.x > 0) {
      this.anims.play('player_walk_right', true);
      this.lastDirection = 'right';
    } else {
      // Not moving, stop the current animation and show the idle frame for the last direction
      this.anims.play(`player_idle_${this.lastDirection}`, true);
    }
  }
  
  protected handleShooting(): void {
    if (this.keys.SPACE.isDown && this.scene.time.now > this.lastFired + this.fireRate) {
      this.shoot();
    }
  }
  
  public shoot(targetX?: number, targetY?: number): void {
    if (this.hasFireball && (this.scene as any).bullets && (this.scene as any).bullets.getChildren().length >= 1) {
      return; // Only 1 instance at a time for special attack
    }

    this.lastFired = this.scene.time.now;
    const pointer = this.scene.input.activePointer;
    const mouseX = targetX !== undefined ? targetX : pointer.worldX;
    const mouseY = targetY !== undefined ? targetY : pointer.worldY;
    
    const angle = Phaser.Math.Angle.Between(this.x, this.y, mouseX, mouseY);
    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    
    const isSpecial = this.hasFireball;
    bullet.setScale(isSpecial ? 1.8 : 0.6); // 1.5x of original 1.2 and 0.4
    bullet.setTint(isSpecial ? 0xf97316 : 0xfcd34d);
    bullet.setDepth(50);
    
    const deltaX = mouseX - this.x;
    const deltaY = mouseY - this.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseSpeed = isSpecial ? 0.5625 : 1.125;
    
    if (distance > 0) {
      bullet.setData('speedX', (deltaX / distance) * baseSpeed);
      bullet.setData('speedY', (deltaY / distance) * baseSpeed);
    } else {
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    
    bullet.setData('born', 0);
    bullet.setData('lifespan', isSpecial ? 738.28125 * 2 : 738.28125);
    bullet.setData('damage', isSpecial ? this.baseDamage * 5 : this.baseDamage);
    bullet.setData('bossDamage', isSpecial ? this.baseDamage * 10 : this.baseDamage * 2);
    bullet.setData('ignoreWalls', isSpecial);
    bullet.setData('isSpecial', isSpecial);
    if (isSpecial) {
      bullet.setData('pierceCount', 2);
      bullet.setData('hitEnemies', []);
    }
    
    if ((this.scene as any).bullets) {
      (this.scene as any).bullets.add(bullet);
    }
    
    this.scene.sound.play(isSpecial ? 'fireball_shoot' : 'spit', { volume: isSpecial ? 0.5 : 0.3 });
  }
}

export { Mage as Player };
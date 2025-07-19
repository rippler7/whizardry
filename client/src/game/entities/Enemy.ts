import * as Phaser from 'phaser';
import { Player } from './Player';
import { ENEMY_CONFIGS, EnemyConfig } from '../data/GameData';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected config: EnemyConfig;
  protected player: Player;
  protected health: number;
  protected maxHealth: number;
  protected lastAttack: number = 0;
  protected attackRate: number = 1000;
  protected isAlive: boolean = true;
  protected stateTimer: number = 0;
  protected state: 'idle' | 'patrol' | 'chase' | 'attack' | 'stunned' = 'patrol';
  protected patrolTarget: { x: number; y: number } = { x: 0, y: 0 };
  protected lastDirection: { x: number; y: number } = { x: 0, y: 0 };
  protected walls: Phaser.Physics.Arcade.StaticGroup | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, enemyType: string, player: Player) {
    super(scene, x, y, texture);
    
    this.config = ENEMY_CONFIGS[enemyType];
    this.player = player;
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    
    // Set initial patrol target
    this.setNewPatrolTarget();
    
    // Create animations
    this.createAnimations();
  }
  
  protected abstract createAnimations(): void;
  
  public setWallsGroup(walls: Phaser.Physics.Arcade.StaticGroup): void {
    this.walls = walls;
  }
  
  public update(): void {
    if (!this.isAlive) return;
    
    this.updateAI();
    this.updateDepth();
  }
  
  protected updateAI(): void {
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );
    
    // State transitions
    if (distanceToPlayer <= this.config.attackRange && this.canSeePlayer()) {
      this.state = 'attack';
    } else if (distanceToPlayer <= this.config.detectionRange && this.canSeePlayer()) {
      this.state = 'chase';
    } else if (this.state === 'chase' && distanceToPlayer > this.config.detectionRange * 1.5) {
      this.state = 'patrol';
      this.setNewPatrolTarget();
    } else if (this.state === 'idle') {
      this.stateTimer -= this.scene.game.loop.delta;
      if (this.stateTimer <= 0) {
        this.state = 'patrol';
        this.setNewPatrolTarget();
      }
    }
    
    // Execute state behavior
    switch (this.state) {
      case 'patrol':
        this.handlePatrol();
        break;
      case 'chase':
        this.handleChase();
        break;
      case 'attack':
        this.handleAttack();
        break;
      case 'stunned':
        this.handleStunned();
        break;
    }
  }
  
  protected handlePatrol(): void {
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.x, this.y, this.patrolTarget.x, this.patrolTarget.y
    );
    
    if (distanceToTarget < 32) {
      this.state = 'idle';
      this.stateTimer = Phaser.Math.Between(1000, 3000);
      this.setVelocity(0, 0);
      return;
    }
    
    this.moveTowardsTarget(this.patrolTarget.x, this.patrolTarget.y, this.config.speed * 0.5);
  }
  
  protected handleChase(): void {
    if (this.canSeePlayer()) {
      this.moveTowardsTarget(this.player.x, this.player.y, this.config.speed);
    } else {
      // Lost sight of player, go to last known position
      this.moveTowardsTarget(this.player.x, this.player.y, this.config.speed * 0.7);
    }
  }
  
  protected handleAttack(): void {
    // Stop moving when attacking
    this.setVelocity(0, 0);
    
    if (this.scene.time.now > this.lastAttack + this.attackRate) {
      this.performAttack();
      this.lastAttack = this.scene.time.now;
    }
  }
  
  protected handleStunned(): void {
    this.setVelocity(0, 0);
    this.stateTimer -= this.scene.game.loop.delta;
    if (this.stateTimer <= 0) {
      this.state = 'patrol';
      this.setNewPatrolTarget();
    }
  }
  
  protected moveTowardsTarget(targetX: number, targetY: number, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    let velocityX = Math.cos(angle) * speed;
    let velocityY = Math.sin(angle) * speed;
    
    // Simple obstacle avoidance
    if (this.walls) {
      const futureX = this.x + velocityX * 0.1;
      const futureY = this.y + velocityY * 0.1;
      
      // Check if future position would collide with walls
      const willCollide = this.checkWallCollision(futureX, futureY);
      
      if (willCollide) {
        // Try alternative directions
        const alternatives = [
          { x: velocityX, y: 0 }, // Horizontal only
          { x: 0, y: velocityY }, // Vertical only
          { x: -velocityY, y: velocityX }, // Perpendicular
          { x: velocityY, y: -velocityX }, // Perpendicular opposite
        ];
        
        for (const alt of alternatives) {
          const testX = this.x + alt.x * 0.1;
          const testY = this.y + alt.y * 0.1;
          
          if (!this.checkWallCollision(testX, testY)) {
            velocityX = alt.x;
            velocityY = alt.y;
            break;
          }
        }
      }
    }
    
    this.setVelocity(velocityX, velocityY);
    this.lastDirection = { x: velocityX, y: velocityY };
    
    // Update animation based on movement
    this.updateMovementAnimation(velocityX, velocityY);
  }
  
  protected checkWallCollision(x: number, y: number): boolean {
    if (!this.walls) return false;
    
    // Simple bounds check for now - can be improved with actual collision detection
    const bounds = this.getBounds();
    bounds.x = x - bounds.width / 2;
    bounds.y = y - bounds.height / 2;
    
    // Check world bounds
    if (bounds.x < 0 || bounds.y < 0 || 
        bounds.x + bounds.width > this.scene.sys.game.config.width as number ||
        bounds.y + bounds.height > this.scene.sys.game.config.height as number) {
      return true;
    }
    
    return false;
  }
  
  protected canSeePlayer(): boolean {
    // Simple line-of-sight check
    // In a more complex implementation, this would check for wall obstacles
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );
    
    return distance <= this.config.detectionRange;
  }
  
  protected setNewPatrolTarget(): void {
    const range = 150;
    this.patrolTarget = {
      x: this.x + Phaser.Math.Between(-range, range),
      y: this.y + Phaser.Math.Between(-range, range)
    };
    
    // Keep within world bounds
    const worldBounds = this.scene.physics.world.bounds;
    this.patrolTarget.x = Phaser.Math.Clamp(this.patrolTarget.x, 50, worldBounds.width - 50);
    this.patrolTarget.y = Phaser.Math.Clamp(this.patrolTarget.y, 50, worldBounds.height - 50);
  }
  
  protected abstract updateMovementAnimation(velocityX: number, velocityY: number): void;
  protected abstract performAttack(): void;
  
  protected updateDepth(): void {
    this.setDepth(this.y);
  }
  
  public takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;
    
    this.health = Math.max(0, this.health - amount);
    
    // Flash effect
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (this.isAlive) {
        this.clearTint();
      }
    });
    
    // Stun briefly when hit
    this.state = 'stunned';
    this.stateTimer = 300;
    
    if (this.health <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }
  
  protected die(): void {
    this.isAlive = false;
    this.setTint(0x666666);
    
    // Give player rewards
    this.player.gainExperience(this.config.experienceReward);
    this.player.addScore(this.config.scoreReward);
    
    // Play death sound
    this.scene.sound.play('enemyHurt', { volume: 0.3 });
    
    // Remove after delay
    this.scene.time.delayedCall(2000, () => {
      this.destroy();
    });
    
    // Emit death event
    this.scene.events.emit('enemyDefeated', this.config.type);
  }
}

// Skeleton Enemy
export class Skeleton extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'skeleton', 'skeleton', player);
    this.setSize(48, 48);
    this.setOffset(8, 16);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    // Walking animations for skeleton
    if (!anims.exists('skeleton_walk_down')) {
      anims.create({
        key: 'skeleton_walk_down',
        frames: anims.generateFrameNumbers('skeleton', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('skeleton_walk_left')) {
      anims.create({
        key: 'skeleton_walk_left',
        frames: anims.generateFrameNumbers('skeleton', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('skeleton_walk_right')) {
      anims.create({
        key: 'skeleton_walk_right',
        frames: anims.generateFrameNumbers('skeleton', { start: 8, end: 11 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('skeleton_walk_up')) {
      anims.create({
        key: 'skeleton_walk_up',
        frames: anims.generateFrameNumbers('skeleton', { start: 12, end: 15 }),
        frameRate: 6,
        repeat: -1
      });
    }
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'skeleton_walk_right' : 'skeleton_walk_left', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'skeleton_walk_down' : 'skeleton_walk_up', true);
    }
  }
  
  protected performAttack(): void {
    // Melee attack
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );
    
    if (distance <= this.config.attackRange) {
      this.player.takeDamage(this.config.damage);
    }
  }
}

// Zombie Enemy
export class Zombie extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'zombie', 'zombie', player);
    this.setSize(24, 24);
    this.setOffset(4, 8);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('zombie_walk_down')) {
      anims.create({
        key: 'zombie_walk_down',
        frames: anims.generateFrameNumbers('zombie', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    if (!anims.exists('zombie_walk_left')) {
      anims.create({
        key: 'zombie_walk_left',
        frames: anims.generateFrameNumbers('zombie', { start: 4, end: 7 }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    if (!anims.exists('zombie_walk_right')) {
      anims.create({
        key: 'zombie_walk_right',
        frames: anims.generateFrameNumbers('zombie', { start: 8, end: 11 }),
        frameRate: 4,
        repeat: -1
      });
    }
    
    if (!anims.exists('zombie_walk_up')) {
      anims.create({
        key: 'zombie_walk_up',
        frames: anims.generateFrameNumbers('zombie', { start: 12, end: 15 }),
        frameRate: 4,
        repeat: -1
      });
    }
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'zombie_walk_right' : 'zombie_walk_left', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'zombie_walk_down' : 'zombie_walk_up', true);
    }
  }
  
  protected performAttack(): void {
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );
    
    if (distance <= this.config.attackRange) {
      this.player.takeDamage(this.config.damage);
    }
  }
}

// Bat Enemy
export class Bat extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'bat', 'bat', player);
    this.setSize(48, 48);
    this.setOffset(8, 8);
    this.attackRate = 2000; // Slower attack rate for ranged enemy
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('bat_fly')) {
      anims.create({
        key: 'bat_fly',
        frames: anims.generateFrameNumbers('bat', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    this.anims.play('bat_fly', true);
    this.setFlipX(velocityX < 0);
  }
  
  protected performAttack(): void {
    // Ranged projectile attack
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    
    const fireball = this.scene.physics.add.sprite(this.x, this.y, 'fireball');
    fireball.setScale(0.8);
    fireball.setTint(0xff4444);
    fireball.setDepth(50);
    
    const projectileSpeed = 200;
    fireball.setVelocity(
      Math.cos(angle) * projectileSpeed,
      Math.sin(angle) * projectileSpeed
    );
    
    // Destroy fireball after time
    this.scene.time.delayedCall(3000, () => {
      if (fireball.active) {
        fireball.destroy();
      }
    });
    
    // Set up collision with player
    this.scene.physics.add.overlap(fireball, this.player, () => {
      this.player.takeDamage(this.config.damage);
      fireball.destroy();
    });
    
    // Play sound
    this.scene.sound.play('spitting', { volume: 0.3 });
  }
}

// Boss Enemy
export class Boss extends Enemy {
  private phase: number = 1;
  private maxPhases: number = 3;
  private phaseChangeHealth: number[];
  
  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'Boss', 'boss', player);
    this.setSize(48, 48);
    this.setOffset(8, 16);
    this.attackRate = 1500;
    
    // Calculate phase change thresholds
    this.phaseChangeHealth = [];
    for (let i = 1; i < this.maxPhases; i++) {
      this.phaseChangeHealth.push(Math.floor(this.maxHealth * (this.maxPhases - i) / this.maxPhases));
    }
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('boss_walk_down')) {
      anims.create({
        key: 'boss_walk_down',
        frames: anims.generateFrameNumbers('Boss', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('boss_walk_left')) {
      anims.create({
        key: 'boss_walk_left',
        frames: anims.generateFrameNumbers('Boss', { start: 4, end: 7 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('boss_walk_right')) {
      anims.create({
        key: 'boss_walk_right',
        frames: anims.generateFrameNumbers('Boss', { start: 8, end: 11 }),
        frameRate: 6,
        repeat: -1
      });
    }
    
    if (!anims.exists('boss_walk_up')) {
      anims.create({
        key: 'boss_walk_up',
        frames: anims.generateFrameNumbers('Boss', { start: 12, end: 15 }),
        frameRate: 6,
        repeat: -1
      });
    }
  }
  
  public update(): void {
    super.update();
    this.checkPhaseChange();
  }
  
  private checkPhaseChange(): void {
    const newPhase = this.maxPhases - this.phaseChangeHealth.filter(threshold => this.health <= threshold).length;
    
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.onPhaseChange();
    }
  }
  
  private onPhaseChange(): void {
    // Visual effect for phase change
    this.setTint(0xff00ff);
    this.scene.time.delayedCall(1000, () => {
      this.clearTint();
    });
    
    // Increase stats based on phase
    this.config.speed += 10;
    this.config.damage += 5;
    this.attackRate = Math.max(500, this.attackRate - 200);
    
    this.scene.events.emit('bossPhaseChange', this.phase);
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'boss_walk_right' : 'boss_walk_left', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'boss_walk_down' : 'boss_walk_up', true);
    }
  }
  
  protected performAttack(): void {
    if (this.phase >= 2) {
      // Multi-attack in later phases
      this.multiAttack();
    } else {
      // Simple melee attack
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, this.player.x, this.player.y
      );
      
      if (distance <= this.config.attackRange) {
        this.player.takeDamage(this.config.damage);
      }
    }
  }
  
  private multiAttack(): void {
    // Melee attack
    const distance = Phaser.Math.Distance.Between(
      this.x, this.y, this.player.x, this.player.y
    );
    
    if (distance <= this.config.attackRange) {
      this.player.takeDamage(this.config.damage);
    }
    
    // Also shoot projectiles in phase 3
    if (this.phase >= 3) {
      for (let i = 0; i < 3; i++) {
        this.scene.time.delayedCall(i * 200, () => {
          this.shootProjectile();
        });
      }
    }
  }
  
  private shootProjectile(): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    
    const fireball = this.scene.physics.add.sprite(this.x, this.y, 'fireball');
    fireball.setScale(1.2);
    fireball.setTint(0x8800ff);
    fireball.setDepth(50);
    
    const projectileSpeed = 150;
    fireball.setVelocity(
      Math.cos(angle) * projectileSpeed,
      Math.sin(angle) * projectileSpeed
    );
    
    this.scene.time.delayedCall(4000, () => {
      if (fireball.active) {
        fireball.destroy();
      }
    });
    
    this.scene.physics.add.overlap(fireball, this.player, () => {
      this.player.takeDamage(this.config.damage * 0.7);
      fireball.destroy();
    });
  }
  
  protected die(): void {
    super.die();
    this.scene.events.emit('bossDefeated');
  }
}
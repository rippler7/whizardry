import * as Phaser from 'phaser';

export interface EnemyConfig {
  type: string;
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  detectionRange: number;
  experienceReward: number;
  scoreReward: number;
}

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  skeleton: { type: 'skeleton', health: 50, speed: 40, damage: 20, attackRange: 40, detectionRange: 200, experienceReward: 10, scoreReward: 50 },
  zombie: { type: 'zombie', health: 150, speed: 40, damage: 20, attackRange: 40, detectionRange: 200, experienceReward: 10, scoreReward: 50 },
  zombie2: { type: 'zombie2', health: 100, speed: 60, damage: 20, attackRange: 40, detectionRange: 200, experienceReward: 15, scoreReward: 75 },
  bat: { type: 'bat', health: 50, speed: 60, damage: 15, attackRange: 150, detectionRange: 250, experienceReward: 10, scoreReward: 50 },
  spider: { type: 'spider', health: 50, speed: 50, damage: 15, attackRange: 150, detectionRange: 200, experienceReward: 10, scoreReward: 50 },
  boss: { type: 'boss', health: 10500, speed: 50, damage: 30, attackRange: 80, detectionRange: 400, experienceReward: 100, scoreReward: 500 }
};

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected config: EnemyConfig;
  protected player: any; // Using duck-typing to communicate with DungeonGameScene's player
  protected lastAttack: number = 0;
  protected attackRate: number = 1000;
  protected isAlive: boolean = true;
  public get isDead(): boolean { return !this.isAlive; }
  protected stateTimer: number = 0;
  protected state: 'idle' | 'patrol' | 'chase' | 'attack' | 'stunned' = 'patrol';
  protected patrolTarget: { x: number; y: number } = { x: 0, y: 0 };
  protected lastDirection: { x: number; y: number } = { x: 0, y: 0 };
  protected walls: Phaser.Physics.Arcade.StaticGroup | null = null;
  protected shadow!: Phaser.GameObjects.Ellipse;
  protected shadowOffset: number = 20;
  protected evasionDirection: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, enemyType: string, player: any, hp: number, speed: number) {
    super(scene, x, y, texture);
    
    this.config = { ...ENEMY_CONFIGS[enemyType] };
    if (hp) this.config.health = hp;
    if (speed) this.config.speed = speed;
    
    this.player = player;
    this.setData('health', this.config.health);
    this.setData('type', enemyType);
    
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
  
  protected createShadow(width: number, height: number, offset: number) {
    this.shadowOffset = offset;
    this.shadow = this.scene.add.ellipse(this.x, this.y + offset, width, height, 0x000000, 0.4).setDepth(1);
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
      // Before making decision to change direction or continue, check for player proximity
      const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
      
      // Check if obstacle is present in the direct path
      const directObstacle = this.checkWallCollision(this.x + velocityX * 0.3, this.y + velocityY * 0.3);
      
      // Always prioritize detecting player proximity or clear path
      if (!directObstacle || distanceToTarget < 24) {
        // Path is clear or player is right next to us! Chase directly immediately.
        this.evasionDirection = { x: 0, y: 0 };
      } else {
        // Obstacle is present. Decide whether to continue direction or change direction.
        let canContinueEvasion = false;
        if (this.evasionDirection.x !== 0 || this.evasionDirection.y !== 0) {
          canContinueEvasion = !this.checkWallCollision(this.x + this.evasionDirection.x * 0.3, this.y + this.evasionDirection.y * 0.3);
        }

        if (this.state === 'patrol') {
          this.setNewPatrolTarget();
          this.setVelocity(0, 0);
          this.evasionDirection = { x: 0, y: 0 };
          return;
        }

        if (canContinueEvasion) {
          velocityX = this.evasionDirection.x;
          velocityY = this.evasionDirection.y;
          
          this.setVelocity(velocityX, velocityY);
          this.lastDirection = { x: velocityX, y: velocityY };
          this.updateMovementAnimation(velocityX, velocityY);
          return;
        }

        // Change direction: calculate a BRAND NEW scaling direction around the obstacle
        let evX = 0;
        let evY = 0;

        if (typeof directObstacle !== 'boolean') {
          const wallBounds = directObstacle.getBounds();
          const dxToPlayer = targetX - this.x;
          const dyToPlayer = targetY - this.y;

          const canSlideX = !this.checkWallCollision(this.x + Math.sign(dxToPlayer || 1) * speed * 0.3, this.y);
          const canSlideY = !this.checkWallCollision(this.x, this.y + Math.sign(dyToPlayer || 1) * speed * 0.3);

          if (canSlideX && Math.abs(dxToPlayer) > 10) {
            evX = Math.sign(dxToPlayer) * speed;
          } else if (canSlideY && Math.abs(dyToPlayer) > 10) {
            evY = Math.sign(dyToPlayer) * speed;
          } else {
            const distLeft = Math.abs(this.x - wallBounds.left);
            const distRight = Math.abs(this.x - wallBounds.right);
            const distTop = Math.abs(this.y - wallBounds.top);
            const distBottom = Math.abs(this.y - wallBounds.bottom);

            const minDistX = Math.min(distLeft, distRight);
            const minDistY = Math.min(distTop, distBottom);

            if (minDistX < minDistY && !this.checkWallCollision(this.x + (distLeft < distRight ? -speed : speed) * 0.3, this.y)) {
              evX = distLeft < distRight ? -speed : speed;
            } else if (!this.checkWallCollision(this.x, this.y + (distTop < distBottom ? -speed : speed) * 0.3)) {
              evY = distTop < distBottom ? -speed : speed;
            } else {
              evX = -velocityX;
              evY = -velocityY;
            }
          }
        } else {
          evX = velocityX === 0 ? 0 : -Math.sign(velocityX) * speed;
          evY = velocityY === 0 ? 0 : -Math.sign(velocityY) * speed;
        }

        if (evX !== 0 || evY !== 0) {
          velocityX = evX;
          velocityY = evY;
          this.evasionDirection = { x: velocityX, y: velocityY };
        } else {
          velocityX = 0;
          velocityY = 0;
          this.evasionDirection = { x: 0, y: 0 };
        }
      }
    }
    
    this.setVelocity(velocityX, velocityY);
    this.lastDirection = { x: velocityX, y: velocityY };
    
    // Update animation based on movement
    this.updateMovementAnimation(velocityX, velocityY);
  }
  
  protected checkWallCollision(x: number, y: number): boolean | Phaser.Physics.Arcade.Sprite {
    if (!this.walls) return false;
    
    // Use the exact physics body dimensions instead of the wildly scaling visual texture bounds
    const bodyW = this.body ? this.body.width : this.width;
    const bodyH = this.body ? this.body.height : this.height;
    
    const bounds = new Phaser.Geom.Rectangle(
      x - bodyW / 2, y - bodyH / 2, bodyW, bodyH
    );
    
    // Check world bounds
    if (bounds.x < 0 || bounds.y < 0 || 
        bounds.x + bounds.width > this.scene.scale.width ||
        bounds.y + bounds.height > this.scene.scale.height) {
      return true;
    }
    
    let collided: boolean | Phaser.Physics.Arcade.Sprite = false;
    if (this.walls) {
      this.walls.getChildren().forEach(wall => {
        // Allow spiders to bypass wall collision checks
        if (this.config.type !== 'spider' && Phaser.Geom.Intersects.RectangleToRectangle(bounds, (wall as Phaser.Physics.Arcade.Sprite).getBounds())) {
          collided = wall as Phaser.Physics.Arcade.Sprite;
        }
      });
    }
    
    return collided;
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
    this.setDepth(5);
    if (this.shadow) this.shadow.setPosition(this.x, this.y + this.shadowOffset);
  }
  
  public takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;
    
    const newHealth = Math.max(0, this.getData('health') - amount);
    this.setData('health', newHealth);
    
    // Flash effect
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      if (this.isAlive && this.active) this.clearTint();
    });
    
    // Stun briefly when hit
    this.state = 'stunned';
    this.stateTimer = 300;
    
    if (newHealth <= 0) {
      this.die();
      return true;
    }
    
    return false;
  }
  
  protected die(): void {
    this.isAlive = false;
    this.body.enable = false;
    if (this.shadow) this.shadow.destroy();
    
    // Give player rewards
    if (this.player.gainExperience) this.player.gainExperience(this.config.experienceReward);
    if (this.player.addScore) this.player.addScore(this.config.scoreReward);
    
    // Play specific death sounds
    if (this.config.type === 'zombie' || this.config.type === 'zombie2') {
      this.scene.sound.play('zombienoise', { volume: 0.3 });
      this.scene.sound.play('burst', { volume: 0.3 });
    } else {
      this.scene.sound.play('enemy-death', { volume: 0.3 });
    }
    
    const dieAnim = `${this.config.type}Die`;
    if (this.scene.anims.exists(dieAnim)) {
      this.anims.play(dieAnim);
      this.once('animationcomplete', () => this.destroy());
    } else {
      this.setTint(0xff0000);
      this.scene.tweens.add({
        targets: this, alpha: 0, angle: 90, scaleX: 0.5, scaleY: 0.5,
        duration: 500, onComplete: () => this.destroy()
      });
    }
    
    // Emit death event
    this.scene.events.emit('enemyDefeated', this.config.type, this.x, this.y);
  }
}

// Skeleton Enemy
export class Skeleton extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'skeleton', 'skeleton', player, hp, speed);
    this.setSize(32, 48);
    this.setOffset(16, 16);
    this.createShadow(40, 16, 30);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    // Walking animations for skeleton
    if (!anims.exists('walkDownSkeleton')) {
      anims.create({
        key: 'walkDownSkeleton',
        frames: anims.generateFrameNumbers('skeleton', { start: 130, end: 137 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkLeftSkeleton',
        frames: anims.generateFrameNumbers('skeleton', { start: 117, end: 125 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkRightSkeleton',
        frames: anims.generateFrameNumbers('skeleton', { start: 143, end: 151 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkUpSkeleton',
        frames: anims.generateFrameNumbers('skeleton', { start: 104, end: 112 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'skeletonDie',
        frames: anims.generateFrameNumbers('skeleton', { start: 260, end: 265 }),
        frameRate: 8,
        repeat: 0
      });
    }
    this.anims.play('walkDownSkeleton');
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'walkRightSkeleton' : 'walkLeftSkeleton', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'walkDownSkeleton' : 'walkUpSkeleton', true);
    } else {
      this.anims.stop();
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
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'zombie', 'zombie', player, hp, speed);
    this.setSize(24, 24);
    this.setOffset(4, 8);
    this.createShadow(24, 10, 16);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('walkDownZombie')) {
      anims.create({
        key: 'walkDownZombie',
        frames: anims.generateFrameNumbers('zombie', { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkLeftZombie',
        frames: anims.generateFrameNumbers('zombie', { start: 18, end: 20 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkRightZombie',
        frames: anims.generateFrameNumbers('zombie', { start: 30, end: 32 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkUpZombie',
        frames: anims.generateFrameNumbers('zombie', { start: 42, end: 44 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'zombieDie',
        frames: anims.generateFrameNumbers('zombie', { start: 48, end: 53 }),
        frameRate: 8,
        repeat: 0
      });
    }
    this.anims.play('walkDownZombie');
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'walkRightZombie' : 'walkLeftZombie', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'walkDownZombie' : 'walkUpZombie', true);
    } else {
      this.anims.stop();
    }
  }
  
  protected performAttack(): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    if (distance <= this.config.attackRange) {
      this.player.takeDamage(this.config.damage);
    }
  }
}

// Zombie2 Enemy
export class Zombie2 extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'zombie', 'zombie2', player, hp, speed);
    this.setSize(24, 24);
    this.setOffset(4, 8);
    this.createShadow(24, 10, 16);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    if (!anims.exists('walkDownZombie2')) {
      anims.create({ key: 'walkDownZombie2', frames: anims.generateFrameNumbers('zombie', { start: 0, end: 5 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'walkLeftZombie2', frames: anims.generateFrameNumbers('zombie', { start: 12, end: 17 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'walkRightZombie2', frames: anims.generateFrameNumbers('zombie', { start: 24, end: 29 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'walkUpZombie2', frames: anims.generateFrameNumbers('zombie', { start: 36, end: 41 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'zombie2Die', frames: anims.generateFrameNumbers('zombie', { start: 48, end: 53 }), frameRate: 8, repeat: 0 });
    }
    this.anims.play('walkDownZombie2');
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'walkRightZombie2' : 'walkLeftZombie2', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'walkDownZombie2' : 'walkUpZombie2', true);
    } else {
      this.anims.stop();
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
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'bat', 'bat', player, hp, speed);
    this.setSize(48, 48);
    this.setOffset(8, 8);
    this.attackRate = 2000; // Slower attack rate for ranged enemy
    this.createShadow(30, 12, 30);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('flyLeft')) {
      anims.create({
        key: 'flyLeft',
        frames: anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'flyRight',
        frames: anims.generateFrameNumbers('bat', { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1
      });
    }
    this.anims.play('flyLeft');
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    this.anims.play(velocityX > 0 ? 'flyRight' : 'flyLeft', true);
  }
  
  protected performAttack(): void {
    // Ranged projectile attack
    
    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    bullet.setScale(0.4);
    bullet.setTint(0xff4444);
    bullet.setDepth(50);
    bullet.setData('damage', this.config.damage);
    
    const scene = this.scene as any;
    if (scene.enemyBullets) {
      scene.enemyBullets.add(bullet);
    } else {
      this.scene.physics.add.overlap(bullet, this.player, () => {
        this.player.takeDamage(this.config.damage);
        bullet.destroy();
      });
    }
    
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseSpeed = 0.25;
    
    if (distance > 0) {
      bullet.setData('speedX', (dx / distance) * baseSpeed);
      bullet.setData('speedY', (dy / distance) * baseSpeed);
    } else {
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    bullet.setData('born', 0);
    
    // Destroy fireball after time
    this.scene.time.delayedCall(3000, () => {
      if (bullet.active) bullet.destroy();
    });
    
    this.scene.sound.play('spit', { volume: 0.3 });
  }
}

// Spider Enemy
export class Spider extends Enemy {
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'spider', 'spider', player, hp, speed);
    this.setSize(32, 32);
    this.setOffset(16, 16);
    this.attackRate = 2000;
    this.createShadow(40, 16, 28);
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    if (!anims.exists('walkSpider')) {
      anims.create({ key: 'walkSpider', frames: anims.generateFrameNumbers('spider', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'attackSpider', frames: anims.generateFrameNumbers('spider', { start: 13, end: 16 }), frameRate: 8, repeat: -1 });
      anims.create({ key: 'spiderDie', frames: anims.generateFrameNumbers('spider', { start: 51, end: 54 }), frameRate: 8, repeat: 0 });
    }
    this.anims.play('walkSpider');
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1) {
      this.anims.play('walkSpider', true);
    } else {
      this.anims.stop();
    }
  }
  
  protected performAttack(): void {
    this.anims.play('attackSpider', true);
    
    const baseSpeed = 0.25;
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    const spreadAngles = [baseAngle - 0.25, baseAngle, baseAngle + 0.25]; // Shoot left, center, and right
    
    spreadAngles.forEach(angle => {
      const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
      bullet.setScale(0.4);
      bullet.setTint(0xffffff); // White web projectile
      bullet.setDepth(50);
      bullet.setData('damage', this.config.damage);
      bullet.setData('isSpiderWeb', true);
      
      const scene = this.scene as any;
      if (scene.enemyBullets) {
        scene.enemyBullets.add(bullet);
      } else {
        this.scene.physics.add.overlap(bullet, this.player, () => {
          this.player.takeDamage(this.config.damage);
          bullet.destroy();
        });
      }

      bullet.setData('speedX', Math.cos(angle) * baseSpeed);
      bullet.setData('speedY', Math.sin(angle) * baseSpeed);
      bullet.setData('born', 0);
      
      this.scene.time.delayedCall(3000, () => { if (bullet.active) bullet.destroy(); });
    });

    this.scene.sound.play('spit', { volume: 0.3 });
  }
}

// Boss Enemy
export class Boss extends Enemy {
  private phase: number = 1;
  private maxPhases: number = 3;
  private phaseChangeHealth: number[];
  private isPatrollingToChest: boolean = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number, player: any, hp: number, speed: number) {
    super(scene, x, y, 'Boss', 'boss', player, hp, speed);
    this.setSize(40, 56);
    this.setOffset(12, 8);
    this.attackRate = 1500;
    this.createShadow(60, 24, 44);
    
    // Calculate phase change thresholds
    this.phaseChangeHealth = [];
    for (let i = 1; i < this.maxPhases; i++) {
      this.phaseChangeHealth.push(Math.floor(this.config.health * (this.maxPhases - i) / this.maxPhases));
    }
  }
  
  protected createAnimations(): void {
    const anims = this.scene.anims;
    
    if (!anims.exists('walkDownOrc')) {
      anims.create({
        key: 'walkDownOrc',
        frames: anims.generateFrameNumbers('Boss', { start: 130, end: 137 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkUpOrc',
        frames: anims.generateFrameNumbers('Boss', { start: 104, end: 112 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkLeftOrc',
        frames: anims.generateFrameNumbers('Boss', { start: 117, end: 125 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'walkRightOrc',
        frames: anims.generateFrameNumbers('Boss', { start: 143, end: 151 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'attackDownOrc',
        frames: anims.generateFrameNumbers('Boss', { start: 78, end: 84 }),
        frameRate: 8,
        repeat: -1
      });
      anims.create({
        key: 'bossDie',
        frames: anims.generateFrameNumbers('Boss', { start: 260, end: 265 }),
        frameRate: 8,
        repeat: 0
      });
    }
    this.anims.play('walkDownOrc');
  }
  
  public update(): void {
    super.update();
    this.checkPhaseChange();
  }
  
  protected setNewPatrolTarget(): void {
    const scene = this.scene as any;
    this.isPatrollingToChest = false;
    
    if (scene.chests && scene.chests.getChildren().length > 0) {
      let nearestChest: any = null;
      let minDistance = Infinity;
      
      // Find the chest that is currently closest to the player
      scene.chests.getChildren().forEach((chest: any) => {
        if (!chest.getData('opened')) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
          if (dist < minDistance) {
            minDistance = dist;
            nearestChest = chest;
          }
        }
      });
      
      if (nearestChest) {
        const range = 80;
        this.patrolTarget = {
          x: nearestChest.x + Phaser.Math.Between(-range, range),
          y: nearestChest.y + Phaser.Math.Between(-range, range)
        };
        
        const worldBounds = this.scene.physics.world.bounds;
        this.patrolTarget.x = Phaser.Math.Clamp(this.patrolTarget.x, 50, worldBounds.width - 50);
        this.patrolTarget.y = Phaser.Math.Clamp(this.patrolTarget.y, 50, worldBounds.height - 50);
        this.isPatrollingToChest = true;
        return;
      }
    }
    
    super.setNewPatrolTarget();
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
    
    const scene = this.scene as any;
    let currentSpeed = this.config.speed * 0.5; // Normal wandering is 0.5x speed
    
    if (this.isPatrollingToChest) {
      currentSpeed = 120; // Match player walking speed (120) when going straight to a chest
    }
    
    this.moveTowardsTarget(this.patrolTarget.x, this.patrolTarget.y, currentSpeed);
  }

  protected handleChase(): void {
    let currentSpeed = this.config.speed;
    
    if (this.canSeePlayer()) {
      this.moveTowardsTarget(this.player.x, this.player.y, currentSpeed);
    } else {
      this.moveTowardsTarget(this.player.x, this.player.y, currentSpeed * 0.7);
    }
  }

  private checkPhaseChange(): void {
    const newPhase = 1 + this.phaseChangeHealth.filter(threshold => this.getData('health') <= threshold).length;
    
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this.onPhaseChange();
    }
  }
  
  private onPhaseChange(): void {
    // Visual effect for phase change
    this.setTint(0xff00ff);
    this.scene.time.delayedCall(1000, () => {
      if (this.active) this.clearTint();
    });
    
    // Increase stats based on phase
    this.config.speed += 10;
    this.config.damage += 5;
    this.attackRate = Math.max(500, this.attackRate - 200);
    
    this.scene.events.emit('bossPhaseChange', this.phase);
  }
  
  protected updateMovementAnimation(velocityX: number, velocityY: number): void {
    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.anims.play(velocityX > 0 ? 'walkRightOrc' : 'walkLeftOrc', true);
    } else if (velocityY !== 0) {
      this.anims.play(velocityY > 0 ? 'walkDownOrc' : 'walkUpOrc', true);
    } else {
      this.anims.stop();
    }
  }
  
  protected performAttack(): void {
    this.anims.play('attackDownOrc', true);
    
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
          if (this.active && !this.isDead) this.shootProjectile();
        });
      }
    }
  }
  
  private shootProjectile(): void {
    
    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    bullet.setScale(0.8);
    bullet.setTint(0x8800ff);
    bullet.setDepth(50);
    bullet.setData('damage', this.config.damage * 0.7);
    
    const scene = this.scene as any;
    if (scene.enemyBullets) {
      scene.enemyBullets.add(bullet);
    } else {
      this.scene.physics.add.overlap(bullet, this.player, () => {
        this.player.takeDamage(this.config.damage * 0.7);
        bullet.destroy();
      });
    }
    
    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const baseSpeed = 0.25;
    
    if (distance > 0) {
      bullet.setData('speedX', (dx / distance) * baseSpeed);
      bullet.setData('speedY', (dy / distance) * baseSpeed);
    } else {
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    bullet.setData('born', 0);
    
    this.scene.time.delayedCall(4000, () => {
      if (bullet.active) bullet.destroy();
    });
  }
  
  protected die(): void {
    super.die();
    this.scene.events.emit('bossDefeated');
  }
}
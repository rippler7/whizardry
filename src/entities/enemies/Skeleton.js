import { Enemy } from './Enemy.js';
import { ANIMATIONS, CONSTANTS } from '../../config/Constants.js';

export class Skeleton extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'skeleton', 0);
        this.setupSkeleton();
    }

    setupSkeleton() {
        this.health = 150;
        this.maxHealth = 150;
        this.damage = CONSTANTS.SKELETON_DAMAGE;
        this.speed = 60;
        this.attackRange = 80;
        this.detectionRange = 200;
        this.attackCooldown = 1500;
        this.canShoot = true;
        this.shootCooldown = 2000;
        this.lastShootTime = 0;
        
        this.body.setSize(50, 50, 7, 7);
        this.setScale(1.2);
    }

    update() {
        super.update();
        this.updateShooting();
    }

    updateShooting() {
        if (this.isDead || !this.target) return;
        
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        const currentTime = this.scene.time.now;
        
        if (distanceToPlayer <= this.detectionRange && 
            distanceToPlayer > this.attackRange &&
            currentTime - this.lastShootTime >= this.shootCooldown) {
            this.shoot();
        }
    }

    shoot() {
        if (!this.canShoot || !this.target) return;
        
        this.lastShootTime = this.scene.time.now;
        
        // Play shooting animation
        this.anims.play(ANIMATIONS.SKELETON.SHOOT_LEFT, false);
        
        // Create projectile
        const bullet = this.scene.physics.add.sprite(this.x, this.y, 'fireball');
        bullet.setScale(0.5);
        bullet.setTint(0x00ff00); // Green tint for skeleton projectiles
        
        // Calculate direction to player
        const direction = new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();
        
        bullet.setVelocity(direction.x * 200, direction.y * 200);
        
        // Set up collision with player
        this.scene.physics.add.overlap(bullet, this.target, (bullet, player) => {
            if (player.takeDamage) {
                player.takeDamage(this.damage);
            }
            bullet.destroy();
        });
        
        // Destroy bullet after timeout
        this.scene.time.delayedCall(3000, () => {
            if (bullet && bullet.active) {
                bullet.destroy();
            }
        });
        
        // Play sound
        this.scene.audioManager.playSound('spitting');
    }

    playMovementAnimation() {
        if (this.isDead) return;
        
        switch (this.lastDirection) {
            case 'up':
                this.anims.play(ANIMATIONS.SKELETON.WALK_UP, true);
                break;
            case 'down':
                this.anims.play(ANIMATIONS.SKELETON.WALK_DOWN, true);
                break;
            case 'left':
                this.anims.play(ANIMATIONS.SKELETON.WALK_LEFT, true);
                break;
            case 'right':
                this.anims.play(ANIMATIONS.SKELETON.WALK_RIGHT, true);
                break;
        }
    }

    attack() {
        super.attack();
        
        // Play casting animation
        this.anims.play(ANIMATIONS.SKELETON.CAST_DOWN, false);
        
        // Additional magic attack effects could go here
        this.scene.audioManager.playSound('spitting');
    }

    playDeathAnimation() {
        this.anims.play(ANIMATIONS.SKELETON.DIE, false);
        this.on('animationcomplete', () => {
            if (this.anims.currentAnim && this.anims.currentAnim.key === ANIMATIONS.SKELETON.DIE) {
                super.playDeathAnimation();
            }
        });
    }
}

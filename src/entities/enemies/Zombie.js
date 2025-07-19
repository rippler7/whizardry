import { Enemy } from './Enemy.js';
import { ANIMATIONS, CONSTANTS } from '../../config/Constants.js';

export class Zombie extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'zombie', 0);
        this.setupZombie();
    }

    setupZombie() {
        this.health = 80;
        this.maxHealth = 80;
        this.damage = CONSTANTS.ZOMBIE_DAMAGE;
        this.speed = 40;
        this.attackRange = 40;
        this.detectionRange = 120;
        this.attackCooldown = 1200;
        this.isInfectious = true;
        
        this.body.setSize(28, 28, 2, 2);
    }

    update() {
        super.update();
        this.updateInfection();
    }

    updateInfection() {
        // Zombie-specific behavior - could infect other enemies or create new zombies
        if (this.isDead) return;
        
        // Simple infection mechanic - slower but persistent
        if (this.target && this.body.velocity.length() > 0) {
            // Zombies are relentless - they don't give up easily
            this.detectionRange = Math.max(this.detectionRange, 200);
        }
    }

    playMovementAnimation() {
        if (this.isDead) return;
        
        switch (this.lastDirection) {
            case 'up':
                this.anims.play(ANIMATIONS.ZOMBIE.WALK_UP, true);
                break;
            case 'down':
                this.anims.play(ANIMATIONS.ZOMBIE.WALK_DOWN, true);
                break;
            case 'left':
                this.anims.play(ANIMATIONS.ZOMBIE.WALK_LEFT, true);
                break;
            case 'right':
                this.anims.play(ANIMATIONS.ZOMBIE.WALK_RIGHT, true);
                break;
        }
    }

    attack() {
        super.attack();
        
        // Zombies have a chance to grab and hold the player
        if (this.target && Math.random() < 0.3) {
            this.grabPlayer();
        }
    }

    grabPlayer() {
        // Slow down the player temporarily
        if (this.target && this.target.setVelocity) {
            const originalSpeed = this.target.speed;
            this.target.speed *= 0.5;
            
            // Restore speed after a delay
            this.scene.time.delayedCall(1000, () => {
                if (this.target && !this.target.isDead) {
                    this.target.speed = originalSpeed;
                }
            });
        }
    }

    takeDamage(amount) {
        const died = super.takeDamage(amount);
        
        if (died && this.isInfectious) {
            // Chance to spawn another zombie when this one dies
            if (Math.random() < 0.2) {
                this.spawnInfectedZombie();
            }
        }
        
        return died;
    }

    spawnInfectedZombie() {
        // Spawn a new zombie nearby
        const spawnX = this.x + Phaser.Math.Between(-50, 50);
        const spawnY = this.y + Phaser.Math.Between(-50, 50);
        
        const newZombie = new Zombie(this.scene, spawnX, spawnY);
        newZombie.health = 40; // Weaker infected zombie
        newZombie.setTint(0x00ff00); // Green tint to show it's infected
        
        if (this.scene.zombies) {
            this.scene.zombies.add(newZombie);
        }
    }

    playDeathAnimation() {
        this.anims.play(ANIMATIONS.ZOMBIE.DIE, false);
        this.on('animationcomplete', () => {
            if (this.anims.currentAnim && this.anims.currentAnim.key === ANIMATIONS.ZOMBIE.DIE) {
                super.playDeathAnimation();
            }
        });
    }

    die() {
        super.die();
        
        // Zombies might drop health items
        if (Math.random() < 0.15) {
            this.dropHealthItem();
        }
    }

    dropHealthItem() {
        // Create a simple health pickup
        const healthItem = this.scene.add.circle(this.x, this.y, 8, 0x00ff00);
        this.scene.physics.add.existing(healthItem);
        
        // Make it collectible by the player
        this.scene.physics.add.overlap(healthItem, this.scene.player, () => {
            this.scene.player.heal(20);
            this.scene.audioManager.playSound('star');
            healthItem.destroy();
        });
        
        // Remove after 10 seconds
        this.scene.time.delayedCall(10000, () => {
            if (healthItem && healthItem.active) {
                healthItem.destroy();
            }
        });
    }
}

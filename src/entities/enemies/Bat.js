import { Enemy } from './Enemy.js';
import { ANIMATIONS, CONSTANTS } from '../../config/Constants.js';

export class Bat extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'bat', 0);
        this.setupBat();
    }

    setupBat() {
        this.health = 60;
        this.maxHealth = 60;
        this.damage = CONSTANTS.BAT_DAMAGE;
        this.speed = 80;
        this.attackRange = 30;
        this.detectionRange = 180;
        this.attackCooldown = 800;
        this.canFly = true;
        this.flyHeight = 0;
        this.maxFlyHeight = 20;
        this.diveBombCooldown = 3000;
        this.lastDiveBombTime = 0;
        
        this.body.setSize(48, 32, 8, 16);
    }

    update() {
        super.update();
        this.updateFlying();
        this.updateDiveBomb();
    }

    updateFlying() {
        if (this.isDead) return;
        
        // Simulate flying with vertical oscillation
        this.flyHeight = Math.sin(this.scene.time.now * 0.003) * this.maxFlyHeight;
        this.setY(this.y + this.flyHeight * 0.1);
    }

    updateDiveBomb() {
        if (this.isDead || !this.target) return;
        
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        const currentTime = this.scene.time.now;
        
        if (distanceToPlayer <= this.detectionRange && 
            distanceToPlayer > this.attackRange &&
            currentTime - this.lastDiveBombTime >= this.diveBombCooldown) {
            this.diveBomb();
        }
    }

    diveBomb() {
        this.lastDiveBombTime = this.scene.time.now;
        
        // Increase speed temporarily and dive towards player
        const originalSpeed = this.speed;
        this.speed = originalSpeed * 2;
        
        // Calculate dive direction
        const direction = new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();
        
        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
        
        // Set tint to indicate dive bomb
        this.setTint(0xff4444);
        
        // Restore normal speed and tint after dive
        this.scene.time.delayedCall(1000, () => {
            this.speed = originalSpeed;
            this.clearTint();
        });
    }

    moveTowardsTarget() {
        if (!this.target) return;

        // Bats move in a more erratic pattern
        const baseDirection = new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();
        
        // Add some randomness to movement
        const randomOffset = new Phaser.Math.Vector2(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        const finalDirection = baseDirection.add(randomOffset).normalize();
        
        this.setVelocity(finalDirection.x * this.speed, finalDirection.y * this.speed);
        this.updateDirection(finalDirection);
    }

    patrol() {
        // Bats patrol in more complex patterns
        this.movementTimer -= this.scene.game.loop.delta;
        
        if (this.movementTimer <= 0) {
            // Circular or figure-8 pattern
            const time = this.scene.time.now * 0.001;
            const centerX = this.x;
            const centerY = this.y;
            const radius = 50;
            
            const targetX = centerX + Math.cos(time) * radius;
            const targetY = centerY + Math.sin(time * 0.5) * radius;
            
            const direction = new Phaser.Math.Vector2(
                targetX - this.x,
                targetY - this.y
            ).normalize();
            
            this.setVelocity(direction.x * this.speed * 0.3, direction.y * this.speed * 0.3);
            this.updateDirection(direction);
            
            this.movementTimer = Phaser.Math.Between(500, 1500);
        }
    }

    playMovementAnimation() {
        if (this.isDead) return;
        
        // Bats always use flying animation, but direction matters
        if (this.lastDirection === 'left') {
            this.anims.play(ANIMATIONS.BAT.FLY_LEFT, true);
        } else {
            this.anims.play(ANIMATIONS.BAT.FLY_RIGHT, true);
        }
    }

    attack() {
        super.attack();
        
        // Bats can drain some health and give it to themselves
        if (this.target && Math.random() < 0.4) {
            const drainAmount = 5;
            if (this.target.takeDamage) {
                this.target.takeDamage(drainAmount);
                this.heal(drainAmount);
            }
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    playDeathAnimation() {
        this.anims.play(ANIMATIONS.BAT.DIE, false);
        this.on('animationcomplete', () => {
            if (this.anims.currentAnim && this.anims.currentAnim.key === ANIMATIONS.BAT.DIE) {
                super.playDeathAnimation();
            }
        });
    }

    takeDamage(amount) {
        const died = super.takeDamage(amount);
        
        if (!died && Math.random() < 0.3) {
            // Bats can sometimes dodge attacks by flying erratically
            this.dodge();
        }
        
        return died;
    }

    dodge() {
        const dodgeDirection = new Phaser.Math.Vector2(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        
        this.setVelocity(dodgeDirection.x * this.speed * 1.5, dodgeDirection.y * this.speed * 1.5);
        
        // Brief invulnerability during dodge
        const originalTakeDamage = this.takeDamage;
        this.takeDamage = () => false;
        
        this.scene.time.delayedCall(300, () => {
            this.takeDamage = originalTakeDamage;
        });
    }
}

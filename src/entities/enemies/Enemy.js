export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame = 0) {
        super(scene, x, y, texture, frame);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.scene = scene;
        this.setupEnemy();
    }

    setupEnemy() {
        this.setDepth(this.y);
        this.body.setCollideWorldBounds(false);
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 10;
        this.speed = 50;
        this.attackRange = 50;
        this.detectionRange = 150;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second
        this.isDead = false;
        this.target = null;
        this.pathFindingTimer = 0;
        this.lastDirection = 'down';
        this.movementTimer = 0;
        this.currentPath = null;
        this.pathIndex = 0;
    }

    update() {
        if (this.isDead) return;
        
        this.updateDepth();
        this.updateAI();
        this.updateMovement();
    }

    updateDepth() {
        this.setDepth(this.y);
    }

    updateAI() {
        if (!this.scene.player) return;
        
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.scene.player.x, this.scene.player.y
        );

        if (distanceToPlayer <= this.detectionRange) {
            this.target = this.scene.player;
            
            if (distanceToPlayer <= this.attackRange) {
                this.tryAttack();
            } else {
                this.moveTowardsTarget();
            }
        } else {
            this.target = null;
            this.patrol();
        }
    }

    updateMovement() {
        // Update animation based on movement
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.playMovementAnimation();
        } else {
            this.anims.stop();
        }
    }

    moveTowardsTarget() {
        if (!this.target) return;

        const direction = new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();

        this.setVelocity(direction.x * this.speed, direction.y * this.speed);
        this.updateDirection(direction);
    }

    patrol() {
        this.movementTimer -= this.scene.game.loop.delta;
        
        if (this.movementTimer <= 0) {
            // Change direction randomly
            const angle = Math.random() * Math.PI * 2;
            const direction = new Phaser.Math.Vector2(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            this.setVelocity(direction.x * this.speed * 0.5, direction.y * this.speed * 0.5);
            this.updateDirection(direction);
            
            this.movementTimer = Phaser.Math.Between(1000, 3000);
        }
    }

    updateDirection(direction) {
        if (Math.abs(direction.x) > Math.abs(direction.y)) {
            this.lastDirection = direction.x > 0 ? 'right' : 'left';
        } else {
            this.lastDirection = direction.y > 0 ? 'down' : 'up';
        }
    }

    playMovementAnimation() {
        // Override in child classes
    }

    tryAttack() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastAttackTime >= this.attackCooldown) {
            this.attack();
            this.lastAttackTime = currentTime;
        }
        this.setVelocity(0, 0);
    }

    attack() {
        if (!this.target || this.isDead) return;
        
        // Simple attack - damage player if in range
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );
        
        if (distance <= this.attackRange && this.target.takeDamage) {
            this.target.takeDamage(this.damage);
        }
    }

    takeDamage(amount) {
        if (this.isDead) return false;

        this.health -= amount;
        
        // Flash effect
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (!this.isDead) {
                this.clearTint();
            }
        });
        
        // Play hurt sound
        this.scene.audioManager.playSound('enemyHit');
        
        if (this.health <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }

    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.setVelocity(0, 0);
        
        // Update game state
        this.scene.gameState.updateScore(100);
        
        // Death animation or immediate removal
        this.playDeathAnimation();
    }

    playDeathAnimation() {
        // Fade out and destroy
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    destroy() {
        if (this.scene.enemies && this.scene.enemies.contains(this)) {
            this.scene.enemies.remove(this);
        }
        super.destroy();
    }
}

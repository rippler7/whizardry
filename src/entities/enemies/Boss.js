import { Enemy } from './Enemy.js';
import { ANIMATIONS, CONSTANTS } from '../../config/Constants.js';

export class Boss extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'Boss', 0);
        this.setupBoss();
    }

    setupBoss() {
        this.health = 500;
        this.maxHealth = 500;
        this.damage = CONSTANTS.BOSS_DAMAGE;
        this.speed = 30;
        this.attackRange = 60;
        this.detectionRange = 300;
        this.attackCooldown = 2000;
        this.specialAttackCooldown = 5000;
        this.lastSpecialAttackTime = 0;
        this.phase = 1; // Boss has multiple phases
        this.enraged = false;
        this.minions = [];
        this.shieldActive = false;
        this.shieldCooldown = 10000;
        this.lastShieldTime = 0;
        
        this.body.setSize(50, 50, 7, 7);
        this.setScale(1.5);
        this.setTint(0xff0000); // Red tint for boss
        
        // Boss-specific properties
        this.attackPatterns = ['melee', 'ranged', 'area', 'summon'];
        this.currentAttackPattern = 0;
        this.patternTimer = 0;
    }

    update() {
        super.update();
        this.updatePhase();
        this.updateSpecialAttacks();
        this.updateShield();
    }

    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent <= 0.5 && this.phase === 1) {
            this.enterPhase2();
        } else if (healthPercent <= 0.25 && this.phase === 2) {
            this.enterPhase3();
        }
    }

    enterPhase2() {
        this.phase = 2;
        this.speed = 45;
        this.attackCooldown = 1500;
        this.specialAttackCooldown = 4000;
        this.setTint(0xff4400); // Orange tint
        
        // Screen shake and sound effect
        this.scene.cameras.main.shake(500, 0.02);
        this.scene.audioManager.playSound('bossTheme');
        
        this.scene.add.text(this.scene.cameras.main.centerX, 100, 'BOSS PHASE 2!', {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(3000);
    }

    enterPhase3() {
        this.phase = 3;
        this.enraged = true;
        this.speed = 60;
        this.attackCooldown = 1000;
        this.specialAttackCooldown = 3000;
        this.setTint(0x8800ff); // Purple tint
        
        // Screen shake and sound effect
        this.scene.cameras.main.shake(800, 0.03);
        
        this.scene.add.text(this.scene.cameras.main.centerX, 100, 'BOSS ENRAGED!', {
            fontSize: '32px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(3000);
    }

    updateSpecialAttacks() {
        if (this.isDead || !this.target) return;
        
        const currentTime = this.scene.time.now;
        
        if (currentTime - this.lastSpecialAttackTime >= this.specialAttackCooldown) {
            this.executeSpecialAttack();
        }
    }

    executeSpecialAttack() {
        this.lastSpecialAttackTime = this.scene.time.now;
        
        const attackType = this.attackPatterns[this.currentAttackPattern];
        this.currentAttackPattern = (this.currentAttackPattern + 1) % this.attackPatterns.length;
        
        switch (attackType) {
            case 'melee':
                this.meleeSpecialAttack();
                break;
            case 'ranged':
                this.rangedSpecialAttack();
                break;
            case 'area':
                this.areaSpecialAttack();
                break;
            case 'summon':
                this.summonSpecialAttack();
                break;
        }
    }

    meleeSpecialAttack() {
        // Charge attack
        if (!this.target) return;
        
        const direction = new Phaser.Math.Vector2(
            this.target.x - this.x,
            this.target.y - this.y
        ).normalize();
        
        // Telegraph the attack
        this.setTint(0xffff00);
        
        this.scene.time.delayedCall(500, () => {
            // Execute charge
            this.setVelocity(direction.x * this.speed * 3, direction.y * this.speed * 3);
            this.setTint(0xff0000);
            
            // Stop charge after time
            this.scene.time.delayedCall(800, () => {
                this.setVelocity(0, 0);
                this.clearTint();
                if (this.phase === 1) this.setTint(0xff0000);
                else if (this.phase === 2) this.setTint(0xff4400);
                else this.setTint(0x8800ff);
            });
        });
    }

    rangedSpecialAttack() {
        // Fire multiple projectiles in different directions
        const projectileCount = this.phase + 2;
        const angleStep = (Math.PI * 2) / projectileCount;
        
        for (let i = 0; i < projectileCount; i++) {
            const angle = i * angleStep;
            const direction = new Phaser.Math.Vector2(
                Math.cos(angle),
                Math.sin(angle)
            );
            
            this.createProjectile(direction);
        }
        
        this.scene.audioManager.playSound('spitting');
    }

    createProjectile(direction) {
        const projectile = this.scene.physics.add.sprite(this.x, this.y, 'fireball');
        projectile.setScale(0.8);
        projectile.setTint(0xff00ff); // Purple tint for boss projectiles
        
        projectile.setVelocity(direction.x * 150, direction.y * 150);
        
        // Set up collision with player
        this.scene.physics.add.overlap(projectile, this.target, (proj, player) => {
            if (player.takeDamage) {
                player.takeDamage(this.damage * 0.7);
            }
            proj.destroy();
        });
        
        // Destroy after timeout
        this.scene.time.delayedCall(4000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    areaSpecialAttack() {
        // Area damage attack
        if (!this.target) return;
        
        // Create warning indicator
        const warningArea = this.scene.add.circle(this.target.x, this.target.y, 80, 0xff0000, 0.3);
        warningArea.setDepth(1000);
        
        this.scene.time.delayedCall(1000, () => {
            // Check if player is still in area
            const distance = Phaser.Math.Distance.Between(
                this.target.x, this.target.y,
                warningArea.x, warningArea.y
            );
            
            if (distance <= 80) {
                this.target.takeDamage(this.damage * 1.5);
                
                // Visual explosion effect
                const explosion = this.scene.add.circle(warningArea.x, warningArea.y, 100, 0xff4400, 0.8);
                explosion.setDepth(1500);
                
                this.scene.tweens.add({
                    targets: explosion,
                    scaleX: 2,
                    scaleY: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => explosion.destroy()
                });
            }
            
            warningArea.destroy();
            this.scene.audioManager.playSound('burst');
        });
    }

    summonSpecialAttack() {
        // Summon minions
        const minionCount = Math.min(3, this.phase);
        
        for (let i = 0; i < minionCount; i++) {
            const angle = (i * Math.PI * 2) / minionCount;
            const distance = 100;
            const minionX = this.x + Math.cos(angle) * distance;
            const minionY = this.y + Math.sin(angle) * distance;
            
            // Create a simple minion (could be a smaller version of other enemies)
            const minion = this.scene.physics.add.sprite(minionX, minionY, 'skeleton');
            minion.setScale(0.5);
            minion.setTint(0x444444);
            minion.health = 30;
            minion.damage = 8;
            minion.speed = 70;
            
            // Simple AI for minion
            minion.update = () => {
                if (!this.target) return;
                
                const direction = new Phaser.Math.Vector2(
                    this.target.x - minion.x,
                    this.target.y - minion.y
                ).normalize();
                
                minion.setVelocity(direction.x * minion.speed, direction.y * minion.speed);
            };
            
            // Set up collision with player
            this.scene.physics.add.overlap(minion, this.target, (min, player) => {
                if (player.takeDamage) {
                    player.takeDamage(minion.damage);
                    min.destroy();
                }
            });
            
            // Auto-destroy after time
            this.scene.time.delayedCall(5000, () => {
                if (minion && minion.active) {
                    minion.destroy();
                }
            });
            
            this.minions.push(minion);
        }
    }

    updateShield() {
        const currentTime = this.scene.time.now;
        
        if (!this.shieldActive && 
            currentTime - this.lastShieldTime >= this.shieldCooldown &&
            this.health < this.maxHealth * 0.3) {
            this.activateShield();
        }
    }

    activateShield() {
        this.shieldActive = true;
        this.lastShieldTime = this.scene.time.now;
        
        // Visual shield effect
        const shield = this.scene.add.circle(this.x, this.y, 60, 0x00ffff, 0.3);
        shield.setDepth(this.depth + 1);
        
        // Shield absorbs damage for a duration
        const originalTakeDamage = this.takeDamage;
        this.takeDamage = (amount) => {
            return false; // Absorb all damage
        };
        
        this.scene.time.delayedCall(3000, () => {
            this.shieldActive = false;
            this.takeDamage = originalTakeDamage;
            shield.destroy();
        });
    }

    playMovementAnimation() {
        if (this.isDead) return;
        
        switch (this.lastDirection) {
            case 'up':
                this.anims.play(ANIMATIONS.BOSS.WALK_UP, true);
                break;
            case 'down':
                this.anims.play(ANIMATIONS.BOSS.WALK_DOWN, true);
                break;
            case 'left':
                this.anims.play(ANIMATIONS.BOSS.WALK_LEFT, true);
                break;
            case 'right':
                this.anims.play(ANIMATIONS.BOSS.WALK_RIGHT, true);
                break;
        }
    }

    attack() {
        if (!this.target || this.isDead) return;
        
        // Play attack animation based on direction
        switch (this.lastDirection) {
            case 'up':
                this.anims.play(ANIMATIONS.BOSS.ATTACK_UP, false);
                break;
            case 'down':
                this.anims.play(ANIMATIONS.BOSS.ATTACK_DOWN, false);
                break;
            case 'left':
                this.anims.play(ANIMATIONS.BOSS.ATTACK_LEFT, false);
                break;
            case 'right':
                this.anims.play(ANIMATIONS.BOSS.ATTACK_RIGHT, false);
                break;
        }
        
        super.attack();
    }

    takeDamage(amount) {
        if (this.shieldActive) return false;
        
        const died = super.takeDamage(amount);
        
        if (died) {
            // Boss death sequence
            this.scene.audioManager.playSound('enemyHit');
            this.scene.gameState.updateScore(1000);
            this.scene.events.emit('bossDefeated');
        }
        
        return died;
    }

    playDeathAnimation() {
        this.anims.play(ANIMATIONS.BOSS.DIE, false);
        
        // Epic death sequence
        this.scene.cameras.main.shake(1000, 0.05);
        
        // Clean up minions
        this.minions.forEach(minion => {
            if (minion && minion.active) {
                minion.destroy();
            }
        });
        
        this.on('animationcomplete', () => {
            if (this.anims.currentAnim && this.anims.currentAnim.key === ANIMATIONS.BOSS.DIE) {
                super.playDeathAnimation();
            }
        });
    }

    destroy() {
        // Clean up minions when boss is destroyed
        this.minions.forEach(minion => {
            if (minion && minion.active) {
                minion.destroy();
            }
        });
        super.destroy();
    }
}

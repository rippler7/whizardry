import { CONSTANTS } from '../config/Constants.js';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        
        this.scene = scene;
        this.speed = CONSTANTS.BULLET_SPEED;
        this.damage = CONSTANTS.PLAYER_DAMAGE;
        this.lifespan = 2000; // 2 seconds
        this.born = 0;
        this.direction = new Phaser.Math.Vector2(0, 0);
        
        this.setScale(0.5);
        this.setDepth(1000);
    }

    fire(x, y, direction) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        
        this.born = this.scene.time.now;
        
        // Set direction vector
        switch (direction) {
            case 'up':
                this.direction.set(0, -1);
                this.setRotation(-Math.PI / 2);
                break;
            case 'down':
                this.direction.set(0, 1);
                this.setRotation(Math.PI / 2);
                break;
            case 'left':
                this.direction.set(-1, 0);
                this.setRotation(Math.PI);
                break;
            case 'right':
                this.direction.set(1, 0);
                this.setRotation(0);
                break;
            default:
                this.direction.set(1, 0);
                this.setRotation(0);
                break;
        }
        
        // Apply velocity
        this.setVelocity(
            this.direction.x * this.speed,
            this.direction.y * this.speed
        );
        
        // Add trail effect
        this.createTrail();
    }

    createTrail() {
        // Simple trail effect using particles
        const trail = this.scene.add.particles(this.x, this.y, 'bullet', {
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 200,
            follow: this,
            quantity: 1,
            frequency: 50
        });
        
        // Clean up trail when bullet is destroyed
        this.on('destroy', () => {
            trail.destroy();
        });
    }

    update() {
        // Check if bullet has exceeded its lifespan
        if (this.scene.time.now - this.born > this.lifespan) {
            this.kill();
        }
        
        // Check if bullet is out of camera bounds (with some margin)
        const camera = this.scene.cameras.main;
        if (this.x < camera.scrollX - 100 || 
            this.x > camera.scrollX + camera.width + 100 ||
            this.y < camera.scrollY - 100 || 
            this.y > camera.scrollY + camera.height + 100) {
            this.kill();
        }
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
        this.setVelocity(0, 0);
        this.body.reset(0, 0);
    }

    hitEnemy(enemy) {
        if (enemy && enemy.takeDamage) {
            const killed = enemy.takeDamage(this.damage);
            if (killed) {
                this.scene.gameState.updateScore(50);
            }
        }
        
        // Create hit effect
        this.createHitEffect();
        this.kill();
    }

    createHitEffect() {
        // Create a small explosion effect
        const hitEffect = this.scene.add.circle(this.x, this.y, 10, 0xffff00, 0.8);
        hitEffect.setDepth(1500);
        
        this.scene.tweens.add({
            targets: hitEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => hitEffect.destroy()
        });
        
        // Screen shake for impact
        this.scene.cameras.main.shake(100, 0.005);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.update();
    }
}

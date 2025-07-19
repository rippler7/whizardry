import { CONSTANTS, ANIMATIONS } from '../config/Constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player', 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.scene = scene;
        this.setupPlayer();
        this.setupControls();
        this.setupProperties();
    }

    setupPlayer() {
        this.setDepth(this.y);
        this.body.setSize(32, 58, 8, 0);
        this.body.setCollideWorldBounds(false);
        this.body.setDrag(300, 300);
        this.setScale(1);
    }

    setupControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        this.spacebar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    setupProperties() {
        this.currLevel = 1;
        this.keyCode = 'A';
        this.hasKey = false;
        this.ansKey = '';
        this.typeChar = 'player';
        this.currLoc = 1;
        this.picking = false;
        this.gatePassed = 1;
        this.clearUpgrade = false;
        this.choiceIndex = 10;
        this.speed = CONSTANTS.PLAYER_SPEED;
        this.health = CONSTANTS.PLAYER_LIFE;
        this.maxHealth = CONSTANTS.PLAYER_LIFE;
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.lastDirection = 'down';
    }

    update() {
        this.handleMovement();
        this.updateDepth();
        this.updateInvulnerability();
    }

    handleMovement() {
        let velocityX = 0;
        let velocityY = 0;
        let moving = false;

        // Handle input
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -this.speed;
            moving = true;
            this.lastDirection = 'left';
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = this.speed;
            moving = true;
            this.lastDirection = 'right';
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -this.speed;
            moving = true;
            this.lastDirection = 'up';
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = this.speed;
            moving = true;
            this.lastDirection = 'down';
        }

        // Apply movement
        this.setVelocity(velocityX, velocityY);

        // Play appropriate animation
        this.playMovementAnimation(moving);
    }

    playMovementAnimation(moving) {
        if (!moving) {
            this.anims.stop();
            return;
        }

        switch (this.lastDirection) {
            case 'up':
                this.anims.play(ANIMATIONS.PLAYER.WALK_UP, true);
                break;
            case 'down':
                this.anims.play(ANIMATIONS.PLAYER.WALK_DOWN, true);
                break;
            case 'left':
                this.anims.play(ANIMATIONS.PLAYER.WALK_LEFT, true);
                break;
            case 'right':
                this.anims.play(ANIMATIONS.PLAYER.WALK_RIGHT, true);
                break;
        }
    }

    updateDepth() {
        this.setDepth(this.y);
    }

    updateInvulnerability() {
        if (this.invulnerable) {
            this.invulnerabilityTimer -= this.scene.game.loop.delta;
            
            // Flash effect
            this.alpha = Math.sin(this.scene.time.now * 0.01) * 0.5 + 0.5;
            
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
                this.alpha = 1;
            }
        }
    }

    takeDamage(amount) {
        if (this.invulnerable) return false;

        this.health -= amount;
        this.scene.gameState.takeDamage(amount);
        
        // Make invulnerable for a short time
        this.invulnerable = true;
        this.invulnerabilityTimer = 1000; // 1 second
        
        // Play hurt sound
        this.scene.audioManager.playSound('playerHurt');
        
        // Screen shake effect
        this.scene.cameras.main.shake(200, 0.01);
        
        if (this.health <= 0) {
            this.die();
        }
        
        return true;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.scene.gameState.heal(amount);
    }

    die() {
        this.scene.events.emit('playerDied');
        this.setActive(false);
        this.setVisible(false);
    }

    shoot() {
        if (this.scene.bullets) {
            const bullet = this.scene.bullets.get();
            if (bullet) {
                bullet.fire(this.x, this.y, this.lastDirection);
                this.scene.audioManager.playSound('fire');
            }
        }
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        this.setDepth(this.y);
        return this;
    }

    respawn(x = 100, y = 100) {
        this.setPosition(x, y);
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.alpha = 1;
        this.setActive(true);
        this.setVisible(true);
    }

    destroy() {
        if (this.cursors) {
            // Clean up input handlers
            this.scene.input.keyboard.removeKey(this.cursors.up);
            this.scene.input.keyboard.removeKey(this.cursors.down);
            this.scene.input.keyboard.removeKey(this.cursors.left);
            this.scene.input.keyboard.removeKey(this.cursors.right);
        }
        super.destroy();
    }
}

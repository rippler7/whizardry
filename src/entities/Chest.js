import { ANIMATIONS, CONSTANTS } from '../config/Constants.js';

export class Chest extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, chestType = 'red') {
        const textureKey = `chest${chestType.charAt(0).toUpperCase() + chestType.slice(1)}`;
        super(scene, x, y, textureKey, 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.scene = scene;
        this.chestType = chestType;
        this.setupChest();
    }

    setupChest() {
        this.setDepth(this.y);
        this.body.setImmovable(true);
        this.body.setSize(32, 64);
        
        this.locked = true;
        this.unlocking = false;
        this.opened = false;
        this.questionData = null;
        this.correctAnswerIndex = 0;
        this.interactionCooldown = 0;
        this.choiceButtons = [];
        this.questionDisplay = null;
        
        // Visual indicator for locked state
        this.createLockIndicator();
    }

    createLockIndicator() {
        // Create a simple lock icon above the chest
        this.lockIcon = this.scene.add.text(
            this.x, this.y - 40,
            '🔒',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px' }
        );
        this.lockIcon.setOrigin(0.5);
        this.lockIcon.setDepth(this.depth + 1);
    }

    setQuestionData(questionData) {
        this.questionData = questionData;
        if (this.questionData && this.questionData.choices) {
            const correctAnswer = this.questionData.answer || this.questionData.correctAnswer;
            this.correctAnswerIndex = this.questionData.choices.indexOf(correctAnswer);
        }
    }

    interact(player) {
        if (this.interactionCooldown > 0 || this.opened) return;
        
        this.interactionCooldown = 2000; // 2 second cooldown
        
        if (this.locked && !this.unlocking) {
            this.tryUnlock();
        }
    }

    tryUnlock() {
        if (!this.questionData) {
            console.warn('No question data for chest:', this.chestType);
            this.forceUnlock(); // Fallback
            return;
        }
        
        this.unlocking = true;
        this.showQuestion();
    }

    showQuestion() {
        this.scene.audioManager.playSound('doorLock');
        
        // Pause the game
        this.scene.physics.pause();
        
        // Create question UI
        this.createQuestionUI();
    }

    createQuestionUI() {
        const camera = this.scene.cameras.main;
        const centerX = camera.centerX;
        const centerY = camera.centerY;
        
        // Get chest color for styling
        const chestColors = {
            red: '#8b0000',
            blue: '#000080',
            green: '#006400',
            yellow: '#b8860b'
        };
        const backgroundColor = chestColors[this.chestType] || '#333333';
        
        // Background
        const background = this.scene.add.rectangle(
            centerX, centerY, 650, 450, 0x000000, 0.9
        );
        background.setDepth(5000);
        background.setScrollFactor(0);
        
        // Title
        const titleText = this.scene.add.text(
            centerX, centerY - 180,
            `Unlock the ${this.chestType.toUpperCase()} Chest`,
            { ...CONSTANTS.FONT_STYLES.SUBTITLE, fontSize: '24px' }
        );
        titleText.setOrigin(0.5);
        titleText.setDepth(5001);
        titleText.setScrollFactor(0);
        
        // Question text
        const questionLines = this.questionData.question.split('<br />');
        const questionText = this.scene.add.text(
            centerX, centerY - 100,
            questionLines.join('\n'),
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', wordWrap: { width: 580 } }
        );
        questionText.setOrigin(0.5);
        questionText.setDepth(5001);
        questionText.setScrollFactor(0);
        
        // Choice buttons
        const choices = this.questionData.choices || [];
        const buttonSpacing = 70;
        const startY = centerY + 20;
        
        for (let i = 0; i < Math.min(4, choices.length); i++) {
            const buttonY = startY + (i * buttonSpacing);
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            
            // Button background
            const button = this.scene.add.rectangle(
                centerX, buttonY, 550, 50, parseInt(backgroundColor.replace('#', '0x'))
            );
            button.setDepth(5001);
            button.setScrollFactor(0);
            button.setInteractive();
            
            // Button border
            const border = this.scene.add.rectangle(
                centerX, buttonY, 550, 50
            );
            border.setStrokeStyle(2, 0xffffff);
            border.setDepth(5001);
            border.setScrollFactor(0);
            
            // Button text
            const buttonText = this.scene.add.text(
                centerX, buttonY,
                `${letter}. ${choices[i]}`,
                { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '14px', wordWrap: { width: 520 } }
            );
            buttonText.setOrigin(0.5);
            buttonText.setDepth(5002);
            buttonText.setScrollFactor(0);
            
            // Store UI elements for cleanup
            this.choiceButtons.push(button, border, buttonText);
            
            // Button interaction
            button.on('pointerdown', () => {
                this.selectChoice(i, choices[i]);
            });
            
            button.on('pointerover', () => {
                button.setFillStyle(0xffffff, 0.2);
                border.setStrokeStyle(3, 0xffff00);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(parseInt(backgroundColor.replace('#', '0x')));
                border.setStrokeStyle(2, 0xffffff);
            });
        }
        
        // Store UI elements for cleanup
        this.questionDisplay = [background, titleText, questionText, ...this.choiceButtons];
        
        // Add keyboard support
        this.setupKeyboardChoices(choices);
    }

    setupKeyboardChoices(choices) {
        const keys = [
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B),
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
            this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        ];
        
        keys.forEach((key, index) => {
            if (index < choices.length) {
                key.on('down', () => this.selectChoice(index, choices[index]));
            }
        });
        
        // Clean up keyboard handlers after use
        this.keyboardCleanup = () => {
            keys.forEach(key => key.off('down'));
        };
    }

    selectChoice(choiceIndex, selectedChoice) {
        const isCorrect = choiceIndex === this.correctAnswerIndex;
        
        // Clean up UI
        this.cleanupQuestionUI();
        
        if (isCorrect) {
            this.unlock();
        } else {
            this.showIncorrectAnswer(selectedChoice);
        }
        
        // Resume game
        this.scene.physics.resume();
        this.unlocking = false;
    }

    showIncorrectAnswer(selectedChoice) {
        const camera = this.scene.cameras.main;
        const centerX = camera.centerX;
        const centerY = camera.centerY;
        
        const correctAnswer = this.questionData.choices[this.correctAnswerIndex];
        
        const feedbackText = this.scene.add.text(
            centerX, centerY,
            `Incorrect Answer!\nYou chose: ${selectedChoice}\nCorrect answer: ${correctAnswer}`,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', fill: '#ff4444', backgroundColor: '#000000', padding: { x: 20, y: 15 } }
        );
        feedbackText.setOrigin(0.5);
        feedbackText.setDepth(5000);
        feedbackText.setScrollFactor(0);
        
        // Remove feedback after delay
        this.scene.time.delayedCall(3000, () => {
            if (feedbackText && feedbackText.active) {
                feedbackText.destroy();
            }
        });
        
        this.scene.audioManager.playSound('playerHurt');
        
        // Reset chest state for another attempt
        this.locked = true;
    }

    unlock() {
        this.locked = false;
        this.openChest();
        
        // Remove lock indicator
        if (this.lockIcon) {
            this.lockIcon.destroy();
            this.lockIcon = null;
        }
        
        // Update game state
        this.scene.gameState.updateScore(300);
        
        // Play success sound
        this.scene.audioManager.playSound('star');
        
        // Visual feedback
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const camera = this.scene.cameras.main;
        const centerX = camera.centerX;
        const centerY = camera.centerY;
        
        const successText = this.scene.add.text(
            centerX, centerY,
            `Correct! ${this.chestType.toUpperCase()} Chest Unlocked!\n+300 Points`,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '20px', fill: '#44ff44', backgroundColor: '#000000', padding: { x: 20, y: 15 } }
        );
        successText.setOrigin(0.5);
        successText.setDepth(5000);
        successText.setScrollFactor(0);
        
        // Animate success message
        this.scene.tweens.add({
            targets: successText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                this.scene.time.delayedCall(1500, () => {
                    if (successText && successText.active) {
                        successText.destroy();
                    }
                });
            }
        });
    }

    openChest() {
        if (this.opened) return;
        
        this.opened = true;
        
        // Play opening animation
        const animationKey = ANIMATIONS.CHEST[`OPEN_${this.chestType.toUpperCase()}`];
        if (animationKey) {
            this.anims.play(animationKey, false);
        }
        
        // Create treasure effect
        this.createTreasureEffect();
        
        // Spawn reward
        this.spawnReward();
    }

    createTreasureEffect() {
        // Sparkle effect
        const sparkles = this.scene.add.particles(this.x, this.y - 20, 'bullet', {
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: this.getTreasureColor(),
            lifespan: 1000,
            quantity: 3,
            frequency: 100,
            speed: { min: 20, max: 60 },
            gravityY: -50
        });
        
        // Remove sparkles after animation
        this.scene.time.delayedCall(2000, () => {
            sparkles.destroy();
        });
        
        // Light flash effect
        const flash = this.scene.add.circle(this.x, this.y, 50, 0xffffff, 0.5);
        flash.setDepth(this.depth + 2);
        
        this.scene.tweens.add({
            targets: flash,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
    }

    getTreasureColor() {
        const colors = {
            red: 0xff0000,
            blue: 0x0080ff,
            green: 0x00ff00,
            yellow: 0xffff00
        };
        return colors[this.chestType] || 0xffffff;
    }

    spawnReward() {
        // Create different rewards based on chest type
        switch (this.chestType) {
            case 'red':
                this.spawnHealthReward();
                break;
            case 'blue':
                this.spawnManaReward();
                break;
            case 'green':
                this.spawnSpeedReward();
                break;
            case 'yellow':
                this.spawnScoreReward();
                break;
            default:
                this.spawnHealthReward();
                break;
        }
    }

    spawnHealthReward() {
        const healthItem = this.scene.add.circle(this.x, this.y - 30, 12, 0xff0000);
        healthItem.setDepth(this.depth + 1);
        this.scene.physics.add.existing(healthItem);
        
        // Add collection overlap
        this.scene.physics.add.overlap(healthItem, this.scene.player, () => {
            this.scene.player.heal(50);
            this.scene.audioManager.playSound('star');
            healthItem.destroy();
            
            this.showRewardText('+50 Health');
        });
        
        // Animate the item
        this.scene.tweens.add({
            targets: healthItem,
            y: healthItem.y - 20,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
        
        // Remove after time
        this.scene.time.delayedCall(10000, () => {
            if (healthItem && healthItem.active) {
                healthItem.destroy();
            }
        });
    }

    spawnManaReward() {
        // Mana could increase bullet capacity or reduce cooldowns
        const manaItem = this.scene.add.circle(this.x, this.y - 30, 12, 0x0080ff);
        manaItem.setDepth(this.depth + 1);
        this.scene.physics.add.existing(manaItem);
        
        this.scene.physics.add.overlap(manaItem, this.scene.player, () => {
            // Increase bullet capacity temporarily
            if (this.scene.bullets) {
                this.scene.bullets.maxSize += 2;
            }
            this.scene.audioManager.playSound('star');
            manaItem.destroy();
            
            this.showRewardText('+2 Bullet Capacity');
        });
        
        this.animateRewardItem(manaItem);
    }

    spawnSpeedReward() {
        const speedItem = this.scene.add.circle(this.x, this.y - 30, 12, 0x00ff00);
        speedItem.setDepth(this.depth + 1);
        this.scene.physics.add.existing(speedItem);
        
        this.scene.physics.add.overlap(speedItem, this.scene.player, () => {
            // Temporary speed boost
            const originalSpeed = this.scene.player.speed;
            this.scene.player.speed *= 1.5;
            
            this.scene.time.delayedCall(15000, () => {
                if (this.scene.player && !this.scene.player.isDead) {
                    this.scene.player.speed = originalSpeed;
                }
            });
            
            this.scene.audioManager.playSound('star');
            speedItem.destroy();
            
            this.showRewardText('Speed Boost! (15s)');
        });
        
        this.animateRewardItem(speedItem);
    }

    spawnScoreReward() {
        const scoreItem = this.scene.add.circle(this.x, this.y - 30, 12, 0xffff00);
        scoreItem.setDepth(this.depth + 1);
        this.scene.physics.add.existing(scoreItem);
        
        this.scene.physics.add.overlap(scoreItem, this.scene.player, () => {
            this.scene.gameState.updateScore(500);
            this.scene.audioManager.playSound('star');
            scoreItem.destroy();
            
            this.showRewardText('+500 Points');
        });
        
        this.animateRewardItem(scoreItem);
    }

    animateRewardItem(item) {
        this.scene.tweens.add({
            targets: item,
            y: item.y - 20,
            duration: 1000,
            ease: 'Power2',
            yoyo: true,
            repeat: -1
        });
        
        // Remove after time
        this.scene.time.delayedCall(10000, () => {
            if (item && item.active) {
                item.destroy();
            }
        });
    }

    showRewardText(text) {
        const rewardText = this.scene.add.text(
            this.x, this.y - 60,
            text,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '14px', fill: '#ffff00', backgroundColor: '#000000', padding: { x: 10, y: 5 } }
        );
        rewardText.setOrigin(0.5);
        rewardText.setDepth(this.depth + 3);
        
        // Animate and remove
        this.scene.tweens.add({
            targets: rewardText,
            y: rewardText.y - 30,
            alpha: 0,
            duration: 2000,
            onComplete: () => rewardText.destroy()
        });
    }

    forceUnlock() {
        // Fallback unlock method
        this.locked = false;
        this.openChest();
        
        if (this.lockIcon) {
            this.lockIcon.destroy();
            this.lockIcon = null;
        }
    }

    cleanupQuestionUI() {
        if (this.questionDisplay) {
            this.questionDisplay.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.questionDisplay = null;
        }
        
        this.choiceButtons = [];
        
        if (this.keyboardCleanup) {
            this.keyboardCleanup();
            this.keyboardCleanup = null;
        }
    }

    update() {
        if (this.interactionCooldown > 0) {
            this.interactionCooldown -= this.scene.game.loop.delta;
        }
        
        this.setDepth(this.y);
        
        // Update lock indicator position
        if (this.lockIcon) {
            this.lockIcon.setPosition(this.x, this.y - 40);
            this.lockIcon.setDepth(this.depth + 1);
        }
    }

    destroy() {
        this.cleanupQuestionUI();
        if (this.lockIcon) {
            this.lockIcon.destroy();
        }
        super.destroy();
    }
}

import { CONSTANTS } from '../config/Constants.js';

export class HUD {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.visible = true;
        this.initialize();
    }

    initialize() {
        this.createHealthBar();
        this.createScoreDisplay();
        this.createTimeDisplay();
        this.createProgressDisplay();
        this.createControlsHint();
        
        // Listen to game state events
        this.setupEventListeners();
    }

    createHealthBar() {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 20;
        
        // Background
        this.elements.healthBg = this.scene.add.rectangle(
            x + width / 2, y + height / 2, 
            width, height, 0x330000
        );
        this.elements.healthBg.setOrigin(0.5);
        this.elements.healthBg.setScrollFactor(0);
        this.elements.healthBg.setDepth(CONSTANTS.UI_DEPTH);
        
        // Health bar
        this.elements.healthBar = this.scene.add.rectangle(
            x + width / 2, y + height / 2,
            width - 4, height - 4, 0x00ff00
        );
        this.elements.healthBar.setOrigin(0.5);
        this.elements.healthBar.setScrollFactor(0);
        this.elements.healthBar.setDepth(CONSTANTS.UI_DEPTH + 1);
        
        // Health text
        this.elements.healthText = this.scene.add.text(
            x + width / 2, y + height / 2,
            '100/100',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '12px' }
        );
        this.elements.healthText.setOrigin(0.5);
        this.elements.healthText.setScrollFactor(0);
        this.elements.healthText.setDepth(CONSTANTS.UI_DEPTH + 2);
        
        // Health label
        this.elements.healthLabel = this.scene.add.text(
            x, y - 5,
            'HEALTH',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '10px' }
        );
        this.elements.healthLabel.setOrigin(0, 1);
        this.elements.healthLabel.setScrollFactor(0);
        this.elements.healthLabel.setDepth(CONSTANTS.UI_DEPTH);
    }

    createScoreDisplay() {
        const x = this.scene.cameras.main.width - 20;
        const y = 20;
        
        this.elements.scoreLabel = this.scene.add.text(
            x, y,
            'SCORE',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '12px' }
        );
        this.elements.scoreLabel.setOrigin(1, 0);
        this.elements.scoreLabel.setScrollFactor(0);
        this.elements.scoreLabel.setDepth(CONSTANTS.UI_DEPTH);
        
        this.elements.scoreValue = this.scene.add.text(
            x, y + 20,
            '0',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '18px', fill: '#ffff00' }
        );
        this.elements.scoreValue.setOrigin(1, 0);
        this.elements.scoreValue.setScrollFactor(0);
        this.elements.scoreValue.setDepth(CONSTANTS.UI_DEPTH);
    }

    createTimeDisplay() {
        const x = this.scene.cameras.main.width - 20;
        const y = 80;
        
        this.elements.timeLabel = this.scene.add.text(
            x, y,
            'TIME',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '12px' }
        );
        this.elements.timeLabel.setOrigin(1, 0);
        this.elements.timeLabel.setScrollFactor(0);
        this.elements.timeLabel.setDepth(CONSTANTS.UI_DEPTH);
        
        this.elements.timeValue = this.scene.add.text(
            x, y + 20,
            '00:00:00',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', fill: '#00ffff' }
        );
        this.elements.timeValue.setOrigin(1, 0);
        this.elements.timeValue.setScrollFactor(0);
        this.elements.timeValue.setDepth(CONSTANTS.UI_DEPTH);
    }

    createProgressDisplay() {
        const x = 20;
        const y = 60;
        const width = 150;
        const height = 15;
        
        // Progress label
        this.elements.progressLabel = this.scene.add.text(
            x, y - 5,
            'PROGRESS',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '10px' }
        );
        this.elements.progressLabel.setOrigin(0, 1);
        this.elements.progressLabel.setScrollFactor(0);
        this.elements.progressLabel.setDepth(CONSTANTS.UI_DEPTH);
        
        // Progress background
        this.elements.progressBg = this.scene.add.rectangle(
            x + width / 2, y + height / 2,
            width, height, 0x333333
        );
        this.elements.progressBg.setOrigin(0.5);
        this.elements.progressBg.setScrollFactor(0);
        this.elements.progressBg.setDepth(CONSTANTS.UI_DEPTH);
        
        // Progress bar
        this.elements.progressBar = this.scene.add.rectangle(
            x + 2, y + height / 2,
            0, height - 4, 0x00aa00
        );
        this.elements.progressBar.setOrigin(0, 0.5);
        this.elements.progressBar.setScrollFactor(0);
        this.elements.progressBar.setDepth(CONSTANTS.UI_DEPTH + 1);
        
        // Progress percentage
        this.elements.progressText = this.scene.add.text(
            x + width + 10, y + height / 2,
            '0%',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '12px' }
        );
        this.elements.progressText.setOrigin(0, 0.5);
        this.elements.progressText.setScrollFactor(0);
        this.elements.progressText.setDepth(CONSTANTS.UI_DEPTH);
    }

    createControlsHint() {
        const y = this.scene.cameras.main.height - 80;
        
        const controlsText = [
            'WASD/ARROWS: Move',
            'SPACE: Shoot',
            'E: Interact with doors/chests'
        ];
        
        controlsText.forEach((text, index) => {
            const element = this.scene.add.text(
                20, y + (index * 16),
                text,
                { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '11px', fill: '#cccccc' }
            );
            element.setScrollFactor(0);
            element.setDepth(CONSTANTS.UI_DEPTH);
            element.setAlpha(0.7);
            
            this.elements[`control${index}`] = element;
        });
    }

    setupEventListeners() {
        // Health updates
        this.scene.events.on('healthUpdated', (health) => {
            this.updateHealth(health);
        });
        
        // Score updates
        this.scene.events.on('scoreUpdated', (score) => {
            this.updateScore(score);
        });
        
        // Time updates
        this.scene.events.on('timeUpdated', (timeData) => {
            this.updateTime(timeData);
        });
        
        // Progress updates
        this.scene.events.on('progressUpdated', (progress) => {
            this.updateProgress(progress);
        });
    }

    updateHealth(currentHealth) {
        const maxHealth = CONSTANTS.PLAYER_LIFE;
        const healthPercent = Math.max(0, currentHealth / maxHealth);
        
        // Update health bar width
        const maxWidth = 196; // Full width minus padding
        const currentWidth = maxWidth * healthPercent;
        this.elements.healthBar.displayWidth = currentWidth;
        
        // Update health bar color based on percentage
        let healthColor = 0x00ff00; // Green
        if (healthPercent < 0.5) {
            healthColor = 0xffff00; // Yellow
        }
        if (healthPercent < 0.25) {
            healthColor = 0xff0000; // Red
        }
        
        this.elements.healthBar.setFillStyle(healthColor);
        
        // Update health text
        this.elements.healthText.setText(`${Math.max(0, Math.floor(currentHealth))}/${maxHealth}`);
        
        // Flash effect on damage
        if (healthPercent < 1) {
            this.elements.healthBar.setAlpha(0.7);
            this.scene.tweens.add({
                targets: this.elements.healthBar,
                alpha: 1,
                duration: 200
            });
        }
    }

    updateScore(score) {
        this.elements.scoreValue.setText(score.toLocaleString());
        
        // Brief scale animation for score updates
        this.scene.tweens.add({
            targets: this.elements.scoreValue,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            yoyo: true
        });
    }

    updateTime(timeData) {
        const { hours, minutes, seconds } = timeData;
        
        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');
        const paddedSeconds = seconds.toString().padStart(2, '0');
        
        this.elements.timeValue.setText(`${paddedHours}:${paddedMinutes}:${paddedSeconds}`);
    }

    updateProgress(progressPercent) {
        const maxWidth = 146; // Full width minus padding
        const currentWidth = (maxWidth * progressPercent) / 100;
        
        this.elements.progressBar.displayWidth = Math.max(0, currentWidth);
        this.elements.progressText.setText(`${Math.floor(progressPercent)}%`);
        
        // Change color based on progress
        let progressColor = 0x00aa00; // Green
        if (progressPercent >= 50) {
            progressColor = 0x00cc00; // Brighter green
        }
        if (progressPercent >= 75) {
            progressColor = 0x00ff00; // Full green
        }
        if (progressPercent >= 100) {
            progressColor = 0xffff00; // Gold for completion
        }
        
        this.elements.progressBar.setFillStyle(progressColor);
    }

    showMessage(message, duration = 3000, color = '#ffffff') {
        const messageText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY - 100,
            message,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '24px', fill: color, backgroundColor: '#000000', padding: { x: 20, y: 10 } }
        );
        messageText.setOrigin(0.5);
        messageText.setScrollFactor(0);
        messageText.setDepth(CONSTANTS.UI_DEPTH + 100);
        
        // Animate in
        messageText.setAlpha(0);
        messageText.setScale(0.5);
        
        this.scene.tweens.add({
            targets: messageText,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.out'
        });
        
        // Remove after duration
        this.scene.time.delayedCall(duration, () => {
            this.scene.tweens.add({
                targets: messageText,
                alpha: 0,
                scaleX: 0.5,
                scaleY: 0.5,
                duration: 200,
                onComplete: () => messageText.destroy()
            });
        });
    }

    showInteractionPrompt(text = 'Press E to interact') {
        if (this.elements.interactionPrompt) {
            this.elements.interactionPrompt.destroy();
        }
        
        this.elements.interactionPrompt = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.height - 150,
            text,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', fill: '#ffff00', backgroundColor: '#000000', padding: { x: 15, y: 8 } }
        );
        this.elements.interactionPrompt.setOrigin(0.5);
        this.elements.interactionPrompt.setScrollFactor(0);
        this.elements.interactionPrompt.setDepth(CONSTANTS.UI_DEPTH + 50);
        
        // Pulse animation
        this.scene.tweens.add({
            targets: this.elements.interactionPrompt,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    hideInteractionPrompt() {
        if (this.elements.interactionPrompt) {
            this.elements.interactionPrompt.destroy();
            this.elements.interactionPrompt = null;
        }
    }

    toggle() {
        this.visible = !this.visible;
        
        Object.values(this.elements).forEach(element => {
            if (element && element.setVisible) {
                element.setVisible(this.visible);
            }
        });
    }

    hide() {
        this.visible = false;
        Object.values(this.elements).forEach(element => {
            if (element && element.setVisible) {
                element.setVisible(false);
            }
        });
    }

    show() {
        this.visible = true;
        Object.values(this.elements).forEach(element => {
            if (element && element.setVisible) {
                element.setVisible(true);
            }
        });
    }

    destroy() {
        // Clean up event listeners
        this.scene.events.off('healthUpdated');
        this.scene.events.off('scoreUpdated');
        this.scene.events.off('timeUpdated');
        this.scene.events.off('progressUpdated');
        
        // Destroy all UI elements
        Object.values(this.elements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        this.elements = {};
    }
}

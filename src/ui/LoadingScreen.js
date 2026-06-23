import { CONSTANTS } from '../config/Constants.js';

export class LoadingScreen {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.loadingComplete = false;
    }

    create() {
        const { width, height } = this.scene.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Background
        this.elements.background = this.scene.add.rectangle(
            centerX, centerY, width, height, 0x2c3e50
        );
        this.elements.background.setDepth(10000);

        // Title
        this.elements.title = this.scene.add.text(
            centerX, centerY - 150,
            'Educational RPG Game',
            CONSTANTS.FONT_STYLES.TITLE
        );
        this.elements.title.setOrigin(0.5);
        this.elements.title.setDepth(10001);

        // Subtitle
        this.elements.subtitle = this.scene.add.text(
            centerX, centerY - 100,
            'Answer questions, defeat enemies, and unlock treasures!',
            CONSTANTS.FONT_STYLES.SUBTITLE
        );
        this.elements.subtitle.setOrigin(0.5);
        this.elements.subtitle.setDepth(10001);

        // Progress box background
        this.elements.progressBox = this.scene.add.rectangle(
            centerX, centerY - 25, 320, 50, 0x34495e, 0.8
        );
        this.elements.progressBox.setDepth(10001);

        // Progress bar background
        this.elements.progressBarBg = this.scene.add.rectangle(
            centerX, centerY - 25, 300, 30, 0x2c3e50
        );
        this.elements.progressBarBg.setDepth(10002);

        // Progress bar
        this.elements.progressBar = this.scene.add.rectangle(
            centerX - 148, centerY - 25, 0, 26, 0x3498db
        );
        this.elements.progressBar.setOrigin(0, 0.5);
        this.elements.progressBar.setDepth(10003);

        // Loading text
        this.elements.loadingText = this.scene.add.text(
            centerX, centerY - 50,
            'Loading...',
            CONSTANTS.FONT_STYLES.DEFAULT
        );
        this.elements.loadingText.setOrigin(0.5);
        this.elements.loadingText.setDepth(10003);

        // Percentage text
        this.elements.percentText = this.scene.add.text(
            centerX, centerY - 25,
            '0%',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '14px' }
        );
        this.elements.percentText.setOrigin(0.5);
        this.elements.percentText.setDepth(10004);

        // Tips text
        this.createTips(centerX, centerY + 50);

        // Loading animation
        this.createLoadingAnimation();

        return this.elements;
    }

    createTips(x, y) {
        const tips = [
            'Use WASD or Arrow Keys to move around',
            'Press SPACE to shoot at enemies',
            'Answer questions correctly to unlock doors',
            'Collect treasures from chests for rewards',
            'Defeat all enemies to win the game',
            'Your health regenerates slowly over time'
        ];

        this.currentTipIndex = 0;
        
        this.elements.tipsLabel = this.scene.add.text(
            x, y,
            'Tip:',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '14px', fill: '#f39c12' }
        );
        this.elements.tipsLabel.setOrigin(0.5);
        this.elements.tipsLabel.setDepth(10001);

        this.elements.tipText = this.scene.add.text(
            x, y + 25,
            tips[0],
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '12px', fill: '#ecf0f1', wordWrap: { width: 400 } }
        );
        this.elements.tipText.setOrigin(0.5);
        this.elements.tipText.setDepth(10001);

        // Cycle through tips
        this.tipTimer = this.scene.time.addEvent({
            delay: 2000,
            callback: () => {
                this.currentTipIndex = (this.currentTipIndex + 1) % tips.length;
                this.elements.tipText.setText(tips[this.currentTipIndex]);
                
                // Fade animation
                this.elements.tipText.setAlpha(0);
                this.scene.tweens.add({
                    targets: this.elements.tipText,
                    alpha: 1,
                    duration: 300
                });
            },
            loop: true
        });
    }

    createLoadingAnimation() {
        // Pulse animation for loading text
        this.scene.tweens.add({
            targets: this.elements.loadingText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Rotate animation for title
        this.scene.tweens.add({
            targets: this.elements.title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateProgress(value) {
        if (this.loadingComplete) return;

        const percentage = Math.round(value * 100);
        
        // Update progress bar
        this.elements.progressBar.displayWidth = 296 * value;
        
        // Update percentage text
        this.elements.percentText.setText(`${percentage}%`);
        
        // Change color based on progress
        if (value < 0.5) {
            this.elements.progressBar.setFillStyle(0xe74c3c); // Red
        } else if (value < 0.8) {
            this.elements.progressBar.setFillStyle(0xf39c12); // Orange
        } else {
            this.elements.progressBar.setFillStyle(0x27ae60); // Green
        }
        
        // Update loading text based on progress
        if (value < 0.2) {
            this.elements.loadingText.setText('Loading Assets...');
        } else if (value < 0.4) {
            this.elements.loadingText.setText('Loading Audio...');
        } else if (value < 0.6) {
            this.elements.loadingText.setText('Loading Maps...');
        } else if (value < 0.8) {
            this.elements.loadingText.setText('Preparing Game...');
        } else if (value < 1.0) {
            this.elements.loadingText.setText('Almost Ready...');
        } else {
            this.completeLoading();
        }
    }

    completeLoading() {
        if (this.loadingComplete) return;
        
        this.loadingComplete = true;
        
        // Update final text
        this.elements.loadingText.setText('Loading Complete!');
        this.elements.percentText.setText('100%');
        this.elements.progressBar.setFillStyle(0x2ecc71); // Bright green
        
        // Stop tip cycling
        if (this.tipTimer) {
            this.tipTimer.remove();
        }
        
        // Show ready message
        const readyText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 150,
            'Click anywhere or press any key to start!',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '18px', fill: '#e74c3c', backgroundColor: '#000000', padding: { x: 15, y: 8 } }
        );
        readyText.setOrigin(0.5);
        readyText.setDepth(10003);
        
        // Pulse animation for ready text
        this.scene.tweens.add({
            targets: readyText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        this.elements.readyText = readyText;
        
        // Enable start input
        this.enableStartInput();
    }

    enableStartInput() {
        // Click to start
        this.scene.input.once('pointerdown', () => {
            this.startGame();
        });
        
        // Any key to start
        this.scene.input.keyboard.once('keydown', () => {
            this.startGame();
        });
    }

    startGame() {
        if (!this.loadingComplete) return;
        
        // Fade out loading screen
        const allElements = Object.values(this.elements);
        
        this.scene.tweens.add({
            targets: allElements,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                this.destroy();
                // Emit event to start the actual game
                this.scene.events.emit('loadingComplete');
            }
        });
    }

    destroy() {
        // Stop any running timers
        if (this.tipTimer) {
            this.tipTimer.remove();
            this.tipTimer = null;
        }
        
        // Destroy all elements
        Object.values(this.elements).forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        
        this.elements = {};
        this.loadingComplete = false;
    }

    // Method to show error message
    showError(errorMessage) {
        // Hide loading elements
        this.elements.progressBox.setVisible(false);
        this.elements.progressBar.setVisible(false);
        this.elements.progressBarBg.setVisible(false);
        this.elements.percentText.setVisible(false);
        this.elements.loadingText.setVisible(false);
        
        // Show error
        const errorText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            `Loading Error:\n${errorMessage}\n\nPlease refresh the page to try again.`,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', fill: '#e74c3c', backgroundColor: '#000000', padding: { x: 20, y: 15 } }
        );
        errorText.setOrigin(0.5);
        errorText.setDepth(10005);
        
        this.elements.errorText = errorText;
    }
}

import { ANIMATIONS, CONSTANTS } from '../config/Constants.js';

export class Door extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'gate', 0);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.scene = scene;
        this.setupDoor();
    }

    setupDoor() {
        this.setDepth(this.y);
        this.body.setImmovable(true);
        this.body.setSize(32, 32);
        
        this.isLocked = true;
        this.isOpen = false;
        this.keyRequired = '';
        this.questionData = null;
        this.choiceButtons = [];
        this.questionDisplay = null;
        this.interactionCooldown = 0;
    }

    setQuestionData(questionData) {
        this.questionData = questionData;
        this.questionData.correctAnswer = questionData.correctAnswer || questionData.answer || '';
        this.keyRequired = this.questionData.correctAnswer;
    }

    interact(player) {
        if (this.interactionCooldown > 0) return;
        
        this.interactionCooldown = 1000; // 1 second cooldown
        
        if (this.isOpen) {
            // Door is already open, player can pass
            return;
        }
        
        if (this.isLocked) {
            this.showQuestion();
        } else {
            this.openDoor();
        }
    }

    showQuestion() {
        if (!this.questionData) {
            console.warn('No question data for door');
            return;
        }
        
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
        
        // Background
        const background = this.scene.add.rectangle(
            centerX, centerY, 600, 400, 0x000000, 0.8
        );
        background.setDepth(5000);
        background.setScrollFactor(0);
        
        // Question text
        const questionText = this.scene.add.text(
            centerX, centerY - 120, 
            this.questionData.question, 
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '18px', wordWrap: { width: 550 } }
        );
        questionText.setOrigin(0.5);
        questionText.setDepth(5001);
        questionText.setScrollFactor(0);
        
        // Choice buttons
        const choices = this.questionData.choices || this.questionData.choiceSet || [];
        const buttonSpacing = 80;
        const startY = centerY - 20;
        
        for (let i = 0; i < Math.min(4, choices.length); i++) {
            const buttonY = startY + (i * buttonSpacing);
            const letter = String.fromCharCode(65 + i); // A, B, C, D
            
            // Button background
            const button = this.scene.add.rectangle(
                centerX, buttonY, 500, 60, 0x333333
            );
            button.setDepth(5001);
            button.setScrollFactor(0);
            button.setInteractive();
            
            // Button text
            const buttonText = this.scene.add.text(
                centerX, buttonY,
                `${letter}. ${choices[i]}`,
                { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px' }
            );
            buttonText.setOrigin(0.5);
            buttonText.setDepth(5002);
            buttonText.setScrollFactor(0);
            
            // Store UI elements for cleanup
            this.choiceButtons.push(button, buttonText);
            
            // Button interaction
            button.on('pointerdown', () => {
                this.selectChoice(i, choices[i]);
            });
            
            button.on('pointerover', () => {
                button.setFillStyle(0x555555);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x333333);
            });
        }
        
        // Store UI elements for cleanup
        this.questionDisplay = [background, questionText, ...this.choiceButtons];
        
        // Add keyboard support
        this.setupKeyboardChoices();
    }

    setupKeyboardChoices() {
        const keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        const keyB = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        const keyC = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        const keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        
        const choices = this.questionData.choices || this.questionData.choiceSet || [];
        
        keyA.on('down', () => this.selectChoice(0, choices[0]));
        keyB.on('down', () => this.selectChoice(1, choices[1]));
        keyC.on('down', () => this.selectChoice(2, choices[2]));
        keyD.on('down', () => this.selectChoice(3, choices[3]));
        
        // Clean up keyboard handlers after use
        this.keyboardCleanup = () => {
            keyA.off('down');
            keyB.off('down');
            keyC.off('down');
            keyD.off('down');
        };
    }

    selectChoice(index, choice) {
        const correctAnswer = this.questionData.correctAnswer || this.questionData.answer || '';
        const isCorrect = choice === correctAnswer;
        
        // Clean up UI
        this.cleanupQuestionUI();
        
        if (isCorrect) {
            this.unlockDoor();
        } else {
            this.showIncorrectAnswer(choice, correctAnswer);
        }
        
        // Resume game
        this.scene.physics.resume();
    }

    showIncorrectAnswer(selectedChoice, correctAnswer) {
        const camera = this.scene.cameras.main;
        const centerX = camera.centerX;
        const centerY = camera.centerY;
        
        const feedbackText = this.scene.add.text(
            centerX, centerY,
            `Incorrect! You chose: ${selectedChoice}\nCorrect answer: ${correctAnswer}`,
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '16px', fill: '#ff4444', backgroundColor: '#000000', padding: { x: 20, y: 10 } }
        );
        feedbackText.setOrigin(0.5);
        feedbackText.setDepth(5000);
        feedbackText.setScrollFactor(0);
        
        // Remove feedback after delay
        this.scene.time.delayedCall(2000, () => {
            feedbackText.destroy();
        });
        
        this.scene.audioManager.playSound('playerHurt');
    }

    unlockDoor() {
        this.isLocked = false;
        this.scene.audioManager.playSound('doorOpen');
        this.openDoor();
        
        // Update game state
        this.scene.gameState.updateScore(200);
        
        // Visual feedback
        const camera = this.scene.cameras.main;
        const successText = this.scene.add.text(
            camera.centerX, camera.centerY,
            'Correct! Door unlocked!',
            { ...CONSTANTS.FONT_STYLES.DEFAULT, fontSize: '18px', fill: '#44ff44', backgroundColor: '#000000', padding: { x: 20, y: 10 } }
        );
        successText.setOrigin(0.5);
        successText.setDepth(5000);
        successText.setScrollFactor(0);
        
        this.scene.time.delayedCall(1500, () => {
            successText.destroy();
        });
    }

    openDoor() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.body.setEnable(false); // Disable collision
        this.anims.play(ANIMATIONS.GATE.OPEN, false);
        this.scene.audioManager.playSound('doorOpen');
        
        // Make door semi-transparent when open
        this.setAlpha(0.7);
    }

    closeDoor() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.body.setEnable(true); // Re-enable collision
        this.anims.play(ANIMATIONS.GATE.CLOSE, false);
        this.scene.audioManager.playSound('doorClose');
        
        // Restore full opacity
        this.setAlpha(1);
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
    }

    destroy() {
        this.cleanupQuestionUI();
        super.destroy();
    }
}

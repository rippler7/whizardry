import { CONSTANTS } from '../config/Constants.js';

export class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.currentState = CONSTANTS.GAME_STATES.PLAYING;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeElapsed = 0;
        this.enemiesKilled = 0;
        this.chestsOpened = 0;
        this.questionsAnswered = 0;
        this.correctAnswers = 0;
        
        // Game timer
        this.gameTimer = null;
        this.startTime = Date.now();
    }

    initialize() {
        // Start the game timer
        this.gameTimer = this.scene.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        
        console.log('Game State Manager initialized');
    }

    updateTimer() {
        this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    }

    setState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        console.log(`Game state changed from ${oldState} to ${newState}`);
        
        // Handle state transitions
        this.handleStateChange(oldState, newState);
    }

    handleStateChange(oldState, newState) {
        switch (newState) {
            case CONSTANTS.GAME_STATES.PAUSED:
                this.pauseGame();
                break;
            case CONSTANTS.GAME_STATES.PLAYING:
                if (oldState === CONSTANTS.GAME_STATES.PAUSED) {
                    this.resumeGame();
                }
                break;
            case CONSTANTS.GAME_STATES.GAME_OVER:
                this.handleGameOver();
                break;
            case CONSTANTS.GAME_STATES.VICTORY:
                this.handleVictory();
                break;
            case CONSTANTS.GAME_STATES.QUESTION:
                this.pauseGameplay();
                break;
        }
    }

    pauseGame() {
        if (this.gameTimer) {
            this.gameTimer.paused = true;
        }
        this.scene.physics.pause();
    }

    resumeGame() {
        if (this.gameTimer) {
            this.gameTimer.paused = false;
        }
        this.scene.physics.resume();
    }

    pauseGameplay() {
        // Pause physics but keep timer running
        this.scene.physics.pause();
    }

    resumeGameplay() {
        this.scene.physics.resume();
        this.setState(CONSTANTS.GAME_STATES.PLAYING);
    }

    handleGameOver() {
        console.log('Game Over!');
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        this.scene.physics.pause();
    }

    handleVictory() {
        console.log('Victory!');
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        this.scene.physics.pause();
    }

    addScore(points) {
        this.score += points;
        console.log(`Score increased by ${points}. Total: ${this.score}`);
    }

    loseLife() {
        this.lives--;
        console.log(`Life lost! Lives remaining: ${this.lives}`);
        
        if (this.lives <= 0) {
            this.setState(CONSTANTS.GAME_STATES.GAME_OVER);
        }
        
        return this.lives;
    }

    addLife() {
        this.lives++;
        console.log(`Life gained! Lives: ${this.lives}`);
    }

    enemyKilled() {
        this.enemiesKilled++;
        this.addScore(100);
    }

    chestOpened() {
        this.chestsOpened++;
        this.addScore(50);
    }

    questionAnswered(correct) {
        this.questionsAnswered++;
        if (correct) {
            this.correctAnswers++;
            this.addScore(200);
        } else {
            this.addScore(-50);
        }
    }

    getGameStats() {
        return {
            score: this.score,
            lives: this.lives,
            level: this.level,
            timeElapsed: this.timeElapsed,
            enemiesKilled: this.enemiesKilled,
            chestsOpened: this.chestsOpened,
            questionsAnswered: this.questionsAnswered,
            correctAnswers: this.correctAnswers,
            accuracy: this.questionsAnswered > 0 ? 
                Math.round((this.correctAnswers / this.questionsAnswered) * 100) : 0
        };
    }

    getCurrentState() {
        return this.currentState;
    }

    isPlaying() {
        return this.currentState === CONSTANTS.GAME_STATES.PLAYING;
    }

    isPaused() {
        return this.currentState === CONSTANTS.GAME_STATES.PAUSED;
    }

    isGameOver() {
        return this.currentState === CONSTANTS.GAME_STATES.GAME_OVER;
    }

    isInQuestion() {
        return this.currentState === CONSTANTS.GAME_STATES.QUESTION;
    }
}
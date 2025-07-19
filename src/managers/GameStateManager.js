import { CONSTANTS } from '../config/Constants.js';

export class GameStateManager {
    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.gameMode = CONSTANTS.GAME_MODE.NORMAL;
        this.playerLife = CONSTANTS.PLAYER_LIFE;
        this.enemies = CONSTANTS.ENEMIES;
        this.batCount = CONSTANTS.BAT_COUNT;
        this.zombieCount = CONSTANTS.ZOMBIE_COUNT;
        this.skeletonDamage = CONSTANTS.SKELETON_DAMAGE;
        this.batDamage = CONSTANTS.BAT_DAMAGE;
        this.score = 0;
        this.timeElapsed = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.selectionLevel = 0;
        this.debug = false;
        this.choiceIndex = 10;
        this.playerAns = 'A';
    }

    setupGameData(data = {}) {
        this.gameMode = data.gameMode || CONSTANTS.GAME_MODE.NORMAL;
        
        if (this.gameMode === CONSTANTS.GAME_MODE.HARD) {
            this.playerLife += 50;
            this.enemies += 50;
            this.batCount *= 2;
            this.zombieCount = Math.round(this.enemies / 2) + 3;
            this.skeletonDamage *= 2;
            this.batDamage *= 2;
        } else if (this.debug) {
            this.playerLife += 50;
            this.enemies = 5;
            this.batCount = 5;
            this.zombieCount = Math.round(this.enemies / 2) + 3;
        }
    }

    updateScore(points) {
        this.score += points;
        this.scene.events.emit('scoreUpdated', this.score);
    }

    updateTime() {
        this.timeElapsed++;
        this.seconds = this.timeElapsed % 60;
        this.minutes = Math.floor(this.timeElapsed / 60) % 60;
        this.hours = Math.floor(this.timeElapsed / 3600);
        
        this.scene.events.emit('timeUpdated', {
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
            total: this.timeElapsed
        });
    }

    takeDamage(amount) {
        this.playerLife -= amount;
        if (this.playerLife < 0) this.playerLife = 0;
        this.scene.events.emit('healthUpdated', this.playerLife);
        
        if (this.playerLife <= 0) {
            this.scene.events.emit('gameOver');
        }
    }

    heal(amount) {
        this.playerLife += amount;
        if (this.playerLife > CONSTANTS.PLAYER_LIFE) {
            this.playerLife = CONSTANTS.PLAYER_LIFE;
        }
        this.scene.events.emit('healthUpdated', this.playerLife);
    }

    getCompletionPercentage() {
        // Calculate completion based on gates passed, chests opened, etc.
        return Math.min(100, Math.floor((this.score / 1000) * 100));
    }

    isGameComplete() {
        return this.getCompletionPercentage() >= 100;
    }

    saveState() {
        const state = {
            gameMode: this.gameMode,
            playerLife: this.playerLife,
            score: this.score,
            timeElapsed: this.timeElapsed,
            selectionLevel: this.selectionLevel
        };
        
        try {
            localStorage.setItem('gameState', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save game state:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('gameState');
            if (saved) {
                const state = JSON.parse(saved);
                Object.assign(this, state);
                return true;
            }
        } catch (error) {
            console.warn('Failed to load game state:', error);
        }
        return false;
    }
}

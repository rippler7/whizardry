import { GameConfig } from './config/GameConfig.js';
import { GameScene } from './scenes/GameScene.js';

// Register the main game scene
GameConfig.scene = [GameScene];

// Initialize the Phaser game
const game = new Phaser.Game(GameConfig);

// Make game globally accessible for debugging
window.game = game;

// Handle window resize
window.addEventListener('resize', () => {
    game.scale.refresh();
});

// Handle visibility change to pause/resume game
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        game.scene.pause('GameScene');
    } else {
        game.scene.resume('GameScene');
    }
});

export default game;

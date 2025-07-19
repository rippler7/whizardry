import { CONSTANTS } from '../config/Constants.js';

export class AssetManager {
    constructor(scene) {
        this.scene = scene;
        this.loadProgress = 0;
    }

    preloadAssets() {
        // Set up loading progress tracking
        this.scene.load.on('progress', (progress) => {
            this.loadProgress = progress;
            console.log('Loading progress:', Math.round(progress * 100) + '%');
        });

        this.scene.load.on('complete', () => {
            console.log('All assets loaded successfully');
        });

        // Load placeholder graphics for now - in a real game these would be actual asset files
        this.createPlaceholderAssets();
    }

    createPlaceholderAssets() {
        // Create colored rectangles as placeholder sprites
        const graphics = this.scene.add.graphics();
        
        // Player - Blue rectangle
        graphics.fillStyle(0x0066cc);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.PLAYER_SPRITE, 32, 32);
        
        // Skeleton - White rectangle
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.SKELETON_SPRITE, 32, 32);
        
        // Zombie - Green rectangle
        graphics.clear();
        graphics.fillStyle(0x00cc66);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.ZOMBIE_SPRITE, 32, 32);
        
        // Bat - Dark gray rectangle
        graphics.clear();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 24, 24);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.BAT_SPRITE, 24, 24);
        
        // Boss - Red rectangle
        graphics.clear();
        graphics.fillStyle(0xcc0000);
        graphics.fillRect(0, 0, 48, 48);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.BOSS_SPRITE, 48, 48);
        
        // Bullet - Yellow circle
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.BULLET_SPRITE, 8, 8);
        
        // Chest - Brown rectangle
        graphics.clear();
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(0, 0, 32, 24);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.CHEST_SPRITE, 32, 24);
        
        // Door - Purple rectangle
        graphics.clear();
        graphics.fillStyle(0x800080);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture(CONSTANTS.ASSET_KEYS.DOOR_SPRITE, 32, 32);
        
        // Wall tile - Gray rectangle
        graphics.clear();
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall', 32, 32);
        
        // Floor tile - Light gray rectangle
        graphics.clear();
        graphics.fillStyle(0xcccccc);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);
        
        graphics.destroy();
    }

    getLoadProgress() {
        return this.loadProgress;
    }
}
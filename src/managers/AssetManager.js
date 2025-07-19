import { ASSET_KEYS } from '../config/Constants.js';

export class AssetManager {
    constructor(scene) {
        this.scene = scene;
    }

    preloadAudio() {
        // Load audio files with fallbacks
        this.scene.load.audio(ASSET_KEYS.AUDIO.JUNGLE, [
            'https://opengameart.org/sites/default/files/enchanted_forest_loop.ogg',
            'https://opengameart.org/sites/default/files/enchanted_forest.mp3'
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.ARCADE, [
            'https://opengameart.org/sites/default/files/arcade1.mp3',
            'https://opengameart.org/sites/default/files/arcade1.ogg'
        ]);
        
        // Use CDN fallbacks for audio
        this.scene.load.audio(ASSET_KEYS.AUDIO.FIRE, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LE',
            'data:audio/ogg;base64,T2dnUwACAAAAAAABP8W7AAAAAACR0WjOAQAAAP/mDwAHZPHzM9/'
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.ENEMY_HURT, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdswGAECN3+LfmFPyHGG4++bIecEDAEOM4OLamVTyGV60+ebJdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDAEKO4eTdmFXyF1uw++bNeLwDAASH3+Tfm1TzGFa0+ebOdLwDA'
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.PLAYER_HURT, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.BURST, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        // Additional audio with fallbacks
        this.scene.load.audio(ASSET_KEYS.AUDIO.SPITTING, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.DOOR_LOCK, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.DOOR_OPEN, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.DOOR_CLOSE, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.STAR, [
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAWATiS2vPNeSYGOlbC7dWSTgoZaLPn5Z5MEQ1Dqs/8tGEYAAyJ3uPimlTxH2e9++LEdsw='
        ]);
        
        this.scene.load.audio(ASSET_KEYS.AUDIO.BOSS_THEME, [
            'https://opengameart.org/sites/default/files/BoxCat_Games_-_05_-_Battle_Boss.mp3',
            'https://opengameart.org/sites/default/files/BoxCat_Games_-_05_-_Battle_Boss.ogg'
        ]);
    }

    preloadSprites() {
        // Create simple colored rectangles as fallback sprites
        this.scene.load.image(ASSET_KEYS.SPRITES.BULLET, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVFhH7cEBDQAAAMKg909tDjegAADANwL8AAHMoQFgAAAAAElFTkSuQmCC');
        this.scene.load.image(ASSET_KEYS.SPRITES.FIREBALL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAgCAYAAACTYZ2uAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVEhL7cEBDQAAAMKg909tDjegAADANwP8AAHMoQFgAAAAAElFTkSuQmCC');
        
        // Load tileset - using a simple pattern as fallback
        this.scene.load.image(ASSET_KEYS.SPRITES.TILES, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVFhH7cEBDQAAAMKg909tDjegAADANwL8AAHMoQFgAAAAAElFTkSuQmCC');
        this.scene.load.image(ASSET_KEYS.SPRITES.TILES2, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVFhH7cEBDQAAAMKg909tDjegAADANwL8AAHMoQFgAAAAAElFTkSuQmCC');
        
        // Generate spritesheets as base64 data URLs
        this.generateSpritesheet(ASSET_KEYS.SPRITES.PLAYER, 32, 48, 16, '#4A90E2');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.SKELETON, 64, 64, 273, '#E8E8E8');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.ZOMBIE, 32, 32, 96, '#8B4513');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.BAT, 64, 64, 55, '#2F4F4F');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.BOSS, 64, 64, 273, '#8B0000');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.GATE, 32, 32, 16, '#DAA520');
        this.generateSpritesheet('redcrystal', 32, 32, 8, '#FF0000');
        this.generateSpritesheet('bluecrystal', 32, 32, 8, '#0000FF');
        this.generateSpritesheet('greencrystal', 32, 32, 8, '#00FF00');
        this.generateSpritesheet('yellowcrystal', 32, 32, 8, '#FFFF00');
        this.generateSpritesheet('chestRed', 32, 64, 8, '#8B0000');
        this.generateSpritesheet('chestBlue', 32, 64, 8, '#00008B');
        this.generateSpritesheet('chestGreen', 32, 64, 8, '#006400');
        this.generateSpritesheet('chestYellow', 32, 64, 8, '#FFD700');
        this.generateSpritesheet(ASSET_KEYS.SPRITES.CRYSTALS, 32, 32, 16, '#9370DB');
    }

    generateSpritesheet(key, frameWidth, frameHeight, frameCount, color) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate optimal grid dimensions
        const framesPerRow = Math.ceil(Math.sqrt(frameCount));
        const rows = Math.ceil(frameCount / framesPerRow);
        
        canvas.width = framesPerRow * frameWidth;
        canvas.height = rows * frameHeight;
        
        ctx.fillStyle = color;
        
        for (let i = 0; i < frameCount; i++) {
            const col = i % framesPerRow;
            const row = Math.floor(i / framesPerRow);
            const x = col * frameWidth;
            const y = row * frameHeight;
            
            // Create slightly different frames for animation
            const opacity = 0.7 + (0.3 * Math.sin(i * 0.5));
            ctx.globalAlpha = opacity;
            ctx.fillRect(x + 2, y + 2, frameWidth - 4, frameHeight - 4);
            ctx.globalAlpha = 1.0;
        }
        
        const dataUrl = canvas.toDataURL();
        this.scene.load.spritesheet(key, dataUrl, { 
            frameWidth: frameWidth, 
            frameHeight: frameHeight, 
            endFrame: frameCount - 1 
        });
    }

    preloadMaps() {
        // Load tilemap data - create simple CSV data as fallback
        const mapWidth = 100;
        const mapHeight = 100;
        const basicMapData = this.generateMapData(mapWidth, mapHeight, 1);
        const wallsMapData = this.generateMapData(mapWidth, mapHeight, 26, 0.1);
        const doodadsMapData = this.generateMapData(mapWidth, mapHeight, 50, 0.05);
        const layer2MapData = this.generateMapData(mapWidth, mapHeight, 30, 0.03);
        const crystalMapData = this.generateMapData(mapWidth, mapHeight, 11, 0.02);
        
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.BASIC, 'data:text/csv;base64,' + btoa(basicMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.WALLS, 'data:text/csv;base64,' + btoa(wallsMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.DOODADS, 'data:text/csv;base64,' + btoa(doodadsMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.LAYER2, 'data:text/csv;base64,' + btoa(layer2MapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.CRYSTAL_RED, 'data:text/csv;base64,' + btoa(crystalMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.CRYSTAL_BLUE, 'data:text/csv;base64,' + btoa(crystalMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.CRYSTAL_GREEN, 'data:text/csv;base64,' + btoa(crystalMapData));
        this.scene.load.tilemapCSV(ASSET_KEYS.MAPS.CRYSTAL_YELLOW, 'data:text/csv;base64,' + btoa(crystalMapData));
    }

    generateMapData(width, height, tileId, density = 1.0) {
        let mapData = '';
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < density) {
                    mapData += tileId;
                } else {
                    mapData += '0';
                }
                if (x < width - 1) mapData += ',';
            }
            if (y < height - 1) mapData += '\n';
        }
        return mapData;
    }

    preloadAll() {
        try {
            this.preloadAudio();
            this.preloadSprites();
            this.preloadMaps();
        } catch (error) {
            console.warn('Asset loading error:', error);
            // Continue with fallback assets
        }
    }
}

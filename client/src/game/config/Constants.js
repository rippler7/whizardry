export const CONSTANTS = {
    TILE_SIZE: 32,
    PLAYER_SPEED: 160,
    BULLET_SPEED: 300,
    ENEMY_SPEED: 50,
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    
    // Entity types
    ENTITY_TYPES: {
        PLAYER: 'player',
        ENEMY: 'enemy',
        BULLET: 'bullet',
        CHEST: 'chest',
        DOOR: 'door'
    },
    
    // Enemy types
    ENEMY_TYPES: {
        SKELETON: 'skeleton',
        ZOMBIE: 'zombie',
        BAT: 'bat',
        BOSS: 'boss'
    },
    
    // Game states
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        VICTORY: 'victory',
        QUESTION: 'question'
    },
    
    // Audio keys
    AUDIO_KEYS: {
        BACKGROUND_MUSIC: 'background_music',
        BULLET_SOUND: 'bullet_sound',
        ENEMY_HIT: 'enemy_hit',
        PLAYER_HIT: 'player_hit',
        CHEST_OPEN: 'chest_open',
        DOOR_OPEN: 'door_open'
    },
    
    // Asset keys
    ASSET_KEYS: {
        PLAYER_SPRITE: 'player',
        SKELETON_SPRITE: 'skeleton',
        ZOMBIE_SPRITE: 'zombie',
        BAT_SPRITE: 'bat',
        BOSS_SPRITE: 'boss',
        BULLET_SPRITE: 'bullet',
        CHEST_SPRITE: 'chest',
        DOOR_SPRITE: 'door',
        TILESET: 'tileset',
        MAP_DATA: 'mapData'
    }
};
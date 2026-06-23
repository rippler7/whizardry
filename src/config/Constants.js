export const CONSTANTS = {
    // Game Settings
    TILE_SIZE: 32,
    PLAYER_SPEED: 160,
    BULLET_SPEED: 400,
    MAX_FRAME_RATE: 10,

    // Font Styles
    FONT_STYLES: {
        TITLE: {
            fontFamily: 'Sherwood',
            fontSize: '48px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        },
        SUBTITLE: {
            fontFamily: 'Sherwood',
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        },
        DEFAULT: {
            fontFamily: 'Sherwood',
            fontSize: '24px',
            fill: '#FFFFFF'
        }
    },
    
    // Player Settings
    PLAYER_LIFE: 100,
    PLAYER_DAMAGE: 25,
    
    // Enemy Settings
    SKELETON_DAMAGE: 10,
    BAT_DAMAGE: 15,
    ZOMBIE_DAMAGE: 8,
    BOSS_DAMAGE: 30,
    
    // Game Modes
    GAME_MODE: {
        NORMAL: 1,
        HARD: 2
    },
    
    // Enemy Counts
    ENEMIES: 15,
    BAT_COUNT: 10,
    ZOMBIE_COUNT: 8,
    
    // Colors
    COLORS: {
        RED: '#FF0000',
        BLUE: '#0000FF',
        GREEN: '#00FF00',
        YELLOW: '#FFFF00',
        WHITE: '#FFFFFF',
        BLACK: '#000000'
    },
    
    // UI Settings
    UI_DEPTH: 2500,
    HUD_PADDING: 10,
    
    // Audio Settings
    AUDIO_VOLUME: {
        MUSIC: 0.5,
        SFX: 0.7
    },
    
    // Animation Settings
    ANIM_FRAME_RATE: 10,
    
    // Chest Settings
    CHEST_POSITIONS: {
        RED: { x: 1757.86, y: 1055.28 },
        BLUE: { x: 1757.86, y: 1564.43 },
        GREEN: { x: 2270.99, y: 1055.28 },
        YELLOW: { x: 2270.99, y: 1564.43 }
    }
};

export const ANIMATIONS = {
    PLAYER: {
        WALK_UP: 'walkUp',
        WALK_DOWN: 'walkDown',
        WALK_LEFT: 'walkLeft',
        WALK_RIGHT: 'walkRight'
    },
    SKELETON: {
        WALK_UP: 'walkUpSkeleton',
        WALK_DOWN: 'walkDownSkeleton',
        WALK_LEFT: 'walkLeftSkeleton',
        WALK_RIGHT: 'walkRightSkeleton',
        CAST_DOWN: 'animCastDownSkeleton',
        SHOOT_UP: 'shootUpSkeleton',
        SHOOT_LEFT: 'shootLeftSkeleton',
        SHOOT_RIGHT: 'shootRightSkeleton',
        SHOOT_DOWN: 'shootDownSkeleton',
        DIE: 'playerDieSkeleton'
    },
    ZOMBIE: {
        WALK_UP: 'walkUpZombie',
        WALK_DOWN: 'walkDownZombie',
        WALK_LEFT: 'walkLeftZombie',
        WALK_RIGHT: 'walkRightZombie',
        DIE: 'dieZombie'
    },
    BAT: {
        FLY_LEFT: 'flyLeft',
        FLY_RIGHT: 'flyRight',
        DIE: 'batDie'
    },
    BOSS: {
        WALK_UP: 'walkUpOrc',
        WALK_DOWN: 'walkDownOrc',
        WALK_LEFT: 'walkLeftOrc',
        WALK_RIGHT: 'walkRightOrc',
        ATTACK_UP: 'attackUpOrc',
        ATTACK_DOWN: 'attackDownOrc',
        ATTACK_LEFT: 'attackLeftOrc',
        ATTACK_RIGHT: 'attackRightOrc',
        DIE: 'OrcDie'
    },
    GATE: {
        OPEN: 'openGate',
        CLOSE: 'closeGate'
    },
    CRYSTAL: {
        RED: 'redcrystal',
        BLUE: 'bluecrystal',
        GREEN: 'greencrystal',
        YELLOW: 'yellowcrystal'
    },
    CHEST: {
        OPEN_RED: 'chestOpenRed',
        OPEN_BLUE: 'chestOpenBlue',
        OPEN_GREEN: 'chestOpenGreen',
        OPEN_YELLOW: 'chestOpenYellow'
    }
};

export const ASSET_KEYS = {
    AUDIO: {
        JUNGLE: 'jungle',
        ARCADE: 'arcade',
        FIRE: 'fire',
        ENEMY_HURT: 'enemyHurt',
        PLAYER_HURT: 'playerHurt',
        PLAYER_HURT2: 'playerHurt2',
        BURST: 'burst',
        SPITTING: 'spitting',
        DOOR_LOCK: 'doorLock',
        DOOR_OPEN: 'doorOpen',
        DOOR_CLOSE: 'doorClose',
        STAR: 'star',
        BOSS_THEME: 'bossTheme'
    },
    SPRITES: {
        BULLET: 'bullet',
        FIREBALL: 'fireball',
        TILES: 'tiles',
        TILES2: 'tiles2',
        CRYSTALS: 'crystals',
        PLAYER: 'player',
        SKELETON: 'skeleton',
        ZOMBIE: 'zombie',
        BAT: 'bat',
        BOSS: 'Boss',
        GATE: 'gate'
    },
    MAPS: {
        BASIC: 'map_basic',
        LAYER2: 'map_layer2',
        DOODADS: 'map_doodads',
        WALLS: 'map_walls',
        CRYSTAL_RED: 'crystalRed',
        CRYSTAL_BLUE: 'crystalBlue',
        CRYSTAL_GREEN: 'crystalGreen',
        CRYSTAL_YELLOW: 'crystalYellow'
    }
};

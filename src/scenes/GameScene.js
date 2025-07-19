import { AssetManager } from '../managers/AssetManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { GameStateManager } from '../managers/GameStateManager.js';
import { QuestionManager } from '../managers/QuestionManager.js';
import { Player } from '../entities/Player.js';
import { Skeleton } from '../entities/enemies/Skeleton.js';
import { Zombie } from '../entities/enemies/Zombie.js';
import { Bat } from '../entities/enemies/Bat.js';
import { Boss } from '../entities/enemies/Boss.js';
import { Bullet } from '../entities/Bullet.js';
import { Door } from '../entities/Door.js';
import { Chest } from '../entities/Chest.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { CONSTANTS, ANIMATIONS, ASSET_KEYS } from '../config/Constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data = {}) {
        try {
            this.initializeManagers();
            this.gameState.setupGameData(data);
            this.gameState.saveState();
        } catch (error) {
            console.error('Error initializing game scene:', error);
        }
    }

    initializeManagers() {
        this.assetManager = new AssetManager(this);
        this.audioManager = new AudioManager(this);
        this.gameState = new GameStateManager(this);
        this.questionManager = new QuestionManager(this);
    }

    preload() {
        try {
            // Show loading screen
            this.loadingScreen = new LoadingScreen(this);
            this.loadingScreenElements = this.loadingScreen.create();

            // Setup load progress tracking
            this.setupLoadingCallbacks();

            // Load all assets
            this.assetManager.preloadAll();

        } catch (error) {
            console.error('Error during preload:', error);
            this.loadingScreen.showError('Failed to load game assets');
        }
    }

    setupLoadingCallbacks() {
        this.load.on('progress', (value) => {
            this.loadingScreen.updateProgress(value);
        });

        this.load.on('complete', () => {
            this.loadingScreen.completeLoading();
        });

        this.load.on('loaderror', (file) => {
            console.warn('Failed to load file:', file.key);
        });

        // Listen for loading complete event
        this.events.once('loadingComplete', () => {
            this.startGame();
        });
    }

    create() {
        try {
            console.log('GameScene created - waiting for loading to complete');
            
            // Initialize audio (will be called after loading completes)
            this.audioManager.initialize();
            
            // Create animations
            this.createAnimations();
            
        } catch (error) {
            console.error('Error during create:', error);
        }
    }

    startGame() {
        try {
            console.log('Starting game...');
            
            // Create world
            this.createWorld();
            
            // Create player
            this.createPlayer();
            
            // Create enemies
            this.createEnemies();
            
            // Create doors and chests
            this.createInteractables();
            
            // Create bullet system
            this.createBulletSystem();
            
            // Setup physics
            this.setupPhysics();
            
            // Create UI
            this.createUI();
            
            // Setup game timer
            this.setupGameTimer();
            
            // Setup controls
            this.setupControls();
            
            // Start background music
            this.audioManager.playBackgroundMusic();
            
            console.log('Game started successfully');
            
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    createWorld() {
        try {
            // Create tilemaps
            this.map = this.make.tilemap({ key: ASSET_KEYS.MAPS.BASIC, tileWidth: 32, tileHeight: 32 });
            this.mapDoodads = this.make.tilemap({ key: ASSET_KEYS.MAPS.DOODADS, tileWidth: 32, tileHeight: 32 });
            this.mapWalls = this.make.tilemap({ key: ASSET_KEYS.MAPS.WALLS, tileWidth: 32, tileHeight: 32 });
            this.mapLayer2 = this.make.tilemap({ key: ASSET_KEYS.MAPS.LAYER2, tileWidth: 32, tileHeight: 32 });
            
            // Crystal layers
            this.crystalLayerRed = this.make.tilemap({ key: ASSET_KEYS.MAPS.CRYSTAL_RED, tileWidth: 32, tileHeight: 32 });
            this.crystalLayerBlue = this.make.tilemap({ key: ASSET_KEYS.MAPS.CRYSTAL_BLUE, tileWidth: 32, tileHeight: 32 });
            this.crystalLayerGreen = this.make.tilemap({ key: ASSET_KEYS.MAPS.CRYSTAL_GREEN, tileWidth: 32, tileHeight: 32 });
            this.crystalLayerYellow = this.make.tilemap({ key: ASSET_KEYS.MAPS.CRYSTAL_YELLOW, tileWidth: 32, tileHeight: 32 });

            // Add tilesets
            const tileset = this.map.addTilesetImage('32x32_map_tile_RPG_basic', ASSET_KEYS.SPRITES.TILES);
            const tileset2 = this.mapLayer2.addTilesetImage('tilea2', ASSET_KEYS.SPRITES.TILES2);
            const tilesetCrystals = this.crystalLayerRed.addTilesetImage('crystals2', ASSET_KEYS.SPRITES.CRYSTALS);

            // Create layers
            this.layer = this.map.createStaticLayer(0, tileset, 0, 0);
            this.layerExtra = this.mapLayer2.createStaticLayer(0, tileset2, 0, 0);
            this.layerDoodads = this.mapDoodads.createStaticLayer(0, tileset, 0, 0);
            this.layer3 = this.mapWalls.createStaticLayer(0, tileset, 0, 0);
            
            // Crystal layers
            this.cLayerR = this.crystalLayerRed.createStaticLayer(0, tilesetCrystals, 0, 0);
            this.cLayerB = this.crystalLayerBlue.createStaticLayer(0, tilesetCrystals, 0, 0);
            this.cLayerG = this.crystalLayerGreen.createStaticLayer(0, tilesetCrystals, 0, 0);
            this.cLayerY = this.crystalLayerYellow.createStaticLayer(0, tilesetCrystals, 0, 0);

            // Set up collisions
            this.mapWalls.setCollisionBetween(26, 151);
            this.crystalLayerRed.setCollision(11);
            this.crystalLayerBlue.setCollision(8);
            this.crystalLayerGreen.setCollision(10);
            this.crystalLayerYellow.setCollision(9);

            // Setup camera
            this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        } catch (error) {
            console.error('Error creating world:', error);
            // Create fallback minimal world
            this.createFallbackWorld();
        }
    }

    createFallbackWorld() {
        // Create a simple colored background if tilemaps fail
        this.add.rectangle(400, 300, 800, 600, 0x2c5f2d);
        this.cameras.main.setBounds(0, 0, 3200, 2400);
        console.warn('Using fallback world due to tilemap errors');
    }

    createPlayer() {
        this.player = new Player(this, 100, 100);
        this.cameras.main.startFollow(this.player);
        
        // Center camera on player initially
        this.cameras.main.centerOn(this.player.x, this.player.y);
    }

    createEnemies() {
        // Create enemy groups
        this.enemies = this.physics.add.group();
        this.skeletons = this.physics.add.group();
        this.zombies = this.physics.add.group();
        this.bats = this.physics.add.group();
        this.bosses = this.physics.add.group();

        try {
            this.spawnEnemies();
        } catch (error) {
            console.error('Error spawning enemies:', error);
            this.spawnFallbackEnemies();
        }
    }

    spawnEnemies() {
        const keyLocations = this.questionManager.keyLocations;
        
        // Spawn skeletons
        for (let i = 0; i < Math.min(this.gameState.enemies, 10); i++) {
            const location = keyLocations[i % keyLocations.length];
            const skeleton = new Skeleton(this, location[0] + Phaser.Math.Between(-50, 50), location[1] + Phaser.Math.Between(-50, 50));
            this.enemies.add(skeleton);
            this.skeletons.add(skeleton);
        }

        // Spawn zombies
        for (let i = 0; i < Math.min(this.gameState.zombieCount, 8); i++) {
            const location = keyLocations[(i + 2) % keyLocations.length];
            const zombie = new Zombie(this, location[0] + Phaser.Math.Between(-100, 100), location[1] + Phaser.Math.Between(-100, 100));
            this.enemies.add(zombie);
            this.zombies.add(zombie);
        }

        // Spawn bats
        for (let i = 0; i < Math.min(this.gameState.batCount, 10); i++) {
            const location = keyLocations[(i + 6) % keyLocations.length];
            const bat = new Bat(this, location[0] + Phaser.Math.Between(-80, 80), location[1] + Phaser.Math.Between(-80, 80));
            this.enemies.add(bat);
            this.bats.add(bat);
        }

        // Spawn boss
        const bossLocation = keyLocations[keyLocations.length - 1];
        const boss = new Boss(this, bossLocation[0], bossLocation[1]);
        this.enemies.add(boss);
        this.bosses.add(boss);
        this.boss = boss;
    }

    spawnFallbackEnemies() {
        // Spawn simplified enemies if keyLocations fail
        const positions = [
            [300, 200], [500, 300], [700, 400], [200, 500], [600, 200]
        ];

        positions.forEach((pos, index) => {
            let enemy;
            if (index === 0) {
                enemy = new Boss(this, pos[0], pos[1]);
                this.boss = enemy;
                this.bosses.add(enemy);
            } else if (index < 3) {
                enemy = new Skeleton(this, pos[0], pos[1]);
                this.skeletons.add(enemy);
            } else {
                enemy = new Zombie(this, pos[0], pos[1]);
                this.zombies.add(enemy);
            }
            this.enemies.add(enemy);
        });
    }

    createInteractables() {
        this.doors = this.physics.add.group();
        this.chests = this.physics.add.group();

        try {
            this.createDoors();
            this.createChests();
        } catch (error) {
            console.error('Error creating interactables:', error);
            this.createFallbackInteractables();
        }
    }

    createDoors() {
        const gateLocations = this.questionManager.gateLocations;
        
        gateLocations.forEach((gateData, index) => {
            const door = new Door(this, gateData.x, gateData.y);
            door.setQuestionData(gateData);
            this.doors.add(door);
        });
    }

    createChests() {
        const chestTypes = ['red', 'blue', 'green', 'yellow'];
        const chestPositions = [
            CONSTANTS.CHEST_POSITIONS.RED,
            CONSTANTS.CHEST_POSITIONS.BLUE,
            CONSTANTS.CHEST_POSITIONS.GREEN,
            CONSTANTS.CHEST_POSITIONS.YELLOW
        ];

        chestTypes.forEach((type, index) => {
            const position = chestPositions[index];
            const chest = new Chest(this, position.x, position.y, type);
            const questionData = this.questionManager.getChestQuestion(index);
            if (questionData) {
                chest.setQuestionData(questionData);
            }
            this.chests.add(chest);
        });
    }

    createFallbackInteractables() {
        // Create simple fallback interactables
        const door = new Door(this, 200, 150);
        door.setQuestionData({
            question: 'What is 2 + 2?',
            choices: ['3', '4', '5', '6'],
            correctAnswer: '4'
        });
        this.doors.add(door);

        const chest = new Chest(this, 400, 150, 'red');
        chest.setQuestionData({
            question: 'What color is the sky?',
            choices: ['Red', 'Blue', 'Green', 'Yellow'],
            correctAnswer: 'Blue'
        });
        this.chests.add(chest);
    }

    createBulletSystem() {
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });
    }

    setupPhysics() {
        try {
            // Player collisions
            if (this.layer3) {
                this.physics.add.collider(this.player, this.layer3);
            }
            
            // Crystal collisions
            if (this.cLayerR) this.physics.add.collider(this.player, this.cLayerR);
            if (this.cLayerB) this.physics.add.collider(this.player, this.cLayerB);
            if (this.cLayerG) this.physics.add.collider(this.player, this.cLayerG);
            if (this.cLayerY) this.physics.add.collider(this.player, this.cLayerY);

            // Enemy collisions
            this.physics.add.collider(this.enemies, this.enemies);
            if (this.layer3) {
                this.physics.add.collider(this.enemies, this.layer3);
            }

            // Player vs enemies
            this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

            // Bullets vs enemies
            this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitEnemy, null, this);

            // Bullets vs walls
            if (this.layer3) {
                this.physics.add.collider(this.bullets, this.layer3, this.bulletHitWall, null, this);
            }

            // Player vs doors
            this.physics.add.overlap(this.player, this.doors, this.playerNearDoor, null, this);

            // Player vs chests
            this.physics.add.overlap(this.player, this.chests, this.playerNearChest, null, this);

        } catch (error) {
            console.error('Error setting up physics:', error);
        }
    }

    createUI() {
        this.hud = new HUD(this);
        this.updateHUD();
    }

    setupGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.gameState.updateTime();
            },
            repeat: -1
        });
    }

    setupControls() {
        // Interaction key
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Debug keys
        this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
        this.debugKey.on('down', () => {
            this.physics.world.debugGraphic.visible = !this.physics.world.debugGraphic.visible;
        });
    }

    update(time, delta) {
        try {
            // Update player
            if (this.player && this.player.active) {
                this.player.update();
            }

            // Update enemies
            this.enemies.children.entries.forEach(enemy => {
                if (enemy.active && enemy.update) {
                    enemy.update();
                }
            });

            // Update doors
            this.doors.children.entries.forEach(door => {
                if (door.active && door.update) {
                    door.update();
                }
            });

            // Update chests
            this.chests.children.entries.forEach(chest => {
                if (chest.active && chest.update) {
                    chest.update();
                }
            });

            // Handle interactions
            this.handleInteractions();

            // Check game over conditions
            this.checkGameOver();

        } catch (error) {
            console.error('Error in update loop:', error);
        }
    }

    handleInteractions() {
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.tryInteract();
        }
    }

    tryInteract() {
        const playerBounds = this.player.getBounds();
        const interactionDistance = 60;

        // Check doors
        this.doors.children.entries.forEach(door => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                door.x, door.y
            );
            if (distance <= interactionDistance) {
                door.interact(this.player);
            }
        });

        // Check chests
        this.chests.children.entries.forEach(chest => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                chest.x, chest.y
            );
            if (distance <= interactionDistance) {
                chest.interact(this.player);
            }
        });
    }

    checkGameOver() {
        if (this.player.health <= 0) {
            this.gameOver(false);
        } else if (this.enemies.children.entries.length === 0 || this.gameState.isGameComplete()) {
            this.gameOver(true);
        }
    }

    gameOver(won) {
        this.physics.pause();
        this.gameTimer.remove();

        const message = won ? 'Congratulations! You Won!' : 'Game Over! Try Again?';
        const color = won ? '#00ff00' : '#ff0000';

        this.hud.showMessage(message, 5000, color);

        // Show restart option
        this.time.delayedCall(2000, () => {
            const restartText = this.add.text(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 50,
                'Press R to restart or ESC for main menu',
                {
                    fontSize: '18px',
                    fill: '#ffffff',
                    fontFamily: 'Arial',
                    align: 'center',
                    backgroundColor: '#000000',
                    padding: { x: 15, y: 8 }
                }
            );
            restartText.setOrigin(0.5);
            restartText.setScrollFactor(0);
            restartText.setDepth(CONSTANTS.UI_DEPTH + 200);

            // Setup restart controls
            const restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
            const escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

            restartKey.once('down', () => {
                this.scene.restart();
            });

            escapeKey.once('down', () => {
                // Could transition to main menu scene here
                this.scene.restart();
            });
        });
    }

    // Physics collision callbacks
    playerHitEnemy(player, enemy) {
        if (enemy.takeDamage && enemy.active) {
            // Enemy damages player
            if (player.takeDamage) {
                player.takeDamage(enemy.damage || 10);
            }
        }
    }

    bulletHitEnemy(bullet, enemy) {
        if (bullet.active && enemy.active) {
            bullet.hitEnemy(enemy);
        }
    }

    bulletHitWall(bullet, wall) {
        if (bullet.active) {
            bullet.kill();
        }
    }

    playerNearDoor(player, door) {
        if (door.isLocked) {
            this.hud.showInteractionPrompt('Press E to answer question');
        } else {
            this.hud.hideInteractionPrompt();
        }
    }

    playerNearChest(player, chest) {
        if (chest.locked && !chest.unlocking) {
            this.hud.showInteractionPrompt('Press E to solve riddle');
        } else {
            this.hud.hideInteractionPrompt();
        }
    }

    updateHUD() {
        // Update HUD with current game state
        this.events.emit('healthUpdated', this.gameState.playerLife);
        this.events.emit('scoreUpdated', this.gameState.score);
        this.events.emit('progressUpdated', this.gameState.getCompletionPercentage());
    }

    createAnimations() {
        try {
            // Player animations
            this.anims.create({
                key: ANIMATIONS.PLAYER.WALK_UP,
                frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.PLAYER, { start: 12, end: 15 }),
                frameRate: CONSTANTS.ANIM_FRAME_RATE,
                repeat: -1
            });

            this.anims.create({
                key: ANIMATIONS.PLAYER.WALK_DOWN,
                frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.PLAYER, { start: 0, end: 3 }),
                frameRate: CONSTANTS.ANIM_FRAME_RATE,
                repeat: -1
            });

            this.anims.create({
                key: ANIMATIONS.PLAYER.WALK_LEFT,
                frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.PLAYER, { start: 4, end: 7 }),
                frameRate: CONSTANTS.ANIM_FRAME_RATE,
                repeat: -1
            });

            this.anims.create({
                key: ANIMATIONS.PLAYER.WALK_RIGHT,
                frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.PLAYER, { start: 8, end: 11 }),
                frameRate: CONSTANTS.ANIM_FRAME_RATE,
                repeat: -1
            });

            // Create all other animations
            this.createEnemyAnimations();
            this.createObjectAnimations();

        } catch (error) {
            console.error('Error creating animations:', error);
        }
    }

    createEnemyAnimations() {
        // Skeleton animations
        this.anims.create({
            key: ANIMATIONS.SKELETON.WALK_UP,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 104, end: 112 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.WALK_DOWN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 130, end: 137 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.WALK_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 117, end: 125 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.WALK_RIGHT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 143, end: 151 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.CAST_DOWN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 26, end: 32 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: 1
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.SHOOT_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 221, end: 233 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.SKELETON.DIE,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.SKELETON, { start: 260, end: 265 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        // Add other enemy animations...
        this.createZombieAnimations();
        this.createBatAnimations();
        this.createBossAnimations();
    }

    createZombieAnimations() {
        this.anims.create({
            key: ANIMATIONS.ZOMBIE.WALK_UP,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.ZOMBIE, { start: 42, end: 44 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.ZOMBIE.WALK_DOWN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.ZOMBIE, { start: 6, end: 8 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.ZOMBIE.WALK_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.ZOMBIE, { start: 18, end: 20 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.ZOMBIE.WALK_RIGHT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.ZOMBIE, { start: 30, end: 32 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.ZOMBIE.DIE,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.ZOMBIE, { start: 48, end: 53 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });
    }

    createBatAnimations() {
        this.anims.create({
            key: ANIMATIONS.BAT.FLY_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BAT, { start: 0, end: 4 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.BAT.FLY_RIGHT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BAT, { start: 6, end: 8 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.BAT.DIE,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BAT, { start: 46, end: 54 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });
    }

    createBossAnimations() {
        // Boss walking animations
        this.anims.create({
            key: ANIMATIONS.BOSS.WALK_UP,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 104, end: 112 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.WALK_DOWN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 130, end: 137 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.WALK_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 117, end: 125 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.WALK_RIGHT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 143, end: 151 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        // Boss attack animations
        this.anims.create({
            key: ANIMATIONS.BOSS.ATTACK_UP,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 52, end: 58 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.ATTACK_DOWN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 78, end: 84 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.ATTACK_LEFT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 65, end: 72 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.ATTACK_RIGHT,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 91, end: 97 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.BOSS.DIE,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.BOSS, { start: 260, end: 265 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });
    }

    createObjectAnimations() {
        // Gate animations
        this.anims.create({
            key: ANIMATIONS.GATE.OPEN,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.GATE, { start: 0, end: 3 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        this.anims.create({
            key: ANIMATIONS.GATE.CLOSE,
            frames: this.anims.generateFrameNumbers(ASSET_KEYS.SPRITES.GATE, { start: 4, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: false
        });

        // Crystal animations
        this.anims.create({
            key: ANIMATIONS.CRYSTAL.RED,
            frames: this.anims.generateFrameNumbers('redcrystal', { start: 0, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.CRYSTAL.BLUE,
            frames: this.anims.generateFrameNumbers('bluecrystal', { start: 0, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.CRYSTAL.GREEN,
            frames: this.anims.generateFrameNumbers('greencrystal', { start: 0, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATIONS.CRYSTAL.YELLOW,
            frames: this.anims.generateFrameNumbers('yellowcrystal', { start: 0, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: -1
        });

        // Chest animations
        this.anims.create({
            key: ANIMATIONS.CHEST.OPEN_RED,
            frames: this.anims.generateFrameNumbers('chestRed', { start: 0, end: 3 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: 0
        });

        this.anims.create({
            key: ANIMATIONS.CHEST.OPEN_BLUE,
            frames: this.anims.generateFrameNumbers('chestBlue', { start: 0, end: 3 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: 0
        });

        this.anims.create({
            key: ANIMATIONS.CHEST.OPEN_GREEN,
            frames: this.anims.generateFrameNumbers('chestGreen', { start: 4, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: 0
        });

        this.anims.create({
            key: ANIMATIONS.CHEST.OPEN_YELLOW,
            frames: this.anims.generateFrameNumbers('chestYellow', { start: 4, end: 7 }),
            frameRate: CONSTANTS.ANIM_FRAME_RATE,
            repeat: 0
        });
    }

    // Cleanup
    destroy() {
        if (this.gameTimer) {
            this.gameTimer.remove();
        }

        if (this.hud) {
            this.hud.destroy();
        }

        if (this.audioManager) {
            this.audioManager.destroy();
        }

        if (this.loadingScreen) {
            this.loadingScreen.destroy();
        }

        super.destroy();
    }
}

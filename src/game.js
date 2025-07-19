// Global game variables
let gameMode = 1;
let debug = false;
let playerLife = 100;
let Enemies = 10;
let BatCount = 5;
let ZombieCount = 5;
let skeletonDamage = 20;
let batDamage = 15;
let playerAns = 'a';
let choiceIndex = 0;

// Game state variables
let map, mapDoodads, mapWalls, mapLayer2;
let crystalLayerRed, crystalLayerBlue, crystalLayerGreen, crystalLayerYellow;
let layer3, cLayerR, cLayerB, cLayerG, cLayerY;
let playerChar;
let cursors, spacebar;
let scoreText;
let clocker;

// Audio variables
let jungle, arcade, fire, star, playerHurt, enemyHit, spitting;
let doorLock, doorOpen, doorClose, bossTheme, burst;

// Question system variables
let ans = [];
let questions = [];
let res = [];
let ls = [];
let qSet = [];
let shuffledSet = [];
let choiceSets = [];
let gateLocations = [];
let keyLocations = [];
let chestQuestions = [];
let masterChestQuestions = [];
let SelectionLevel = 0;

// Sample question data (simplified for demo)
const q1 = [
    "What is the capital of France?",
    "What is 2 + 2?",
    "Which planet is closest to the Sun?",
    "What is the largest mammal?",
    "Who wrote Romeo and Juliet?"
];

const res1 = [
    "Paris",
    "4", 
    "Mercury",
    "Blue Whale",
    "William Shakespeare"
];

const ls1 = [1, 1, 1, 2, 2];

const q2 = q1; // For now, same questions for mode 2
const res2 = res1;
const ls2 = ls1;

// Utility functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function elapsedTime() {
    // Timer function placeholder
}

function updateLockText(show) {
    // UI update function placeholder
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data = {}) {
        this.setupGameData(data);
    }

    setupGameData(data) {
        gameMode = data.gameMode || 1;
        
        if (gameMode == 2) {
            playerLife = playerLife + 50;
            Enemies = Enemies + 50;
            BatCount = BatCount * 2;
            ZombieCount = Math.round(Enemies / 2) + 3;
            skeletonDamage = skeletonDamage * 2;
            batDamage = batDamage * 2;
        } else if (debug) {
            playerLife = playerLife + 50;
            Enemies = 5;
            BatCount = 5;
            ZombieCount = Math.round(Enemies / 2) + 3;
        }
        
        ans = ['a', 'b', 'c', 'c', 'd', 'b', 'a', 'c', 'x', 'c', 'x', 'd', 'a', 'b', 'c'];
        
        if (gameMode == 2) {
            questions = q2;
            res = res2;
            ls = ls2;
        } else {
            questions = q1;
            res = res1;
            ls = ls1;
        }

        // Setup question sets
        qSet = [];
        for (let m = 0; m < questions.length; m++) {
            let q = questions[m];
            let a = res[m];
            let level = ls[m];
            let qs = [q, a, level];
            qSet.push(qs);
        }
        
        shuffledSet = Phaser.Utils.Array.Shuffle(qSet);
        
        // Setup choice sets
        choiceSets = [];
        for (let n = 0; n < shuffledSet.length; n++) {
            let set = [];
            set.push(shuffledSet[n][1]);
            for (let k = 0; k < 3; k++) {
                let ch = shuffledSet[getRandomInt(0, res.length - 1)][1];
                while (set.indexOf(ch) >= 0) {
                    ch = shuffledSet[getRandomInt(0, res.length - 1)][1];
                }
                set.push(ch);
            }
            choiceSets[n] = Phaser.Utils.Array.Shuffle(set);
        }
        
        // Setup gate locations (simplified)
        gateLocations = [];
        for (let i = 0; i < Math.min(15, shuffledSet.length); i++) {
            let gate = [
                300 + i * 200, // x position
                300 + (i % 3) * 200, // y position  
                i + 1, // gate id
                'n', // type
                choiceSets[i] || ['A', 'B', 'C', 'D'], // choices
                shuffledSet[i] ? shuffledSet[i][1] : 'A', // correct answer
                shuffledSet[i] ? shuffledSet[i][0] : 'Sample question', // question
                i + 1 // level
            ];
            gateLocations.push(gate);
        }
    }

    preload() {
        this.setupLoadingBar();
        
        // Load placeholder assets for now
        this.load.image('tiles', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        this.load.image('tiles2', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        
        // Create simple CSV data for maps
        const simpleMapData = Array(50).fill(Array(50).fill(1).join(',')).join('\n');
        const wallMapData = Array(50).fill(Array(50).fill(0).join(',')).join('\n');
        
        this.load.text('map_basic', 'data:text/plain,' + encodeURIComponent(simpleMapData));
        this.load.text('map_walls', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('map_doodads', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('map_layer2', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('crystalRed', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('crystalBlue', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('crystalGreen', 'data:text/plain,' + encodeURIComponent(wallMapData));
        this.load.text('crystalYellow', 'data:text/plain,' + encodeURIComponent(wallMapData));
        
        // Create placeholder sprite data
        this.createPlaceholderSprites();
    }

    createPlaceholderSprites() {
        // Create placeholder graphics
        const graphics = this.add.graphics();
        
        // Player sprite - blue rectangle
        graphics.fillStyle(0x0066cc);
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('player', 32, 48);
        
        // Enemy sprites
        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('skeleton', 64, 64);
        
        graphics.clear();
        graphics.fillStyle(0x00cc66);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('zombie', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('bat', 64, 64);
        
        graphics.clear();
        graphics.fillStyle(0xcc0000);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('Boss', 64, 64);
        
        // Other sprites
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('bullet', 16, 16);
        
        graphics.clear();
        graphics.fillStyle(0xff6600);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('fireball', 16, 16);
        
        graphics.clear();
        graphics.fillStyle(0x800080);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('gate', 32, 32);
        
        // Crystal sprites
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('redcrystal', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x0000ff);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('bluecrystal', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('greencrystal', 32, 32);
        
        graphics.clear();
        graphics.fillStyle(0xffff00);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('yellowcrystal', 32, 32);
        
        // Chest sprites
        graphics.clear();
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(0, 0, 32, 64);
        graphics.generateTexture('chestRed', 32, 64);
        graphics.generateTexture('chestBlue', 32, 64);
        graphics.generateTexture('chestGreen', 32, 64);
        graphics.generateTexture('chestYellow', 32, 64);
        
        graphics.destroy();
    }

    setupLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const progressBar = this.add.graphics();
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', { 
            fontSize: '20px', 
            fill: '#ffffff' 
        }).setOrigin(0.5);
        const percentText = this.add.text(width / 2, height / 2, '0%', { 
            fontSize: '18px', 
            fill: '#ffffff' 
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
    }

    create() {
        console.log('GameScene created');
        
        // Hide game state UI initially
        const gameStateEl = document.getElementById("gameState");
        if (gameStateEl) {
            gameStateEl.style.display = 'none';
        }
        
        // Create maps using CSV data
        map = this.make.tilemap({ 
            key: 'map_basic', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        
        // Add tilesets
        const tileset = map.addTilesetImage('tiles');
        const tileset2 = map.addTilesetImage('tiles2');
        
        // Create additional map layers
        mapDoodads = this.make.tilemap({ 
            key: 'map_doodads', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        mapWalls = this.make.tilemap({ 
            key: 'map_walls', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        mapLayer2 = this.make.tilemap({ 
            key: 'map_layer2', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        
        // Crystal layers
        crystalLayerRed = this.make.tilemap({ 
            key: 'crystalRed', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        crystalLayerBlue = this.make.tilemap({ 
            key: 'crystalBlue', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        crystalLayerGreen = this.make.tilemap({ 
            key: 'crystalGreen', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        crystalLayerYellow = this.make.tilemap({ 
            key: 'crystalYellow', 
            tileWidth: 32, 
            tileHeight: 32 
        });
        
        // Create tile layers
        const layer = map.createLayer(0, tileset, 0, 0);
        
        // Timer setup
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.timeElapsed = 0;
        this.consolidatedTime = 'Elapsed Time: 0' + this.hours + ':0' + this.minutes + ':0' + this.seconds;
        this.elapsedText = this.add.text(550, 60, this.consolidatedTime, { 
            fontFamily: 'Arial', 
            color: '#fff', 
            align: 'right', 
            padding: 5 
        }).setScrollFactor(0).setDepth(2500);
        
        clocker = this.time.addEvent({ 
            delay: 1000, 
            callback: this.updateElapsedTime, 
            callbackScope: this, 
            repeat: -1 
        });
        
        // Create player
        playerChar = this.physics.add.sprite(100, 100, 'player', 0);
        playerChar.currLevel = 1;
        playerChar.keyCode = playerAns.toUpperCase();
        playerChar.setDepth(playerChar.y);
        playerChar.body.setSize(32, 58, 8, 0);
        playerChar.hasKey = false;
        playerChar.ansKey = '';
        playerChar.typeChar = 'player';
        playerChar.currLoc = 1;
        playerChar.picking = false;
        playerChar.gatePassed = 1;
        playerChar.clearUpgrade = false;
        playerChar.choiceIndex = choiceIndex;
        
        // Setup controls
        cursors = this.input.keyboard.createCursorKeys();
        spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Setup audio (placeholder)
        console.log('Audio would be initialized here');
        
        // Setup collisions
        if (mapWalls && mapWalls.layers.length > 0) {
            mapWalls.setCollisionBetween(26, 151);
        }
        
        // Camera setup
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(playerChar);
        
        // Score text
        scoreText = this.add.text(720, 60, '0%', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#fff'
        }).setScrollFactor(0).setDepth(2500);
        
        console.log('Game setup complete');
    }
    
    updateElapsedTime() {
        this.seconds++;
        if (this.seconds >= 60) {
            this.seconds = 0;
            this.minutes++;
            if (this.minutes >= 60) {
                this.minutes = 0;
                this.hours++;
            }
        }
        
        const h = this.hours < 10 ? '0' + this.hours : this.hours;
        const m = this.minutes < 10 ? '0' + this.minutes : this.minutes;
        const s = this.seconds < 10 ? '0' + this.seconds : this.seconds;
        
        this.consolidatedTime = `Elapsed Time: ${h}:${m}:${s}`;
        this.elapsedText.setText(this.consolidatedTime);
    }

    update() {
        if (playerChar) {
            this.handlePlayerMovement();
        }
    }
    
    handlePlayerMovement() {
        const speed = 160;
        
        // Reset velocity
        playerChar.setVelocity(0);
        
        // Handle movement
        if (cursors.left.isDown) {
            playerChar.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            playerChar.setVelocityX(speed);
        }
        
        if (cursors.up.isDown) {
            playerChar.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            playerChar.setVelocityY(speed);
        }
        
        // Update depth based on Y position
        playerChar.setDepth(playerChar.y);
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    backgroundColor: '#2c3e50',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 800,
            height: 600
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    render: {
        pixelArt: true,
        antialias: false
    },
    scene: GameScene
};

// Initialize the game
const game = new Phaser.Game(config);

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
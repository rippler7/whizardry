import * as Phaser from 'phaser';
import { Enemy, Skeleton, Zombie, Zombie2, Bat, Spider, Boss } from '../entities/Enemy';
import questionsData from '../entities/questions.json';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: number;
}

const DEFAULT_QUESTIONS: Question[] = [
  { id: 1, question: "What is 5 + 3?", options: ["6", "7", "8", "9"], correctAnswer: "8", category: "Math", difficulty: 1 },
  { id: 2, question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: "Paris", category: "Geography", difficulty: 1 },
  { id: 3, question: "What is 2 × 6?", options: ["10", "12", "14", "16"], correctAnswer: "12", category: "Math", difficulty: 1 },
  { id: 4, question: "Which planet is closest to the Sun?", options: ["Venus", "Mercury", "Earth", "Mars"], correctAnswer: "Mercury", category: "Science", difficulty: 1 },
  { id: 5, question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: "Pacific", category: "Geography", difficulty: 2 }
];

const normalizeAnswerText = (value: unknown): string => {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

const isCorrectAnswer = (selectedAnswer: unknown, correctAnswer: unknown): boolean => {
  return normalizeAnswerText(selectedAnswer) === normalizeAnswerText(correctAnswer);
};

// Helper to safely parse imported questions regardless of formatting
const getValidQuestions = (rawData: any): Question[] => {
  let questionsArray = rawData;
  if (!Array.isArray(rawData)) {
    if (rawData && typeof rawData === 'object') {
      questionsArray = Object.values(rawData);
    } else {
      return DEFAULT_QUESTIONS;
    }
  }
  
  if (questionsArray.length === 0) {
    return DEFAULT_QUESTIONS;
  }
  
  return questionsArray.map((q: any, i: number) => {
    let options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    if (Array.isArray(q.options)) options = q.options;
    else if (Array.isArray(q.choices)) options = q.choices;
    else if (Array.isArray(q.answers)) options = q.answers;
    else if (Array.isArray(q.a)) options = q.a;

    const normalizedOptions = options.map((option: unknown) => String(option ?? '').trim());
    const rawCorrectAnswer = q.correctAnswer ?? q.correct ?? q.answer ?? q.answerText ?? normalizedOptions[0];
    const correctedAnswer = typeof rawCorrectAnswer === 'number' && Number.isInteger(rawCorrectAnswer)
      ? normalizedOptions[rawCorrectAnswer] ?? normalizedOptions[0]
      : String(rawCorrectAnswer ?? normalizedOptions[0] ?? '');

    return {
      id: q.id || i,
      question: q.question || q.q || "Missing Question?",
      options: normalizedOptions,
      correctAnswer: correctedAnswer,
      category: q.category || "General",
      difficulty: q.difficulty || 1
    };
  });
};

export class DungeonGameScene extends Phaser.Scene {
  // Game objects
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private droppedItems!: Phaser.Physics.Arcade.Group;
  private door!: Phaser.Physics.Arcade.Sprite;
  public boss?: Boss;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shootKey!: Phaser.Input.Keyboard.Key;
  
  // Mobile controls
  private movePointer: Phaser.Input.Pointer | null = null;
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickThumb!: Phaser.GameObjects.Arc;
  private joystickActive: boolean = false;
  private moveVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

  // Game state
  private playerHealth: number = 100;
  private playerMaxHealth: number = 100;
  private playerScore: number = 0;
  private questionsAnswered: number = 0;
  private correctAnswers: number = 0;
  private levelCorrectAnswers: number = 0;
  private currentDungeon: number = 1;
  private maxDungeons: number = 5;
  private doorUnlocked: boolean = false;
  private gameDifficulty: string = 'easy';
  private bossVulnerability: number = 0; // 0-100%, boss takes 25% per correct answer
  private isModalOpen: boolean = false;
  private usedQuestionIds: number[] = [];
  private isTouchingDoor: boolean = false;
  private enemiesFrozenUntil: number = 0;
  
  private playerShadow!: Phaser.GameObjects.Ellipse;

  // UI elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private questionsText!: Phaser.GameObjects.Text;
  private dungeonText!: Phaser.GameObjects.Text;

  // Educational questions for this dungeon
  private dungeonQuestions: Question[] = [];

  constructor() {
    super({ key: 'DungeonGameScene' });
  }

  init(data: any) {
    this.currentDungeon = data.dungeon || 1;
    this.playerHealth = data.health || 100;
    this.playerScore = data.score || 0;
    this.questionsAnswered = data.questionsAnswered || 0;
    this.correctAnswers = data.correctAnswers || 0;
    this.gameDifficulty = data.difficulty || 'easy';
    this.usedQuestionIds = data.usedQuestionIds || [];
    
    // Reset per-level state for when the scene restarts
    this.levelCorrectAnswers = 0;
    this.doorUnlocked = false;
    this.isModalOpen = false;
    this.bossVulnerability = 0;
    this.boss = undefined;
    this.isTouchingDoor = false;
    this.enemiesFrozenUntil = 0;
    this.resetJoystick();
  }

  preload() {
    // Load sprites using your original specifications
    this.load.spritesheet('player', 'assets/sprites/mageHero.png', { frameWidth: 32, frameHeight: 48, endFrame: 15 });
    this.load.spritesheet('skeleton', 'assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', 'assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', 'assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('spider', 'assets/sprites/spider2.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', 'assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', 'assets/sprites/rpg_gate5.png', { frameWidth: 145, frameHeight: 96, endFrame: 15 });
    this.load.image('wall_texture', 'textures/cobbledsquare.jpg');
    this.load.spritesheet('tilea2', 'assets/sprites/tilea2.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ground_easy', 'textures/grass.png');
    this.load.image('ground_medium', 'textures/sand.jpg');
    this.load.image('ground_hard', 'textures/asphalt.png');
    this.load.image('ground_easy', 'assets/sprites/grass_3.png');
    this.load.image('ground_medium', 'assets/sprites/sand_3.png');
    this.load.image('ground_hard', 'assets/sprites/dirty_3.png');
    this.load.spritesheet('redcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-red.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('bluecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-blue.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('greencrystal', 'assets/sprites/crystal-qubodup-ccby3-32-green.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('yellowcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('chestRed', 'assets/sprites/chestRed_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestBlue', 'assets/sprites/chestBlue_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestGreen', 'assets/sprites/chestGreen_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestYellow', 'assets/sprites/chestYellow_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    
    // Load other sprites
    this.load.image('bullet', 'assets/sprites/bullet.png');
    this.load.image('door', 'assets/sprites/gameDoor1.png');
    
    // Load audio files
    this.load.audio('enchanted_forest', ['assets/audio/enchanted_forest.mp3', 'assets/audio/enchanted_forest_loop.ogg']);
    this.load.audio('boss_battle', ['assets/audio/BoxCat_Games_-_05_-_Battle_Boss.mp3', 'assets/audio/BoxCat_Games_-_05_-_Battle_Boss.ogg']);
    this.load.audio('spit', ['assets/audio/spit.mp3', 'assets/audio/spit.ogg']);
    this.load.audio('star', ['assets/audio/star.mp3', 'assets/audio/star.ogg']);
    this.load.audio('star', 'assets/audio/star.ogg');
    this.load.audio('hurt', ['assets/audio/hurt.mp3', 'assets/audio/hurt.ogg']);
    this.load.audio('enemy-death', ['assets/audio/enemy-death.mp3', 'assets/audio/enemy-death.ogg']);
    this.load.audio('hurt_male', 'assets/audio/hurt_male.ogg');
    this.load.audio('zombienoise', 'assets/audio/zombienoise.ogg');
    this.load.audio('burst', 'assets/audio/burst.ogg');
    this.load.audio('gameover_theme', 'assets/audio/Kevin MacLeod - Teller of the Tales.ogg');
    this.load.audio('victory_theme', 'assets/audio/BoxCat_Games_-_25_-_Victory.ogg');
    this.load.audio('close_door', 'assets/audio/close_door.ogg');
    this.load.audio('open_door', 'assets/audio/open_door.ogg');
    this.load.audio('door_lock', 'assets/audio/door_lock.ogg');
    this.load.audio('arcade1', 'assets/audio/arcade1.ogg');
    
    this.load.on('filecomplete', (key: string) => {
      console.log('Asset loaded:', key);
    });
    
    this.load.on('loaderror', (file: any) => {
      console.warn('Asset failed to load:', file.key, file.src);
    });
  }



  create() {
    const { width, height } = this.scale;

    // Determine ground texture based on difficulty
    let groundTexture = 'ground_easy';
    if (this.gameDifficulty === 'medium') {
      groundTexture = 'ground_medium';
    } else if (this.gameDifficulty === 'hard') {
      groundTexture = 'ground_hard';
    }

    // Background - Anchor to top left and explicitly send to the absolute back
    if (this.gameDifficulty === 'easy' && this.textures.exists('tilea2')) {
      // Cellular Automata to generate organically clumped grass (25% - 80% coverage)
      const tileSize = 64;
      const cols = Math.ceil(width / tileSize);
      const rows = Math.ceil(height / tileSize);
      const grid: number[][] = [];
      const fillPercent = Phaser.Math.FloatBetween(0.25, 0.80);

      // 1. Initialize the grid with random noise
      for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
          grid[y][x] = Math.random() < fillPercent ? 1 : 0;
        }
      }

      // 2. Smooth the noise out to create clumps
      for (let i = 0; i < 3; i++) {
        const newGrid = grid.map(arr => [...arr]);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                  neighbors += grid[ny][nx];
                } else {
                  neighbors++; // Encourage clumping near the walls
                }
              }
            }
            if (neighbors > 4) newGrid[y][x] = 1;
            else if (neighbors < 4) newGrid[y][x] = 0;
          }
        }
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            grid[y][x] = newGrid[y][x];
          }
        }
      }

      // 3. Render the clumped map
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const isDense = grid[y][x] === 1;
          const frame = isDense ? 0 : 1; // Assuming frame 0 is dense, frame 1 is patchy
          
          const tile = this.add.image(x * tileSize, y * tileSize, 'tilea2', frame)
            .setOrigin(0, 0)
            .setDisplaySize(tileSize, tileSize)
            .setDepth(-10);
            
          if (this.currentDungeon === 3 || this.currentDungeon === 4) {
            tile.setTint(0xe8e0cc);
          } else if (this.currentDungeon === 5) {
            tile.setTint(0xd8c8e8);
          }
        }
      }
    } else if (this.textures.exists(groundTexture)) {
      const ground = this.add.tileSprite(0, 0, width, height, groundTexture).setOrigin(0, 0).setDepth(-10);
      
      if (this.currentDungeon === 3 || this.currentDungeon === 4) {
        ground.setTint(0xe8e0cc); // Very slight khaki tint
      } else if (this.currentDungeon === 5) {
        ground.setTint(0xd8c8e8); // Very slight purple tint
      }
    } else {
      // Safe fallback if image is missing
      const fallbackColors: { [key: string]: number } = { 'easy': 0x2d4a22, 'medium': 0xc3b091, 'hard': 0x4a148c };
      const color = fallbackColors[this.gameDifficulty] || 0x2d4a22;
      this.add.rectangle(0, 0, width, height, color).setOrigin(0, 0).setDepth(-10);
    }

    this.generateDungeonQuestions();

    // Create player with animated spritesheet
    this.playerShadow = this.add.ellipse(100, height / 2 + 26, 28, 12, 0x000000, 0.4).setDepth(1);
    this.player = this.physics.add.sprite(100, height / 2, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.125); // Increased by 25% from 0.9
    this.player.setDepth(5);
    
    // Give the player sprite standard RPG hook methods so Enemy.ts can call them natively
    (this.player as any).takeDamage = (amount: number) => {
      this.hitPlayer(this.player, null, amount);
    };
    (this.player as any).addScore = (amount: number) => {
      this.playerScore += amount;
      this.updateUI();
    };
    (this.player as any).gainExperience = (amount: number) => {};
    
    // Create player animations
    this.createPlayerAnimations();

    // Create physics groups
    this.enemies = this.physics.add.group();
    this.chests = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.droppedItems = this.physics.add.group();

    if (!this.anims.exists('spin-greencrystal')) {
      this.anims.create({
        key: 'spin-greencrystal',
        frames: this.anims.generateFrameNumbers('greencrystal', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    if (!this.anims.exists('spin-redcrystal')) {
      this.anims.create({
        key: 'spin-redcrystal',
        frames: this.anims.generateFrameNumbers('redcrystal', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('spin-bluecrystal')) {
      this.anims.create({
        key: 'spin-bluecrystal',
        frames: this.anims.generateFrameNumbers('bluecrystal', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    if (!this.anims.exists('spin-yellowcrystal')) {
      this.anims.create({
        key: 'spin-yellowcrystal',
        frames: this.anims.generateFrameNumbers('yellowcrystal', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Listen to enemy deaths to drop items
    this.events.on('enemyDefeated', this.handleEnemyDefeated, this);

    // Create dungeon layout
    this.createDungeonLayout();

    // Create exit door
    this.createExitDoor();

    // Create question chests
    this.createQuestionChests();

    // Create random obstacles
    this.createRandomObstacles();

    // Create enemies based on dungeon level
    this.createEnemies();

    // Create boss if this is the last dungeon
    this.createBoss();

    // Setup controls
    this.setupControls();

    // Setup mobile touch controls
    this.setupMobileControls();

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.createUI();

    // Start background music
    this.sound.stopAll();
    if (this.currentDungeon === this.maxDungeons) {
      this.sound.play('boss_battle', { volume: 0.3, loop: true });
    } else if (this.currentDungeon === 3 || this.currentDungeon === 4) {
      this.sound.play('arcade1', { volume: 0.2, loop: true });
    } else {
      this.sound.play('enchanted_forest', { volume: 0.2, loop: true });
    }
  }

  private createPlayerAnimations() {
    // Create walking animations for mage hero (16 frames total, 4 directions x 4 frames each)
    // Check if animations already exist to avoid duplicates
    if (!this.anims.exists('walk-down')) {
      // Down (facing camera) - frames 0-3
      this.anims.create({
        key: 'walk-down',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
      
      // Left - frames 4-7
      this.anims.create({
        key: 'walk-left',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
      
      // Right - frames 8-11
      this.anims.create({
        key: 'walk-right',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: -1
      });
      
      // Up (facing away) - frames 12-15
      this.anims.create({
        key: 'walk-up',
        frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }),
        frameRate: 8,
        repeat: -1
      });
      
      // Idle animations
      this.anims.create({
        key: 'idle-down',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1
      });
      
      this.anims.create({
        key: 'idle-left',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 1
      });
      
      this.anims.create({
        key: 'idle-right',
        frames: [{ key: 'player', frame: 8 }],
        frameRate: 1
      });
      
      this.anims.create({
        key: 'idle-up',
        frames: [{ key: 'player', frame: 12 }],
        frameRate: 1
      });
    }
  }

  private createDungeonLayout() {
    const { width, height } = this.scale;

    // Create walls around the dungeon with physics bodies
    const wallThickness = 32;

    // Create walls group for collision
    const walls = this.physics.add.staticGroup();
    const hasWallTex = this.textures.exists('wall_texture');

    // Helper to safely create a wall tile or a fallback rectangle
    const createWall = (x: number, y: number, w: number, h: number) => {
      if (hasWallTex) {
        return this.add.tileSprite(x, y, w, h, 'wall_texture').setOrigin(0, 0).setDepth(0);
      }
      return this.add.rectangle(x, y, w, h, 0x555555).setOrigin(0, 0).setDepth(0);
    };

    // Top wall 
    const topWall = createWall(0, 0, width, wallThickness);
    walls.add(topWall);

    // Bottom wall
    const bottomWall = createWall(0, height - wallThickness, width, wallThickness);
    walls.add(bottomWall);

    // Left wall
    const leftWall = createWall(0, 0, wallThickness, height);
    walls.add(leftWall);

    // Right wall (with gap for door)
    const rightWallTop = createWall(width - wallThickness, 0, wallThickness, height / 2 - 48);
    const rightWallBottom = createWall(width - wallThickness, height / 2 + 48, wallThickness, height / 2 - 48);
    walls.add(rightWallTop);
    walls.add(rightWallBottom);

    // Ensure all static bodies are perfectly aligned with their new 0,0 origins
    walls.getChildren().forEach(wall => {
      ((wall as Phaser.GameObjects.TileSprite).body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    });

    // Store walls for collision detection
    this.registry.set('walls', walls);
  }

  private createRandomObstacles() {
    const walls = this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup;
    // Fill the wider map with a dense number of obstacles.
    // getValidSpawnPosition automatically enforces the player-height gap rule!
    let numObstacles = Phaser.Math.Between(30 + this.currentDungeon * 2, 45 + this.currentDungeon * 2);
    
    if (this.currentDungeon === this.maxDungeons) {
      numObstacles = Phaser.Math.Between(60, 80); // Spawn significantly more obstacles on the boss level
    }
    
    const blockSize = 64; // 2x scale (enlarged from 32px to 64px base size)

    // Define Tetris-like shapes using grid coordinates (each block is 64x64)
    const shapes = [
      // Horizontal Line
      [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
      // Vertical Line
      [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}],
      // L-Shape
      [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 2}],
      // Reverse L-Shape
      [{x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 0, y: 2}],
      // T-Shape
      [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 1, y: 1}],
      // Cross / Plus
      [{x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}],
      // Square 2x2
      [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
      // Small Wall
      [{x: 0, y: 0}, {x: 1, y: 0}]
    ];

    for (let i = 0; i < numObstacles; i++) {
      const shape = shapes[Phaser.Math.Between(0, shapes.length - 1)];
      
      // Calculate the full bounding box of the chosen shape
      const minX = Math.min(...shape.map(b => b.x));
      const maxX = Math.max(...shape.map(b => b.x));
      const minY = Math.min(...shape.map(b => b.y));
      const maxY = Math.max(...shape.map(b => b.y));
      
      const w = (maxX - minX + 1) * blockSize;
      const h = (maxY - minY + 1) * blockSize;

      const pos = this.getValidSpawnPosition(w, h, true);
      
      if (pos) {
        const startX = pos.x - w / 2 + blockSize / 2;
        const startY = pos.y - h / 2 + blockSize / 2;

        shape.forEach(block => {
          let obstacle;
          const blockX = startX + (block.x - minX) * blockSize;
          const blockY = startY + (block.y - minY) * blockSize;
          
          if (this.textures.exists('wall_texture')) {
            obstacle = this.add.tileSprite(blockX, blockY, blockSize, blockSize, 'wall_texture').setDepth(0);
          } else {
            obstacle = this.add.rectangle(blockX, blockY, blockSize, blockSize, 0x666666).setDepth(0);
          }
          
          walls.add(obstacle);
          if (obstacle.body) {
            (obstacle.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
          }
        });
      }
    }
  }

  private getValidSpawnPosition(w: number = 64, h: number = 64, isObstacle: boolean = false, bounds?: {minX: number, maxX: number, minY: number, maxY: number}): { x: number, y: number } | null {
    let x: number = 0, y: number = 0;
    let valid = false;
    const walls = this.registry.get('walls').getChildren();
    const chests = this.chests.getChildren();
    const enemies = this.enemies.getChildren();
    const playerBounds = this.player.getBounds();
    const playerHeight = playerBounds.height;
    
    // Boss is scaled to 1.5x with a 64px frame (96px visual height, 84px physics height).
    // Use 100px minimum gap for Dungeon 5 to ensure it is strictly greater than the boss's height.
    const requiredGap = this.currentDungeon === this.maxDungeons ? 100 : playerHeight;
    
    // Give player some breathing room so they aren't trapped on spawn
    Phaser.Geom.Rectangle.Inflate(playerBounds, 64, 64);
    
    const padding = isObstacle ? requiredGap * 2 : 16;
    const checkRect = new Phaser.Geom.Rectangle(0, 0, w + padding, h + padding);
    const doorBounds = this.door ? this.door.getBounds() : new Phaser.Geom.Rectangle(0, 0, 0, 0);
    const bossBounds = new Phaser.Geom.Rectangle(this.scale.width / 2 - 80, this.scale.height / 2 - 80, 160, 160);

    // OPTIMIZATION: Cache the obstacle bounds before the loop so we don't recalculate 
    // them thousands of times per placement attempt!
    const allObstacles = [...walls, ...chests, ...enemies];
    const obstacleBounds = allObstacles.map(obs => (obs as any).getBounds());

    let attempts = 0;
    const maxAttempts = this.currentDungeon === this.maxDungeons ? 500 : 200;
    while (!valid && attempts < maxAttempts) {
        attempts++;
        const minX = bounds ? bounds.minX : 100;
        const maxX = bounds ? bounds.maxX : this.scale.width - 100;
        const minY = bounds ? bounds.minY : 100;
        const maxY = bounds ? bounds.maxY : this.scale.height - 100;
        
        x = Phaser.Math.Between(minX, maxX);
        y = Phaser.Math.Between(minY, maxY);
        checkRect.setPosition(x - checkRect.width / 2, y - checkRect.height / 2);

        valid = true;

        if (Phaser.Geom.Intersects.RectangleToRectangle(checkRect, playerBounds)) {
            valid = false;
            continue;
        }
        // Ensure non-obstacle entities (enemies/chests) don't spawn too close to the player
        if (!isObstacle && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 350) {
            valid = false;
            continue;
        }
        if (this.door && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, doorBounds)) {
            valid = false;
            continue;
        }
        if (this.currentDungeon === this.maxDungeons && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, bossBounds)) {
            valid = false;
            continue;
        }

        for (const obsBound of obstacleBounds) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(checkRect, obsBound)) {
                valid = false;
                break;
            }
        }
    }
    return valid ? { x, y } : null;
  }

  private createEnemies() {
    // Adjust enemy pool based on difficulty
    let enemyTypes = ['skeleton', 'chiroptera'];
    if (this.gameDifficulty === 'medium') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider'];
    } else if (this.gameDifficulty === 'hard') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider', 'zombie', 'zombie2'];
    }

    // Minimum 5 enemies (2 bats + 3 random) on level 1, scaling up each level
    const batCount = 1 + this.currentDungeon;
    const randomCount = 1 + (this.currentDungeon * 2);
    const totalEnemies = batCount + randomCount;

    for (let i = 0; i < totalEnemies; i++) {
      const pos = this.getValidSpawnPosition();
      if (!pos) continue;
      const { x, y } = pos;
      const enemyType = i < batCount ? 'chiroptera' : enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
      
      let hp = 50 + this.currentDungeon * 10;
      let baseSpeed = (25 + this.currentDungeon * 5) * 1.75;
      
      let enemy: Enemy;
      if (enemyType === 'zombie') {
        hp *= 3; // Zombies are 3x tougher in Hard mode
        enemy = new Zombie(this, x, y, this.player, hp, baseSpeed);
      } else if (enemyType === 'zombie2') {
        hp *= 2; // Zombie2 is 2x tougher
        enemy = new Zombie2(this, x, y, this.player, hp, baseSpeed * 1.5);
      } else if (enemyType === 'chiroptera') {
        enemy = new Bat(this, x, y, this.player, hp, baseSpeed);
      } else if (enemyType === 'spider') {
        enemy = new Spider(this, x, y, this.player, hp, baseSpeed);
      } else {
        enemy = new Skeleton(this, x, y, this.player, hp, baseSpeed);
      }
      enemy.setWallsGroup(this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup);
      this.enemies.add(enemy);
    }
  }

  private generateDungeonQuestions(): void {
    const validQuestions = getValidQuestions(questionsData);
    const pool = validQuestions.filter((question) => {
      if (this.gameDifficulty === 'hard') {
        return question.difficulty >= 5;
      } else if (this.gameDifficulty === 'medium') {
        return question.difficulty >= 3 && question.difficulty <= 4;
      } else {
        return question.difficulty >= 1 && question.difficulty <= 2;
      }
    });

    // Filter out questions we've already seen in previous levels
    let availablePool = pool.filter(q => !this.usedQuestionIds.includes(q.id));

    // If we run out of unique questions for this difficulty, fallback to the full difficulty pool
    if (availablePool.length < 4) {
      availablePool = pool;
    }

    const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
    this.dungeonQuestions = shuffled.slice(0, 4);

    // Mark these selected questions as used for future levels
    this.dungeonQuestions.forEach(q => {
      if (!this.usedQuestionIds.includes(q.id)) {
        this.usedQuestionIds.push(q.id);
      }
    });
  }

  private createQuestionChests() {
    const { width, height } = this.scale;
    const chestTypes = ['chestBlue', 'chestGreen', 'chestRed', 'chestYellow'];
    
    // Define 4 quadrants to keep chests relatively equidistant from each other
    const quadrants = [
      { minX: 100, maxX: width / 2 - 50, minY: 100, maxY: height / 2 - 50 },
      { minX: width / 2 + 50, maxX: width - 100, minY: 100, maxY: height / 2 - 50 },
      { minX: 100, maxX: width / 2 - 50, minY: height / 2 + 50, maxY: height - 100 },
      { minX: width / 2 + 50, maxX: width - 100, minY: height / 2 + 50, maxY: height - 100 }
    ];

    chestTypes.forEach((type, index) => {
      // Use getValidSpawnPosition within the designated quadrant to ensure safe placement and equidistant spreading
      const pos = this.getValidSpawnPosition(48, 80, false, quadrants[index]);
      
      // Fallback coordinates just in case it fails to find a safe spot after 100 attempts
      const x = pos ? pos.x : quadrants[index].minX + 50;
      const y = pos ? pos.y : quadrants[index].minY + 50;

      const chest = this.physics.add.sprite(x, y, type, 0);
      chest.setScale(1.0); // Normal scale since chests are properly sized now
      chest.setData('questionIndex', index);
      chest.setData('opened', false);
      
      // Use pixelPerfect so the hitbox perfectly wraps the actual visible sprite pixels
      chest.setInteractive({ useHandCursor: true, pixelPerfect: true });
      
      // Add visual hover feedback so the hitbox is obvious
      chest.on('pointerover', () => {
        if (!chest.getData('opened')) chest.setTint(0xffffcc); // Light yellow tint on hover
      });
      chest.on('pointerout', () => {
        if (!chest.getData('opened')) chest.clearTint();
      });
      
      // Create chest opening animation using original specifications
      const openAnimKey = `open-${type}`;
      if (!this.anims.exists(openAnimKey)) {
        if (type === 'chestRed' || type === 'chestBlue') {
          this.anims.create({
            key: openAnimKey,
            frames: this.anims.generateFrameNumbers(type, { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
          });
        } else { // Green and Yellow chests
          this.anims.create({
            key: openAnimKey,
            frames: this.anims.generateFrameNumbers(type, { start: 4, end: 7 }),
            frameRate: 8,
            repeat: 0
          });
        }
      }
      // Start with first frame (closed chest)
      chest.setFrame(type === 'chestGreen' || type === 'chestYellow' ? 4 : 0);
      
      chest.on('pointerdown', () => this.openChest(chest));
      
      this.chests.add(chest);
    });
  }

  private createExitDoor() {
    this.door = this.physics.add.sprite(this.scale.width - 50, this.scale.height / 2, 'gate', 15);
    this.door.setScale(0.75); // Half of 1.5
    
    // Create gate animations using original specifications
    if (!this.anims.exists('openGate')) {
      this.anims.create({
        key: 'openGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 0, end: 15 }),
        frameRate: 8,
        repeat: false
      });
      this.anims.create({
        key: 'closeGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 15, end: 0 }),
        frameRate: 8,
        repeat: false
      });
    }

    this.door.anims.play('closeGate');
    this.sound.play('close_door', { volume: 0.5 });
  }

  private createBoss() {
    if (this.currentDungeon === this.maxDungeons) {
      const bossHp = 15 * (50 + this.currentDungeon * 10);
      const baseSpeed = (55 + this.currentDungeon * 5) * 1.4; // Reduced to 80% of 1.75
      this.boss = new Boss(this, this.scale.width / 2, this.scale.height / 2, this.player, bossHp, baseSpeed);
      this.boss.setWallsGroup(this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup);
      this.boss.setScale(1.5); // Proper scale for boss
      this.boss.setTint(0x00ff00); // 100% pure green tint when invulnerable
    }
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private setupMobileControls() {
    // Ensure we can handle multi-touch (left thumb moving, right thumb shooting)
    this.input.addPointer(2);


    // Create virtual joystick graphics
    this.joystickBase = this.add.circle(0, 0, 50, 0x888888, 0.5).setDepth(2000).setScrollFactor(0).setVisible(false);
    this.joystickThumb = this.add.circle(0, 0, 25, 0xcccccc, 0.8).setDepth(2001).setScrollFactor(0).setVisible(false);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (this.isModalOpen || this.player.getData('isDead')) return;
      if (currentlyOver.length > 0) return; // Prevent shooting/moving when clicking UI or chests

      // Touch on the left half initiates the joystick
      if (pointer.x < this.scale.width / 2 && !this.joystickActive && !this.sys.game.device.os.desktop) {
        this.movePointer = pointer;
        this.joystickActive = true;
        this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
        this.joystickThumb.setPosition(pointer.x, pointer.y).setVisible(true);
        this.moveVector.set(0, 0); // Explicitly reset vector
      } else {
        // Touch on the right half (or a 2nd finger) fires a bullet
        this.fireBullet(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isModalOpen || this.player.getData('isDead')) return;

      // Safely check pointer.id to guarantee multi-touch stability on mobile browsers
      if (this.joystickActive && this.movePointer && pointer.id === this.movePointer.id) {
        if (!pointer.isDown) return; // Failsafe for loose hover events

        const distance = Phaser.Math.Distance.Between(this.joystickBase.x, this.joystickBase.y, pointer.x, pointer.y);
        const angle = Phaser.Math.Angle.Between(this.joystickBase.x, this.joystickBase.y, pointer.x, pointer.y);
        
        const maxRadius = 50;
        const clampedDist = Math.min(distance, maxRadius);
        
        this.joystickThumb.x = this.joystickBase.x + Math.cos(angle) * clampedDist;
        this.joystickThumb.y = this.joystickBase.y + Math.sin(angle) * clampedDist;
        
        this.moveVector.x = Math.cos(angle) * (clampedDist / maxRadius);
        this.moveVector.y = Math.sin(angle) * (clampedDist / maxRadius);
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && this.movePointer && pointer.id === this.movePointer.id) {
        // If it was a very quick tap on the left side, allow it to fire a bullet instead of moving
        const duration = pointer.upTime - pointer.downTime;
        const distance = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY);
        
        if (duration < 250 && distance < 15) {
          this.fireBullet(pointer.worldX, pointer.worldY);
        }

        this.resetJoystick();
      }
    });
    
    // Catch fingers sliding off the screen edge
    this.input.on('pointerout', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickActive && this.movePointer && pointer.id === this.movePointer.id) {
        this.resetJoystick();
      }
    });
  }

  private setupCollisions() {
    // Get walls from registry
    const walls = this.registry.get('walls');
    
    // Player vs walls
    if (walls) {
      this.physics.add.collider(this.player, walls);
      // Allow spiders to bypass walls using a process callback filter
      this.physics.add.collider(this.enemies, walls, undefined, (obj1: any, obj2: any) => {
        const enemy = obj1.getData && obj1.getData('type') ? obj1 : obj2;
        return enemy.getData('type') !== 'spider';
      });
      this.physics.add.collider(this.bullets, walls, (bullet: any) => {
        bullet.destroy(); // Bullets destroyed when hitting walls
      });
      this.physics.add.collider(this.enemyBullets, walls, (bullet: any) => {
        bullet.destroy(); // Enemy bullets destroyed when hitting walls
      }, (bullet: any, wall: any) => {
        return !bullet.getData('isSpiderWeb'); // Let spider webs pass through
      });
    }
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    
    // Player vs enemy bullets
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayerWithBullet, undefined, this);
    
    // Bullets vs enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    
    // Player vs dropped items
    this.physics.add.overlap(this.player, this.droppedItems, this.collectItem, undefined, this);
    
    // Player vs door
    this.physics.add.overlap(this.player, this.door, this.tryExitDungeon, undefined, this);
    
    // Player vs boss (if exists)
    if (this.boss) {
      this.physics.add.overlap(this.boss, this.bullets, this.hitBoss, undefined, this);
      if (walls) {
        this.physics.add.collider(this.boss, walls);
      }
    }
  }

  private createUI() {
    // Determine background color based on difficulty for the stats panel
    let statsBgColor = 0x2d4a22; // easy
    if (this.gameDifficulty === 'medium') statsBgColor = 0x8b7355;
    else if (this.gameDifficulty === 'hard') statsBgColor = 0x4a148c;

    // Add semi-transparent background behind stats for readability
    this.add.rectangle(10, 10, 220, 115, statsBgColor, 0.75).setOrigin(0, 0).setScrollFactor(0);

    // Health bar
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // Score and progress
    this.scoreText = this.add.text(20, 20, `Score: ${this.playerScore}`, {
      fontSize: '18px',
      fill: '#ffffff'
    });

    this.questionsText = this.add.text(20, 45, `Questions: ${this.levelCorrectAnswers}/4`, {
      fontSize: '16px',
      fill: '#ffff00'
    });

    this.dungeonText = this.add.text(20, 70, `Dungeon: ${this.currentDungeon}/${this.maxDungeons}`, {
      fontSize: '16px',
      fill: '#00ffff'
    });

    // Instructions
    this.add.text(this.scale.width / 2, 20, 'Answer all 4 questions to unlock the door!', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const controlsText = this.sys.game.device.os.desktop 
      ? 'WASD to move • SPACE/Click to shoot • Click chests for questions'
      : 'Left Side to move • Right Side to shoot • Tap chests for questions';

    this.add.text(this.scale.width / 2, 40, controlsText, {
      fontSize: '14px',
      fill: '#ffff88',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    if (this.currentDungeon === this.maxDungeons) {
      this.add.text(this.scale.width / 2, 60, 'Boss is invulnerable until all questions answered!', {
        fontSize: '14px',
        fill: '#ff4444',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    // Exit to Menu Button (Top Right)
    const exitBtnWidth = 160;
    const exitBtnHeight = 45;
    const exitBtnX = this.scale.width - exitBtnWidth / 2 - 20;
    const exitBtnY = 40;

    const exitBtnBg = this.add.rectangle(exitBtnX, exitBtnY, exitBtnWidth, exitBtnHeight, 0x4a2511)
      .setStrokeStyle(3, 0xd4af37) // Gold border for RPG theme
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(1000);

    const exitBtnText = this.add.text(exitBtnX, exitBtnY, 'Exit to Menu', {
      fontSize: '18px',
      fill: '#f4d03f', // Gold-ish text
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    exitBtnBg.on('pointerover', () => {
      exitBtnBg.setFillStyle(0x6b3619); // Brighter wood color on hover
      exitBtnText.setFill('#ffffff');
    });

    exitBtnBg.on('pointerout', () => {
      exitBtnBg.setFillStyle(0x4a2511);
      exitBtnText.setFill('#f4d03f');
    });

    exitBtnBg.on('pointerdown', () => {
      this.sound.stopAll();
      this.scene.start('MainMenuScene');
    });
  }

  private updateHealthBar() {
    this.healthBar.clear();
    
    // Background
    this.healthBar.fillStyle(0x444444);
    this.healthBar.fillRect(20, 95, 200, 20);
    
    // Health fill
    const healthPercent = this.playerHealth / this.playerMaxHealth;
    const color = healthPercent > 0.6 ? 0x00ff00 : healthPercent > 0.3 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(color);
    this.healthBar.fillRect(20, 95, 200 * healthPercent, 20);
    
    // Border
    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(20, 95, 200, 20);
  }

  update(time: number, delta: number) {
    if (this.isModalOpen) return;

    this.handlePlayerMovement();
    this.handleShooting();
    this.updateBullets(delta);
    
    if (time >= this.enemiesFrozenUntil) {
      this.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.update) enemy.update();
      });
      if (this.boss && this.boss.update) {
        this.boss.update();
      }
    } else {
      // Enforce 0 velocity while frozen just in case physics collisions try to bump them
      this.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.setVelocity) enemy.setVelocity(0, 0);
      });
      if (this.boss && this.boss.setVelocity) {
        this.boss.setVelocity(0, 0);
      }
    }

    if (this.playerShadow && !this.player.getData('isDead')) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 26);
    }

    // Check if player moved away from door
    if (this.door && this.player && this.isTouchingDoor) {
      if (!this.physics.overlap(this.player, this.door)) {
        this.isTouchingDoor = false;
      }
    }
  }

  private updateBullets(delta: number) {
    const allBullets = [
      ...(this.bullets ? this.bullets.children.entries : []),
      ...(this.enemyBullets ? this.enemyBullets.children.entries : [])
    ];

    allBullets.forEach((bullet: any) => {
      // Update bullet position using delta time like original code
      const born = bullet.getData('born') + delta;
      bullet.setData('born', born);
      
      const speedX = bullet.getData('speedX') || 0;
      const speedY = bullet.getData('speedY') || 0;
      
      // Apply velocity using delta time (corrected direction)
      bullet.body.setVelocityX(delta * speedX * 50);
      bullet.body.setVelocityY(delta * speedY * 50);
      
      // Remove bullet after lifetime expires (original used 1750ms)
      if (born > 1750) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();
      }
    });
  }

  private handlePlayerMovement() {
    if (this.player.getData('isDead')) return;

    const speed = 120; // Reduced from 160
    let isMoving = false;
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-speed);
      this.player.anims.play('walk-left', true);
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(speed);
      this.player.anims.play('walk-right', true);
      isMoving = true;
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setVelocityY(-speed);
      if (!isMoving) this.player.anims.play('walk-up', true);
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setVelocityY(speed);
      if (!isMoving) this.player.anims.play('walk-down', true);
      isMoving = true;
    } else {
      this.player.setVelocityY(0);
    }
    
    // Play idle animation when not moving
    if (!isMoving) {
      // Get current animation to determine which idle to play
      const currentAnim = this.player.anims.currentAnim;
      if (currentAnim) {
        if (currentAnim.key.includes('left')) {
          this.player.anims.play('idle-left');
        } else if (currentAnim.key.includes('right')) {
          this.player.anims.play('idle-right');
        } else if (currentAnim.key.includes('up')) {
          this.player.anims.play('idle-up');
        } else {
          this.player.anims.play('idle-down');
        }
      } else {
        this.player.anims.play('idle-down');
      }
    }
  }

  private handleShooting() {
    if (this.player.getData('isDead')) return;

    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.fireBullet();
    }
  }

  private fireBullet(targetX?: number, targetY?: number) {
    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
    bullet.setScale(0.4); // Reduced to 1/3 of original (1.2 / 3)
    bullet.setTint(0x88ccff); // Blue tint for magic effect
    
    // Use the exact touch coordinate if provided, otherwise fallback to the active pointer
    const pointer = this.input.activePointer;
    const mouseX = targetX !== undefined ? targetX : pointer.worldX;
    const mouseY = targetY !== undefined ? targetY : pointer.worldY;
    
    // Calculate direction from player to mouse click (like original code)
    const deltaX = mouseX - this.player.x;
    const deltaY = mouseY - this.player.y;
    
    // Normalize direction and set speed properties like original
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseSpeed = 0.375; // Increased by 25% (0.3 * 1.25)
    
    if (distance > 0) {
      bullet.setData('speedX', (deltaX / distance) * baseSpeed);
      bullet.setData('speedY', (deltaY / distance) * baseSpeed);
    } else {
      // Default direction if mouse is on player
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    
    bullet.setData('born', 0); // Track lifetime like original
    
    this.bullets.add(bullet);
    
    // Play shooting sound
    this.sound.play('spit', { volume: 0.3 });
    
    console.log('Bullet fired toward:', mouseX, mouseY, 'with speed:', bullet.getData('speedX'), bullet.getData('speedY'));
  }

  private openChest(chest: Phaser.Physics.Arcade.Sprite) {
    if (chest.getData('opened')) return;
    
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
    if (distance > 100) { // Increased from 80 to 100 to make clicking more forgiving
      this.showMessage('You are too far away to open this chest!');
      return;
    }

    const questionIndex = Number(chest.getData('questionIndex')) || 0;
    const validQuestions = getValidQuestions(questionsData);
    const question = this.dungeonQuestions[questionIndex] || validQuestions[questionIndex % validQuestions.length];

    if (!question || !Array.isArray(question.options) || question.options.length === 0) {
      this.showMessage('Question data is unavailable right now. Please try again.');
      return;
    }

    this.showQuestionModal(question, (isCorrect: boolean) => {
      if (isCorrect) {
        chest.setData('opened', true);
        chest.setTint(0x00ff00); // Green tint for opened
        this.levelCorrectAnswers++;
        this.correctAnswers++;
        this.playerScore += 100;
        
        this.sound.play('star', { volume: 0.5 });
        this.sound.play('star', { volume: 0.8 }); // Boosted volume for clearer feedback
        
        // Check if door should unlock
        if (this.levelCorrectAnswers >= 4) {
          this.unlockDoor();
        }
        
        // Play chest opening animation
        const openAnimKey = `open-${chest.texture.key}`;
        chest.anims.play(openAnimKey);
      } else {
        chest.setTint(0xff0000); // Red tint for wrong answer
        this.time.delayedCall(1000, () => {
          chest.clearTint();
        });
        
        if (this.gameDifficulty === 'hard') {
          this.player.setData('isInvulnerable', false); // Bypass i-frames to guarantee penalty
          this.hitPlayer(this.player, null, 10);
        }
      }
      
      this.questionsAnswered++;
      this.updateUI();
    });
  }

  private resetJoystick() {
    this.joystickActive = false;
    this.movePointer = null;
    if (this.joystickBase) this.joystickBase.setVisible(false);
    if (this.joystickThumb) this.joystickThumb.setVisible(false);
    if (this.moveVector) this.moveVector.set(0, 0);
  }

  private showQuestionModal(question: Question, callback: (isCorrect: boolean) => void) {
    this.isModalOpen = true;
    this.physics.pause();
    this.resetJoystick();

    const modalBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      Math.min(640, this.scale.width * 0.9),
      420,
      0x000000,
      0.85
    ).setScrollFactor(0).setDepth(1000);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 170,
      'Answer this question to open the chest',
      {
        fontSize: '18px',
        fill: '#ffd54a',
        align: 'center',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const questionText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 120,
      question.question,
      {
        fontSize: '22px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: Math.min(560, this.scale.width * 0.8) }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const buttons: Phaser.GameObjects.Text[] = [];

    question.options.forEach((option, index) => {
      const button = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 - 40 + index * 60,
        `${index + 1}. ${option}`,
        {
          fontSize: '18px',
          fill: '#7cff7c',
          backgroundColor: '#1f3d1f',
          padding: { x: 14, y: 8 }
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setInteractive();

      button.on('pointerover', () => button.setStyle({ fill: '#ffff66' }));
      button.on('pointerout', () => button.setStyle({ fill: '#7cff7c' }));
      button.on('pointerdown', () => {
        this.cleanupQuestionModal([modalBg, title, questionText, ...buttons]);
        callback(isCorrectAnswer(option, question.correctAnswer));
      });

      buttons.push(button);
    });

    const closeHint = this.add.text(
      this.scale.width / 2,
      this.scale.height - 50,
      'Choose an answer to continue',
      {
        fontSize: '14px',
        fill: '#bbbbbb',
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const modalElements = [modalBg, title, questionText, closeHint, ...buttons];

    this.input.keyboard!.once('keydown-ONE', () => this.answerFromKey(0, question, callback, modalElements));
    this.input.keyboard!.once('keydown-TWO', () => this.answerFromKey(1, question, callback, modalElements));
    this.input.keyboard!.once('keydown-THREE', () => this.answerFromKey(2, question, callback, modalElements));
    this.input.keyboard!.once('keydown-FOUR', () => this.answerFromKey(3, question, callback, modalElements));
  }

  private answerFromKey(index: number, question: Question, callback: (isCorrect: boolean) => void, modalElements: Phaser.GameObjects.GameObject[]) {
    this.cleanupQuestionModal(modalElements);
    callback(isCorrectAnswer(question.options[index], question.correctAnswer));
  }

  private cleanupQuestionModal(elements: Phaser.GameObjects.GameObject[]) {
    elements.forEach((element) => element.destroy());
    this.physics.resume();
    this.isModalOpen = false;
  }

  private unlockDoor() {
    this.doorUnlocked = true;
    
    // Play gate opening animation
    this.door.anims.play('openGate');
    this.sound.play('open_door', { volume: 0.5 });
    
    // Make boss vulnerable if final dungeon
    if (this.currentDungeon === this.maxDungeons && this.boss) {
      this.bossVulnerability = 100;
      this.boss.clearTint(); // Remove invulnerable tint
    }
  }

  private tryExitDungeon() {
    if (!this.doorUnlocked) {
      if (!this.isTouchingDoor) {
        this.sound.play('door_lock', { volume: 0.5 });
        this.showMessage('Door is locked! Answer all questions first.');
        this.isTouchingDoor = true;
      }
      return;
    }
    
    if (this.currentDungeon === this.maxDungeons) {
      if (this.boss && this.boss.getData('health') > 0) {
        this.showMessage('Defeat the boss to complete the game!');
        return;
      }
      
      // Game completed!
      this.sound.stopAll();
      this.sound.play('victory_theme', { volume: 0.5 });
      this.scene.start('GameOverScene', {
        victory: true,
        playerStats: {
          score: this.playerScore,
          health: this.playerHealth,
          questionsAnswered: this.questionsAnswered,
          correctAnswers: this.correctAnswers,
          difficulty: this.gameDifficulty,
          usedQuestionIds: this.usedQuestionIds
        }
      });
    } else {
      // Go to next dungeon
      this.sound.stopAll();
      this.scene.start('DungeonGameScene', {
        dungeon: this.currentDungeon + 1,
        health: this.playerHealth,
        score: this.playerScore,
        questionsAnswered: this.questionsAnswered,
        correctAnswers: this.correctAnswers,
        difficulty: this.gameDifficulty,
        usedQuestionIds: this.usedQuestionIds
      });
    }
  }

  private hitPlayer(player: any, enemy: any, damage?: number) {
    if (player.getData('isDead')) return;
    if (player.getData('isInvincible')) return; // Check for yellow crystal invincibility
    if (player.getData('isInvulnerable')) return;
    
    // Default to the provided damage, or extract it from the Enemy config, or fallback to 20
    let actualDamage = damage;
    if (actualDamage === undefined) {
      actualDamage = (enemy && enemy.config && enemy.config.damage) ? enemy.config.damage : 20;
    }
    
    player.setData('isInvulnerable', true);
    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
      if (player && player.active) {
        player.setData('isInvulnerable', false);
        if (!player.getData('isInvincible')) {
          player.clearTint();
        }
      }
    });

    this.playerHealth -= actualDamage;
    this.sound.play('hurt_male', { volume: 0.4 });
    
    // Only push player back if the physical enemy collision box exists
    if (enemy) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
      player.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100); // Reduced pushback
    }
    
    this.updateHealthBar();
    
    if (this.playerHealth <= 0) {
      if (this.playerShadow) this.playerShadow.destroy();
      this.playerHealth = 0;
      this.updateHealthBar();
      
      player.setData('isDead', true);
      player.body.enable = false;
      player.anims.stop();
      player.setTint(0xff0000);
      this.resetJoystick();
      
      this.tweens.add({
        targets: player,
        alpha: 0,
        angle: 90,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 1000,
        onComplete: () => this.gameOver()
      });
    }
  }

  private hitPlayerWithBullet(player: any, bullet: any) {
    const damage = bullet.getData('damage') || 20;
    bullet.destroy();
    this.hitPlayer(player, bullet, damage);
  }

  private hitEnemy(bullet: any, enemy: any) {
    if (enemy.getData('isDead')) return;
    bullet.destroy();
    enemy.takeDamage(25);
  }

  private hitBoss(boss: any, bullet: any) {
    if (boss.getData('isDead')) return;
    bullet.destroy();
    
    if (this.bossVulnerability < 100) {
      this.showMessage('Boss is invulnerable! Answer all questions first!');
      return;
    }
    
    boss.takeDamage(50);
    if (boss.isDead) {
      this.boss = undefined;
      this.showMessage('Boss defeated! Proceed to exit!');
    }
  }

  private showMessage(message: string) {
    const messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }

  private gameOver() {
    this.sound.stopAll();
    this.sound.play('gameover_theme', { volume: 0.5 });
    this.scene.start('GameOverScene', {
      victory: false,
      playerStats: {
        score: this.playerScore,
        health: 0,
        questionsAnswered: this.questionsAnswered,
        correctAnswers: this.correctAnswers,
        difficulty: this.gameDifficulty,
        usedQuestionIds: this.usedQuestionIds
      }
    });
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.playerScore}`);
    this.questionsText.setText(`Questions: ${this.levelCorrectAnswers}/4`);
  }

  private handleEnemyDefeated(enemyType: string, x: number, y: number) {
    if (enemyType === 'bat') {
      let dropChance = 0;
      if (this.gameDifficulty === 'easy') dropChance = 0.6;
      else if (this.gameDifficulty === 'medium') dropChance = 0.5;
      else if (this.gameDifficulty === 'hard') dropChance = 0.3;

      if (Math.random() < dropChance) {
        const crystal = this.physics.add.sprite(x, y, 'greencrystal');
        crystal.anims.play('spin-greencrystal');
        crystal.setScale(0.8);
        crystal.setDepth(4);
        this.droppedItems.add(crystal);
      }
    }
    else if (enemyType === 'zombie2' && this.currentDungeon === 5) {
      if (Math.random() < 0.50) {
        const crystal = this.physics.add.sprite(x, y, 'bluecrystal');
        crystal.anims.play('spin-bluecrystal');
        crystal.setScale(0.8);
        crystal.setDepth(4);
        this.droppedItems.add(crystal);
      }
    }
    else if ((enemyType === 'zombie' && (this.currentDungeon === 4 || this.currentDungeon === 5)) || 
             (enemyType === 'zombie2' && this.currentDungeon === 4)) {
      if (Math.random() < 0.20) {
        const crystal = this.physics.add.sprite(x, y, 'redcrystal');
        crystal.anims.play('spin-redcrystal');
        crystal.setScale(0.8);
        crystal.setDepth(4);
        this.droppedItems.add(crystal);
      }
    }
    else if (enemyType === 'spider' && this.currentDungeon === 5 && this.gameDifficulty === 'hard') {
      if (Math.random() < (1 / 3)) {
        const crystal = this.physics.add.sprite(x, y, 'yellowcrystal');
        crystal.anims.play('spin-yellowcrystal');
        crystal.setScale(0.8);
        crystal.setDepth(4);
        this.droppedItems.add(crystal);
      }
    }
  }

  private collectItem(player: any, item: any) {
    const isRedCrystal = item.texture.key === 'redcrystal';
    const isBlueCrystal = item.texture.key === 'bluecrystal';
    const isYellowCrystal = item.texture.key === 'yellowcrystal';
    item.destroy();
    
    if (isYellowCrystal) {
      this.player.setData('isInvincible', true);
      this.player.setTint(0xffff33); // 80% yellow tint
      
      this.sound.play('star', { volume: 0.5 });
      
      const invulnText = this.add.text(this.player.x, this.player.y - 30, 'INVINCIBLE!', {
        fontSize: '16px', fill: '#ffff33', fontFamily: 'Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      
      this.tweens.add({
        targets: invulnText, y: invulnText.y - 30, alpha: 0, duration: 1000, onComplete: () => invulnText.destroy()
      });

      // Flicker effect starting at 4 seconds
      this.time.delayedCall(4000, () => {
        let blinkCount = 0;
        this.time.addEvent({
          delay: 100,
          repeat: 9, // 10 times total = 1000ms
          callback: () => {
            if (this.player.getData('isDead')) return;
            blinkCount++;
            if (blinkCount % 2 === 0) {
              this.player.setTint(0xffff33);
            } else {
              this.player.clearTint();
            }
          }
        });
      });

      // Remove invincibility at exactly 5 seconds
      this.time.delayedCall(5000, () => {
        if (!this.player.getData('isDead')) {
          this.player.setData('isInvincible', false);
          this.player.clearTint();
        }
      });
      return;
    }

    if (isBlueCrystal) {
      this.enemiesFrozenUntil = this.time.now + 3000;
      
      this.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.setVelocity) enemy.setVelocity(0, 0);
        if (enemy.anims) enemy.anims.stop();
      });
      if (this.boss) {
        this.boss.setVelocity(0, 0);
        this.boss.anims.stop();
      }
      
      this.sound.play('star', { volume: 0.5 });
      
      const freezeText = this.add.text(this.player.x, this.player.y - 30, 'TIME FREEZE!', {
        fontSize: '16px', fill: '#00ffff', fontFamily: 'Arial', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      
      this.tweens.add({
        targets: freezeText, y: freezeText.y - 30, alpha: 0, duration: 1000, onComplete: () => freezeText.destroy()
      });
      return;
    }

    if (isRedCrystal) {
      this.playerHealth = this.playerMaxHealth;
    } else {
      this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 10);
    }
    this.updateHealthBar();
    
    this.sound.play('star', { volume: 0.5 });
    
    // Floating text feedback
    const textStr = isRedCrystal ? 'MAX HP!' : '+10 HP';
    const textColor = isRedCrystal ? '#ff4444' : '#00ff00';
    const healText = this.add.text(this.player.x, this.player.y - 30, textStr, {
      fontSize: '16px',
      fill: textColor,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    this.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => healText.destroy()
    });
  }

}
import * as Phaser from 'phaser';
import { QUESTIONS } from '../data/Questions';

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
const getValidQuestions = (): Question[] => {
  let questionsArray = QUESTIONS;
  if (!Array.isArray(QUESTIONS)) {
    if (QUESTIONS && typeof QUESTIONS === 'object') {
      questionsArray = Object.values(QUESTIONS);
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
  private door!: Phaser.Physics.Arcade.Sprite;
  private boss?: Phaser.Physics.Arcade.Sprite;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shootKey!: Phaser.Input.Keyboard.Key;

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
  }

  preload() {
    // Load sprites using your original specifications
    this.load.spritesheet('player', '/assets/sprites/mageHero.png', { frameWidth: 32, frameHeight: 48, endFrame: 15 });
    this.load.spritesheet('skeleton', '/assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', '/assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', '/assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('spider', '/assets/sprites/spider2.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', '/assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', '/assets/sprites/rpg_gate5.png', { frameWidth: 145, frameHeight: 96, endFrame: 15 });
    this.load.spritesheet('redcrystal', '/assets/sprites/crystal-qubodup-ccby3-32-red.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('bluecrystal', '/assets/sprites/crystal-qubodup-ccby3-32-blue.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('greencrystal', '/assets/sprites/crystal-qubodup-ccby3-32-green.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('yellowcrystal', '/assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('chestRed', '/assets/sprites/chestRed_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestBlue', '/assets/sprites/chestBlue_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestGreen', '/assets/sprites/chestGreen_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestYellow', '/assets/sprites/chestYellow_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    
    // Load other sprites
    this.load.image('bullet', '/assets/sprites/bullet.png');
    this.load.image('door', '/assets/sprites/gameDoor1.png');
    
    // Load audio files
    this.load.audio('enchanted_forest', ['/assets/audio/enchanted_forest.mp3', '/assets/audio/enchanted_forest_loop.ogg']);
    this.load.audio('boss_battle', ['/assets/audio/BoxCat_Games_-_05_-_Battle_Boss.mp3', '/assets/audio/BoxCat_Games_-_05_-_Battle_Boss.ogg']);
    this.load.audio('spit', ['/assets/audio/spit.mp3', '/assets/audio/spit.ogg']);
    this.load.audio('star', ['/assets/audio/star.mp3', '/assets/audio/star.ogg']);
    this.load.audio('hurt', ['/assets/audio/hurt.mp3', '/assets/audio/hurt.ogg']);
    this.load.audio('enemy-death', ['/assets/audio/enemy-death.mp3', '/assets/audio/enemy-death.ogg']);
    
    this.load.on('filecomplete', (key: string) => {
      console.log('Asset loaded:', key);
    });
    
    this.load.on('loaderror', (file: any) => {
      console.warn('Asset failed to load:', file.key, file.src);
    });
  }



  create() {
    const { width, height } = this.scale;

    // Determine ground color based on difficulty
    let groundColor = 0x2d4a22; // easy (green)
    if (this.gameDifficulty === 'medium') {
      groundColor = 0xc3b091; // medium (khaki)
    } else if (this.gameDifficulty === 'hard') {
      groundColor = 0x4a148c; // hard (purple)
    }

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, groundColor);

    this.generateDungeonQuestions();

    // Create player with animated spritesheet
    this.player = this.physics.add.sprite(100, height / 2, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.125); // Increased by 25% from 0.9
    
    // Create player animations
    this.createPlayerAnimations();

    // Create physics groups
    this.enemies = this.physics.add.group();
    this.chests = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

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

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.createUI();

    // Start background music
    this.sound.stopAll();
    if (this.currentDungeon === this.maxDungeons) {
      this.sound.play('boss_battle', { volume: 0.3, loop: true });
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
    const wallColor = 0x8b4513;

    // Create walls group for collision
    const walls = this.physics.add.staticGroup();

    // Top wall
    const topWall = this.add.rectangle(width / 2, wallThickness / 2, width, wallThickness, wallColor);
    walls.add(topWall);

    // Bottom wall
    const bottomWall = this.add.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, wallColor);
    walls.add(bottomWall);

    // Left wall
    const leftWall = this.add.rectangle(wallThickness / 2, height / 2, wallThickness, height, wallColor);
    walls.add(leftWall);

    // Right wall (with gap for door)
    const rightWallTop = this.add.rectangle(width - wallThickness / 2, height / 4, wallThickness, height / 2, wallColor);
    const rightWallBottom = this.add.rectangle(width - wallThickness / 2, height * 3/4, wallThickness, height / 2, wallColor);
    walls.add(rightWallTop);
    walls.add(rightWallBottom);

    // Store walls for collision detection
    this.registry.set('walls', walls);
  }

  private createRandomObstacles() {
    const walls = this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup;
    const wallColor = 0x8b4513;
    const numObstacles = Phaser.Math.Between(3 + this.currentDungeon, 5 + this.currentDungeon);

    for (let i = 0; i < numObstacles; i++) {
      const w = Phaser.Math.Between(1, 3) * 32;
      const h = Phaser.Math.Between(1, 3) * 32;
      const pos = this.getValidSpawnPosition(w, h, true);
      
      if (pos) {
        const obstacle = this.add.rectangle(pos.x, pos.y, w, h, wallColor);
        walls.add(obstacle);
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
    
    // Give player some breathing room so they aren't trapped on spawn
    Phaser.Geom.Rectangle.Inflate(playerBounds, 64, 64);
    
    const padding = isObstacle ? playerHeight * 2 : 16;
    const checkRect = new Phaser.Geom.Rectangle(0, 0, w + padding, h + padding);
    const doorBounds = this.door ? this.door.getBounds() : new Phaser.Geom.Rectangle(0, 0, 0, 0);
    const bossBounds = new Phaser.Geom.Rectangle(this.scale.width / 2 - 80, this.scale.height / 2 - 80, 160, 160);

    let attempts = 0;
    while (!valid && attempts < 100) {
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
        if (this.door && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, doorBounds)) {
            valid = false;
            continue;
        }
        if (this.currentDungeon === this.maxDungeons && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, bossBounds)) {
            valid = false;
            continue;
        }

        const allObstacles = [...walls, ...chests, ...enemies];
        for (const obstacle of allObstacles) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(checkRect, (obstacle as any).getBounds())) {
                valid = false;
                break;
            }
        }
    }
    return valid ? { x, y } : null;
  }

  private createEnemies() {
    const enemyCount = Math.min(2 + this.currentDungeon, 6);
    
    // Adjust enemy pool based on difficulty
    let enemyTypes = ['skeleton', 'chiroptera'];
    if (this.gameDifficulty === 'medium') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider'];
    } else if (this.gameDifficulty === 'hard') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider', 'zombie', 'zombie2'];
    }

    for (let i = 0; i < enemyCount; i++) {
      const pos = this.getValidSpawnPosition();
      if (!pos) continue;
      const { x, y } = pos;
      const enemyType = enemyTypes[i % enemyTypes.length];
      
      // Use proper enemy sprites with correct mapping
      const spriteMap: { [key: string]: string } = {
        'skeleton': 'skeleton',
        'zombie': 'zombie',
        'zombie2': 'zombie',
        'chiroptera': 'bat',
        'spider': 'spider'
      };
      
      const spriteKey = spriteMap[enemyType] || 'skeleton';
      const enemy = this.physics.add.sprite(x, y, spriteKey, 0);
      enemy.setScale(1.0); // Normal scale since sprites are properly sized
      
      let hp = 50 + this.currentDungeon * 10;
      if (enemyType === 'zombie') {
        hp *= 3; // Zombies are 3x tougher in Hard mode
      } else if (enemyType === 'zombie2') {
        hp *= 2; // Zombie2 is 2x tougher
      }
      enemy.setData('health', hp);
      enemy.setData('maxHealth', hp);
      enemy.setData('type', enemyType);
      enemy.setData('wanderTimer', 0);
      
      // Create directional walking animations for enemies using original specifications
      if (enemyType === 'skeleton') {
        if (!this.anims.exists('walkUpSkeleton')) {
          this.anims.create({
            key: 'walkUpSkeleton',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 104, end: 112 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkDownSkeleton',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 130, end: 137 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkLeftSkeleton',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 117, end: 125 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkRightSkeleton',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 143, end: 151 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'skeletonDie',
            frames: this.anims.generateFrameNumbers('skeleton', { start: 260, end: 265 }),
            frameRate: 8,
            repeat: 0
          });
        }
        enemy.anims.play('walkDownSkeleton'); // Default
      } else if (enemyType === 'zombie') {
        if (!this.anims.exists('walkUpZombie')) {
          this.anims.create({
            key: 'walkUpZombie',
            frames: this.anims.generateFrameNumbers('zombie', { start: 42, end: 44 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkDownZombie',
            frames: this.anims.generateFrameNumbers('zombie', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkLeftZombie',
            frames: this.anims.generateFrameNumbers('zombie', { start: 18, end: 20 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkRightZombie',
            frames: this.anims.generateFrameNumbers('zombie', { start: 30, end: 32 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'zombieDie',
            frames: this.anims.generateFrameNumbers('zombie', { start: 48, end: 53 }),
            frameRate: 8,
            repeat: 0
          });
        }
        enemy.anims.play('walkDownZombie'); // Default
      } else if (enemyType === 'zombie2') {
        if (!this.anims.exists('walkUpZombie2')) {
          this.anims.create({
            key: 'walkUpZombie2',
            frames: this.anims.generateFrameNumbers('zombie', { start: 36, end: 41 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkDownZombie2',
            frames: this.anims.generateFrameNumbers('zombie', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkLeftZombie2',
            frames: this.anims.generateFrameNumbers('zombie', { start: 12, end: 17 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'walkRightZombie2',
            frames: this.anims.generateFrameNumbers('zombie', { start: 24, end: 29 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'zombie2Die',
            frames: this.anims.generateFrameNumbers('zombie', { start: 48, end: 53 }),
            frameRate: 8,
            repeat: 0
          });
        }
        enemy.anims.play('walkDownZombie2'); // Default
      } else if (enemyType === 'chiroptera') {
        if (!this.anims.exists('flyLeft')) {
          this.anims.create({
            key: 'flyLeft',
            frames: this.anims.generateFrameNumbers('bat', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'flyRight',
            frames: this.anims.generateFrameNumbers('bat', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
          });
        }
        enemy.anims.play('flyLeft'); // Default
      } else if (enemyType === 'spider') {
        if (!this.anims.exists('walkSpider') && this.textures.exists('spider')) {
          this.anims.create({
            key: 'walkSpider',
            frames: this.anims.generateFrameNumbers('spider', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'attackSpider',
            frames: this.anims.generateFrameNumbers('spider', { start: 13, end: 16 }),
            frameRate: 8,
            repeat: -1
          });
          this.anims.create({
            key: 'spiderDie',
            frames: this.anims.generateFrameNumbers('spider', { start: 51, end: 54 }),
            frameRate: 8,
            repeat: 0
          });
        }
        if (this.anims.exists('walkSpider')) {
          enemy.anims.play('walkSpider'); // Default
        }
      }
      
      this.enemies.add(enemy);
    }
  }

  private generateDungeonQuestions(): void {
    const validQuestions = getValidQuestions();
    const pool = validQuestions.filter((question) => {
      if (this.gameDifficulty === 'hard') {
        return question.difficulty >= 4;
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
      chest.setInteractive();
      
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
  }

  private createBoss() {
    if (this.currentDungeon === this.maxDungeons) {
      this.boss = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'Boss', 0);
      this.boss.setScale(1.5); // Proper scale for boss
      const bossHp = 5 * (50 + this.currentDungeon * 10);
      this.boss.setData('health', bossHp);
      this.boss.setData('maxHealth', bossHp);
      this.boss.setTint(0x8888ff); // Blue tint when invulnerable
      
      // Create boss animations using original specifications
      if (!this.anims.exists('walkDownOrc')) {
        this.anims.create({
          key: 'walkDownOrc',
          frames: this.anims.generateFrameNumbers('Boss', { start: 130, end: 137 }),
          frameRate: 8,
          repeat: -1
        });
        this.anims.create({
          key: 'walkUpOrc',
          frames: this.anims.generateFrameNumbers('Boss', { start: 104, end: 112 }),
          frameRate: 8,
          repeat: -1
        });
        this.anims.create({
          key: 'walkLeftOrc',
          frames: this.anims.generateFrameNumbers('Boss', { start: 117, end: 125 }),
          frameRate: 8,
          repeat: -1
        });
        this.anims.create({
          key: 'walkRightOrc',
          frames: this.anims.generateFrameNumbers('Boss', { start: 143, end: 151 }),
          frameRate: 8,
          repeat: -1
        });
        this.anims.create({
          key: 'attackDownOrc',
          frames: this.anims.generateFrameNumbers('Boss', { start: 78, end: 84 }),
          frameRate: 8,
          repeat: -1
        });
        this.anims.create({
          key: 'OrcDie',
          frames: this.anims.generateFrameNumbers('Boss', { start: 260, end: 265 }),
          frameRate: 8,
          repeat: 0
        });
      }
      this.boss.anims.play('walkDownOrc');

      // Add animation event listeners to trigger damage only on attack cycles
      this.boss.on('animationstart', this.onBossAttackFrame, this);
      this.boss.on('animationrepeat', this.onBossAttackFrame, this);
    }
  }

  private onBossAttackFrame(anim: Phaser.Animations.Animation) {
    if (anim.key.startsWith('attack') && this.boss && !this.boss.getData('isDead')) {
      const now = this.time.now;
      const lastAttack = this.boss.getData('lastAttackTime') || 0;
      
      // Enforce an 850ms cooldown (animation cycle is 875ms) so the boss 
      // waits for the animation to finish before it can trigger damage again
      if (now - lastAttack < 850) {
        return;
      }
      this.boss.setData('lastAttackTime', now);

      const dist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
      const attackRange = this.bossVulnerability < 100 ? 100 : 50;
      
      if (dist <= attackRange + 15) {
        this.player.setData('isInvulnerable', false); // Bypass normal invulnerability so every cycle hits
        this.hitPlayer(this.player, this.boss);
      }
    }
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.shootKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
      });
    }
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    
    // Player vs enemy bullets
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayerWithBullet, undefined, this);
    
    // Bullets vs enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    
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

    this.add.text(this.scale.width / 2, 40, 'WASD to move • SPACE to shoot • Click chests for questions', {
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
    this.updateEnemies();
    
    if (this.boss) {
      this.updateBoss();
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
      
      const speedX = bullet.getData('speedX');
      const speedY = bullet.getData('speedY');
      
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

  private fireBullet() {
    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
    bullet.setScale(0.4); // Reduced to 1/3 of original (1.2 / 3)
    bullet.setTint(0x88ccff); // Blue tint for magic effect
    
    // Get mouse click position (using downX/downY like original)
    const pointer = this.input.activePointer;
    const mouseX = pointer.worldX;
    const mouseY = pointer.worldY;
    
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

  private updateEnemies() {
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.getData('isDead')) return;

      const distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      let baseSpeed = 25 + this.currentDungeon * 5;
      const enemyType = enemy.getData('type');
      
      if (enemyType === 'zombie2') {
        baseSpeed *= 1.5; // Move 50% faster
      }

      // AI: Chase player if close, otherwise wander
      if (distanceToPlayer < 200) {
        if (enemyType === 'chiroptera' || enemyType === 'spider') {
          // Bat/Spider behavior: maintain distance and shoot
          if (distanceToPlayer > 120) {
            this.physics.moveToObject(enemy, this.player, baseSpeed);
          } else {
            enemy.setVelocity(0, 0);
          }
          
          const activeBullet = enemy.getData('activeBullet');
          if (!activeBullet || !activeBullet.active) {
            this.fireEnemyBullet(enemy, this.player);
          }
        } else {
          if (distanceToPlayer > 32) {
            this.physics.moveToObject(enemy, this.player, baseSpeed);
          } else {
            enemy.setVelocity(0, 0);
          }
        }
      } else {
        // Wander
        let wanderTimer = enemy.getData('wanderTimer') || 0;
        if (this.time.now > wanderTimer) {
          const wanderAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const wanderSpeed = baseSpeed * 0.5; // Wander slower
          enemy.setVelocity(Math.cos(wanderAngle) * wanderSpeed, Math.sin(wanderAngle) * wanderSpeed);
          enemy.setData('wanderTimer', this.time.now + Phaser.Math.Between(2000, 4000));
        }
      }

      // Update animation based on velocity
      const velocity = enemy.body.velocity;

      if (Math.abs(velocity.x) < 1 && Math.abs(velocity.y) < 1) {
        if (enemyType === 'spider' && distanceToPlayer <= 120 && this.anims.exists('attackSpider')) {
          enemy.anims.play('attackSpider', true);
        } else {
          enemy.anims.stop();
        }
      } else if (enemyType === 'skeleton' || enemyType === 'zombie' || enemyType === 'zombie2') {
        const animSuffix = enemyType === 'skeleton' ? 'Skeleton' : (enemyType === 'zombie' ? 'Zombie' : 'Zombie2');
        if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
          enemy.anims.play(velocity.x > 0 ? `walkRight${animSuffix}` : `walkLeft${animSuffix}`, true);
        } else {
          enemy.anims.play(velocity.y > 0 ? `walkDown${animSuffix}` : `walkUp${animSuffix}`, true);
        }
      } else if (enemyType === 'chiroptera') {
        enemy.anims.play(velocity.x > 0 ? 'flyRight' : 'flyLeft', true);
      } else if (enemyType === 'spider') {
        if (this.anims.exists('walkSpider')) {
          enemy.anims.play('walkSpider', true);
        }
      }
    });
  }

  private updateBoss() {
    if (!this.boss || this.boss.getData('isDead')) return;
    
    // Boss behavior based on vulnerability (slower overall)
    const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    const deltaX = this.player.x - this.boss.x;
    const deltaY = this.player.y - this.boss.y;
    
    if (this.bossVulnerability < 100) {
      // Invulnerable: very slow movement
      if (distance > 100) {
        this.physics.moveToObject(this.boss, this.player, 18.75); // Increased from 15 (+25%)
        
        // Update boss animation based on movement direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Moving horizontally
          if (deltaX > 0) {
            this.boss.anims.play('walkRightOrc', true);
          } else {
            this.boss.anims.play('walkLeftOrc', true);
          }
        } else {
          // Moving vertically
          if (deltaY > 0) {
            this.boss.anims.play('walkDownOrc', true);
          } else {
            this.boss.anims.play('walkUpOrc', true);
          }
        }
      } else {
        this.boss.setVelocity(0, 0); // Stop if close
        this.boss.anims.play('attackDownOrc', true); // Attack animation when close
      }
    } else {
      // Vulnerable: moderate movement
      if (distance > 50) {
        this.physics.moveToObject(this.boss, this.player, 50); // Increased from 40 (+25%)
        
        // Update boss animation based on movement direction
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Moving horizontally
          if (deltaX > 0) {
            this.boss.anims.play('walkRightOrc', true);
          } else {
            this.boss.anims.play('walkLeftOrc', true);
          }
        } else {
          // Moving vertically
          if (deltaY > 0) {
            this.boss.anims.play('walkDownOrc', true);
          } else {
            this.boss.anims.play('walkUpOrc', true);
          }
        }
      } else {
        this.boss.setVelocity(0, 0);
        this.boss.anims.play('attackDownOrc', true); // Attack animation when close
      }
    }
  }

  private openChest(chest: Phaser.Physics.Arcade.Sprite) {
    if (chest.getData('opened')) return;
    
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
    if (distance > 80) {
      this.showMessage('You are too far away to open this chest!');
      return;
    }

    const questionIndex = Number(chest.getData('questionIndex')) || 0;
    const validQuestions = getValidQuestions();
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
      }
      
      this.questionsAnswered++;
      this.updateUI();
    });
  }

  private showQuestionModal(question: Question, callback: (isCorrect: boolean) => void) {
    this.isModalOpen = true;
    this.physics.pause();

    const modalBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      640,
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
        wordWrap: { width: 560 }
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
      this.scale.height / 2 + 180,
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
    
    // Make boss vulnerable if final dungeon
    if (this.currentDungeon === this.maxDungeons && this.boss) {
      this.bossVulnerability = 100;
      this.boss.clearTint(); // Remove invulnerable tint
    }
  }

  private tryExitDungeon() {
    if (!this.doorUnlocked) {
      this.showMessage('Door is locked! Answer all questions first.');
      return;
    }
    
    if (this.currentDungeon === this.maxDungeons) {
      if (this.boss && this.boss.getData('health') > 0) {
        this.showMessage('Defeat the boss to complete the game!');
        return;
      }
      
      // Game completed!
      this.sound.stopAll();
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

  private hitPlayer(player: any, enemy: any) {
    if (player.getData('isDead')) return;
    if (player.getData('isInvulnerable')) return;
    
    player.setData('isInvulnerable', true);
    player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
      if (player && player.active) {
        player.setData('isInvulnerable', false);
        player.clearTint();
      }
    });

    this.playerHealth -= 20;
    this.sound.play('hurt', { volume: 0.4 });
    
    // Push player back (less force)
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100); // Reduced pushback
    
    this.updateHealthBar();
    
    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.updateHealthBar();
      
      player.setData('isDead', true);
      player.body.enable = false;
      player.anims.stop();
      player.setTint(0xff0000);
      
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
    bullet.destroy();
    this.hitPlayer(player, bullet);
  }

  private hitEnemy(bullet: any, enemy: any) {
    if (enemy.getData('isDead')) return;
    bullet.destroy();
    
    const health = enemy.getData('health') - 25;
    enemy.setData('health', health);
    
    if (health <= 0) {
      enemy.setData('isDead', true);
      enemy.body.enable = false;
      
      this.sound.play('enemy-death', { volume: 0.3 });
      this.playerScore += 50;
      this.updateUI();
      
      const enemyType = enemy.getData('type');
      if (enemyType === 'skeleton' && this.anims.exists('skeletonDie')) {
        enemy.anims.play('skeletonDie');
        enemy.once('animationcomplete', () => enemy.destroy());
      } else if (enemyType === 'zombie' && this.anims.exists('zombieDie')) {
        enemy.anims.play('zombieDie');
        enemy.once('animationcomplete', () => enemy.destroy());
      } else if (enemyType === 'zombie2' && this.anims.exists('zombie2Die')) {
        enemy.anims.play('zombie2Die');
        enemy.once('animationcomplete', () => enemy.destroy());
      } else if (enemyType === 'spider' && this.anims.exists('spiderDie')) {
        enemy.anims.play('spiderDie');
        enemy.once('animationcomplete', () => enemy.destroy());
      } else {
        enemy.anims.stop();
        enemy.setTint(0xff0000);
        this.tweens.add({
          targets: enemy,
          alpha: 0,
          angle: 90,
          scaleX: 0.5,
          scaleY: 0.5,
          duration: 500,
          onComplete: () => enemy.destroy()
        });
      }
    } else {
      // Flash red when hit
      enemy.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        enemy.clearTint();
      });
    }
  }

  private hitBoss(boss: any, bullet: any) {
    if (boss.getData('isDead')) return;
    bullet.destroy();
    
    if (this.bossVulnerability < 100) {
      this.showMessage('Boss is invulnerable! Answer all questions first!');
      return;
    }
    
    const damage = 50;
    
    const health = boss.getData('health') - damage;
    boss.setData('health', health);
    
    if (health <= 0) {
      boss.setData('isDead', true);
      boss.body.enable = false;
      boss.clearTint();
      
      boss.anims.play('OrcDie');
      boss.once('animationcomplete', () => {
        this.boss = undefined;
        boss.destroy();
      this.playerScore += 500;
      this.showMessage('Boss defeated! Proceed to exit!');
      });
    } else {
      boss.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (boss && boss.active) boss.clearTint();
      });
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

  private fireEnemyBullet(enemy: any, target: any) {
    const bullet = this.physics.add.sprite(enemy.x, enemy.y, 'bullet');
    bullet.setScale(0.4); 
    if (enemy.getData('type') === 'spider') {
      bullet.setTint(0xffffff); // White tint for spider projectile
    } else {
      bullet.setTint(0xff4444); // Red tint for bat magic effect
    }
    
    const deltaX = target.x - enemy.x;
    const deltaY = target.y - enemy.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseSpeed = 0.25; 
    
    if (distance > 0) {
      bullet.setData('speedX', (deltaX / distance) * baseSpeed);
      bullet.setData('speedY', (deltaY / distance) * baseSpeed);
    } else {
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    
    bullet.setData('born', 0); 
    
    this.enemyBullets.add(bullet);
    enemy.setData('activeBullet', bullet);
    
    this.sound.play('spit', { volume: 0.3 });
  }

  private gameOver() {
    this.sound.stopAll();
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


}
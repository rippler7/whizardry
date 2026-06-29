import * as Phaser from 'phaser';
import { Enemy, Skeleton, Zombie, Zombie2, Bat, Spider, Boss } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { ITEM_DATA } from '../data/ItemData.ts';
import questionsData from '../entities/questions.json';
import { FlowField } from '../entities/FlowField';
import * as easystarjs from 'easystarjs';

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
  
  if (rawData && rawData.error) {
    questionsArray = [];
  } else if (!Array.isArray(rawData)) {
    if (rawData && typeof rawData === 'object') {
      questionsArray = Object.values(rawData);
      if (questionsArray.length > 0 && typeof questionsArray[0] === 'string') {
        questionsArray = [];
      }
    } else {
      questionsArray = [];
    }
  }
  
  if (!questionsArray || questionsArray.length === 0) {
    return DEFAULT_QUESTIONS;
  }
  
  return questionsArray.map((q: any, i: number) => {
    let options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    
    if (typeof q.options === 'string') {
      try { q.options = JSON.parse(q.options); } catch (e) {}
    }
    
    if (Array.isArray(q.options)) options = q.options;
    else if (Array.isArray(q.choices)) options = q.choices;
    else if (Array.isArray(q.answers)) options = q.answers;
    else if (Array.isArray(q.a)) options = q.a;

    const normalizedOptions = options.map((option: unknown) => String(option ?? '').trim());
    const rawCorrectAnswer = q.correct_answer ?? q.correctAnswer ?? q.correct ?? q.answer ?? q.answerText ?? normalizedOptions[0];
    const correctedAnswer = typeof rawCorrectAnswer === 'number' && Number.isInteger(rawCorrectAnswer)
      ? normalizedOptions[rawCorrectAnswer] ?? normalizedOptions[0]
      : String(rawCorrectAnswer ?? normalizedOptions[0] ?? '');

    // --- Shuffle the options array ---
    const shuffledOptions = [...normalizedOptions];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    // Ensure the correct answer is still present in the shuffled array. If not, something is wrong.
    if (!shuffledOptions.some(opt => normalizeAnswerText(opt) === normalizeAnswerText(correctedAnswer))) {
      shuffledOptions[0] = correctedAnswer; // Failsafe
    }

    return {
      id: q.id || i,
      question: q.question || q.q || "Missing Question?",
      options: shuffledOptions,
      correctAnswer: correctedAnswer,
      category: q.category || "General",
      difficulty: parseInt(q.difficulty, 10) || 1
    };
  });
};

export class DungeonGameScene extends Phaser.Scene {
  // Game objects
  private player!: Player;
  private enemies!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private droppedItems!: Phaser.Physics.Arcade.Group;
  private door!: Phaser.Physics.Arcade.Sprite;
  public boss?: Boss;
  public flowField!: FlowField;
  public easystar!: any;
  public easystarFlying!: any;

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
  private initialPlayerStats: any = {};
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
  
  private modalOpenTimestamp: number = 0;
  private statsBg!: Phaser.GameObjects.Graphics;
  private statsBgWidth: number = 460;
  private statsBgColor: number = 0x1c1917;
  private statsArrow!: Phaser.GameObjects.Text;
  private isStatsExpanded: boolean = false;
  private isOrangeCrystalActive: boolean = false;
  private orangeEffectEndTime: number = 0;
  private guaranteedZombieDropReady: boolean = false;
  private guaranteedZombie2DropReady: boolean = false;
  private guaranteedSpiderDropReady: boolean = false;
  private yellowEffectEndTime: number = 0;
  private activeEffects: { type: string, endTime: number, textObj: Phaser.GameObjects.Text, color: string }[] = [];
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

    // Bind event handlers to 'this' context to ensure they are valid listeners
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerOut = this.handlePointerOut.bind(this);
    this.handleBushWiggle = this.handleBushWiggle.bind(this);
  }

  init(data: any) {
    this.currentDungeon = data.dungeon || 1;
    this.gameDifficulty = data.difficulty || 'easy';
    this.usedQuestionIds = data.usedQuestionIds || [];
    
    this.initialPlayerStats = {
      health: data.health || 100,
      maxHealth: data.maxHealth || 100,
      level: data.level || 1,
      experience: data.experience || 0,
      baseDamage: data.baseDamage || 25,
      score: data.score || 0,
      questionsAnswered: data.questionsAnswered || 0,
      correctAnswers: data.correctAnswers || 0,
      enemiesKilled: data.enemiesKilled || 0,
      inventory: data.inventory || []
    };

    // Reset per-level state for when the scene restarts
    this.levelCorrectAnswers = 0;
    this.doorUnlocked = false;
    this.isModalOpen = false;
    this.bossVulnerability = 0;
    this.boss = undefined;
    this.isTouchingDoor = false;
    this.enemiesFrozenUntil = 0;
    this.modalOpenTimestamp = 0;
    this.isStatsExpanded = false;
    this.statsBgWidth = 460;
    this.activeEffects = [];
    this.yellowEffectEndTime = 0;
    this.isOrangeCrystalActive = false;
    this.orangeEffectEndTime = 0;
    this.resetJoystick();
    this.guaranteedZombieDropReady = this.currentDungeon >= 4;
    this.guaranteedZombie2DropReady = this.currentDungeon >= 4;
    this.guaranteedSpiderDropReady = this.currentDungeon >= 4;
  }

  shutdown() {
    // Clean up global event listeners to prevent memory leaks when the scene is restarted
    this.input.off('pointerdown', this.handlePointerDown);
    this.input.off('pointermove', this.handlePointerMove);
    this.input.off('pointerup', this.handlePointerUp);
    this.input.off('pointerout', this.handlePointerOut);

    // Also good practice to remove scene-specific listeners
    this.events.off('playerHealthChanged', this.updateHealthBar, this);
    this.events.off('playerScoreChanged', this.updateUI, this);
    this.events.off('playerLevelUp', this.onPlayerLevelUp, this);
    this.events.off('enemyDefeated', this.handleEnemyDefeated, this);
    this.events.off('bossPhaseChange');
    this.events.off('bossDefeated');

    this.player = undefined!;
    this.enemies = undefined!;
    this.bullets = undefined!;

    // Nullify all scene-specific properties to prevent "zombie" objects
    this.chests = undefined!;
    this.enemyBullets = undefined!;
    this.droppedItems = undefined!;
    this.door = undefined!;
    this.boss = undefined;
    this.flowField = undefined!;
    this.easystar = undefined;
    this.easystarFlying = undefined;
    this.playerShadow = undefined!;
    this.activeEffects = [];

    this.registry.get('walls')?.destroy(true);
    this.registry.get('decorations')?.destroy(true);

    // IMPORTANT: Call the parent's shutdown method to clean up its properties
    super.shutdown();
  }

  async create() {
    // Fetch questions from the API on the first dungeon level only
    if (this.currentDungeon === 1) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://jermsancog.com/dungeongame';
      try {
        const response = await fetch(`${apiUrl}/server/questions.php?difficulty=${this.gameDifficulty}`);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const apiQuestions = await response.json();
        this.registry.set('questions', apiQuestions);
        console.log(`Fetched ${apiQuestions.length} questions for ${this.gameDifficulty} mode.`);
      } catch (error) {
        console.error('Failed to fetch questions from API, falling back to local questions.json.', error);
        // Fallback to local questions if API fails
        const localQuestions = getValidQuestions(questionsData);
        this.registry.set('questions', localQuestions);
      }
    }

    const { width, height } = this.scale;

    // Define the new, larger map dimensions
    const mapWidth = width * 2;
    const mapHeight = height * 2;

    // Set the physics world bounds to our new larger size
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);

    // Instantiate EasyStar engines
    this.easystar = new easystarjs.js();
    this.easystarFlying = new easystarjs.js();

    // Determine ground texture based on dungeon level
    let groundTexture = 'ground_easy';
    let useCellularAutomata = false;

    if (this.currentDungeon === 1) {
      groundTexture = 'ground_easy';
    } else if (this.currentDungeon === 2) {
      groundTexture = 'ground_easy';
      useCellularAutomata = true;
    } else if (this.currentDungeon === 3) {
      groundTexture = 'ground_medium';
    } else if (this.currentDungeon === 4) {
      groundTexture = 'ground_medium';
      useCellularAutomata = true;
    } else if (this.currentDungeon === 5) {
      groundTexture = 'ground_hard';
    }

    // Background - Anchor to top left and explicitly send to the absolute back
    const getTileTint = (baseColor: number = 0xffffff) => {
      let modeTint = 0xffffff;
      if (this.gameDifficulty === 'medium') modeTint = 0xe8e0cc; // 50% Khaki
      else if (this.gameDifficulty === 'hard') modeTint = 0xd8c8e8; // 30% Purple

      if (baseColor === 0xffffff) return modeTint;
      if (modeTint === 0xffffff) return baseColor;

      const r = Math.floor(((baseColor >> 16) & 0xff) * ((modeTint >> 16) & 0xff) / 255);
      const g = Math.floor(((baseColor >> 8) & 0xff) * ((modeTint >> 8) & 0xff) / 255);
      const b = Math.floor((baseColor & 0xff) * (modeTint & 0xff) / 255);
      return (r << 16) | (g << 8) | b;
    };

    const applyTint = (gameObject: any, tint: number) => {
      if (tint !== 0xffffff) gameObject.setTint(tint);
    };

    if (useCellularAutomata) {
      const isMixedTerrain = this.currentDungeon === 2 || this.currentDungeon === 4;

      // Draw a base layer for mixed terrain
      if (isMixedTerrain) {
        if (this.currentDungeon === 2 && this.textures.exists('ground_medium')) {
          const bg = this.add.tileSprite(0, 0, mapWidth, mapHeight, 'ground_medium').setOrigin(0, 0).setDepth(-11);
          applyTint(bg, getTileTint());
        } else if (this.currentDungeon === 4 && this.textures.exists('ground_hard')) {
          const bg = this.add.tileSprite(0, 0, mapWidth, mapHeight, 'ground_hard').setOrigin(0, 0).setDepth(-11);
          applyTint(bg, getTileTint(0xd8c8e8));
        }
      }

      // Cellular Automata to generate organically clumped textures
      const tileSize = isMixedTerrain ? 32 : 64; // Finer clumps for mixed terrain
      const cols = Math.ceil(mapWidth / tileSize);
      const rows = Math.ceil(mapHeight / tileSize);
      const grid: number[][] = [];
      const fillPercent = isMixedTerrain ? 0.42 : Phaser.Math.FloatBetween(0.25, 0.80); // Fixed 42% initial noise for ~30% final clumps

      // 1. Initialize the grid with random noise
      for (let y = 0; y < rows; y++) {
        grid[y] = [];
        for (let x = 0; x < cols; x++) {
          grid[y][x] = Math.random() < fillPercent ? 1 : 0;
        }
      }

      // 2. Smooth the noise out to create clumps
      const iterations = isMixedTerrain ? 4 : 3;
      for (let i = 0; i < iterations; i++) {
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
                  neighbors += (isMixedTerrain ? 0 : 1); // Don't force clumps at walls for mixed terrain
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
          
          if (this.currentDungeon === 2) {
            if (isDense && this.textures.exists('ground_easy')) {
              // Draw grass clumps on top of the sand
              const tile = this.add.tileSprite(x * tileSize, y * tileSize, tileSize, tileSize, 'ground_easy')
                .setOrigin(0, 0)
                .setDepth(-10);
              applyTint(tile, getTileTint());
              tile.tilePositionX = x * tileSize;
              tile.tilePositionY = y * tileSize;
            }
          } else if (this.currentDungeon === 4) {
            if (isDense && this.textures.exists('ground_medium')) {
              // Draw sand clumps on top of the asphalt
              const tile = this.add.tileSprite(x * tileSize, y * tileSize, tileSize, tileSize, 'ground_medium')
                .setOrigin(0, 0)
                .setDepth(-10);
              applyTint(tile, getTileTint(0xd8c8e8)); // Maintain purple tint + mode tint
              tile.tilePositionX = x * tileSize;
              tile.tilePositionY = y * tileSize;
            }
          }
        }
      }
    } else if (this.textures.exists(groundTexture)) {
      const ground = this.add.tileSprite(0, 0, mapWidth, mapHeight, groundTexture).setOrigin(0, 0).setDepth(-10);
      applyTint(ground, getTileTint());
    } else {
      // Safe fallback if image is missing
      const fallbackColors: { [key: number]: number } = { 1: 0x292524, 2: 0x3d3730, 3: 0x44403c, 4: 0x3d334d, 5: 0x1c1917 };
      const color = fallbackColors[this.currentDungeon] || 0x292524;
      this.add.rectangle(0, 0, mapWidth, mapHeight, getTileTint(color)).setOrigin(0, 0).setDepth(-10);
    }

    this.generateDungeonQuestions();

    // Create player with animated spritesheet
    this.player = new Player(this, 100, mapHeight / 2);
    this.player.health = this.initialPlayerStats.health;
    this.player.maxHealth = this.initialPlayerStats.maxHealth;
    this.player.level = this.initialPlayerStats.level;
    this.player.experience = this.initialPlayerStats.experience;
    this.player.baseDamage = this.initialPlayerStats.baseDamage;
    this.player.score = this.initialPlayerStats.score;
    this.player.questionsAnswered = this.initialPlayerStats.questionsAnswered;
    this.player.correctAnswers = this.initialPlayerStats.correctAnswers;
    this.player.enemiesKilled = this.initialPlayerStats.enemiesKilled;

    // Restore inventory by converting the array from the previous scene back into a Map
    if (Array.isArray(this.initialPlayerStats.inventory) && this.initialPlayerStats.inventory.length > 0) {
      this.player.inventory = new Map(this.initialPlayerStats.inventory.map(item => [item.id, item]));
    }

    // Ensure joystickVector exists on player, even if Player class doesn't initialize it
    if (!this.player.joystickVector) {
      this.player.joystickVector = new Phaser.Math.Vector2(0, 0);
    }

    this.playerShadow = this.add.ellipse(100, this.player.y + 39, 42, 18, 0x000000, 0.4).setDepth(1);

    // Setup player events
    this.events.on('playerHealthChanged', this.updateHealthBar, this);
    this.events.on('playerScoreChanged', this.updateUI, this);
    this.events.on('playerLevelUp', this.onPlayerLevelUp, this);

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

    if (!this.anims.exists('spin-orangecrystal')) {
      this.anims.create({
        key: 'spin-orangecrystal',
        frames: this.anims.generateFrameNumbers('orangecrystal', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Listen to enemy deaths to drop items
    this.events.off('enemyDefeated', this.handleEnemyDefeated, this);
    this.events.on('enemyDefeated', this.handleEnemyDefeated, this);

    // Create dungeon layout
    this.createDungeonLayout();

    // Create exit door
    this.createExitDoor();

    // Create question chests
    this.createQuestionChests();

    // Create random obstacles
    this.createRandomObstacles();

    // Create decorations
    this.createDecorations();

    // Build EasyStar Navigation Grids
    this.buildPathfindingGrids();

    // Generate the Navigational Flow Field for the horde minions based on the static map geometry
    this.flowField = new FlowField(this);
    this.flowField.buildCostField(this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup, this.chests);

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

    // Make the main camera follow the player
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Launch the UI Scene in parallel
    this.scene.launch('InventoryUIScene', { gameScene: this, player: this.player });

    // Start background music
    this.sound.stopAll();
    if (this.currentDungeon === this.maxDungeons) {
      this.sound.play('the_tournament', { volume: 0.3, loop: true });
    } else if (this.currentDungeon === 3 || this.currentDungeon === 4) {
      this.sound.play('war_of_the_crown', { volume: 0.2, loop: true });
    } else {
      this.sound.play('air_fight', { volume: 0.2, loop: true });
    }

    this.showLevelIntro();

    // --- Global Event Listeners for UI Scene Communication ---
    this.game.events.on('pauseGame', this.pauseGame, this);
    this.game.events.on('resumeGame', this.resumeGame, this);
    this.game.events.on('shiftTimers', this.shiftTimers, this);

    // Ensure listeners are cleaned up when the scene is destroyed
    this.events.on('shutdown', () => {
      this.game.events.off('pauseGame', this.pauseGame, this);
      this.game.events.off('resumeGame', this.resumeGame, this);
      this.game.events.off('shiftTimers', this.shiftTimers, this);
      this.scene.stop('InventoryUIScene');
    });
  }

  private pauseGame = () => { this.togglePause(true); };
  private resumeGame = () => { this.togglePause(false); };

  private createDecorations() {
    let decorationGroups: string[][] = [];

    if (this.currentDungeon === 1) {
      decorationGroups = [
        ['Bush_simple_1_1', 'Bush_simple_1_2', 'Bush_simple_1_3', 'Bush_simple_2_1', 'Bush_simple_2_2', 'Bush_simple_2_3'],
        ['Bush_blue_flowers1', 'Bush_blue_flowers2', 'Bush_blue_flowers3']
      ];
    } else if (this.currentDungeon === 2) {
      decorationGroups = [
        ['Bush_orange_flowers1', 'Bush_orange_flowers2', 'Bush_orange_flowers3'],
        ['Bush_pink_flowers1', 'Bush_pink_flowers2', 'Bush_pink_flowers3'],
        ['Bush_red_flowers1', 'Bush_red_flowers2', 'Bush_red_flowers3']
      ];
    } else if (this.currentDungeon === 3 || this.currentDungeon === 4) {
      decorationGroups = [
        ['Rock1_grass_shadow_dark1', 'Rock1_grass_shadow_dark2', 'Rock1_grass_shadow_dark3', 'Rock1_grass_shadow_dark4', 'Rock1_grass_shadow_dark5'],
        ['Rock2_grass_shadow_dark1', 'Rock2_grass_shadow_dark2', 'Rock2_grass_shadow_dark3', 'Rock2_grass_shadow_dark4', 'Rock2_grass_shadow_dark5'],
        ['Rock6_grass_shadow_dark1', 'Rock6_grass_shadow_dark2', 'Rock6_grass_shadow_dark3', 'Rock6_grass_shadow_dark4', 'Rock6_grass_shadow_dark5']
      ];
    } else if (this.currentDungeon === 5) {
      decorationGroups = [
        ['Rock1_1', 'Rock1_2', 'Rock1_3', 'Rock1_4', 'Rock1_5'],
        ['Rock4_1', 'Rock4_2', 'Rock4_3', 'Rock4_4', 'Rock4_5'],
        ['Rock5_1', 'Rock5_2', 'Rock5_3', 'Rock5_4', 'Rock5_5'],
        ['Rock6_1', 'Rock6_2', 'Rock6_3', 'Rock6_4', 'Rock6_5']
      ];
    }

    if (decorationGroups.length === 0) return;

    const walls = this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup;
    const numSpawns = this.currentDungeon === 5 ? Phaser.Math.Between(45, 75) : Phaser.Math.Between(25, 45);

    for (let i = 0; i < numSpawns; i++) {
      const group = Phaser.Utils.Array.GetRandom(decorationGroups);
      const isClump = Math.random() < 0.45; // 40-50% chance

      if (isClump) {
        // Reserve a larger area for the clump to ensure pathway is clear and prevent individual bushes from rejecting each other
        const clumpPos = this.getValidSpawnPosition(165, 165, true);
        if (!clumpPos) continue;

        const clumpSize = Phaser.Math.Between(4, 10);
        for (let j = 0; j < clumpSize; j++) {
          // Compact offsets within the reserved area
          const offsetX = Phaser.Math.FloatBetween(-52, 52);
          const offsetY = Phaser.Math.FloatBetween(-52, 52);
          this.spawnDecoration(clumpPos.x + offsetX, clumpPos.y + offsetY, Phaser.Utils.Array.GetRandom(group), walls);
        }
      } else {
        const basePos = this.getValidSpawnPosition(72, 72, true);
        if (basePos) {
          this.spawnDecoration(basePos.x, basePos.y, Phaser.Utils.Array.GetRandom(group), walls);
        }
      }
    }

    // Add sporadic scattering for smaller and medium decorations
    const numSporadic = this.currentDungeon === 5 ? Phaser.Math.Between(100, 150) : Phaser.Math.Between(60, 100);
    for (let i = 0; i < numSporadic; i++) {
      const group = Phaser.Utils.Array.GetRandom(decorationGroups);
      // Select non-colliding variants to safely blanket the map without blocking paths
      const nonCollidingKeys = group.filter(k => {
        if (k.startsWith('Bush')) return !k.endsWith('3');
        if (k.startsWith('Rock')) return !(k.endsWith('1') || k.endsWith('2') || k.endsWith('3'));
        return false;
      });

      const key = nonCollidingKeys.length > 0 ? Phaser.Utils.Array.GetRandom(nonCollidingKeys) : Phaser.Utils.Array.GetRandom(group);
      
      const pos = this.getValidSpawnPosition(48, 48, false, undefined, true); 
      if (pos) {
        const scaleOverride = Phaser.Math.FloatBetween(0.5, 1.1);
        this.spawnDecoration(pos.x, pos.y, key, walls, scaleOverride);
      }
    }
  }

  private spawnDecoration(x: number, y: number, textureKey: string, walls: Phaser.Physics.Arcade.StaticGroup, scaleOverride?: number) {
    const scale = scaleOverride ?? (Phaser.Math.FloatBetween(0.8, 1.2) * 2.25); // Use random scale or override (1.5x of original 1.5)

    // Check the actual image dimensions to prevent small visual decorations from acting as obstacles
    const frame = this.textures.get(textureKey).get();
    const isSmallImage = frame && (frame.width < 60 || frame.height < 60); // 1.5x of original 40

    let ignoreCollision = false;
    if (textureKey.startsWith('Bush')) {
      ignoreCollision = !textureKey.endsWith('3') || isSmallImage;
    } else if (textureKey.startsWith('Rock')) {
      ignoreCollision = !(textureKey.endsWith('1') || textureKey.endsWith('2') || textureKey.endsWith('3')) || isSmallImage;
    }
    
    // ALWAYS create as a physics object so they can be overlapped, but assign passable ones to a separate decorations group
    const decorations = this.registry.get('decorations') as Phaser.Physics.Arcade.StaticGroup;
    let decoration = (ignoreCollision ? decorations : walls).create(x, y, textureKey) as Phaser.Physics.Arcade.Sprite;
    
    // Retain 'isBush' flag so bullets, bats, and spiders continue to correctly ignore it!
    decoration.setData('isBush', true);
    decoration.setScale(scale);

    // Apply purple tint to rocks based on dungeon level
    if (textureKey.startsWith('Rock')) {
      if (this.currentDungeon === 4) {
        decoration.setTint(0xdfbfdf); // 25% purple tint
      } else if (this.currentDungeon === 5) {
        decoration.setTint(0x9f3f9f); // 75% purple tint
      }
    }
    
    const displayHeight = decoration.height * scale;
    const displayWidth = decoration.width * scale;
    
    if (decoration.body) {
      const staticBody = decoration.body as Phaser.Physics.Arcade.StaticBody;
      
      // Use unscaled coordinates for size/offset so updateFromGameObject calculates scale natively
      const unscaledBodyWidth = decoration.width * 0.7;
      const unscaledBodyHeight = decoration.height * 0.4;
      
      staticBody.setSize(unscaledBodyWidth, unscaledBodyHeight);
      staticBody.setOffset((decoration.width - unscaledBodyWidth) / 2, decoration.height - unscaledBodyHeight);
      
      staticBody.updateFromGameObject();
    }
    
    // ALWAYS depth sort using the absolute visual bottom of the sprite!
    decoration.setDepth(decoration.y + (displayHeight / 2));
  }

  private buildPathfindingGrids() {
    const grid: number[][] = [];
    const flyingGrid: number[][] = [];
    const cellSize = 32;
    const worldBounds = this.physics.world.bounds;
    const cols = Math.ceil(worldBounds.width / cellSize);
    const rows = Math.ceil(worldBounds.height / cellSize);

    const walls = this.registry.get('walls').getChildren();
    const chests = this.chests.getChildren();
    const allObstacles = [...walls, ...chests];

    for (let y = 0; y < rows; y++) {
      grid[y] = new Array(cols).fill(0);
      flyingGrid[y] = new Array(cols).fill(0);

      for (let x = 0; x < cols; x++) {
        const rect = new Phaser.Geom.Rectangle(x * cellSize, y * cellSize, cellSize, cellSize);
        for (const obs of allObstacles) {
          const body = (obs as any).body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
          const bound = body ? new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height) : (obs as any).getBounds();

          if (Phaser.Geom.Intersects.RectangleToRectangle(rect, bound)) {
            grid[y][x] = 1;
            const textureKey = (obs as any).texture ? (obs as any).texture.key : '';
            if (!textureKey.startsWith('Bush_') && !textureKey.startsWith('Rock')) {
              flyingGrid[y][x] = 1; // Flying units treat everything EXCEPT bushes and rocks as blocked
            }
          }
        }
      }
    }

    this.easystar.setGrid(grid);
    this.easystar.setAcceptableTiles([0]);
    this.easystar.enableDiagonals();

    this.easystarFlying.setGrid(flyingGrid);
    this.easystarFlying.setAcceptableTiles([0]);
    this.easystarFlying.enableDiagonals();
  }

  private getWallTextureKey(): string {
    const r = Math.random();
    if (this.currentDungeon === 1) {
      if (r < 0.4) return 'cobbledsquare';
      if (r < 0.8) return 'cobbledsquare2';
      if (r < 0.9) return 'cobbledsquare3';
      return 'cobbledsquare4';
    } else if (this.currentDungeon === 2) {
      if (r < 0.1) return 'cobbledsquare';
      if (r < 0.5) return 'cobbledsquare2';
      if (r < 0.9) return 'cobbledsquare3';
      return 'cobbledsquare4';
    } else if (this.currentDungeon === 3) {
      return r < 0.5 ? 'cobbledsquare6' : 'cobbledsquare7';
    } else if (this.currentDungeon === 4) {
      return r < 0.5 ? 'cobbledsquare8' : 'cobbledsquare9';
    } else {
      return r < 0.95 ? 'cobbledsquare10' : 'cobbledsquare9';
    }
  }

  private createDungeonLayout() {
    const { width, height } = this.physics.world.bounds;

    // Create walls around the dungeon with physics bodies
    const wallThickness = 48; // 1.5x of original 32

    // Create walls group for collision
    const walls = this.physics.add.staticGroup();

    // Helper to safely create wall tiles or fallback rectangles in segments for organic look
    const createWallSegments = (startX: number, startY: number, w: number, h: number) => {
      const segments: Phaser.GameObjects.GameObject[] = [];
      const segmentSize = 48; // 1.5x of original 32
      
      for (let x = startX; x < startX + w; x += segmentSize) {
        for (let y = startY; y < startY + h; y += segmentSize) {
          const currentW = Math.min(segmentSize, startX + w - x);
          const currentH = Math.min(segmentSize, startY + h - y);
          
          const offsetX = Phaser.Math.Between(-4, 4);
          const offsetY = Phaser.Math.Between(-4, 4);
          
          const tex = this.getWallTextureKey();
          let segment;
          if (this.textures.exists(tex)) {
            segment = this.add.tileSprite(x + offsetX, y + offsetY, currentW, currentH, tex)
              .setOrigin(0, 0)
              .setDepth(0)
              .setTileScale(1.5, 1.5);
          } else {
            segment = this.add.rectangle(x + offsetX, y + offsetY, currentW, currentH, 0x555555).setOrigin(0, 0).setDepth(0);
          }
          segments.push(segment);
        }
      }
      return segments;
    };

    // Top wall 
    walls.addMultiple(createWallSegments(0, 0, width, wallThickness));

    // Bottom wall
    walls.addMultiple(createWallSegments(0, height - wallThickness, width, wallThickness));

    // Left wall
    walls.addMultiple(createWallSegments(0, 0, wallThickness, height));

    // Right wall (with gap for door)
    walls.addMultiple(createWallSegments(width - wallThickness, 0, wallThickness, (height / 2) - 54));
    walls.addMultiple(createWallSegments(width - wallThickness, (height / 2) + 54, wallThickness, (height / 2) - 54));

    // Ensure all static bodies are perfectly aligned with their new 0,0 origins
    walls.getChildren().forEach(wall => {
      if (wall.body) {
        ((wall as Phaser.GameObjects.TileSprite).body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      }
    });

    // Store walls for collision detection
    this.registry.set('walls', walls);
    
    // Create and store passable decorations for overlap detection
    const decorations = this.physics.add.staticGroup();
    this.registry.set('decorations', decorations);
  }

  private createRandomObstacles() {
    const walls = this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup;
    // Fill the wider map with a dense number of obstacles.
    // getValidSpawnPosition automatically enforces the player-height gap rule!
    let numObstacles = Phaser.Math.Between(30 + this.currentDungeon * 2, 45 + this.currentDungeon * 2);
    
    if (this.currentDungeon === this.maxDungeons) {
      numObstacles = Phaser.Math.Between(60, 80); // Spawn significantly more obstacles on the boss level
    }
    
    const blockSize = 96; // 1.5x scale (enlarged from 64px base size)

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
          
          // Add a slight random offset to give an organic, uneven look
          const offsetX = Phaser.Math.Between(-4, 4);
          const offsetY = Phaser.Math.Between(-4, 4);
          const blockX = startX + (block.x - minX) * blockSize + offsetX;
          const blockY = startY + (block.y - minY) * blockSize + offsetY;
          
          const tex = this.getWallTextureKey();
          if (this.textures.exists(tex)) {
            obstacle = this.add.tileSprite(blockX, blockY, blockSize, blockSize, tex);
            obstacle.setTileScale(1.5, 1.5);
          } else {
            obstacle = this.add.rectangle(blockX, blockY, blockSize, blockSize, 0x666666);
          }
          
          walls.add(obstacle);
          if (obstacle.body) {
            const staticBody = obstacle.body as Phaser.Physics.Arcade.StaticBody;
            
            // Determine if there's a block directly above this one in the shape definition
            const hasBlockAbove = shape.some(b => b.x === block.x && b.y === block.y - 1);
            
            if (!hasBlockAbove) {
              // Top-most block: shrink hitbox slightly so player can walk behind it
              const depthOffset = 24; // Allow player to walk behind the top quarter of the block
              staticBody.setSize(blockSize, blockSize - depthOffset);
              staticBody.setOffset(0, depthOffset);
            } else {
              // Lower blocks: use full hitbox to remain completely solid and block gaps
              staticBody.setSize(blockSize, blockSize);
              staticBody.setOffset(0, 0);
            }
            
            staticBody.updateFromGameObject();
          }
          
          obstacle.setDepth(obstacle.y + (obstacle.displayHeight / 2));
        });
      }
    }
  }

  private getValidSpawnPosition(w: number = 64, h: number = 64, isObstacle: boolean = false, bounds?: {minX: number, maxX: number, minY: number, maxY: number}, allowNearPlayer: boolean = false): { x: number, y: number } | null {
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
    Phaser.Geom.Rectangle.Inflate(playerBounds, 96, 96);
    
    const padding = isObstacle ? requiredGap * 2 : 16;
    const checkRect = new Phaser.Geom.Rectangle(0, 0, w + padding, h + padding);
    const doorBounds = this.door ? this.door.getBounds() : new Phaser.Geom.Rectangle(0, 0, 0, 0);
    const worldBounds = this.physics.world.bounds;
    const bossBounds = new Phaser.Geom.Rectangle(worldBounds.width / 2 - 120, worldBounds.height / 2 - 120, 240, 240);

    // OPTIMIZATION: Cache the obstacle bounds before the loop so we don't recalculate 
    // them thousands of times per placement attempt!
    const allObstacles = [...walls, ...chests, ...enemies];
    const obstacleBounds = allObstacles.map(obs => (obs as any).getBounds());

    let attempts = 0;
    const maxAttempts = this.currentDungeon === this.maxDungeons ? 500 : 200;
    while (!valid && attempts < maxAttempts) {
        attempts++;
        const minX = bounds ? bounds.minX : 100;
        const maxX = bounds ? bounds.maxX : worldBounds.width - 100;
        const minY = bounds ? bounds.minY : 100;
        const maxY = bounds ? bounds.maxY : worldBounds.height - 100;
        
        x = Phaser.Math.Between(minX, maxX);
        y = Phaser.Math.Between(minY, maxY);
        checkRect.setPosition(x - checkRect.width / 2, y - checkRect.height / 2);

        valid = true;

        if (!allowNearPlayer && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, playerBounds)) {
            valid = false;
            continue;
        }
        // Ensure non-obstacle entities (enemies/chests) don't spawn too close to the player
        if (!isObstacle && !allowNearPlayer && Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 525) {
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

  private getNearestValidDropPosition(startX: number, startY: number, width: number, height: number): { x: number, y: number } {
    const checkRect = new Phaser.Geom.Rectangle(0, 0, width, height);
    const walls = this.registry.get('walls').getChildren();
    const chests = this.chests.getChildren();
    const obstacleBounds = [...walls, ...chests].map(obs => (obs as any).getBounds());
    const worldBounds = this.physics.world.bounds;
    const doorBounds = this.door ? this.door.getBounds() : new Phaser.Geom.Rectangle(0, 0, 0, 0);

    let radius = 0;
    const step = 16;
    const maxRadius = 450;

    while (radius <= maxRadius) {
      const points = radius === 0 ? 1 : Math.max(8, Math.floor((Math.PI * 2 * radius) / step));
      for (let i = 0; i < points; i++) {
        const currentAngle = (Math.PI * 2 * i) / points;
        const testX = startX + Math.cos(currentAngle) * radius;
        const testY = startY + Math.sin(currentAngle) * radius;

        if (testX < width || testX > worldBounds.width - width || testY < height || testY > worldBounds.height - height) {
          continue;
        }

        checkRect.setPosition(testX - width / 2, testY - height / 2);
        let valid = true;

        if (this.door && Phaser.Geom.Intersects.RectangleToRectangle(checkRect, doorBounds)) {
          valid = false;
        }

        if (valid) {
          for (const obsBound of obstacleBounds) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(checkRect, obsBound)) {
              valid = false;
              break;
            }
          }
        }

        if (valid) {
          return { x: testX, y: testY };
        }
      }
      radius += step;
    }

    return { x: startX, y: startY };
  }

  private spawnCrystal(type: string, x: number, y: number) {
    const dropPos = this.getNearestValidDropPosition(x, y, 25, 25);
    
    // Start the crystal slightly higher in the air with a random rotation angle
    const crystal = this.physics.add.sprite(dropPos.x, dropPos.y - 40, type);
    crystal.anims.play(`spin-${type}`);
    crystal.setScale(1.2); // 1.5x of original 0.8
    crystal.setDepth(dropPos.y + 12); // Approximate bottom of the crystal
    crystal.setAngle(Phaser.Math.Between(-60, 60));
    
    // Small points for defeating an enemy that drops a crystal (8% of max health)
    this.player.gainExperience(Math.floor(this.player.maxHealth * 0.08));

    this.droppedItems.add(crystal);

    this.tweens.add({
      targets: crystal,
      y: dropPos.y,
      duration: 800,
      ease: 'Bounce.easeOut'
    });

    this.tweens.add({
      targets: crystal,
      angle: 0,
      duration: 800,
      ease: 'Cubic.easeOut'
    });
  }

  private createEnemies() {
    // Adjust enemy pool based on difficulty
    let enemyTypes = ['skeleton', 'chiroptera'];
    if (this.gameDifficulty === 'medium') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider'];
    } else if (this.gameDifficulty === 'hard') {
      enemyTypes = ['skeleton', 'chiroptera', 'spider', 'zombie', 'zombie2'];
    }

    if (this.currentDungeon >= 4) {
      enemyTypes = ['skeleton', 'chiroptera', 'spider', 'zombie', 'zombie2'];
    }

    // Minimum 5 enemies (2 bats + 3 random) on level 1, scaling up each level
    const batCount = 1 + this.currentDungeon;
    const randomCount = 1 + (this.currentDungeon * 2);
    const totalEnemies = batCount + randomCount;

    let enemiesToSpawn: string[] = [];

    if (this.currentDungeon >= 4) {
      enemiesToSpawn.push('zombie', 'zombie2', 'spider');
    }

    for (let i = 0; i < batCount; i++) {
      enemiesToSpawn.push('chiroptera');
    }

    const remainingToSpawn = totalEnemies - enemiesToSpawn.length;
    for (let i = 0; i < Math.max(0, remainingToSpawn); i++) {
      enemiesToSpawn.push(enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)]);
    }

    for (const enemyType of enemiesToSpawn) {
      const pos = this.getValidSpawnPosition();
      if (!pos) continue;
      const { x, y } = pos;
      
      let hp = 50 + this.currentDungeon * 10;
      let baseSpeed = (25 + this.currentDungeon * 5) * 2.625; // 1.75 * 1.5
      
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
      enemy.setChestsGroup(this.chests);
      this.enemies.add(enemy);
    }
  }

  private generateDungeonQuestions(): void {
    const allQuestions = this.registry.get('questions') || [];
    const validQuestions = getValidQuestions(allQuestions);

    let availablePool = validQuestions.filter(q => !this.usedQuestionIds.includes(q.id));

    if (availablePool.length < 4) {
      // Not enough unique questions. Reset all used questions and start over.
      console.warn("Not enough unique questions, resetting used question pool for this session.");
      this.usedQuestionIds = [];
      availablePool = validQuestions.filter(q => !this.usedQuestionIds.includes(q.id));
    }

    // If after reset we still don't have enough, it's a critical error.
    if (availablePool.length < 4) {
      console.error("CRITICAL: Not enough questions available to create a dungeon. Using default questions.");
      this.dungeonQuestions = DEFAULT_QUESTIONS.slice(0, 4);
      return;
    }

    this.dungeonQuestions = availablePool.slice(0, 4);
    this.dungeonQuestions.forEach(q => this.usedQuestionIds.push(q.id));
  }

  private createQuestionChests() {
    const { width, height } = this.physics.world.bounds;
    const chestTypes = ['chestBlue', 'chestGreen', 'chestRed', 'chestYellow'];
    
    // Define 4 quadrants to keep chests relatively equidistant from each other
    const quadrants = [
      { minX: 100, maxX: (width / 2) - 50, minY: 100, maxY: (height / 2) - 50 },
      { minX: (width / 2) + 50, maxX: width - 100, minY: 100, maxY: (height / 2) - 50 },
      { minX: 100, maxX: (width / 2) - 50, minY: (height / 2) + 50, maxY: height - 100 },
      { minX: (width / 2) + 50, maxX: width - 100, minY: (height / 2) + 50, maxY: height - 100 }
    ];

    chestTypes.forEach((type, index) => {
      // Use getValidSpawnPosition within the designated quadrant to ensure safe placement and equidistant spreading
      const pos = this.getValidSpawnPosition(48, 80, false, quadrants[index]);
      
      // Fallback coordinates just in case it fails to find a safe spot after 100 attempts
      const x = pos ? pos.x : quadrants[index].minX + 50;
      const y = pos ? pos.y : quadrants[index].minY + 50;

      const chest = this.physics.add.sprite(x, y, type, 0);
      chest.setScale(1.5); // 1.5x of original 1.0
      
      // Chests are 32x64. Make the hitbox 32x32 at the base so player can walk behind them
      const chestBody = chest.body as Phaser.Physics.Arcade.Body;
      chestBody.setSize(32, 32);
      chestBody.setOffset(0, 32);
      
      chest.setData('questionIndex', index);
      chest.setData('opened', false);
      chest.setData('nextInteractionTime', 0);
      chest.setImmovable(true);

      // Stop Phaser 3.50+ from allowing the player to push this immovable body
      if (typeof (chest as any).setPushable === 'function') { (chest as any).setPushable(false); }
      
      chest.setDepth(chest.y + 32); // Exact bottom of the chest hitbox
      
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
    const worldBounds = this.physics.world.bounds;
    this.door = this.physics.add.sprite(worldBounds.width - 50, worldBounds.height / 2, 'gate', 7);
    this.door.setScale(1.125); // 1.5x of original 0.75
    this.door.setDepth(this.door.y + (this.door.displayHeight / 2));
    
    // Create gate animations using original specifications
    if (!this.anims.exists('openGate')) {
      this.anims.create({
        key: 'openGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 0, end: 7 }),
        frameRate: 8,
        repeat: 0
      });
      this.anims.create({
        key: 'closeGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 7, end: 0 }),
        frameRate: 8,
        repeat: 0
      });
    }

    this.door.anims.play('closeGate');
    this.sound.play('close_door', { volume: 0.5 });
  }

  private createBoss() {
    if (this.currentDungeon === this.maxDungeons) {
      const bossHp = 15 * (50 + this.currentDungeon * 10);
      const baseSpeed = (55 + this.currentDungeon * 5) * 2.1; // 1.4 * 1.5
      const worldBounds = this.physics.world.bounds;
      this.boss = new Boss(this, worldBounds.width / 2, worldBounds.height / 2, this.player, bossHp, baseSpeed);
      this.boss.setWallsGroup(this.registry.get('walls') as Phaser.Physics.Arcade.StaticGroup);
      this.boss.setChestsGroup(this.chests);
      this.boss.setScale(2.25); // 1.5x of original 1.5
      this.boss.setTint(0xf59e0b); // Golden amber tint when invulnerable instead of pure green
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

    this.input.on('pointerdown', this.handlePointerDown);
    this.input.on('pointermove', this.handlePointerMove);
    this.input.on('pointerup', this.handlePointerUp);
    this.input.on('pointerout', this.handlePointerOut);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    if (this.isModalOpen || this.player.isDead) return;
    if (currentlyOver && currentlyOver.length > 0) return; // Prevent shooting/moving when clicking UI or chests

    // Touch on the left half initiates the joystick
    if (pointer.x < this.scale.width / 2 && !this.joystickActive && !this.sys.game.device.os.desktop) {
      this.movePointer = pointer;
      this.joystickActive = true;
      this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
      this.joystickThumb.setPosition(pointer.x, pointer.y).setVisible(true);
      this.moveVector.set(0, 0); // Explicitly reset vector
    } else {
      // Touch on the right half (or a 2nd finger) fires a bullet
      this.player.shoot(pointer.worldX, pointer.worldY);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.isModalOpen || this.player.isDead) return;

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
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer) {
    if (this.joystickActive && this.movePointer && pointer.id === this.movePointer.id) {
      // If it was a very quick tap on the left side, allow it to fire a bullet instead of moving
      const duration = pointer.upTime - pointer.downTime;
      const distance = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY);
      
      if (duration < 250 && distance < 15) {
        this.player.shoot(pointer.worldX, pointer.worldY);
      }

      this.resetJoystick();
    }
  }
  
  private handlePointerOut(pointer: Phaser.Input.Pointer) {
    if (this.joystickActive && this.movePointer && pointer.id === this.movePointer.id) {
      this.resetJoystick();
    }
  }

  private handleBushWiggle(obj1: any, obj2: any) {
    const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && obj1.texture.key.startsWith('Bush_'));
    const wall = isWall1 ? obj1 : obj2;
    const entity = isWall1 ? obj2 : obj1;

    if (wall.texture && wall.texture.key && wall.texture.key.startsWith('Bush_')) {
      if (entity && entity.getData && entity.getData('type')) {
        const type = entity.getData('type').toLowerCase();
        if (type === 'bat' || type === 'chiroptera') return; // Bats don't trigger wiggles
      }
      
      if (!wall.getData('isWiggling')) {
        wall.setData('isWiggling', true);
        
        // Add a tiny burst of leaf particles for visual impact
        const leafColors = [0x22c55e, 0x16a34a, 0x15803d];
        for (let i = 0; i < 3; i++) {
          const leaf = this.add.rectangle(wall.x + Phaser.Math.Between(-10, 10), wall.y - Phaser.Math.Between(10, 30), 4, 4, Phaser.Utils.Array.GetRandom(leafColors)).setDepth(wall.depth + 1);
          this.tweens.add({
            targets: leaf,
            x: leaf.x + Phaser.Math.Between(-15, 15),
            y: leaf.y + Phaser.Math.Between(10, 30),
            angle: Phaser.Math.Between(90, 360),
            alpha: 0,
            duration: Phaser.Math.Between(600, 900),
            ease: 'Quad.easeOut',
            onComplete: () => leaf.destroy()
          });
        }
        
        // Leafy bushes get the back-and-forth tilt
        this.tweens.add({
          targets: wall,
          angle: { from: -3, to: 3 },
          ease: 'Power1',
          duration: 80,
          yoyo: true,
          repeat: 3,
          onComplete: () => { 
            wall.angle = 0; 
            wall.setData('isWiggling', false);
          }
        });
      }
    }
  }

  private setupCollisions() {
    // Get walls from registry
    const walls = this.registry.get('walls');
    
    // Player vs walls
    if (walls) {
      this.physics.add.collider(this.player, walls, this.handleBushWiggle, undefined, this);
      // Allow spiders to bypass walls using a process callback filter
      this.physics.add.collider(this.enemies, walls, this.handleBushWiggle, (obj1: any, obj2: any) => {
        const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && (obj1.texture.key.startsWith('cobbledsquare') || obj1.texture.key.startsWith('Bush_') || obj1.texture.key.startsWith('Rock')));
        const wall = isWall1 ? obj1 : obj2;
        const enemy = isWall1 ? obj2 : obj1;
        
        const type = ((enemy.getData && enemy.getData('type')) || enemy.type || (enemy.constructor && enemy.constructor.name) || '').toLowerCase();

        if (type === 'spider' || type === 'babyspider') return false;
        if ((type === 'bat' || type === 'chiroptera') && wall.getData && wall.getData('isBush')) return false;
        
        return true;
      });
      this.physics.add.collider(this.bullets, walls, (obj1: any, obj2: any) => {
        const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && (obj1.texture.key.startsWith('cobbledsquare') || obj1.texture.key.startsWith('Bush_') || obj1.texture.key.startsWith('Rock')));
        const bullet = isWall1 ? obj2 : obj1;
        if (bullet && typeof bullet.destroy === 'function' && bullet.active) bullet.destroy();
      }, (obj1: any, obj2: any) => {
        const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && (obj1.texture.key.startsWith('cobbledsquare') || obj1.texture.key.startsWith('Bush_') || obj1.texture.key.startsWith('Rock')));
        const wall = isWall1 ? obj1 : obj2;
        const bullet = isWall1 ? obj2 : obj1;
        if (wall.getData && wall.getData('isBush')) return false; // Bullets ignore bushes & rocks
        return !(bullet.getData && bullet.getData('ignoreWalls'));
      });
      this.physics.add.collider(this.enemyBullets, walls, (obj1: any, obj2: any) => {
        const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && (obj1.texture.key.startsWith('cobbledsquare') || obj1.texture.key.startsWith('Bush_') || obj1.texture.key.startsWith('Rock')));
        const bullet = isWall1 ? obj2 : obj1;
        if (bullet && typeof bullet.destroy === 'function' && bullet.active) bullet.destroy();
      }, (obj1: any, obj2: any) => {
        const isWall1 = (obj1.getData && obj1.getData('isBush')) || (obj1.texture && obj1.texture.key && (obj1.texture.key.startsWith('cobbledsquare') || obj1.texture.key.startsWith('Bush_') || obj1.texture.key.startsWith('Rock')));
        const wall = isWall1 ? obj1 : obj2;
        const bullet = isWall1 ? obj2 : obj1;
        if (wall.getData && wall.getData('isBush')) return false; // Bullets ignore bushes & rocks
        if (bullet.getData && bullet.getData('isSpiderWeb')) return false;
        return true;
      });
    }
    
    // Establish overlap events for passable decorations so they trigger wiggles but don't block movement
    const decorations = this.registry.get('decorations') as Phaser.Physics.Arcade.StaticGroup;
    if (decorations) {
      this.physics.add.overlap(this.player, decorations, this.handleBushWiggle, undefined, this);
      this.physics.add.overlap(this.enemies, decorations, this.handleBushWiggle, undefined, this);
    }
    
    // Enemies vs chests
    this.physics.add.collider(this.enemies, this.chests, undefined, (obj1: any, obj2: any) => {
      const isChest1 = (obj1.texture && obj1.texture.key && obj1.texture.key.toLowerCase().includes('chest'));
      const enemy = isChest1 ? obj2 : obj1;
      const type = ((enemy.getData && enemy.getData('type')) || enemy.type || (enemy.constructor && enemy.constructor.name) || '').toLowerCase();
      
      if (type === 'spider' || type === 'babyspider' || type === 'bat' || type === 'chiroptera') return false;
      return true;
    });
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    
    // Player vs enemy bullets
    this.physics.add.overlap(this.player, this.enemyBullets, this.hitPlayerWithBullet, undefined, this);
    
    // Player vs chests
    this.physics.add.collider(this.player, this.chests, (player, chest) => this.openChest(chest as Phaser.Physics.Arcade.Sprite), undefined, this);
    
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
      this.physics.add.collider(this.boss, this.chests);
    }
  }

  private createUI() {
    const UI_DEPTH = 10000;

    // Determine background color based on difficulty for the stats panel
    this.statsBgColor = 0x1c1917; // stone-900
    if (this.gameDifficulty === 'medium') this.statsBgColor = 0x292524; // stone-800
    else if (this.gameDifficulty === 'hard') this.statsBgColor = 0x44403c; // stone-700

    // Dynamic expanding background
    this.statsBg = this.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH);
    this.drawStatsBg();

    // Health bar
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH + 1);
    this.updateHealthBar();

    // Score and progress
    this.scoreText = this.add.text(335, 44, `${this.player.score}`, {
      fontSize: '27px',
      fill: '#fde68a',
      fontFamily: '"Georgia", "Times New Roman", serif'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1);

    // Arrow Indicator
    this.statsArrow = this.add.text(435, 44, '►', {
      fontSize: '36px',
      fill: '#fbbf24'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1).setInteractive({ useHandCursor: true });

    this.statsArrow.on('pointerover', () => this.statsArrow.setTint(0xffffff));
    this.statsArrow.on('pointerout', () => this.statsArrow.clearTint());

    this.statsArrow.on('pointerdown', () => {
      this.isStatsExpanded = !this.isStatsExpanded;
      this.statsArrow.setText(this.isStatsExpanded ? '◄' : '►');

      if (this.isStatsExpanded) {
        this.questionsText.setVisible(true);
        this.dungeonText.setVisible(true);
        this.tweens.add({
          targets: this,
          statsBgWidth: 860,
          duration: 250,
          ease: 'Power2',
          onUpdate: () => this.drawStatsBg()
        });
        this.tweens.add({
          targets: [this.questionsText, this.dungeonText],
          alpha: 1,
          duration: 250,
          ease: 'Power2'
        });
      } else {
        this.tweens.add({
          targets: this,
          statsBgWidth: 460,
          duration: 250,
          ease: 'Power2',
          onUpdate: () => this.drawStatsBg()
        });
        this.tweens.add({
          targets: [this.questionsText, this.dungeonText],
          alpha: 0,
          duration: 250,
          ease: 'Power2',
          onComplete: () => {
            this.questionsText.setVisible(false);
            this.dungeonText.setVisible(false);
          }
        });
      }
    });

    this.questionsText = this.add.text(480, 44, `Questions: ${this.levelCorrectAnswers}/4`, {
      fontSize: '24px',
      fill: '#fbbf24',
      fontFamily: '"Georgia", "Times New Roman", serif'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1).setAlpha(0).setVisible(false);

    this.dungeonText = this.add.text(680, 44, `Dungeon: ${this.currentDungeon}/${this.maxDungeons}`, {
      fontSize: '24px',
      fill: '#fcd34d',
      fontFamily: '"Georgia", "Times New Roman", serif'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1).setAlpha(0).setVisible(false);

    if (this.currentDungeon === this.maxDungeons) {
      this.add.text(this.scale.width / 2, 115, 'Boss is invulnerable until all questions answered!', {
        fontSize: '16px',
        fill: '#f87171',
        fontFamily: '"Georgia", "Times New Roman", serif',
        stroke: '#000000',
        strokeThickness: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: { x: 8, y: 4 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    }

    // Exit to Menu Button (Top Right)
    const exitBtnWidth = 240;
    const exitBtnHeight = 60;
    const exitBtnX = this.scale.width - exitBtnWidth / 2 - 20;
    const exitBtnY = 44;

    const exitBtnBg = this.add.rectangle(exitBtnX, exitBtnY, exitBtnWidth, exitBtnHeight, 0x4a2511)
      .setStrokeStyle(3, 0xd4af37) // Gold border for RPG theme
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(UI_DEPTH)
      .setRounded(12);

    const exitBtnText = this.add.text(exitBtnX, exitBtnY, 'Exit to Menu', {
      fontSize: '27px',
      fill: '#f4d03f', // Gold-ish text
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(UI_DEPTH + 1);

    exitBtnBg.on('pointerover', () => {
      exitBtnBg.setFillStyle(0x6b3619); // Brighter wood color on hover
      exitBtnText.setFill('#ffffff');
    });

    exitBtnBg.on('pointerout', () => {
      exitBtnBg.setFillStyle(0x4a2511);
      exitBtnText.setFill('#f4d03f');
    });

    exitBtnBg.on('pointerdown', () => {
      this.isModalOpen = false;
      this.time.paused = false;
      this.physics.resume();
      this.sound.stopAll();
      this.scene.start('MainMenuScene');
    });

    // Audio Controls (Top Right, next to Exit)
    const audioY = 44;
    const sliderWidth = 150;
    const sliderX = exitBtnX - exitBtnWidth / 2 - sliderWidth - 30;
    const iconX = sliderX - 52;
    const fsX = iconX - 75;
    const helpX = fsX - 75;
    const inventoryBtnX = helpX - 75;

    // --- Help Button ---
    const helpBtn = this.add.container(helpX, audioY).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    const helpBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const helpIcon = this.add.text(0, 0, '?', { fontSize: '36px', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', fill: '#fde68a' }).setOrigin(0.5);
    helpBtn.add([helpBg, helpIcon]);
    helpBtn.setSize(60, 60);
    helpBtn.setInteractive({ useHandCursor: true });

    helpBtn.on('pointerover', () => helpBg.setFillStyle(0x6b3619));
    helpBtn.on('pointerout', () => helpBg.setFillStyle(0x4a2511));
    helpBtn.on('pointerup', () => {
      this.scene.launch('HelpModalScene');
    });

    // --- Fullscreen Button ---
    const fsBtn = this.add.container(fsX, audioY).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    const fsBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const fsIcon = this.add.text(0, 0, this.scale.isFullscreen ? '⤡' : '⤢', { fontSize: '36px', fontFamily: 'Arial' }).setOrigin(0.5);
    fsBtn.add([fsBg, fsIcon]);
    fsBtn.setSize(60, 60);
    fsBtn.setInteractive({ useHandCursor: true });

    fsBtn.on('pointerover', () => fsBg.setFillStyle(0x6b3619));
    fsBtn.on('pointerout', () => fsBg.setFillStyle(0x4a2511));
    fsBtn.on('pointerup', () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    const enterFs = () => { if (fsIcon.active) fsIcon.setText('⤡'); };
    const leaveFs = () => { if (fsIcon.active) fsIcon.setText('⤢'); };
    this.scale.on('enterfullscreen', enterFs);
    this.scale.on('leavefullscreen', leaveFs);
    this.events.once('shutdown', () => {
      this.scale.off('enterfullscreen', enterFs);
      this.scale.off('leavefullscreen', leaveFs);
    });

    // --- Mute Button Container ---
    const muteBtn = this.add.container(iconX, audioY).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    const muteBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const muteIcon = this.add.text(0, 0, this.sound.mute || this.sound.volume === 0 ? '🔇' : '🔊', { fontSize: '30px' }).setOrigin(0.5);
    muteBtn.add([muteBg, muteIcon]);
    muteBtn.setSize(60, 60);
    muteBtn.setInteractive({ useHandCursor: true });

    muteBtn.on('pointerover', () => muteBg.setFillStyle(0x6b3619));
    muteBtn.on('pointerout', () => muteBg.setFillStyle(0x4a2511));

    // --- Volume Slider ---
    const trackHitArea = this.add.rectangle(sliderX, audioY, sliderWidth, 45, 0x000000, 0).setOrigin(0, 0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(UI_DEPTH + 1);
    const track = this.add.rectangle(sliderX, audioY, sliderWidth, 9, 0x444444).setOrigin(0, 0.5).setStrokeStyle(1, 0x888888).setScrollFactor(0).setDepth(UI_DEPTH + 1).setRounded(4);
    const fill = this.add.rectangle(sliderX, audioY, this.sound.volume * sliderWidth, 9, 0xd4af37).setOrigin(0, 0.5).setScrollFactor(0).setDepth(UI_DEPTH + 2).setRounded(4);
    const handle = this.add.circle(sliderX + this.sound.volume * sliderWidth, audioY, 15, 0xffffff).setInteractive({ draggable: true, useHandCursor: true }).setScrollFactor(0).setDepth(UI_DEPTH + 3);

    const syncAudioUI = () => {
      fill.width = this.sound.volume * sliderWidth;
      handle.x = sliderX + (this.sound.volume * sliderWidth);
    };
    
    syncAudioUI(); // Instantly sync on load in case the game is already muted

    // Continuously listen to the actual audio state to sync the icon perfectly
    const syncAudioIcon = () => {
      if (muteIcon && muteIcon.active) {
        const isMuted = this.sound.mute || this.sound.volume === 0;
        muteIcon.setText(isMuted ? '🔇' : '🔊');
      }
    };
    this.events.on('update', syncAudioIcon);
    this.events.once('shutdown', () => this.events.off('update', syncAudioIcon));

    muteBtn.on('pointerdown', () => {
      if (this.sound.volume === 0) {
        this.sound.volume = 0.5;
        this.sound.mute = false;
      } else {
        this.sound.mute = !this.sound.mute;
      }
      syncAudioUI();
    });

    const updateVolumeFromPointer = (pointerX: number) => {
      const newX = Phaser.Math.Clamp(pointerX, sliderX, sliderX + sliderWidth);
      const newVol = (newX - sliderX) / sliderWidth;
      this.sound.volume = newVol;
      if (newVol > 0 && this.sound.mute) {
        this.sound.mute = false;
      }
      syncAudioUI();
    };

    trackHitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => updateVolumeFromPointer(pointer.x));
  }

  private drawStatsBg() {
    this.statsBg.clear();
    this.statsBg.fillStyle(this.statsBgColor, 0.85);
    this.statsBg.fillRoundedRect(10, 14, this.statsBgWidth, 60, 12);
    this.statsBg.lineStyle(2, 0xb45309, 1);
    this.statsBg.strokeRoundedRect(10, 14, this.statsBgWidth, 60, 12);
  }

  private updateHealthBar() {
    this.healthBar.clear();
    
    // Background
    this.healthBar.fillStyle(0x292524); // stone-800
    this.healthBar.fillRoundedRect(20, 29, 300, 30, 12);
    
    // Health fill
    const healthPercent = this.player.health / this.player.maxHealth;
    const color = healthPercent > 0.6 ? 0x166534 : healthPercent > 0.3 ? 0xb45309 : 0x991b1b;
    this.healthBar.fillStyle(color);
    if (healthPercent > 0) this.healthBar.fillRoundedRect(20, 29, 300 * healthPercent, 30, 12);
    
    // Border
    this.healthBar.lineStyle(2, 0xb45309);
    this.healthBar.strokeRoundedRect(20, 29, 300, 30, 12);
    
    this.emitProgress();
  }

  update(time: number, delta: number) {
    // On scene restart, properties can be "zombie" objects (exist but are destroyed).
    // We must check for a property that is destroyed on shutdown, like `children` on a group
    // or `body` on a sprite, to ensure they are fully instantiated before use.
    // This makes the update loop "wait" as you suggested.
    if (!this.player?.body || !this.bullets?.children || !this.enemies?.children || !this.chests?.children || !this.flowField || this.isModalOpen) {
      return;
    }

    this.player.joystickVector.copy(this.joystickActive ? this.moveVector : Phaser.Math.Vector2.ZERO);
    this.player.update();

    if (!this.player.isDead) {
      this.flowField.updateTarget(this.player.x, this.player.y);
    }
    this.easystar.calculate();
    this.easystarFlying.calculate();

    this.updateBullets(delta);
    
    const currentTime = this.time.now;
    
    if (currentTime >= this.enemiesFrozenUntil) {
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
        if (enemy.updateDepth) enemy.updateDepth();
      });
      if (this.boss && this.boss.setVelocity) {
        this.boss.setVelocity(0, 0);
        if (this.boss.updateDepth) this.boss.updateDepth();
      }
    }

    // Dynamically manage Invincibility (Yellow Crystal)
    if (this.player.isInvincible) {
      if (currentTime >= this.yellowEffectEndTime) {
        this.player.isInvincible = false;
        this.player.clearTint();
      } else {
        const timeLeft = this.yellowEffectEndTime - currentTime;
        if (timeLeft <= 1000) { // Flicker in the last 1 second
          if (Math.floor(currentTime / 100) % 2 === 0) {
            this.player.setTint(0xffff33);
          } else {
            this.player.clearTint();
          }
        } else {
          this.player.setTint(0xffff33);
        }
      }
    }

    if (this.player.hasFireball && currentTime >= this.orangeEffectEndTime) {
      this.isOrangeCrystalActive = false;
      this.player.hasFireball = false;
    }

    if (this.playerShadow && !this.player.isDead) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 39);
    }

    // Group and perfectly center all active effect countdowns
    if (!this.player.isDead) {
      this.activeEffects = this.activeEffects.filter(effect => {
        if (currentTime < effect.endTime) return true;
        effect.textObj.destroy();
        return false;
      });

      if (this.activeEffects.length > 0) {
        const spacing = 15;
        let totalWidth = 0;
        this.activeEffects.forEach(effect => {
          const secondsLeft = Math.ceil((effect.endTime - currentTime) / 1000);
          effect.textObj.setText(secondsLeft.toString());
          totalWidth += effect.textObj.width + spacing;
        });
        totalWidth -= spacing; // remove trailing spacing

        let currentX = this.player.x - (totalWidth / 2);
        this.activeEffects.forEach(effect => {
          const w = effect.textObj.width;
          effect.textObj.setPosition(currentX + (w / 2), this.player.y - 45).setDepth(this.player.depth + 1);
          currentX += w + spacing;
        });
      }
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
      ...(this.bullets && this.bullets.children ? this.bullets.children.entries : []),
      ...(this.enemyBullets && this.enemyBullets.children ? this.enemyBullets.children.entries : [])
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
      
      if (bullet.setDepth) {
        if (bullet.getData('isSpecial')) {
          bullet.setDepth(3000); // Fixed high depth to stay over everything
        } else {
          const depthOffset = bullet.getData('depthOffset') || 0;
          const baseDepth = bullet.y + (bullet.displayHeight / 2);
          bullet.setDepth(baseDepth + depthOffset);
        }
      }
      
      // Add particle trail for special bullets
      if (bullet.getData('isSpecial') && bullet.active) {
        if (Math.random() < 0.7) {
          const orangeShades = [0xf97316, 0xfb923c, 0xfcd34d, 0xffedd5];
          const color = Phaser.Utils.Array.GetRandom(orangeShades);
          const offsetX = Phaser.Math.FloatBetween(-5, 5);
          const offsetY = Phaser.Math.FloatBetween(-5, 5);
          const spark = this.add.star(bullet.x + offsetX, bullet.y + offsetY, 4, 4, 14, color);
          spark.setStrokeStyle(1, 0xb45309, 0.8);
          spark.setDepth(3001);
          this.tweens.add({
            targets: spark,
            alpha: 0,
            scale: 0,
            angle: Phaser.Math.Between(90, 270),
            duration: Phaser.Math.Between(300, 500),
            onComplete: () => spark.destroy()
          });
        }
      }

      // Remove bullet after lifetime expires (original used 1750ms)
      const lifespan = bullet.getData('lifespan') || 1750;
      if (born > lifespan) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();
      }
    });
  }

  private fireBullet(targetX?: number, targetY?: number) {
    if (this.isOrangeCrystalActive && this.bullets.getChildren().length >= 1) {
      return; // Only 1 instance at a time for special attack
    }

    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
    const isSpecial = this.isOrangeCrystalActive;
    bullet.setScale(isSpecial ? 1.2 : 0.4); // 3x larger if special
    bullet.setTint(isSpecial ? 0xf97316 : 0xfcd34d); // Orange if special
    
    // Use the exact touch coordinate if provided, otherwise fallback to the active pointer
    const pointer = this.input.activePointer;
    const mouseX = targetX !== undefined ? targetX : pointer.worldX;
    const mouseY = targetY !== undefined ? targetY : pointer.worldY;
    
    // Calculate direction from player to mouse click (like original code)
    const deltaX = mouseX - this.player.x;
    const deltaY = mouseY - this.player.y;
    
    // Normalize direction and set speed properties like original
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const baseSpeed = isSpecial ? 0.375 : 0.75; // Half speed if special
    
    if (distance > 0) {
      bullet.setData('speedX', (deltaX / distance) * baseSpeed);
      bullet.setData('speedY', (deltaY / distance) * baseSpeed);
    } else {
      // Default direction if mouse is on player
      bullet.setData('speedX', baseSpeed);
      bullet.setData('speedY', 0);
    }
    
    bullet.setData('born', 0); // Track lifetime like original
    bullet.setData('lifespan', isSpecial ? 738.28125 * 2 : 738.28125); // Double lifespan so it travels full distance at half speed
    bullet.setData('damage', isSpecial ? 125 : 25); // 5x damage
    bullet.setData('bossDamage', isSpecial ? 250 : 50); // 5x damage for boss
    bullet.setData('ignoreWalls', isSpecial); // Ignores obstacles
    bullet.setData('isSpecial', isSpecial); // Flag for particle trail
    if (isSpecial) {
      bullet.setData('pierceCount', 2);
      bullet.setData('hitEnemies', []);
    }
    
    this.bullets.add(bullet);
    
    // Play shooting sound
    if (isSpecial) {
      this.sound.play('fireball_shoot', { volume: 0.5 });
    } else {
      this.sound.play('spit', { volume: 0.3 });
    }
    
    console.log('Bullet fired toward:', mouseX, mouseY, 'with speed:', bullet.getData('speedX'), bullet.getData('speedY'));
  }

  private openChest(chest: Phaser.Physics.Arcade.Sprite) {
    if (this.isModalOpen) return;
    if (chest.getData('opened')) return;
    if (chest.getData('nextInteractionTime') && this.time.now < chest.getData('nextInteractionTime')) return;
    
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
    if (distance > 110) {
      this.showMessage('You are too far away to open this chest!');
      return;
    }

    const questionIndex = Number(chest.getData('questionIndex')) || 0;
    const apiQuestions = this.registry.get('apiQuestions');
    const validQuestions = getValidQuestions(apiQuestions || questionsData);
    const question = this.dungeonQuestions[questionIndex] || validQuestions[questionIndex % validQuestions.length];

    if (!question || !Array.isArray(question.options) || question.options.length === 0) {
      this.showMessage('Question data is unavailable right now. Please try again.');
      return;
    }

    this.showQuestionModal(question, (isCorrect: boolean) => {
      if (isCorrect) {
        chest.setData('opened', true);
        chest.setTint(0xffd700); // Gold tint for opened
        
        // Glitter effect
        const goldShades = [0xfffbeb, 0xfde68a, 0xfcd34d, 0xfbbf24, 0xf59e0b, 0xd97706];
        for (let i = 0; i < 30; i++) {
          const color = Phaser.Utils.Array.GetRandom(goldShades);
          // 4-pointed star (glint/sparkle shape), inner radius 3, outer 12, shaded gold color
          const spark = this.add.star(chest.x, chest.y, 4, 3, 12, color);
          spark.setStrokeStyle(1, 0xb45309, 0.8); // Amber-700 stroke for 3D depth
          spark.setScale(Phaser.Math.FloatBetween(0.3, 0.8)); // Larger particles
          spark.setDepth(1500);
          spark.setAngle(Phaser.Math.Between(0, 90)); // Random starting rotation
          
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const speed = Phaser.Math.FloatBetween(25, 70); // Reduced spread
          
          this.tweens.add({
            targets: spark,
            x: chest.x + Math.cos(angle) * speed,
            y: chest.y + Math.sin(angle) * speed - 30, // Drifts slightly upward
            angle: spark.angle + Phaser.Math.Between(180, 360), // Add spinning rotation
            alpha: 0,
            scale: 0,
            duration: Phaser.Math.Between(1500, 3000), // Slower animation
            ease: 'Cubic.easeOut',
            onComplete: () => spark.destroy()
          });
        }
        
        this.levelCorrectAnswers++;
        this.player.answerQuestion(true);
        
        this.sound.play('chest_sparkle', { volume: 0.6 });
        
        // Check if door should unlock
        if (this.levelCorrectAnswers >= 4) {
          this.unlockDoor();
        }
        
        // Play chest opening animation
        const openAnimKey = `open-${chest.texture.key}`;
        chest.anims.play(openAnimKey);
      } else {
        chest.setTint(0xff0000); // Red tint for wrong answer
        chest.setData('nextInteractionTime', this.time.now + 1500); // Prevent instant re-trigger if colliding
        this.time.delayedCall(1000, () => {
          chest.clearTint();
        });
        
        if (this.gameDifficulty === 'hard') {
          this.player.isInvulnerable = false; // Bypass i-frames to guarantee penalty
          this.hitPlayer(this.player, null, 10);
        }
        this.player.answerQuestion(false);
      }
      
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

  private showLevelIntro() {
    this.isModalOpen = true;
    this.physics.pause();
    this.resetJoystick();
    
    const modalBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      450,
      150,
      0x1c1917,
      0.95
    ).setStrokeStyle(2, 0xb45309).setScrollFactor(0).setDepth(3000).setRounded(16);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      `Dungeon ${this.currentDungeon} of ${this.maxDungeons}`,
      {
        fontSize: '36px',
        fill: '#fde68a',
        align: 'center',
        fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(13001);

    this.time.delayedCall(2500, () => {
      if (!this.sys || !this.sys.isActive() || !modalBg.active) return;
      this.tweens.add({
        targets: [modalBg, title],
        alpha: 0,
        duration: 500,
        onComplete: () => {
          if (modalBg.active) modalBg.destroy();
          if (title.active) title.destroy();
          this.physics.resume();
          this.isModalOpen = false;
        }
      });
    });
  }

  private showQuestionModal(question: Question, callback: (isCorrect: boolean) => void) {
    this.isModalOpen = true;
    this.physics.pause();
    this.time.paused = true;
    this.tweens.pauseAll();
    this.modalOpenTimestamp = this.time.now;
    this.resetJoystick();
    
    const playerName = this.registry.get('playerName') || 'Hero';

    const modalBg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      Math.min(640, this.scale.width * 0.9),
      420,
      0x1c1917,
      0.95
    ).setStrokeStyle(2, 0xb45309).setScrollFactor(0).setDepth(15000).setRounded(16);

    const title = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 170,
      `${playerName}, answer this question to open the chest`,
      {
        fontSize: '22px',
        fill: '#fbbf24',
        align: 'center',
        fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(15001);

    const questionText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 120,
      question.question,
      {
        fontSize: '24px',
        fill: '#fde68a',
        align: 'center',
        fontFamily: '"Georgia", "Times New Roman", serif',
        wordWrap: { width: Math.min(560, this.scale.width * 0.8) }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(15001);

    const closeHint = this.add.text(
      this.scale.width / 2,
      this.scale.height - 50,
      'Choose an answer to continue',
      {
        fontSize: '14px',
        fill: '#d6d3d1',
        align: 'center',
        fontFamily: '"Georgia", "Times New Roman", serif',
        fontStyle: 'italic',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: { x: 8, y: 4 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(15001);

    const modalElements: Phaser.GameObjects.GameObject[] = [modalBg, title, questionText, closeHint];

    let currentY = this.scale.height / 2 - 40;

    question.options.forEach((option, index) => {
      const btnText = this.add.text(
        this.scale.width / 2,
        currentY,
        `${index + 1}. ${option}`,
        {
          fontSize: '18px',
          fill: '#fef3c7',
          fontFamily: '"Georgia", "Times New Roman", serif',
          wordWrap: { width: 380, useAdvancedWrap: true },
          align: 'center'
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(15002);

      const textHeight = btnText.getBounds().height;
      const bgHeight = textHeight + 20;

      const btnBg = this.add.rectangle(
        this.scale.width / 2,
        currentY,
        400, bgHeight, 0x78350f
      ).setOrigin(0.5).setScrollFactor(0).setDepth(15001).setInteractive({ useHandCursor: true }).setRounded(8);

      btnBg.on('pointerover', () => { btnBg.setFillStyle(0x92400e); btnText.setFill('#fbbf24'); });
      btnBg.on('pointerout', () => { btnBg.setFillStyle(0x78350f); btnText.setFill('#fef3c7'); });
      
      btnBg.on('pointerdown', () => {
        this.cleanupQuestionModal(modalElements);
        callback(isCorrectAnswer(option, question.correctAnswer));
      });

      modalElements.push(btnBg, btnText);

      currentY += bgHeight + 15;
    });

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
    
    // Remove lingering keyboard listeners so they don't fire out of context
    this.input.keyboard!.off('keydown-ONE');
    this.input.keyboard!.off('keydown-TWO');
    this.input.keyboard!.off('keydown-THREE');
    this.input.keyboard!.off('keydown-FOUR');
    
    const timePaused = this.time.now - this.modalOpenTimestamp;
    this.orangeEffectEndTime += timePaused;
    this.yellowEffectEndTime += timePaused;
    this.enemiesFrozenUntil += timePaused;
    
    this.activeEffects.forEach(effect => { effect.endTime += timePaused; });
    
    this.enemies.getChildren().forEach((enemy: any) => {
      if (typeof enemy.shiftTimers === 'function') enemy.shiftTimers(timePaused);
    });
    if (this.boss && typeof this.boss.shiftTimers === 'function') {
      this.boss.shiftTimers(timePaused);
    }
    
    this.time.paused = false;
    this.tweens.resumeAll();
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
        score: this.player.score,
        health: this.player.health,
          level: this.currentDungeon,
        questionsAnswered: this.player.questionsAnswered,
        correctAnswers: this.player.correctAnswers,
        enemiesKilled: this.player.enemiesKilled,
          difficulty: this.gameDifficulty,
          usedQuestionIds: this.usedQuestionIds
        }
      });
    } else {
      // Go to next dungeon
      this.sound.stopAll();
      this.scene.start('DungeonGameScene', {
        dungeon: this.currentDungeon + 1,
        health: this.player.health,
        maxHealth: this.player.maxHealth,
        level: this.player.level,
        experience: this.player.experience,
        baseDamage: this.player.baseDamage,
        score: this.player.score,
        questionsAnswered: this.player.questionsAnswered,
        correctAnswers: this.player.correctAnswers,
        enemiesKilled: this.player.enemiesKilled,
        difficulty: this.gameDifficulty,
      usedQuestionIds: this.usedQuestionIds,
      inventory: Array.from(this.player.inventory.values())
      });
    }
  }

  private hitPlayer(player: any, enemy: any, damage?: number) {
    if (this.player.isDead) return;
    if (enemy && enemy.isDead) return; // Prevent damage from a dead enemy that hasn't fully decayed/revived yet
    
    // Default to the provided damage, or extract it from the Enemy config, or fallback to 20
    let actualDamage = damage;
    if (actualDamage === undefined) {
      actualDamage = (enemy && enemy.config && enemy.config.damage) ? enemy.config.damage : 20;
    }
    
    const wasKilled = this.player.takeDamage(actualDamage);
    
    // Only push player back if the physical enemy collision box exists
    if (enemy) {
      const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
      player.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150); // Reduced pushback
    }
    
    if (wasKilled) {
      if (this.playerShadow) this.playerShadow.destroy();
      this.activeEffects.forEach(e => e.textObj.destroy());
      this.activeEffects = [];
      
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
    if (enemy.getData('isDead') || !bullet.active) return;
    
    if (bullet.getData('isSpecial')) {
      const hitEnemies = bullet.getData('hitEnemies') || [];
      if (hitEnemies.includes(enemy)) return; // Prevent multi-hits per frame
      hitEnemies.push(enemy);
      bullet.setData('hitEnemies', hitEnemies);
    }
    
    const damage = bullet.getData('damage') || 25;
    enemy.takeDamage(damage);
    
    const pierceCount = bullet.getData('pierceCount') || 0;
    if (pierceCount > 0) {
      bullet.setData('pierceCount', pierceCount - 1);
    } else {
      bullet.destroy();
    }
  }

  private hitBoss(boss: any, bullet: any) {
    if (boss.getData('isDead') || !bullet.active) return;
    const damage = bullet.getData('bossDamage') || 50;
    bullet.destroy();
    
    if (this.bossVulnerability < 100) {
      this.showMessage('Boss is invulnerable! Answer all questions first!');
      return;
    }
    
    boss.takeDamage(damage);
    if (boss.isDead) {
      this.boss = undefined;
      this.showMessage('Boss defeated! Proceed to exit!');
      this.player.forceLevelUp(); // Guarantee level up
    }
  }

  public showMessage(message: string, duration: number = 2000) {
    const messageText = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
      fontSize: '22px',
      fill: '#fde68a', // amber-200
      fontFamily: '"Georgia", "Times New Roman", serif',
      align: 'center',
      wordWrap: { width: Math.min(560, this.scale.width * 0.8) }
    }).setOrigin(0.5).setDepth(12001).setScrollFactor(0);
    
    const bg = this.add.rectangle(
      this.scale.width / 2, 
      this.scale.height / 2, 
      messageText.width + 50, 
      messageText.height + 30, 
      0x1c1917,
      0.95
    ).setStrokeStyle(2, 0xb45309).setRounded(12).setDepth(12000).setScrollFactor(0);
    
    this.time.delayedCall(duration, () => {
      if (bg.active) bg.destroy();
      if (messageText.active) messageText.destroy();
    });
  }

  private gameOver() {
    this.sound.stopAll();
    this.sound.play('gameover_theme', { volume: 0.5 });
    this.scene.start('GameOverScene', {
      victory: false,
      playerStats: {
        score: this.player.score,
        health: 0,
        level: this.currentDungeon,
        questionsAnswered: this.player.questionsAnswered,
        correctAnswers: this.player.correctAnswers,
        enemiesKilled: this.player.enemiesKilled,
        difficulty: this.gameDifficulty,
        usedQuestionIds: this.usedQuestionIds
      }
    });
  }

  private updateUI() {
    this.scoreText.setText(`${this.player.score}`);
    this.questionsText.setText(`Questions: ${this.levelCorrectAnswers}/4`);
    
    this.emitProgress();
  }

  private emitProgress() {
    if (!this.game || !this.game.events) return;
    this.game.events.emit('playerStatsUpdate', {
        dungeon: this.currentDungeon,
        level: this.player.level,
        experience: this.player.experience,
        baseDamage: this.player.baseDamage,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      score: this.player.score,
      questionsAnswered: this.player.questionsAnswered,
      correctAnswers: this.player.correctAnswers,
      enemiesKilled: this.player.enemiesKilled,
      difficulty: this.gameDifficulty,
      usedQuestionIds: this.usedQuestionIds,
      inventory: this.player.inventory
    });
  }

  // Kept here for future implementation
  public handleMiniBossDefeated(miniBoss: any) {
    // Medium points for defeating a mini-boss (15% of max health)
    this.player.gainExperience(Math.floor(this.player.maxHealth * 0.15));
  }

  public togglePause(isPaused: boolean): void {
    this.isModalOpen = isPaused;
    if (isPaused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }
  }

  /**
   * Shifts all active timers forward by a given amount. This is called when resuming from a paused state
   * to ensure that effect durations are not consumed while the game is paused.
   * @param timePaused The duration in milliseconds that the game was paused.
   */  
  public shiftTimers(timePaused: number): void {
    this.orangeEffectEndTime += timePaused;
    this.yellowEffectEndTime += timePaused;
    this.enemiesFrozenUntil += timePaused;
    this.activeEffects.forEach(effect => { effect.endTime += timePaused; });
    this.enemies.getChildren().forEach((enemy: any) => {
      if (typeof enemy.shiftTimers === 'function') enemy.shiftTimers(timePaused);
    });
    if (this.boss && typeof this.boss.shiftTimers === 'function') {
      this.boss.shiftTimers(timePaused);
    }
  }

  public dropItem(playerX: number, playerY: number, itemKey: string) {
    // Drop the item a short distance away from the player in a random direction
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const distance = 60;
    const dropX = playerX + Math.cos(angle) * distance;
    const dropY = playerY + Math.sin(angle) * distance;

    const dropPos = this.getNearestValidDropPosition(dropX, dropY, 25, 25);

    const droppedItem = this.physics.add.sprite(dropPos.x, dropPos.y - 20, itemKey);
    droppedItem.setScale(1.2);
    droppedItem.setDepth(dropPos.y + 12);
    this.droppedItems.add(droppedItem);

    this.tweens.add({
      targets: droppedItem,
      y: dropPos.y,
      duration: 600,
      ease: 'Bounce.easeOut'
    });
  }

  private onPlayerLevelUp(level: number) {
    this.sound.play('star', { volume: 0.6 });

    const levelText = this.add.text(this.player.x, this.player.y - 30, 'LEVEL UP!', {
      fontSize: '18px',
      fill: '#ffffff', // Gold
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(10010);
    
    this.tweens.add({
      targets: levelText,
      y: levelText.y - 40,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => levelText.destroy()
    });
  }

  private addOrResetEffect(type: string, duration: number, color: string) {
    const endTime = this.time.now + duration;
    const existing = this.activeEffects.find(e => e.type === type);
    
    if (existing) {
      existing.endTime = endTime; // Reset timer for this specific effect
    } else {
      const textObj = this.add.text(0, 0, '', {
        fontSize: '24px', fill: color, fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(9000);
      this.activeEffects.push({ type, endTime, textObj, color });
    }
  }

  private handleEnemyDefeated(enemyType: string, x: number, y: number, isBabySpider: boolean = false) {
    this.player.enemiesKilled++;

    if (enemyType === 'spider' || enemyType === 'babyspider' || isBabySpider) {
      // Red blood burst effect
      const redShades = [0xfca5a5, 0xf87171, 0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b];
      for (let i = 0; i < 30; i++) {
        const color = Phaser.Utils.Array.GetRandom(redShades);
        const blood = this.add.circle(x, y, Phaser.Math.FloatBetween(4, 10), color);
        blood.setStrokeStyle(1, 0x450a0a, 0.8); // Dark red stroke for 3D depth
        blood.setDepth(1500);
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.FloatBetween(25, 70); // Reduced spread
        
        this.tweens.add({
          targets: blood,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed + 30, // Drifts downward to simulate liquid falling
          alpha: 0,
          scale: 0,
          duration: Phaser.Math.Between(1500, 3000),
          ease: 'Cubic.easeOut',
          onComplete: () => blood.destroy()
        });
      }

      if (enemyType === 'babyspider' || isBabySpider) {
        return; // Baby spiders don't drop anything
      }
    }

    if (enemyType === 'bat' || enemyType === 'chiroptera') {
      // Green blood burst effect
      const greenShades = [0xbbf7d0, 0x86efac, 0x4ade80, 0x22c55e, 0x16a34a, 0x15803d];
      for (let i = 0; i < 30; i++) {
        const color = Phaser.Utils.Array.GetRandom(greenShades);
        const blood = this.add.circle(x, y, Phaser.Math.FloatBetween(4, 10), color);
        blood.setStrokeStyle(1, 0x064e3b, 0.8); // Dark green stroke for 3D depth
        blood.setDepth(1500);
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.FloatBetween(25, 70); // Reduced spread
        
        this.tweens.add({
          targets: blood,
          x: x + Math.cos(angle) * speed,
          y: y + Math.sin(angle) * speed + 30, // Drifts downward to simulate liquid falling
          alpha: 0,
          scale: 0,
          duration: Phaser.Math.Between(1500, 3000),
          ease: 'Cubic.easeOut',
          onComplete: () => blood.destroy()
        });
      }

      if (Math.random() < (1 / 3)) {
        this.spawnCrystal('greencrystal', x, y);
      }
      return;
    }

    if (enemyType === 'skeleton' && this.currentDungeon >= 3 && this.currentDungeon <= 5) {
      if (Math.random() < 0.5) {
        this.spawnCrystal('redcrystal', x, y);
      }
      return;
    }

    if (this.currentDungeon >= 4) {
      let isGuaranteed = false;
      let crystalToDrop = '';

      if (enemyType === 'zombie') {
        if (this.guaranteedZombieDropReady) {
          this.guaranteedZombieDropReady = false;
          isGuaranteed = true;
        }
      } else if (enemyType === 'zombie2') {
        if (this.guaranteedZombie2DropReady) {
          this.guaranteedZombie2DropReady = false;
          isGuaranteed = true;
        }
      } else if (enemyType === 'spider') {
        if (this.guaranteedSpiderDropReady) {
          this.guaranteedSpiderDropReady = false;
          isGuaranteed = true;
        }
      }

      if (enemyType === 'zombie' || enemyType === 'zombie2' || enemyType === 'spider') {
        if (this.gameDifficulty === 'hard') {
          if (enemyType === 'zombie') crystalToDrop = 'orangecrystal';
          else if (enemyType === 'zombie2') crystalToDrop = 'bluecrystal';
          else if (enemyType === 'spider') crystalToDrop = 'yellowcrystal';
        } else if (this.gameDifficulty === 'medium') {
          if (enemyType === 'zombie') crystalToDrop = 'orangecrystal';
          else if (enemyType === 'zombie2') crystalToDrop = 'bluecrystal';
          else if (enemyType === 'spider') crystalToDrop = 'bluecrystal';
        } else if (this.gameDifficulty === 'easy') {
          crystalToDrop = Math.random() < 0.5 ? 'redcrystal' : 'orangecrystal';
        }

        if (isGuaranteed || Math.random() < (1 / 3)) {
          if (crystalToDrop) {
            this.spawnCrystal(crystalToDrop, x, y);
          }
        }
        return;
      }
    }

    // Legacy drops for dungeons 1-3
    const healthRatio = this.player.health / this.player.maxHealth;
    const getAdjustedHealDropChance = (baseChance: number) => {
      if (healthRatio <= 0.25) return 0.90; 
      if (healthRatio <= 0.40 && healthRatio > 0.25) return Math.min(1.0, baseChance * 1.5); 
      return baseChance;
    };

    if (enemyType === 'zombie') {
      if (Math.random() < (1 / 3)) {
        this.spawnCrystal('orangecrystal', x, y);
      }
    } else if (enemyType === 'zombie2' && (this.currentDungeon === 2 || this.currentDungeon === 3)) {
      const redDropChance = getAdjustedHealDropChance(0.20);
      if (Math.random() < redDropChance) {
        this.spawnCrystal('redcrystal', x, y);
      }
    } else if (enemyType === 'spider' && this.currentDungeon === 3) {
      if (this.gameDifficulty === 'medium' || this.gameDifficulty === 'easy') {
        const redDropChance = getAdjustedHealDropChance(0.20);
        if (Math.random() < redDropChance) {
          this.spawnCrystal('redcrystal', x, y);
        }
      }
    }
  }

  private collectItem(player: any, item: any) {
    const itemKey = item.texture.key;
    item.destroy();

    this.sound.play('star', { volume: 0.5 });

    const itemDefinition = ITEM_DATA[itemKey];

    if (itemDefinition) {
      this.player.addItem(itemDefinition);
    } else {
      // Fallback for any other items, defaults to a standard health potion
      this.player.addItem(ITEM_DATA['greencrystal']);
    }
  }

}
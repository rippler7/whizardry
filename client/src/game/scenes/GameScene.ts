import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Skeleton, Zombie, Bat, Boss } from '../entities/Enemy';
import { Chest, Door, Crystal, HealthPotion } from '../entities/Collectibles';
import { DUNGEON_CONFIGS } from '../data/GameData';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Phaser.Physics.Arcade.Group;
  private bullets: Phaser.Physics.Arcade.Group;
  private collectibles: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  
  // UI Elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;
  
  // Game state
  private dungeonId: number = 1;
  private difficulty: number = 1;
  private enemiesRemaining: number = 0;
  private isPaused: boolean = false;
  private restorePlayerStats: any;
  
  // Maps and tiles
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private baseTiles!: Phaser.Tilemaps.TilemapLayer;
  private wallTiles!: Phaser.Tilemaps.TilemapLayer;

  constructor() {
    super({ key: 'GameScene' });
    
    this.enemies = new Phaser.Physics.Arcade.Group();
    this.bullets = new Phaser.Physics.Arcade.Group();
    this.collectibles = new Phaser.Physics.Arcade.Group();
  }

  init(data: any): void {
    this.dungeonId = data.dungeonId || 1;
    this.difficulty = data.difficulty || 1;
    
    // If coming from another scene, restore player stats
    if (data.playerStats) {
      this.restorePlayerStats = data.playerStats;
    }
  }

  preload(): void {
    this.loadAssets();
  }

  private loadAssets(): void {
    // Audio
    this.load.audio('jungle', ['assets/audio/enchanted_forest.mp3', 'assets/audio/enchanted_forest_loop.ogg']);
    this.load.audio('fire', ['assets/audio/carrot.mp3', 'assets/audio/carrot.ogg']);
    this.load.audio('enemyHurt', ['assets/audio/enemy-death.mp3', 'assets/audio/enemy-death.ogg']);
    this.load.audio('playerHurt', ['assets/audio/hurt.mp3', 'assets/audio/hurt.ogg']);
    this.load.audio('doorOpen', ['assets/audio/open_door.mp3', 'assets/audio/open_door.ogg']);
    this.load.audio('doorLock', ['assets/audio/door_lock.mp3', 'assets/audio/door_lock.ogg']);
    this.load.audio('star', ['assets/audio/star.mp3', 'assets/audio/star.ogg']);
    this.load.audio('spitting', ['assets/audio/spit.mp3', 'assets/audio/spit.ogg']);
    
    // Sprites
    this.load.image('bullet', 'assets/sprites/bullet_32x32.png');
    this.load.image('fireball', 'assets/sprites/red_16x16.png');
    this.load.image('health_potion', 'assets/sprites/red_16x16.png');
    
    // Tilesets
    this.load.image('tiles', 'assets/maps/32x32_RPG00_marginless.png');
    
    // Tilemaps (CSV format)
    this.load.tilemapCSV('map_basic', 'mainMap2_base.csv');
    this.load.tilemapCSV('map_walls', 'mainMap2_walls.csv');
    this.load.tilemapCSV('crystalRed', 'mainMap2_redCrystals.csv');
    this.load.tilemapCSV('crystalBlue', 'mainMap2_blueCrystals.csv');
    this.load.tilemapCSV('crystalGreen', 'mainMap2_greenCrystals.csv');
    this.load.tilemapCSV('crystalYellow', 'mainMap2_yellowCrystals.csv');
    
    // Sprite sheets
    this.load.spritesheet('player', 'assets/sprites/mageHero.png', { 
      frameWidth: 32, frameHeight: 48, endFrame: 15 
    });
    this.load.spritesheet('skeleton', 'assets/sprites/skeleton.png', { 
      frameWidth: 64, frameHeight: 64, endFrame: 272 
    });
    this.load.spritesheet('zombie', 'assets/sprites/zombies.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 95 
    });
    this.load.spritesheet('bat', 'assets/sprites/chiroptera.png', { 
      frameWidth: 64, frameHeight: 64, endFrame: 54 
    });
    this.load.spritesheet('Boss', 'assets/sprites/orc.png', { 
      frameWidth: 64, frameHeight: 64, endFrame: 272 
    });
    this.load.spritesheet('gate', 'assets/sprites/rpg_gate1.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 15 
    });
    this.load.spritesheet('chestRed', 'assets/sprites/chestRed_faceRight.png', { 
      frameWidth: 32, frameHeight: 64, endFrame: 7 
    });
    this.load.spritesheet('redcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-red.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 7 
    });
    this.load.spritesheet('bluecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-blue.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 7 
    });
    this.load.spritesheet('greencrystal', 'assets/sprites/crystal-qubodup-ccby3-32-green.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 7 
    });
    this.load.spritesheet('yellowcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { 
      frameWidth: 32, frameHeight: 32, endFrame: 7 
    });
  }

  create(): void {
    // Setup world
    this.setupTilemap();
    this.setupPlayer();
    this.setupEnemies();
    this.setupCollectibles();
    this.setupPhysics();
    this.setupUI();
    this.setupInput();
    this.setupAudio();
    
    // Setup camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  }

  private setupTilemap(): void {
    // Create tilemap from CSV
    this.tilemap = this.make.tilemap({ 
      key: 'map_basic', 
      tileWidth: 32, 
      tileHeight: 32 
    });
    
    const tileset = this.tilemap.addTilesetImage('tiles', 'tiles');
    
    // Create layers
    this.baseTiles = this.tilemap.createLayer(0, tileset!)!;
    
    // Create walls layer
    const wallsMap = this.make.tilemap({ 
      key: 'map_walls', 
      tileWidth: 32, 
      tileHeight: 32 
    });
    this.wallTiles = wallsMap.createLayer(0, tileset!)!;
    
    // Setup wall collisions
    this.walls = this.physics.add.staticGroup();
    this.wallTiles.forEachTile((tile) => {
      if (tile.index !== -1 && tile.index > 0) {
        const wallSprite = this.physics.add.staticSprite(
          tile.getCenterX(), 
          tile.getCenterY(), 
          'tiles'
        );
        wallSprite.setSize(32, 32);
        this.walls.add(wallSprite);
      }
    });
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  }

  private setupPlayer(): void {
    // Find spawn point (center of map for now)
    const spawnX = this.tilemap.widthInPixels / 2;
    const spawnY = this.tilemap.heightInPixels / 2;
    
    this.player = new Player(this, spawnX, spawnY);
    
    // Restore stats if coming from another scene
    if ((this as any).restorePlayerStats) {
      const stats = (this as any).restorePlayerStats;
      this.player.level = stats.level;
      this.player.health = stats.health;
      this.player.maxHealth = stats.maxHealth;
      this.player.experience = stats.experience;
      this.player.score = stats.score;
      this.player.questionsAnswered = stats.questionsAnswered;
      this.player.correctAnswers = stats.correctAnswers;
      this.player.enemiesKilled = stats.enemiesKilled || 0;
    }
    
    // Setup player events
    this.events.on('playerHealthChanged', this.updateHealthBar, this);
    this.events.on('playerScoreChanged', this.updateScore, this);
    this.events.on('playerLevelUp', this.onPlayerLevelUp, this);
    this.events.on('enemyDefeated', this.onEnemyDefeated, this);
  }

  private setupEnemies(): void {
    const config = DUNGEON_CONFIGS[this.dungeonId - 1];
    this.enemiesRemaining = config.enemyCount;
    
    // Spawn enemies based on dungeon configuration
    for (let i = 0; i < config.enemyCount; i++) {
      this.spawnRandomEnemy();
    }
  }

  private spawnRandomEnemy(): void {
    const x = Phaser.Math.Between(100, this.tilemap.widthInPixels - 100);
    const y = Phaser.Math.Between(100, this.tilemap.heightInPixels - 100);
    
    // Don't spawn too close to player
    const distance = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
    if (distance < 200) {
      this.spawnRandomEnemy(); // Try again
      return;
    }
    
    let enemy;
    const rand = Math.random();
    
    if (this.dungeonId === 5) {
      // Boss level
      enemy = new Boss(this, x, y, this.player);
    } else if (rand < 0.4) {
      enemy = new Skeleton(this, x, y, this.player);
    } else if (rand < 0.7) {
      enemy = new Zombie(this, x, y, this.player);
    } else {
      enemy = new Bat(this, x, y, this.player);
    }
    
    enemy.setWallsGroup(this.walls);
    this.enemies.add(enemy);
  }

  private setupCollectibles(): void {
    // Spawn chests
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, this.tilemap.widthInPixels - 100);
      const y = Phaser.Math.Between(100, this.tilemap.heightInPixels - 100);
      
      const config = DUNGEON_CONFIGS[this.dungeonId - 1];
      const chest = new Chest(this, x, y, config.questionDifficulty);
      this.collectibles.add(chest);
    }
    
    // Spawn crystals from CSV data
    this.spawnCrystalsFromMap('crystalRed', 'red');
    this.spawnCrystalsFromMap('crystalBlue', 'blue');
    this.spawnCrystalsFromMap('crystalGreen', 'green');
    this.spawnCrystalsFromMap('crystalYellow', 'yellow');
    
    // Spawn exit door (if not boss level)
    if (this.dungeonId < 5) {
      const doorX = this.tilemap.widthInPixels - 100;
      const doorY = 100;
      const requiredLevel = this.dungeonId + 1;
      const targetScene = this.dungeonId === 4 ? 'BossScene' : 'DungeonScene';
      
      const door = new Door(this, doorX, doorY, requiredLevel, targetScene);
      this.collectibles.add(door);
    }
  }

  private spawnCrystalsFromMap(mapKey: string, crystalType: 'red' | 'blue' | 'green' | 'yellow'): void {
    const crystalMap = this.make.tilemap({ 
      key: mapKey, 
      tileWidth: 32, 
      tileHeight: 32 
    });
    
    crystalMap.layers[0].data.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.index > 0) {
          const crystal = new Crystal(
            this, 
            x * 32 + 16, 
            y * 32 + 16, 
            crystalType
          );
          this.collectibles.add(crystal);
        }
      });
    });
  }

  private setupPhysics(): void {
    // Player-wall collisions
    this.physics.add.collider(this.player, this.walls);
    
    // Enemy-wall collisions
    this.physics.add.collider(this.enemies, this.walls);
    
    // Player-collectible overlaps
    this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
      (collectible as any).onCollect(player);
    });
    
    // Bullet-enemy collisions
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      (enemy as any).takeDamage(25);
    });
    
    // Bullet-wall collisions
    this.physics.add.collider(this.bullets, this.walls, (bullet) => {
      bullet.destroy();
    });
  }

  private setupUI(): void {
    const camera = this.cameras.main;
    
    // Health bar background
    this.add.rectangle(100, 30, 204, 24, 0x000000).setScrollFactor(0).setDepth(1000);
    
    // Health bar
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(1001);
    
    // UI Text
    this.healthText = this.add.text(10, 20, '', {
      fontSize: '16px',
      fill: '#fde68a',
      backgroundColor: '#1c1917',
      fontFamily: '"Georgia", "Times New Roman", serif',
      padding: { x: 5, y: 2 }
    }).setScrollFactor(0).setDepth(1001);
    
    this.scoreText = this.add.text(10, 50, '', {
      fontSize: '16px',
      fill: '#fbbf24',
      backgroundColor: '#1c1917',
      fontFamily: '"Georgia", "Times New Roman", serif',
      padding: { x: 5, y: 2 }
    }).setScrollFactor(0).setDepth(1001);
    
    this.levelText = this.add.text(10, 80, '', {
      fontSize: '16px',
      fill: '#fcd34d',
      backgroundColor: '#1c1917',
      fontFamily: '"Georgia", "Times New Roman", serif',
      padding: { x: 5, y: 2 }
    }).setScrollFactor(0).setDepth(1001);
    
    this.enemyCountText = this.add.text(10, 110, '', {
      fontSize: '16px',
      fill: '#f87171',
      backgroundColor: '#1c1917',
      fontFamily: '"Georgia", "Times New Roman", serif',
      padding: { x: 5, y: 2 }
    }).setScrollFactor(0).setDepth(1001);
    
    // Initial UI update
    this.updateHealthBar(this.player.health, this.player.maxHealth);
    this.updateScore(this.player.score);
    this.updateLevel(this.player.level);
    this.updateEnemyCount();
  }

  private setupInput(): void {
    // Pause key
    this.input.keyboard!.on('keydown-ESC', () => {
      this.pauseGame();
    });
    
    // Debug keys (only in development)
    if (process.env.NODE_ENV === 'development') {
      this.input.keyboard!.on('keydown-K', () => {
        // Kill all enemies (debug)
        this.enemies.children.entries.forEach(enemy => {
          (enemy as any).takeDamage(1000);
        });
      });
    }
  }

  private setupAudio(): void {
    // Play background music
    if (!this.sound.get('jungle')) {
      const music = this.sound.add('jungle', {
        loop: true,
        volume: 0.2
      });
      music.play();
    }
  }

  update(): void {
    if (this.isPaused) return;
    
    // Update player
    this.player.update();
    
    // Update enemies
    this.enemies.children.entries.forEach(enemy => {
      (enemy as any).update();
    });
    
    // Update bullets
    this.updateBullets();
    
    // Check game completion
    if (this.enemiesRemaining <= 0 && this.dungeonId < 5) {
      this.completeDungeon();
    }
  }

  private updateBullets(): void {
    // Clean up bullets that are off-screen or old
    this.bullets.children.entries.forEach(bullet => {
      const sprite = bullet as Phaser.Physics.Arcade.Sprite;
      if (sprite.x < -100 || sprite.x > this.tilemap.widthInPixels + 100 ||
          sprite.y < -100 || sprite.y > this.tilemap.heightInPixels + 100) {
        sprite.destroy();
      }
    });
  }

  private updateHealthBar(health: number, maxHealth: number): void {
    this.healthBar.clear();
    
    // Background
    this.healthBar.fillStyle(0x292524);
    this.healthBar.fillRect(2, 22, 200, 20);
    
    // Health bar
    const healthPercent = health / maxHealth;
    const barWidth = 200 * healthPercent;
    
    if (healthPercent > 0.6) {
      this.healthBar.fillStyle(0x166534);
    } else if (healthPercent > 0.3) {
      this.healthBar.fillStyle(0xb45309);
    } else {
      this.healthBar.fillStyle(0x991b1b);
    }
    
    this.healthBar.fillRect(2, 22, barWidth, 20);
    
    this.healthText.setText(`Health: ${health}/${maxHealth}`);
  }

  private updateScore(score: number): void {
    this.scoreText.setText(`Score: ${score}`);
  }

  private updateLevel(level: number): void {
    this.levelText.setText(`Level: ${level}`);
  }

  private updateEnemyCount(): void {
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  private onPlayerLevelUp(level: number): void {
    // Show level up notification
    const notification = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 100,
      `LEVEL UP! Level ${level}`,
      {
        fontSize: '32px',
        fill: '#fbbf24',
        fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
        stroke: '#78350f',
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
    
    this.time.delayedCall(3000, () => {
      notification.destroy();
    });
    
    this.updateLevel(level);
  }

  private onEnemyDefeated(enemyType: string): void {
    this.player.enemiesKilled++;
    this.enemiesRemaining--;
    this.updateEnemyCount();
    
    // Check for dungeon completion
    if (this.enemiesRemaining <= 0) {
      this.time.delayedCall(1000, () => {
        this.completeDungeon();
      });
    }
  }

  private completeDungeon(): void {
    if (this.dungeonId >= 5) {
      // Game complete!
      this.scene.start('GameOverScene', {
        victory: true,
        playerStats: {
          level: this.player.level,
          health: this.player.health,
          maxHealth: this.player.maxHealth,
          experience: this.player.experience,
          score: this.player.score,
          questionsAnswered: this.player.questionsAnswered,
          correctAnswers: this.player.correctAnswers,
          enemiesKilled: this.player.enemiesKilled
        }
      });
    } else {
      // Show completion message
      const completionText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Dungeon Complete!\nFind the exit door to continue.',
        {
          fontSize: '24px',
          fill: '#fde68a',
          fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
          stroke: '#78350f',
          strokeThickness: 3,
          align: 'center'
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
      
      this.time.delayedCall(4000, () => {
        completionText.destroy();
      });
    }
  }

  private pauseGame(): void {
    this.isPaused = true;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  // Called when resuming from pause
  resume(): void {
    this.isPaused = false;
  }
}
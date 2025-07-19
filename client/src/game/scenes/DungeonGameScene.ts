import * as Phaser from 'phaser';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: number;
}

export class DungeonGameScene extends Phaser.Scene {
  // Game objects
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
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
  private currentDungeon: number = 1;
  private maxDungeons: number = 5;
  private doorUnlocked: boolean = false;
  private bossVulnerability: number = 0; // 0-100%, boss takes 25% per correct answer

  // UI elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private questionsText!: Phaser.GameObjects.Text;
  private dungeonText!: Phaser.GameObjects.Text;

  // Educational questions for this dungeon
  private dungeonQuestions: Question[] = [
    {
      id: 1,
      question: "What is 8 + 7?",
      options: ["13", "14", "15", "16"],
      correctAnswer: "15",
      category: "math",
      difficulty: 1
    },
    {
      id: 2,
      question: "What is the capital of Japan?",
      options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
      correctAnswer: "Tokyo",
      category: "geography",
      difficulty: 1
    },
    {
      id: 3,
      question: "How many planets are in our solar system?",
      options: ["7", "8", "9", "10"],
      correctAnswer: "8",
      category: "science",
      difficulty: 2
    },
    {
      id: 4,
      question: "Who painted the Mona Lisa?",
      options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
      correctAnswer: "Da Vinci",
      category: "history",
      difficulty: 2
    }
  ];

  constructor() {
    super({ key: 'DungeonGameScene' });
  }

  init(data: any) {
    this.currentDungeon = data.dungeon || 1;
    this.playerHealth = data.health || 100;
    this.playerScore = data.score || 0;
  }

  preload() {
    // Load sprites using your original specifications
    this.load.spritesheet('player', '/assets/sprites/mageHero.png', { frameWidth: 32, frameHeight: 48, endFrame: 15 });
    this.load.spritesheet('skeleton', '/assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', '/assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', '/assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', '/assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', '/assets/sprites/rpg_gate1.png', { frameWidth: 32, frameHeight: 32, endFrame: 15 });
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

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x2d4a22);

    // Create player with animated spritesheet
    this.player = this.physics.add.sprite(100, height / 2, 'player', 0);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(1.5); // Scale to make visible
    
    // Create player animations
    this.createPlayerAnimations();

    // Create physics groups
    this.enemies = this.physics.add.group();
    this.chests = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // Create dungeon layout
    this.createDungeonLayout();

    // Create enemies based on dungeon level
    this.createEnemies();

    // Create question chests
    this.createQuestionChests();

    // Create exit door
    this.createExitDoor();

    // Setup controls
    this.setupControls();

    // Setup collisions
    this.setupCollisions();

    // Create UI
    this.createUI();

    // Start background music
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

    // Add some obstacles in the middle
    const obstacle1 = this.add.rectangle(width / 3, height / 3, 64, 64, wallColor);
    const obstacle2 = this.add.rectangle(width * 2/3, height * 2/3, 64, 64, wallColor);
    walls.add(obstacle1);
    walls.add(obstacle2);

    // Store walls for collision detection
    this.registry.set('walls', walls);
  }

  private createEnemies() {
    const enemyCount = Math.min(2 + this.currentDungeon, 6);
    const enemyTypes = ['skeleton', 'zombie', 'chiroptera'];

    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(200, this.scale.width - 200);
      const y = Phaser.Math.Between(100, this.scale.height - 100);
      const enemyType = enemyTypes[i % enemyTypes.length];
      
      // Use proper enemy sprites with correct mapping
      const spriteMap: { [key: string]: string } = {
        'skeleton': 'skeleton',
        'zombie': 'zombie',
        'chiroptera': 'bat'
      };
      
      const spriteKey = spriteMap[enemyType] || 'skeleton';
      const enemy = this.physics.add.sprite(x, y, spriteKey, 0);
      enemy.setScale(1.0); // Normal scale since sprites are properly sized
      enemy.setData('health', 50 + this.currentDungeon * 10);
      enemy.setData('maxHealth', 50 + this.currentDungeon * 10);
      enemy.setData('type', enemyType);
      
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
        }
        enemy.anims.play('walkDownZombie'); // Default
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
      }
      
      this.enemies.add(enemy);
    }
  }

  private createQuestionChests() {
    const chestTypes = ['chestBlue', 'chestGreen', 'chestRed', 'chestYellow'];
    const positions = [
      { x: 150, y: 150 },
      { x: this.scale.width - 150, y: 150 },
      { x: 150, y: this.scale.height - 150 },
      { x: this.scale.width - 150, y: this.scale.height - 150 }
    ];

    positions.forEach((pos, index) => {
      const chest = this.physics.add.sprite(pos.x, pos.y, chestTypes[index], 0);
      chest.setScale(1.0); // Normal scale since chests are properly sized now
      chest.setData('questionIndex', index);
      chest.setData('opened', false);
      chest.setInteractive();
      
      // Create chest opening animation using original specifications
      const openAnimKey = `open-${chestTypes[index]}`;
      if (!this.anims.exists(openAnimKey)) {
        if (chestTypes[index] === 'chestRed' || chestTypes[index] === 'chestBlue') {
          this.anims.create({
            key: openAnimKey,
            frames: this.anims.generateFrameNumbers(chestTypes[index], { start: 0, end: 3 }),
            frameRate: 8,
            repeat: 0
          });
        } else { // Green and Yellow chests
          this.anims.create({
            key: openAnimKey,
            frames: this.anims.generateFrameNumbers(chestTypes[index], { start: 4, end: 7 }),
            frameRate: 8,
            repeat: 0
          });
        }
      }
      // Start with first frame (closed chest)
      chest.setFrame(chestTypes[index] === 'chestGreen' || chestTypes[index] === 'chestYellow' ? 4 : 0);
      
      chest.on('pointerdown', () => this.openChest(chest));
      
      this.chests.add(chest);
    });
  }

  private createExitDoor() {
    this.door = this.physics.add.sprite(this.scale.width - 50, this.scale.height / 2, 'gate', 0);
    this.door.setScale(1.5); // Scale to make visible
    this.door.setTint(0x888888); // Initially locked (gray)
    
    // Create gate animations using original specifications
    if (!this.anims.exists('openGate')) {
      this.anims.create({
        key: 'openGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: false
      });
      this.anims.create({
        key: 'closeGate',
        frames: this.anims.generateFrameNumbers('gate', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: false
      });
    }
  }

  private createBoss() {
    if (this.currentDungeon === this.maxDungeons) {
      this.boss = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'Boss', 0);
      this.boss.setScale(1.5); // Proper scale for boss
      this.boss.setData('health', 400);
      this.boss.setData('maxHealth', 400);
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
      this.physics.add.collider(this.enemies, walls);
      this.physics.add.collider(this.bullets, walls, (bullet: any) => {
        bullet.destroy(); // Bullets destroyed when hitting walls
      });
    }
    
    // Player vs enemies
    this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, undefined, this);
    
    // Bullets vs enemies
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    
    // Player vs door
    this.physics.add.overlap(this.player, this.door, this.tryExitDungeon, undefined, this);
    
    // Player vs boss (if exists)
    if (this.boss) {
      this.physics.add.overlap(this.player, this.boss, this.hitPlayer, undefined, this);
      this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, undefined, this);
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

    this.questionsText = this.add.text(20, 45, `Questions: ${this.correctAnswers}/4`, {
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
    this.handlePlayerMovement();
    this.handleShooting();
    this.updateBullets(delta);
    this.updateEnemies();
    
    if (this.boss) {
      this.updateBoss();
    }
  }

  private updateBullets(delta: number) {
    this.bullets.children.entries.forEach((bullet: any) => {
      // Update bullet position using delta time like original code
      const born = bullet.getData('born') + delta;
      bullet.setData('born', born);
      
      const speedX = bullet.getData('speedX');
      const speedY = bullet.getData('speedY');
      
      // Apply velocity using delta time (like original: delta * speed * -50)
      bullet.body.setVelocityX(delta * speedX * -50);
      bullet.body.setVelocityY(delta * speedY * -50);
      
      // Remove bullet after lifetime expires (original used 1750ms)
      if (born > 1750) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.destroy();
      }
    });
  }

  private handlePlayerMovement() {
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
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.fireBullet();
    }
  }

  private fireBullet() {
    const bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet');
    bullet.setScale(1.2); // Make it more visible as a magic orb
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
    const baseSpeed = 0.3; // Same as original
    
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
      // Simple AI: move towards player but slower
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      
      if (distance < 200 && distance > 32) { // Don't move if too close
        const speed = 25 + this.currentDungeon * 5; // Much slower
        this.physics.moveToObject(enemy, this.player, speed);
        
        // Update animation based on movement direction
        const enemyType = enemy.getData('type');
        const deltaX = this.player.x - enemy.x;
        const deltaY = this.player.y - enemy.y;
        
        if (enemyType === 'skeleton') {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Moving horizontally
            if (deltaX > 0) {
              enemy.anims.play('walkRightSkeleton', true);
            } else {
              enemy.anims.play('walkLeftSkeleton', true);
            }
          } else {
            // Moving vertically
            if (deltaY > 0) {
              enemy.anims.play('walkDownSkeleton', true);
            } else {
              enemy.anims.play('walkUpSkeleton', true);
            }
          }
        } else if (enemyType === 'zombie') {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Moving horizontally
            if (deltaX > 0) {
              enemy.anims.play('walkRightZombie', true);
            } else {
              enemy.anims.play('walkLeftZombie', true);
            }
          } else {
            // Moving vertically
            if (deltaY > 0) {
              enemy.anims.play('walkDownZombie', true);
            } else {
              enemy.anims.play('walkUpZombie', true);
            }
          }
        } else if (enemyType === 'chiroptera') {
          // Bat flies left or right based on horizontal movement
          if (deltaX > 0) {
            enemy.anims.play('flyRight', true);
          } else {
            enemy.anims.play('flyLeft', true);
          }
        }
      } else {
        // Stop moving if too close
        enemy.setVelocity(0, 0);
      }
    });
  }

  private updateBoss() {
    if (!this.boss) return;
    
    // Boss behavior based on vulnerability (slower overall)
    const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    const deltaX = this.player.x - this.boss.x;
    const deltaY = this.player.y - this.boss.y;
    
    if (this.bossVulnerability < 100) {
      // Invulnerable: very slow movement
      if (distance > 100) {
        this.physics.moveToObject(this.boss, this.player, 15); // Much slower
        
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
        this.physics.moveToObject(this.boss, this.player, 40); // Reduced from 80
        
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
    
    const questionIndex = chest.getData('questionIndex');
    const question = this.dungeonQuestions[questionIndex];
    
    this.showQuestionModal(question, (isCorrect: boolean) => {
      if (isCorrect) {
        chest.setData('opened', true);
        chest.setTint(0x00ff00); // Green tint for opened
        this.correctAnswers++;
        this.playerScore += 100;
        this.bossVulnerability += 25; // 25% vulnerability per correct answer
        
        this.sound.play('star', { volume: 0.5 });
        
        // Check if door should unlock
        if (this.correctAnswers >= 4) {
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
    const modalText = `${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nEnter number (1-4):`;
    
    const answer = prompt(modalText);
    const answerIndex = parseInt(answer || '0') - 1;
    
    if (answerIndex >= 0 && answerIndex < question.options.length) {
      const isCorrect = question.options[answerIndex] === question.correctAnswer;
      callback(isCorrect);
    } else {
      callback(false);
    }
  }

  private unlockDoor() {
    this.doorUnlocked = true;
    this.door.clearTint(); // Remove gray tint
    this.door.setTint(0x00ff00); // Green tint when unlocked
    
    // Play gate opening animation
    this.door.anims.play('openGate');
    
    // Create boss if final dungeon
    if (this.currentDungeon === this.maxDungeons && !this.boss) {
      this.createBoss();
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
      this.scene.start('GameOverScene', {
        victory: true,
        playerStats: {
          score: this.playerScore,
          health: this.playerHealth,
          questionsAnswered: this.questionsAnswered,
          correctAnswers: this.correctAnswers
        }
      });
    } else {
      // Go to next dungeon
      this.scene.start('DungeonGameScene', {
        dungeon: this.currentDungeon + 1,
        health: this.playerHealth,
        score: this.playerScore
      });
    }
  }

  private hitPlayer(player: any, enemy: any) {
    this.playerHealth -= 20;
    this.sound.play('hurt', { volume: 0.4 });
    
    // Push player back (less force)
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    player.setVelocity(Math.cos(angle) * 100, Math.sin(angle) * 100); // Reduced pushback
    
    this.updateHealthBar();
    
    if (this.playerHealth <= 0) {
      this.gameOver();
    }
  }

  private hitEnemy(bullet: any, enemy: any) {
    bullet.destroy();
    
    const health = enemy.getData('health') - 25;
    enemy.setData('health', health);
    
    if (health <= 0) {
      this.sound.play('enemy-death', { volume: 0.3 });
      enemy.destroy();
      this.playerScore += 50;
      this.updateUI();
    } else {
      // Flash red when hit
      enemy.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        enemy.clearTint();
      });
    }
  }

  private hitBoss(bullet: any, boss: any) {
    bullet.destroy();
    
    if (this.bossVulnerability === 0) {
      this.showMessage('Boss is invulnerable! Answer questions first!');
      return;
    }
    
    const damageMultiplier = this.bossVulnerability / 100;
    const damage = 50 * damageMultiplier;
    
    const health = boss.getData('health') - damage;
    boss.setData('health', health);
    
    if (health <= 0) {
      boss.destroy();
      this.playerScore += 500;
      this.showMessage('Boss defeated! Proceed to exit!');
    } else {
      boss.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        if (this.bossVulnerability >= 100) {
          boss.clearTint();
        } else {
          boss.setTint(0x8888ff); // Return to invulnerable tint
        }
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

  private gameOver() {
    this.scene.start('GameOverScene', {
      victory: false,
      playerStats: {
        score: this.playerScore,
        health: 0,
        questionsAnswered: this.questionsAnswered,
        correctAnswers: this.correctAnswers
      }
    });
  }

  private updateUI() {
    this.scoreText.setText(`Score: ${this.playerScore}`);
    this.questionsText.setText(`Questions: ${this.correctAnswers}/4`);
  }


}
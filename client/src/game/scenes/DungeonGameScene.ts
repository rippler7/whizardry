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
    // Load character spritesheet for animated player
    this.load.spritesheet('player', '/assets/sprites/char.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load atlas spritesheet for enemies and other sprites
    this.load.spritesheet('atlas', '/assets/sprites/atlas1.png', {
      frameWidth: 32,
      frameHeight: 32
    });
    
    // Load individual sprites as backup
    this.load.image('mageHero', '/assets/sprites/mageHero.png');
    this.load.image('skeleton', '/assets/sprites/skeleton.png');
    this.load.image('zombie', '/assets/sprites/zombie.png');
    this.load.image('chiroptera', '/assets/sprites/chiroptera.png');
    this.load.image('threeheadedsnake', '/assets/sprites/threeheadedsnake.png');
    this.load.image('bullet', '/assets/sprites/bullet.png');
    
    // Load chest sprites
    this.load.image('chestBlue', '/assets/sprites/chestBlue_faceRight.png');
    this.load.image('chestGreen', '/assets/sprites/chestGreen_faceLeft.png');
    this.load.image('chestRed', '/assets/sprites/chestRed_faceRight.png');
    this.load.image('chestYellow', '/assets/sprites/chestYellow_faceLeft.png');
    
    // Load door sprite
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
    // Create walking animations for all directions
    // Down (facing camera) - frames 0-2
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 2 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Left - frames 9-11
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Right - frames 18-20
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNumbers('player', { start: 18, end: 20 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Up (facing away) - frames 27-29
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('player', { start: 27, end: 29 }),
      frameRate: 8,
      repeat: -1
    });
    
    // Idle animations
    this.anims.create({
      key: 'idle-down',
      frames: [{ key: 'player', frame: 1 }],
      frameRate: 1
    });
    
    this.anims.create({
      key: 'idle-left',
      frames: [{ key: 'player', frame: 10 }],
      frameRate: 1
    });
    
    this.anims.create({
      key: 'idle-right',
      frames: [{ key: 'player', frame: 19 }],
      frameRate: 1
    });
    
    this.anims.create({
      key: 'idle-up',
      frames: [{ key: 'player', frame: 28 }],
      frameRate: 1
    });
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
      
      // Use atlas sprites for enemies with animation
      const atlasFrameMap: { [key: string]: number } = {
        'skeleton': 12, // First frame for skeleton in atlas
        'zombie': 24,   // First frame for zombie in atlas  
        'chiroptera': 36 // First frame for bat in atlas
      };
      
      const enemy = this.physics.add.sprite(x, y, 'atlas', atlasFrameMap[enemyType] || 0);
      enemy.setScale(1.2); // Scale to make visible
      enemy.setData('health', 50 + this.currentDungeon * 10);
      enemy.setData('maxHealth', 50 + this.currentDungeon * 10);
      enemy.setData('type', enemyType);
      
      // Create simple animation for enemies
      const animKey = `${enemyType}-move`;
      if (!this.anims.exists(animKey)) {
        const startFrame = atlasFrameMap[enemyType] || 0;
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers('atlas', { start: startFrame, end: startFrame + 2 }),
          frameRate: 4,
          repeat: -1
        });
      }
      enemy.anims.play(animKey);
      
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
      const chest = this.physics.add.sprite(pos.x, pos.y, chestTypes[index]);
      chest.setScale(1.5); // Scale to make visible
      chest.setData('questionIndex', index);
      chest.setData('opened', false);
      chest.setInteractive();
      
      chest.on('pointerdown', () => this.openChest(chest));
      
      this.chests.add(chest);
    });
  }

  private createExitDoor() {
    this.door = this.physics.add.sprite(this.scale.width - 50, this.scale.height / 2, 'door');
    this.door.setScale(1.5); // Scale to make visible
    this.door.setTint(0x888888); // Initially locked (gray)
  }

  private createBoss() {
    if (this.currentDungeon === this.maxDungeons) {
      this.boss = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'threeheadedsnake');
      this.boss.setScale(2.0); // Proper scale for boss
      this.boss.setData('health', 400);
      this.boss.setData('maxHealth', 400);
      this.boss.setTint(0x8888ff); // Blue tint when invulnerable
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

  update() {
    this.handlePlayerMovement();
    this.handleShooting();
    this.updateEnemies();
    
    if (this.boss) {
      this.updateBoss();
    }
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
    bullet.setScale(0.8); // Slightly larger and easier to see
    
    // Aim towards mouse pointer
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
    
    bullet.setRotation(angle);
    this.physics.velocityFromRotation(angle, 250, bullet.body!.velocity); // Reduced from 400
    
    this.bullets.add(bullet);
    
    // Play sound
    this.sound.play('spit', { volume: 0.3 });
    
    // Remove bullet after 3 seconds (longer lifetime)
    this.time.delayedCall(3000, () => {
      if (bullet.active) {
        bullet.destroy();
      }
    });
  }

  private updateEnemies() {
    this.enemies.children.entries.forEach((enemy: any) => {
      // Simple AI: move towards player but slower
      const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
      
      if (distance < 200 && distance > 32) { // Don't move if too close
        const speed = 25 + this.currentDungeon * 5; // Much slower
        this.physics.moveToObject(enemy, this.player, speed);
      } else {
        // Stop moving if too close
        enemy.setVelocity(0, 0);
      }
    });
  }

  private updateBoss() {
    if (!this.boss) return;
    
    // Boss behavior based on vulnerability (slower overall)
    if (this.bossVulnerability < 100) {
      // Invulnerable: very slow movement
      const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
      if (distance > 100) {
        this.physics.moveToObject(this.boss, this.player, 15); // Much slower
      } else {
        this.boss.setVelocity(0, 0); // Stop if close
      }
    } else {
      // Vulnerable: moderate movement
      const distance = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
      if (distance > 50) {
        this.physics.moveToObject(this.boss, this.player, 40); // Reduced from 80
      } else {
        this.boss.setVelocity(0, 0);
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
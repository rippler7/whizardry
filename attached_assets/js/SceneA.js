// Refactored SceneA based on your uploaded script.js
// Modular, optimized structure with reduced repetition

class SceneA extends Phaser.Scene {
  constructor() {
    super('SceneA');
  }

  init(data) {
    this.setupGameData(data);
  }

   preload() {
    this.setupLoadingBar();

    this.loadAssets();
  }

  create() {
    this.createAnimations();
    this.setupTilemaps();
    this.setupPlayer();
    this.setupSounds();
    this.spawnEntities();
    this.setupChests();
    this.setupColliders();
    this.setupInputs();
    this.setupUI();
    this.setupPauseMenu();
    this.setupGameOver();
  }

  update() {
    if (!this.isPaused && !this.isGameOver) {
      this.handlePlayerMovement();
      this.handlePlayerAttack();
      this.updateEnemiesAI();
      this.checkPlayerHealth();
      this.checkLevelProgression();
    }
  }

  // ---------------- Helper Methods ----------------

  setupGameData(data) {
    this.masterChestQuestions = [
      ['What is 2+2?', '4', ['3', '4', '5']],
      ['Sky color?', 'Blue', ['Red', 'Green', 'Blue']],
      ['Capital of France?', 'Paris', ['London', 'Berlin', 'Paris']],
      ['10 / 2 = ?', '5', ['4', '5', '6']]
    ];
    this.gameMode = data.gameMode;
    if (this.gameMode === 2) {
      playerLife += 50;
      Enemies += 50;
      BatCount *= 2;
      ZombieCount = Math.round(Enemies / 2) + 3;
      skeletonDamage *= 2;
      batDamage *= 2;
    } else if (this.debug){
      this.playerLife += 50;
      this.Enemies = 5;
      this.BatCount = 5;
      this.ZombieCount = Math.round(this.Enemies / 2) + 3;
    }

  }

  loadAssets() {
    this.load.audio('jungle', ['./assets/audio/enchanted_forest.mp3', './assets/audio/enchanted_forest_loop.ogg']);
    this.load.audio('arcade', ['./assets/audio/arcade1.mp3', './assets/audio/arcade1.ogg']);
    this.load.audio('fire', ['./assets/audio/carrot.mp3', './assets/audio/carrot.ogg']);
    this.load.audio('enemyHurt', ['./assets/audio/enemy-death.mp3', './assets/audio/enemy-death.ogg']);
    this.load.audio('playerHurt', ['./assets/audio/hurt.mp3', './assets/audio/hurt.ogg']);
    this.load.audio('playerHurt2', ['./assets/audio/hurt_male.mp3', './assets/audio/hurt_male.ogg']);
    this.load.audio('burst', ['./assets/audio/burst.mp3', './assets/audio/burst.ogg']);
    this.load.audio('spitting', ['./assets/audio/spit.mp3', './assets/audio/spit.ogg']);
    this.load.audio('doorLock', ['./assets/audio/door_lock.mp3', './assets/audio/door_lock.ogg']);
    this.load.audio('doorOpen', ['./assets/audio/open_door.mp3', './assets/audio/open_door.ogg']);
    this.load.audio('doorClose', ['./assets/audio/close_door.mp3', './assets/audio/close_door.ogg']);
    this.load.audio('star', ['./assets/audio/star.mp3', './assets/audio/star.ogg']);
    this.load.audio('bossTheme', ['./assets/audio/BoxCat_Games_-_05_-_Battle_Boss.mp3', './assets/audio/BoxCat_Games_-_05_-_Battle_Boss.ogg']);

    this.load.image('bullet', 'assets/sprites/bullet_32x32.png');
    this.load.image('fireball', 'assets/sprites/red_16x16.png');
    this.load.image('tiles', 'game2Assets/maps/32x32_RPG00_marginless.png');
    this.load.image('tiles2', 'assets/maps/tilea2.png');
    this.load.spritesheet('crystals', 'assets/sprites/crystals2.png', { frameWidth: 32, frameHeight: 32, endFrame: 15 });

    this.load.tilemapCSV('map_basic', './mainMap2_base.csv');
    this.load.tilemapCSV('map_layer2', './mainMap2_layer2Things.csv');
    this.load.tilemapCSV('map_doodads', './mainMap2_doodads.csv');
    this.load.tilemapCSV('map_walls', './mainMap2_walls.csv');
    this.load.tilemapCSV('crystalRed', './mainMap2_redCrystals.csv');
    this.load.tilemapCSV('crystalBlue', './mainMap2_blueCrystals.csv');
    this.load.tilemapCSV('crystalGreen', './mainMap2_greenCrystals.csv');
    this.load.tilemapCSV('crystalYellow', './mainMap2_yellowCrystals.csv');

    this.load.spritesheet('player', 'assets/sprites/mageHero.png', { frameWidth: 32, frameHeight: 48, endFrame: 15 });
    this.load.spritesheet('skeleton', './assets/sprites/skeleton.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('zombie', 'assets/sprites/zombies.png', { frameWidth: 32, frameHeight: 32, endFrame: 95 });
    this.load.spritesheet('bat', 'assets/sprites/chiroptera.png', { frameWidth: 64, frameHeight: 64, endFrame: 54 });
    this.load.spritesheet('Boss', './assets/sprites/orc.png', { frameWidth: 64, frameHeight: 64, endFrame: 272 });
    this.load.spritesheet('gate', 'assets/sprites/rpg_gate1.png', { frameWidth: 32, frameHeight: 32, endFrame: 15 });
    this.load.spritesheet('redcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-red.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('bluecrystal', 'assets/sprites/crystal-qubodup-ccby3-32-blue.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('greencrystal', 'assets/sprites/crystal-qubodup-ccby3-32-green.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('yellowcrystal', 'assets/sprites/crystal-qubodup-ccby3-32-yellow.png', { frameWidth: 32, frameHeight: 32, endFrame: 7 });
    this.load.spritesheet('chestRed', 'assets/sprites/chestRed_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestBlue', 'assets/sprites/chestBlue_faceRight.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestGreen', 'assets/sprites/chestGreen_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
    this.load.spritesheet('chestYellow', 'assets/sprites/chestYellow_faceLeft.png', { frameWidth: 32, frameHeight: 64, endFrame: 7 });
  }

  setupLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const progressBar = this.add.graphics();
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', { fontSize: '20px', fill: '#ffffff' }).setOrigin(0.5);
    const percentText = this.add.text(width / 2, height / 2, '0%', { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);

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

  createAnimations() {
    this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('player', { start: 12, end: 15 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'walkLeft', frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }), frameRate: 10, repeat: -1 });
    this.anims.create({ key: 'walkRight', frames: this.anims.generateFrameNumbers('player', { start: 8, end: 11 }), frameRate: 10, repeat: -1 });
  }

  setupTilemaps() {
  const map = this.make.tilemap({ key: 'map_basic' });
  const tileset = map.addTilesetImage('32x32_map_tile_RPG_basic', 'tiles');
  map.createLayer(0, tileset, 0, 0);  // ✅ Correct method
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}


  setupPlayer() {
    this.player = this.physics.add.sprite(100, 100, 'player');
  this.player.setCollideWorldBounds(true);
  this.playerSpeed = 150;
  this.lastFired = 0;
  this.bullets = this.physics.add.group();
  this.playerLife = 100;
  this.cameras.main.startFollow(this.player);
  }

  setupSounds() {
    this.sounds = {
      jungle: this.sound.add('jungle'),
      arcade: this.sound.add('arcade'),
      fire: this.sound.add('fire'),
      star: this.sound.add('star'),
      playerHurt: this.sound.add('playerHurt2'),
      enemyHit: this.sound.add('enemyHurt'),
      spitting: this.sound.add('spitting'),
      doorLock: this.sound.add('doorLock'),
      doorOpen: this.sound.add('doorOpen'),
      doorClose: this.sound.add('doorClose'),
      bossTheme: this.sound.add('bossTheme'),
      burst: this.sound.add('burst'),
    };
    this.sounds.arcade.play({ loop: true });
  }

  spawnEntities() {
    this.enemies = this.physics.add.group();
    this.boss = this.physics.add.sprite(500, 500, 'Boss').setScale(1.2);
    this.boss.body.setSize(50, 50).setOffset(-10, -10);
  }

  setupChests() {
    this.chests = this.physics.add.group();
    const chestData = [
      { x: 200, y: 200, key: 'chestRed', color: 'Red', question: this.masterChestQuestions[0] },
      { x: 300, y: 200, key: 'chestBlue', color: 'Blue', question: this.masterChestQuestions[1] },
      { x: 400, y: 200, key: 'chestGreen', color: 'Green', question: this.masterChestQuestions[2] },
      { x: 500, y: 200, key: 'chestYellow', color: 'Yellow', question: this.masterChestQuestions[3] },
    ];
    chestData.forEach(data => {
      const chest = new Chest(this, data.x, data.y, data.key, data.color, data.question);
      this.chests.add(chest);
    });
  }

  setupColliders() {
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.player, this.boss);
    this.physics.add.collider(this.player, this.chests);
    this.physics.add.overlap(this.bullets, this.enemies, this.bulletHitsEnemy, null, this);
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  setupUI() {
    this.score = 0;
    this.level = 1;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '16px', fill: '#fff' }).setScrollFactor(0);
  }

  setupPauseMenu() {
    this.isPaused = false;
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pauseKey.on('down', () => {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.scene.pause();
        this.scene.launch('PauseScene');
      }
    });
  }

  setupGameOver() {
    this.isGameOver = false;
  }

  checkPlayerHealth() {
    if (this.playerLife <= 0) {
      this.isGameOver = true;
      this.scene.pause();
      this.add.text(this.player.x, this.player.y, 'GAME OVER', { fontSize: '32px', fill: '#ff0000' });
    }
  }

  checkLevelProgression() {
    if (this.score >= this.level * 500) {
      this.level++;
      this.playerLife += 20;
      this.add.text(this.player.x, this.player.y - 50, 'Level Up!', { fontSize: '24px', fill: '#00ff00' });
    }
  }

  handlePlayerMovement() {
    this.player.setVelocity(0);
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      this.player.anims.play('walkLeft', true);
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      this.player.anims.play('walkRight', true);
    } else if (this.cursors.up.isDown || this.keyW.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      this.player.anims.play('walkUp', true);
    } else if (this.cursors.down.isDown || this.keyS.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      this.player.anims.play('walkDown', true);
    } else {
      this.player.anims.stop();
    }
  }

  handlePlayerAttack() {
    if (this.keySpace.isDown && this.time.now > this.lastFired) {
      const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');
      bullet.setVelocityY(-300);
      this.lastFired = this.time.now + 500;
    }
  }

  bulletHitsEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  updateEnemiesAI() {
    this.enemies.children.iterate(enemy => {
      if (!enemy) return;
      this.physics.moveToObject(enemy, this.player, 50);
    });
  }
}

class Chest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, color, questionSet) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.locked = true;
    this.unLocking = false;
    this.qSet = questionSet;
    this.correctAnswer = questionSet[2].indexOf(questionSet[1]);
    this.color = color;
    this.setupChestBehavior();
  }

  setupChestBehavior() {
    // Define specific chest behaviors per color if needed
  }

  checkLock(playerChoice) {
    if (this.unLocking) return;
    this.unLocking = true;
    if (playerChoice === this.correctAnswer) {
      this.anims.play(`chestOpen${this.color}`, 0);
      this.locked = false;
      this.body.enable = false;
      this.scene.score += 100;
      this.scene.scoreText.setText('Score: ' + this.scene.score);
    } else {
      this.scene.add.text(this.x, this.y - 30, 'Wrong Answer!', { fontSize: '12px', fill: '#ff0000' });
    }
    this.scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.unLocking = false;
      },
    });
  }
}

export default SceneA;

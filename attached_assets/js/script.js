class SceneA extends Phaser.Scene{
	constructor(){
		super('SceneA');
	}
	init(data) {
		
		this.setupGameData(data);
		
	}
	preload() {
	this.setupLoadingBar();
		console.log();
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

	setupGameData(data) {
    gameMode = data.gameMode;
		if(gameMode == 2){
			playerLife = playerLife + 50;
			Enemies = Enemies+50;
			BatCount = BatCount*2;
			ZombieCount = Math.round(Enemies/2)+3;
			skeletonDamage = skeletonDamage*2;
			batDamage = batDamage*2;
		} else if(debug){
			playerLife = playerLife + 50;
			Enemies = 5
			BatCount = 5
			ZombieCount = Math.round(Enemies/2)+3;
		}
		//console.log(questions);
		ans = ['a','b','c','c','d','b','a','c','x','c','x','d','a','b','c']; //x are needed as keys for areas without choices

		if(gameMode == 2){
			questions = q2;
			res = res2;
			ls = ls2;
		} else {
			questions = q1;
			res = res1;
			ls = ls1;
		}

		for (var m=0;m<questions.length;m++){
			var q = questions[m];
			var a = res[m];
			var level = ls[m];
			var qs = [];
			if(qSet.indexOf(qs < 0)){
				qs = [q,a,level];
			}
			qSet.push(qs);
		}
		shuffledSet = Phaser.Utils.Array.Shuffle(qSet);
		for(var n=0;n<shuffledSet.length;n++){
			var set = [];
			set.push(shuffledSet[n][1]);	
			for(var k=0;k<3;k++){
				var ch = shuffledSet[getRandomInt(0,res.length-1)][1];
				while(set.indexOf(ch) >= 0){
					ch = shuffledSet[getRandomInt(0,res.length-1)][1]; //if the same answer is found on the list, it will search for another one
				}
				set.push(ch);
			}
			
			choiceSets[n] = Phaser.Utils.Array.Shuffle(set);
		}
		var gate1 = [381,848,1,'n',choiceSets[0],shuffledSet[0][1],shuffledSet[0][0],1];
		var gate2 = [318,1844,2,'n',choiceSets[1],shuffledSet[1][1],shuffledSet[1][0],2];
		var gate3 = [608,1844,3,'n',choiceSets[2],shuffledSet[2][1],shuffledSet[2][0],3];
		var gate4 = [944,940,4,'n',choiceSets[3],shuffledSet[3][1],shuffledSet[3][0],4];
		var gate5 = [1392,160,5,'n',choiceSets[4],shuffledSet[4][1],shuffledSet[4][0],5];
		var gate6 = [1361,1338,6,'n',choiceSets[5],shuffledSet[5][1],shuffledSet[5][0],6];
		var gate7 = [1118,1833,7,'n',choiceSets[6],shuffledSet[6][1],shuffledSet[6][0],7];
		var gate8 = [1710,2328,7,'y',choiceSets[7],shuffledSet[7][1],shuffledSet[7][0],8];
		var gate9 = [1810,1880,8,'n',choiceSets[8],shuffledSet[8][1],shuffledSet[8][0],9];
		var gate10 = [2574,2330,8,'y',choiceSets[9],shuffledSet[9][1],shuffledSet[9][0],10];
		var gate11 = [3134,2279,9,'n',choiceSets[10],shuffledSet[10][1],shuffledSet[10][0],11];
		var gate12 = [2625,1702,10,'n',choiceSets[11],shuffledSet[11][1],shuffledSet[11][0],12];
		var gate13 = [2942,901,11,'n',choiceSets[12],shuffledSet[12][1],shuffledSet[12][0],12];
		var gate14 = [2352,56,12,'n',choiceSets[13],shuffledSet[13][1],shuffledSet[13][0],14];
		var gate15 = [1534,806,13,'n',choiceSets[14],shuffledSet[14][1],shuffledSet[14][0],15];
		gateLocations = [gate1,gate2,gate3,gate4,gate5,gate6,gate7,gate8,gate9,gate10,gate11,gate12,gate13,gate14,gate15];
		SelectionLevel = 0;
		keyLocations = [stage1,stage2,stage3,stage4,stage5,stage6,stage7,stage8,stage9,stage10,stage11,stage12,stage13,stage14];
		console.log(gateLocations);
		for(var n=0;n<chestQuestions.length;n++){
			var set = [];
			set.push(chestQuestions[n][1]);	
			for(var k=0;k<3;k++){
				var ch = chestQuestions[getRandomInt(0,chestQuestions.length-1)][1];
				while(set.indexOf(ch) >= 0){
					ch = chestQuestions[getRandomInt(0,chestQuestions.length-1)][1]; //if the same answer is found on the list, it will search for another one
				}
				set.push(ch);
			}
					
			chestQuestions[n][2] = Phaser.Utils.Array.Shuffle(set);
		}

		masterChestQuestions = Phaser.Utils.Array.Shuffle(chestQuestions);
		console.log('masterChestQuestions:');
		console.log(masterChestQuestions);

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
	create(){
		console.log('SceneA');
		console.log('debug: '+debug);
		/*
		map = this.make.tilemap({ key: 'map' });
		var tileset = map.addTilesetImage('32x32_map_tile_RPG_basic','tiles');
		var tileset2 = map.addTilesetImage('tilea2','tiles2');
		var tilesetCrystals = map.addTilesetImage('crystals2','crystals');
		*/
		document.getElementById("gameState").style.display = 'none';
		map = this.make.tilemap({ key: 'map_basic', tileWidth: 32, tileHeight: 32 });
		
		var tileset = map.addTilesetImage('32x32_map_tile_RPG_basic','tiles');
		var tileset2 = map.addTilesetImage('tilea2','tiles2');
		var tilesetCrystals = map.addTilesetImage('crystals2','crystals');
		mapDoodads= this.make.tilemap({ key: 'map_doodads', tileWidth: 32, tileHeight: 32 });
		mapWalls= this.make.tilemap({ key: 'map_walls', tileWidth: 32, tileHeight: 32 });
		mapLayer2=this.make.tilemap({ key: 'map_layer2', tileWidth: 32, tileHeight: 32 });
		crystalLayerRed = this.make.tilemap({ key: 'crystalRed', tileWidth: 32, tileHeight: 32 });
		crystalLayerBlue = this.make.tilemap({ key: 'crystalBlue', tileWidth: 32, tileHeight: 32 });
		crystalLayerGreen = this.make.tilemap({ key: 'crystalGreen', tileWidth: 32, tileHeight: 32 });
		crystalLayerYellow = this.make.tilemap({ key: 'crystalYellow', tileWidth: 32, tileHeight: 32 });
		
    	var layer = map.createStaticLayer(0, tileset, 0, 0);
    	//var layer2 = map.createStaticLayer('layer2Things', tileset, 0, 0);
    	//var layerDoodads = map.createStaticLayer('doodads', tileset, 0, 0);
    	//var walls = map.createStaticLayer('walls', tileset, 0, 0); //json
    	
    	var layerExtra = mapLayer2.createStaticLayer(0,tileset2,0,0);
    	var layerDoodads = mapDoodads.createStaticLayer(0, tileset, 0, 0);
    	layer3 = mapWalls.createStaticLayer(0, tileset, 0, 0);
    	cLayerR = crystalLayerRed.createStaticLayer(0,tilesetCrystals,0,0);
    	cLayerB = crystalLayerBlue.createStaticLayer(0,tilesetCrystals,0,0);
    	cLayerG = crystalLayerGreen.createStaticLayer(0,tilesetCrystals,0,0);
    	cLayerY = crystalLayerYellow.createStaticLayer(0,tilesetCrystals,0,0);
    	this.hours = 0;
    	this.minutes = 0;
    	this.seconds = 0;
    	this.timeElapsed = 0;
    	this.consolidatedTime = 'Elapsed Time: '+'0'+this.hours+':'+'0'+this.minutes+':'+'0'+this.seconds;
    	this.elapsedText = this.add.text(550,60, this.consolidatedTime, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'right', padding:5}).setScrollFactor(0).setDepth(2500);
    	clocker = this.time.addEvent({ delay: 1000, callback: elapsedTime, callbackScope: this, repeat:-1 });
    	
    	playerChar = this.physics.add.sprite(100, 100, 'player',0);
    	playerChar.currLevel = 1;
    	playerChar.keyCode = playerAns.toUpperCase();
    	playerChar.depth = playerChar.y;
    	playerChar.body.setSize(32,58,8,0);
    	playerChar.hasKey = false;
    	playerChar.ansKey = '';
    	playerChar.typeChar = 'player';
    	playerChar.currLoc = 1;
    	playerChar.picking = false;
    	playerChar.gatePassed = 1;
    	playerChar.clearUpgrade = false;
    	playerChar.choiceIndex = choiceIndex;
    	updateLockText(true);

    	cursors = this.input.keyboard.createCursorKeys();
		spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		//this.add.image(1600,1200,'tiles');

		jungle = this.sound.add('jungle');
		arcade = this.sound.add('arcade');
		fire = this.sound.add('fire');
		star = this.sound.add('star');
		playerHurt = this.sound.add('playerHurt2');
		enemyHit = this.sound.add('enemyHurt');
		spitting = this.sound.add('spitting');
		doorLock = this.sound.add('doorLock');
		doorOpen = this.sound.add('doorOpen');
		doorClose = this.sound.add('doorClose');
		bossTheme = this.sound.add('bossTheme');
		burst = this.sound.add('burst');
	    arcade.play({
	        loop: true
	    });
		//cactus = this.physics.add.sprite(1200,800,'cactus',(11*23));

		console.log();

	    //  This isn't totally accurate, but it'll do for now
	    mapWalls.setCollisionBetween(26,151);
	    //walls.setCollisionBetween(26,151); //json
	    crystalLayerRed.setCollision(11);
	    crystalLayerBlue.setCollision(8);
	    crystalLayerGreen.setCollision(10);
	    crystalLayerYellow.setCollision(9);
	    this.cameras.main.setBounds(0, 0,  map.widthInPixels, map.heightInPixels);
	    this.cameras.main.startFollow(playerChar);
    	scoreText = this.make.text({
                x: 720,
                y: 60,
                text: '0%',
                style: {
                    font: '24px arcadeclassicregular',
                    fill: '#FFF'
                }
            }).setFontFamily('arcadeclassicregular');
            scoreText.setOrigin(1, 1);
            scoreText.setScrollFactor(0).setDepth(2500);
		var walkUp = {
			key:'walkUp',
			frames: this.anims.generateFrameNumbers('player',{start:12,end:15}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkDown = {
			key:'walkDown',
			frames: this.anims.generateFrameNumbers('player',{start:0,end:3}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkLeft = {
			key:'walkLeft',
			frames: this.anims.generateFrameNumbers('player',{start:4,end:7}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkRight = {
			key:'walkRight',
			frames: this.anims.generateFrameNumbers('player',{start:8,end:11}),
			frameRate:maxFrameRate,
			repeat:-1
		};

		var animCastDownSkeleton = {
			key:'animCastDownSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:26,end:32}),
			frameRate:maxFrameRate,
			repeat:1
		};
		var walkUpSkeleton = {
			key:'walkUpSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:104,end:112}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkDownSkeleton = {
			key:'walkDownSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:130,end:137}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkLeftSkeleton = {
			key:'walkLeftSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:117,end:125}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkRightSkeleton = {
			key:'walkRightSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:143,end:151}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var shootUSkeletonp = {
			key:'shootUpSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:208,end:220}),
			frameRate:maxFrameRate,
			repeat:false
		};
		var shootLeftSkeleton = {
			key:'shootLeftSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:221,end:233}),
			frameRate:maxFrameRate,
			repeat:false
		};
		var playerDieSkeleton = {
			key:'playerDieSkeleton',
			frames: this.anims.generateFrameNumbers('skeleton',{start:260,end:265}),
			frameRate:maxFrameRate,
			repeat:false
		}	

		var walkUpOrc = {
			key:'walkUpOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:104,end:112}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkDownOrc = {
			key:'walkDownOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:130,end:137}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkLeftOrc = {
			key:'walkLeftOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:117,end:125}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkRightOrc = {
			key:'walkRightOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:143,end:151}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var attackLeftOrc = {
			key:'attackLeftOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:65,end:72}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var attackRightOrc = {
			key:'attackRightOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:91,end:97}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var attackUpOrc = {
			key:'attackUpOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:52,end:58}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var attackDownOrc = {
			key:'attackDownOrc',
			frames: this.anims.generateFrameNumbers('Boss',{start:78,end:84}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var OrcDie = {
			key:"OrcDie",
			frames: this.anims.generateFrameNumbers('Boss',{start:260,end:265}),
			repeat:0
		}

		var flyLeft = {
			key:'flyLeft',
			frames: this.anims.generateFrameNumbers('bat',{start:0,end:4}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var flyRight = {
			key:'flyRight',
			frames: this.anims.generateFrameNumbers('bat',{start:6,end:8}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var batDie = {
			key:'batDie',
			frames: this.anims.generateFrameNumbers('bat',{start:46,end:54}),
			frameRate:maxFrameRate,
			repeat:-1
		};

		var walkUpZombie = {
			key:'walkUpZombie',
			frames: this.anims.generateFrameNumbers('zombie',{start:42,end:44}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkDownZombie = {
			key:'walkDownZombie',
			frames: this.anims.generateFrameNumbers('zombie',{start:6,end:8}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkLeftZombie = {
			key:'walkLeftZombie',
			frames: this.anims.generateFrameNumbers('zombie',{start:18,end:20}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var walkRightZombie = {
			key:'walkRightZombie',
			frames: this.anims.generateFrameNumbers('zombie',{start:30,end:32}),
			frameRate:maxFrameRate,
			repeat:-1
		};
		var dieZombie = {
			key:'dieZombie',
			frames: this.anims.generateFrameNumbers('zombie',{start:48,end:53}),
			frameRate:maxFrameRate,
			repeat:-1
		};

		var openGate = {
			key:'openGate',
			frames: this.anims.generateFrameNumbers('gate',{start:0,end:3}),
			frameRate:maxFrameRate,
			repeat:false
		};

		var closeGate = {
			key:'closeGate',
			frames: this.anims.generateFrameNumbers('gate',{start:4,end:7}),
			frameRate:maxFrameRate,
			repeat:false
		};
                
                var cystalRotateRed = {
			key:'redcrystal',
			frames: this.anims.generateFrameNumbers('redcrystal',{start:0,end:7}),
			frameRate:maxFrameRate,
			repeat:-1
		};
                var cystalRotateBlue = {
			key:'bluecrystal',
			frames: this.anims.generateFrameNumbers('bluecrystal',{start:0,end:7}),
			frameRate:maxFrameRate,
			repeat:-1
		};
        var cystalRotateGreen = {
			key:'greencrystal',
			frames: this.anims.generateFrameNumbers('greencrystal',{start:0,end:7}),
			frameRate:maxFrameRate,
			repeat:-1
		};
        var cystalRotateYellow = {
			key:'yellowcrystal',
			frames: this.anims.generateFrameNumbers('yellowcrystal',{start:0,end:7}),
			frameRate:maxFrameRate,
			repeat:-1
		};

		var chestOpenRed = {
			key:'chestOpenRed',
			frames: this.anims.generateFrameNumbers('chestRed',{start:0,end:3}),
			frameRate:maxFrameRate,
			repeat:0
		};
		var chestOpenBlue = {
			key:'chestOpenBlue',
			frames: this.anims.generateFrameNumbers('chestBlue',{start:0,end:3}),
			frameRate:maxFrameRate,
			repeat:0
		};
		var chestOpenGreen = {
			key:'chestOpenGreen',
			frames: this.anims.generateFrameNumbers('chestGreen',{start:4,end:7}),
			frameRate:maxFrameRate,
			repeat:0
		};
		var chestOpenYellow = {
			key:'chestOpenYellow',
			frames: this.anims.generateFrameNumbers('chestYellow',{start:4,end:7}),
			frameRate:maxFrameRate,
			repeat:0
		};

		//this.anims.create(animCastDown);
		this.anims.create(walkUp);
		this.anims.create(walkDown);
		this.anims.create(walkLeft);
		this.anims.create(walkRight);
		//this.anims.create(playerDie);
		//this.anims.create(shootUp);
		//this.anims.create(shootLeft);

		this.anims.create(animCastDownSkeleton);
		this.anims.create(walkUpSkeleton);
		this.anims.create(walkDownSkeleton);
		this.anims.create(walkLeftSkeleton);
		this.anims.create(walkRightSkeleton);
		this.anims.create(playerDieSkeleton);
		this.anims.create(shootLeftSkeleton);

		this.anims.create(flyLeft);
		this.anims.create(flyRight);
		this.anims.create(batDie);

		this.anims.create(walkUpZombie);
		this.anims.create(walkDownZombie);
		this.anims.create(walkLeftZombie);
		this.anims.create(walkRightZombie);
		this.anims.create(dieZombie);

		this.anims.create(walkUpOrc);
		this.anims.create(walkDownOrc);
		this.anims.create(walkLeftOrc);
		this.anims.create(walkRightOrc);
		this.anims.create(OrcDie);
		this.anims.create(attackDownOrc);
		this.anims.create(attackLeftOrc);
		this.anims.create(attackRightOrc);
		this.anims.create(attackUpOrc);

		this.anims.create(openGate);
		this.anims.create(closeGate);
                
        this.anims.create(cystalRotateRed);
        this.anims.create(cystalRotateBlue);
        this.anims.create(cystalRotateGreen);
        this.anims.create(cystalRotateYellow);

        this.anims.create(chestOpenRed);
        this.anims.create(chestOpenBlue);
        this.anims.create(chestOpenGreen);
        this.anims.create(chestOpenYellow);

		//playerChar.body.collideWorldBounds = true; 
		var bossLocX;
		var bossLocY;
		if(!debug){
			bossLocX = keyLocations[keyLocations.length-1][0];
			bossLocY = keyLocations[keyLocations.length-1][1]
		} else {
			bossLocX = keyLocations[0][0];
			bossLocY = keyLocations[0][1]
		}
		playerChar.body.allowGravity = false;
		playerChar.body.rotation = 0;
		this.boss = this.physics.add.group({
		   	key:'Boss',
		   	classType:Boss,
		   	bounceX: 1,
		   	bounceY: 1,
		   	setXY:{
		   		x:bossLocX,
		   		y:bossLocY
		   	},
		   	setScale:{
		   		x:1.2,
		   		y:1.2
		   	},
		   	runChildUpdate:true
	    });
	    console.log(this.boss);
	    this.boss.children.entries[0].body.setSize(50,50,-10,-10);
		this.baddies = spawnBadGuys();
		this.zombies = spawnZombies();
		console.log("spawnBadGuys()");
		this.locations = keyLocations;
		console.log(this.locations);
		batties = this.physics.add.group({
			key:'bat',
			classType: Batty,
	        outOfBoundsKill:true,
		   	bounceX: 1,
		   	bounceY: 1,
		   	repeat:BatCount-1,
		   	collideWorldBounds: false,
		   	runChildUpdate:true,
		   	enableBody:true,
	   		endFrame:9
		});

		var l=6;
   
		batties.children.iterate(function (child) {
			if(l >= keyLocations.length){
				l=6;
			}
			child.x = keyLocations[l][0];
			child.y = keyLocations[l][1];
			child.currLevel = l+1;
	       	l++;
	       	child.body.setSize(64,32,8,8);
	   	});
		
		//console.log(keyLocations[j][0]);		
		
		this.bullets = this.physics.add.group({
	        classType: Bullet,
	        maxSize:3,
	        outOfBoundsKill:true,
	        runChildUpdate: true
	    });

	    /*
	    this.bullets.children.iterate(function(bt){
	    	bt.body.setSize(8,8,8,8);
	    });
	    */

	    this.gates = this.physics.add.group({
	    	key:'gate',
	    	repeat:gateLocations.length-1,
	    	classType:Door,
	    	runChildUpdate:true,
		   	enableBody:true,
	   		endFrame:15
	    });

	    //this.redChest = new chestRed(this,300,300,'chestRed',0);
	    this.redChest = this.physics.add.sprite(1757.8550913865713,1055.2797625521837,'chestRed',0);
	    this.redChest.depth = this.redChest.y;
	    this.redChest.locked = true;
	    this.redChest.unLocking = false;
	    this.redChest.qSet;
	    this.redChest.qSet = masterChestQuestions[0];
	    this.redChest.correctAnswer = this.redChest.qSet[2].indexOf(this.redChest.qSet[1]);
	    //console.log(this.redChest.qSet[2]);
	    console.log('correct answer for red: '+this.redChest.correctAnswer);
	    this.redChest.body.immovable = true;
	    this.redChest.checkLock = function(p){
	    	var redDisplay;
	    	if(this.unLocking == false){
	    		this.unLocking = true;
	    		console.log(this);
	    		console.log(choiceIndex);	    		
	    		console.log(this.qSet);
	    		//var correctAnswer = this.qSet[0][2].indexOf(this.qSet[0][1]);
	    		console.log(choiceIndex,this.correctAnswer);
			    if(choiceIndex == this.correctAnswer){
			    	console.log('correct!');
			    	this.anims.play('chestOpenRed',0);
			    	this.locked = false;
			    	this.body.enabled = false;
			    	choiceIndex = 10;
			    } else {
			    	var que = this.qSet[0].split('<br />');
			    	que.unshift('You must answer this riddle:');
			    	que.push('');
			    	que.push('Your choices are:');
			    	que.push('A = '+this.qSet[2][0]+',  B = '+this.qSet[2][1]+',  C = '+this.qSet[2][2]+',  D = '+this.qSet[2][3])
			    	var midX = game.scene.scenes[1].cameras.main.width/2;
					var midY = game.scene.scenes[1].cameras.main.height/2;
			    	redDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:5, backgroundColor:'#8b0000'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
			    	
			    }
		    	this.scene.time.addEvent({delay:2000,callback:function(){
		    		if(redDisplay){
		    			redDisplay.alpha = 0;
						redDisplay.visible = false;
						redDisplay.destroy();
		    		}
					if(this.locked == true){
		    			this.unLocking = false;
		    		}
		    		choiceIndex = 10;
		    		choiceRed.setScale(0.75,0.75);
                    choiceBlue.setScale(0.75,0.75);
                    choiceGreen.setScale(0.75,0.75);
                    choiceYellow.setScale(0.75,0.75);
                    choiceRed.anims.stop();
                    choiceBlue.anims.stop();
				    choiceGreen.anims.stop();
				    choiceYellow.anims.stop();
				},callbackScope:this});
	    	}
	    };

	    this.blueChest = this.physics.add.sprite(1757.8550913865713,1564.4340393612088,'chestBlue',0);
	    this.blueChest.depth = this.redChest.y;
	    this.blueChest.locked = true;
	    this.blueChest.unLocking = false;
	    this.blueChest.qSet;
	    this.blueChest.qSet = masterChestQuestions[1];
	    this.blueChest.correctAnswer = this.blueChest.qSet[2].indexOf(this.blueChest.qSet[1]);
	    console.log('correct answer for blue: '+this.blueChest.correctAnswer);
	    this.blueChest.body.immovable = true;
	    this.blueChest.checkLock = function(p){
	    	var blueDisplay;
	    	if(this.unLocking == false){
	    		this.unLocking = true;
	    		console.log(this);
	    		console.log(choiceIndex);	    		
	    		console.log(this.qSet);
	    		//var correctAnswer = this.qSet[0][2].indexOf(this.qSet[0][1]);
	    		console.log(choiceIndex,this.correctAnswer);
			    if(choiceIndex == this.correctAnswer){
			    	console.log('correct!');
			    	this.anims.play('chestOpenBlue',0);
			    	this.locked = false;
			    	this.body.enabled = false;
			    	choiceIndex = 10;
			    } else {
			    	var que = this.qSet[0].split('<br />');
			    	que.unshift('What is the correct answer for?:');
			    	que.push('');
			    	que.push('Your choices are:');
			    	que.push('A = '+this.qSet[2][0]+',  B = '+this.qSet[2][1]+',  C = '+this.qSet[2][2]+',  D = '+this.qSet[2][3])
			    	var midX = game.scene.scenes[1].cameras.main.width/2;
					var midY = game.scene.scenes[1].cameras.main.height/2;
			    	blueDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:5, backgroundColor:'#000080'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
			    }
		    	this.scene.time.addEvent({delay:2000,callback:function(){
		    		if(blueDisplay){
		    			blueDisplay.alpha = 0;
						blueDisplay.visible = false;
						blueDisplay.destroy();
		    		}
					if(this.locked == true){
		    			this.unLocking = false;
		    		}
		    		choiceIndex = 10;
		    		choiceRed.setScale(0.75,0.75);
                    choiceBlue.setScale(0.75,0.75);
                    choiceGreen.setScale(0.75,0.75);
                    choiceYellow.setScale(0.75,0.75);
                    choiceRed.anims.stop();
                    choiceBlue.anims.stop();
				    choiceGreen.anims.stop();
				    choiceYellow.anims.stop();
				},callbackScope:this});
	    	}
	    };

	    this.greenChest = this.physics.add.sprite(2270.9861178703914,1055.2797625521837,'chestGreen',3);
	    this.greenChest.depth = this.redChest.y;
	    this.greenChest.locked = true;
	    this.greenChest.unLocking = false;
	    this.greenChest.qSet;
	    this.greenChest.qSet = masterChestQuestions[2];
	    this.greenChest.correctAnswer = this.greenChest.qSet[2].indexOf(this.greenChest.qSet[1]);
	    console.log('correct answer for green: '+this.greenChest.correctAnswer);
	    this.greenChest.body.immovable = true;
	    this.greenChest.checkLock = function(p){
	    	var greenDisplay;
	    	if(this.unLocking == false){
	    		this.unLocking = true;
	    		console.log(this);
	    		console.log(choiceIndex);	    		
	    		console.log(this.qSet);
	    		//var correctAnswer = this.qSet[0][2].indexOf(this.qSet[0][1]);
	    		console.log(choiceIndex,this.correctAnswer);
			    if(choiceIndex == this.correctAnswer){
			    	console.log('correct!');
			    	this.anims.play('chestOpenGreen',0);
			    	this.locked = false;
			    	this.body.enabled = false;
			    	choiceIndex = 10;
			    } else {
			    	var que = this.qSet[0].split('<br />');
			    	que.unshift('Unlock this riddle to unlock chest:');
			    	que.push('');
			    	que.push('Your choices are:');
			    	que.push('A = '+this.qSet[2][0]+',  B = '+this.qSet[2][1]+',  C = '+this.qSet[2][2]+',  D = '+this.qSet[2][3])
			    	var midX = game.scene.scenes[1].cameras.main.width/2;
					var midY = game.scene.scenes[1].cameras.main.height/2;
			    	greenDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:5, backgroundColor:'#006400'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
			    }
		    	this.scene.time.addEvent({delay:2000,callback:function(){
		    		if(greenDisplay){
		    			greenDisplay.alpha = 0;
						greenDisplay.visible = false;
						greenDisplay.destroy();
		    		}
		    		if(this.locked == true){
		    			this.unLocking = false;
		    		}
		    		choiceIndex = 10;
		    		choiceRed.setScale(0.75,0.75);
                    choiceBlue.setScale(0.75,0.75);
                    choiceGreen.setScale(0.75,0.75);
                    choiceYellow.setScale(0.75,0.75);
                    choiceRed.anims.stop();
                    choiceBlue.anims.stop();
				    choiceGreen.anims.stop();
				    choiceYellow.anims.stop();
				},callbackScope:this});
	    	}
	    };

	    this.yellowChest = this.physics.add.sprite(2270.9861178703914,1564.4340393612088,'chestYellow',3);
	    this.yellowChest.depth = this.redChest.y;
	    this.yellowChest.locked = true;
	    this.yellowChest.unLocking = false;
	    this.yellowChest.qSet;
	    this.yellowChest.qSet = masterChestQuestions[3];
	    this.yellowChest.correctAnswer = this.yellowChest.qSet[2].indexOf(this.yellowChest.qSet[1]);
	    console.log('correct answer for yellow: '+this.yellowChest.correctAnswer);
	    this.yellowChest.body.immovable = true;
	    this.yellowChest.checkLock = function(p){
	    	var yellowDisplay;
	    	if(this.unLocking == false){
	    		this.unLocking = true;
	    		console.log(this);
	    		console.log(choiceIndex);	    		
	    		console.log(this.qSet);
	    		//var correctAnswer = this.qSet[0][2].indexOf(this.qSet[0][1]);
	    		console.log(choiceIndex,this.correctAnswer);
			    if(choiceIndex == this.correctAnswer){
			    	console.log('correct!');
			    	this.anims.play('chestOpenYellow',0);
			    	this.locked = false;
			    	this.body.enabled = false;
			    	choiceIndex = 10;
			    } else {
			    	var que = this.qSet[0].split('<br />');
			    	que.unshift('Answer this to unlock:');
			    	que.push('');
			    	que.push('Your choices are:');
			    	que.push('A = '+this.qSet[2][0]+',  B = '+this.qSet[2][1]+',  C = '+this.qSet[2][2]+',  D = '+this.qSet[2][3])
			    	var midX = game.scene.scenes[1].cameras.main.width/2;
					var midY = game.scene.scenes[1].cameras.main.height/2;
			    	yellowDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:5, backgroundColor:'#9b870c'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
			    }
		    	this.scene.time.addEvent({delay:2000,callback:function(){
		    		if(yellowDisplay){
		    			yellowDisplay.alpha = 0;
						yellowDisplay.visible = false;
						yellowDisplay.destroy();
		    		}
		    		if(this.locked == true){
		    			this.unLocking = false;
		    		}
		    		choiceIndex = 10;
		    		choiceRed.setScale(0.75,0.75);
                    choiceBlue.setScale(0.75,0.75);
                    choiceGreen.setScale(0.75,0.75);
                    choiceYellow.setScale(0.75,0.75);
                    choiceRed.anims.stop();
                    choiceBlue.anims.stop();
				    choiceGreen.anims.stop();
				    choiceYellow.anims.stop();
				},callbackScope:this});
	    	}
	    };
	    

	    this.input.on('pointerdown',function(){
		console.log(playerChar.x,playerChar.y);
            },this);
	    /*
	    this.gates.create(gateLocations[0][0], gateLocations[0][1], 'gate');
	    this.gates.create(gateLocations[1][0], gateLocations[1][1], 'gate');
	    this.gates.create(gateLocations[2][0], gateLocations[2][1], 'gate');
	    this.gates.create(gateLocations[3][0], gateLocations[3][1], 'gate');
	    this.gates.create(gateLocations[4][0], gateLocations[4][1], 'gate');
	    this.gates.create(gateLocations[5][0], gateLocations[5][1], 'gate');
	    this.gates.create(gateLocations[6][0], gateLocations[6][1], 'gate');
	    this.gates.create(gateLocations[7][0], gateLocations[7][1], 'gate');
	    this.gates.create(gateLocations[8][0], gateLocations[8][1], 'gate');
	    this.gates.create(gateLocations[9][0], gateLocations[9][1], 'gate');
	    this.gates.create(gateLocations[10][0], gateLocations[10][1], 'gate');
	    this.gates.create(gateLocations[11][0], gateLocations[11][1], 'gate');
	    this.gates.create(gateLocations[12][0], gateLocations[12][1], 'gate');
	    this.gates.create(gateLocations[13][0], gateLocations[13][1], 'gate');
	    this.gates.create(gateLocations[14][0], gateLocations[14][1], 'gate');
	    */
	    //console.log(shuffledSet);
	    this.gates.children.iterate(function(g){
	    	g.x=gateLocations[gCount][0];
	    	g.y=gateLocations[gCount][1];
	    	g.depth = g.y;
	    	g.ansKey = ans[gCount];
	    	g.Selection = gateLocations[gCount][4];
	    	g.body.immovable = true;
	    	g.question = gateLocations[gCount][6];
		g.ans = gateLocations[gCount][5];
	    	g.currLevel = gateLocations[gCount][2];
	    	g.repeat = gateLocations[gCount][3];
	    	g.gid = gateLocations[gCount][7];
	    	g.solved = false;
	    	g.unLocking = false;
	    	g.body.setSize(32,32,0,0);
	    	g.setScale(1.1,1.1);
	    	//console.log(g);
	    	gCount++;
	    });
		
            //console.log("bullets...");
            
		this.physics.add.collider(playerChar, layer3);
		this.physics.add.collider(playerChar,this.redChest,this.hitChest);
		this.physics.add.collider(playerChar,this.blueChest,this.hitChest);
		this.physics.add.collider(playerChar,this.greenChest,this.hitChest);
		this.physics.add.collider(playerChar,this.yellowChest,this.hitChest);
		this.physics.add.collider(playerChar, cLayerR, getRed);
		this.physics.add.collider(playerChar, cLayerB, getBlue);
		this.physics.add.collider(playerChar, cLayerG, getGreen);
		this.physics.add.collider(playerChar, cLayerY, getYellow);
		this.physics.add.collider(this.bullets, layer3, bulletHitsWall);
		this.physics.add.collider(this.bullets, this.gates, bulletHitsWall);
		this.physics.add.collider(this.boss, layer3);
		this.physics.add.collider(this.baddies,layer3,baddieHitsWall);
		this.physics.add.collider(this.zombies,layer3);
		this.physics.add.collider(this.boss, this.gates);
		this.physics.add.collider(this.baddies,this.gates);
		this.physics.add.collider(this.zombies,this.gates);
		this.physics.add.collider(batties,layer3,battieHitsWall);
		//this.physics.add.collider(batties,this.gates,battieHitsWall);
		
		//this.physics.add.colliders = [playerChar,this.boss,this.bullets,this.baddies,batties,this.zombies,this.gates,layer3]; //json

		//this.physics.add.colliders = [playerChar,this.boss,this.bullets,this.baddies,batties,this.zombies,this.gates,this.redChest,this.blueChest,this.greenChest,this.yellowChest,layer3,cLayerR,cLayerB,cLayerG,cLayerY];
        this.physics.add.overlap(this.baddies, this.bullets, shootSkeleton);
        this.physics.add.overlap(this.zombies, this.bullets, shootSkeleton);
        this.physics.add.overlap(batties, this.bullets, shootBat);
        this.physics.add.overlap(playerChar, this.baddies,hitSkeleton, null, this);
        this.physics.add.overlap(playerChar, this.zombies,hitSkeleton, null, this);
        this.physics.add.overlap(playerChar, this.boss,bossAttack, null, this);
        this.physics.add.overlap(this.bullets, this.boss,bossHit, null, this);
        this.physics.add.collider(playerChar, this.gates, checkGate);
                //this.physics.add.overlap(playerChar,batties,hitBat,null,this);

                this.input.keyboard.on('keydown_SPACE',function(event){
                            let bullet = this.bullets.get();
                            if(bullet) {
                                    bullet.fire();	
                            }
                    },this);
                console.log("input keyboard...");
                //console.log(this.baddies.children.entries.length);

                this.input.keyboard.on('keydown_P', function (event) {
                    if(gameStat == 'active'){
                            gameStat = 'paused';
                            clocker.paused = true;
                            document.getElementById("gameState").style.display = 'block';
                            document.getElementById("gameState").innerHTML = 'GAME PAUSED';
                            this.cameras.main.fadeOut(500);
                            this.time.addEvent({ delay: 500, callback: 
                                            function(){
                                                    this.scene.pause();
                                    }, 
                                    callbackScope: this, repeat:false },this);
                    } else {
                    		clocker.paused = false;
                            document.getElementById("gameState").style.display = 'none';
                            document.getElementById("gameState").innerHTML = 'GAME ACTIVE';
                            this.cameras.main.fadeIn(500);
                                    this.scene.resume();
                                    gameStat = 'active';
                    }
                },this);   
            choiceRed = this.physics.add.sprite(604, 20, 'redcrystal',0).setScrollFactor(0).setScale(0.75,0.75).setOrigin(0.5);
            choiceBlue = this.physics.add.sprite(636, 20, 'bluecrystal',0).setScrollFactor(0).setScale(0.75,0.75).setOrigin(0.5);
            choiceGreen = this.physics.add.sprite(668, 20, 'greencrystal',0).setScrollFactor(0).setScale(0.75,0.75).setOrigin(0.5);
            choiceYellow = this.physics.add.sprite(700, 20, 'yellowcrystal',0).setScrollFactor(0).setScale(0.75,0.75).setOrigin(0.5);
            /*
            this.children.bringToTop(choiceRed);
            this.children.bringToTop(choiceBlue);
            this.children.bringToTop(choiceGreen);
            this.children.bringToTop(choiceYellow);
            */
            choiceRed.depth = 2500;
            choiceBlue.depth = 2500;
            choiceGreen.depth = 2500;
            choiceYellow.depth = 2500;
            this.add.text(604,20,'A', { fontFamily: 'arcadeclassicregular', color: '#333', align: 'center',fontSize:'23px'}).setScrollFactor(0).setDepth(2510).setOrigin(0.5, 0.5);
            this.add.text(636,20,'B', { fontFamily: 'arcadeclassicregular', color: '#333', align: 'center',fontSize:'23px'}).setScrollFactor(0).setDepth(2510).setOrigin(0.5, 0.5);
            this.add.text(668,20,'C', { fontFamily: 'arcadeclassicregular', color: '#333', align: 'center',fontSize:'23px'}).setScrollFactor(0).setDepth(2510).setOrigin(0.5, 0.5);
            this.add.text(700,20,'D', { fontFamily: 'arcadeclassicregular', color: '#333', align: 'center',fontSize:'23px'}).setScrollFactor(0).setDepth(2510).setOrigin(0.5, 0.5);
                
        }
	update(time,delta){
		playerChar.depth = playerChar.y;
		this.elapsedText.setText(this.consolidatedTime);
		if(this.redChest.locked == false && this.blueChest.locked == false && this.greenChest.locked == false && this.yellowChest.locked == false){
			if(bossHurting == false){
				bossHurting = true;
				this.boss.children.entries[0].isInvulnerable = false;
				var warningText = [
				"HOORAY!!!",
				"You have unlocked all the chests!",
				"Now the boss is exposed",
				"and you can hurt it now!"
				]
				var midX = this.cameras.main.width/2;
				var midY = this.cameras.main.height/2;
				var warningDisplay = this.add.text(midX,midY, warningText, { fontFamily: 'arcadeclassicregular', color: '#000', align: 'center', padding:5, backgroundColor:'#FFF'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
				console.log(this);
				//this.scene.pause();
				this.time.addEvent({delay:3000,callback:function(){
					console.log(this);
					warningDisplay.alpha = 0;
					warningDisplay.visible = false;
					warningDisplay.destroy();
					//this.scene.resume();
				},callbackScope:this});
			}
		}
		if(playerChar.currLevel == gateLocations.length-1){
			if(!queBoss){
				queBoss = true;
				arcade.stop();
				bossTheme.play({loop:true});
				var warningText = [
				"Be careful!!!",
				"The bad boss can't be hurt until",
				"You have opened all the chests!"
				]
				var midX = this.cameras.main.width/2;
				var midY = this.cameras.main.height/2;
				var warningDisplay = this.add.text(midX,midY, warningText, { fontFamily: 'arcadeclassicregular', color: '#FFF', align: 'centert', padding:5, backgroundColor:'#333'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
				//this.scene.pause();
				console.log(this);
				this.time.addEvent({delay:3000,callback:function(){
					console.log(this);
					warningDisplay.alpha = 0;
					warningDisplay.visible = false;
					warningDisplay.destroy();
					//this.scene.resume();
				},callbackScope:this});
			}
		}
		//console.log(playerChar.x,playerChar.y);
		//cactus.depth = cactus.y; 
		this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); 
		this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); 
		this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);    
		playerChar.playerLife = playerLife;
		if (cursors.left.isDown || this.keyA.isDown)
		{
			flipX = false;
		    activeDir = "X";
		    playerChar.setVelocityX(-walkSpeed);
		    playerChar.setVelocityY(0);		
			playerChar.anims.play('walkLeft', true);
			
		}
		else if (cursors.right.isDown || this.keyD.isDown)
		{
			activeDir = "X";
		    flipX = true;
		    playerChar.setVelocityX(walkSpeed);
		    playerChar.setVelocityY(0);
		    playerChar.anims.play('walkRight', true);
		}
		else if (cursors.up.isDown || this.keyW.isDown)
		{
			activeDir = "Y";
		    flipY = false;
		    playerChar.setVelocityY(-walkSpeed);
		    playerChar.setVelocityX(0);
		    playerChar.anims.play('walkUp', true);
		}
		else if (cursors.down.isDown || this.keyS.isDown)
		{
			activeDir = "Y";
		    flipY = true;
		    playerChar.setVelocityY(walkSpeed);
		    playerChar.setVelocityX(0);
		    playerChar.anims.play('walkDown', true);
		}
		else {		
				if(!Phaser.Input.Keyboard.JustDown(spacebar)){
				playerChar.anims.stop();
			    playerChar.setVelocityX(0);
			    playerChar.setVelocityY(0);
			}
		}
		if(playerLife <= 0){
			//playerChar.anims.play('playerDie', true);
			if(runOnce == 0){
				runOnce++;
				this.input.keyboard.off('keydown_SPACE');
				//this.bullets.destroy();
				arcade.stop();
				bossTheme.stop();
				var timePenalty = 0;
				if(timeFactor > 1500){
					timePenalty = (Math.floor((timeFactor-1500)/60));
				}
				var skeletonScore = (Enemies - this.baddies.children.entries.length);
				var batScore = (BatCount - batties.children.entries.length);
				var zombieScore = (ZombieCount-this.zombies.children.entries.length);
				playerScore = (playerScore + 15) - timePenalty + skeletonScore + batScore + zombieScore + playerLife;
				var totalTimeSpent = secondsToHms(timeFactor);
				this.cameras.main.fadeOut(500);
				this.time.addEvent({delay:500,callback:function(){
					this.scene.pause();
					this.scene.start('GameOver',{pScore: playerScore, elapsedTime:this.consolidatedTime, totalTime:timeFactor, date:Date.now(), timeSpent:totalTimeSpent});
				},callbackScope:this});
			}
		}
		scoreText.setText('Score: '+playerScore);
		document.getElementById("enemyCounter").innerHTML = "Skeletons Left: "+this.baddies.children.entries.length+"<br />Flyers Left:"+batties.children.entries.length;
		document.getElementById("zombieCounter").innerHTML = "Zombies Left: "+this.zombies.children.entries.length;
		document.getElementById("bossBoard").innerHTML = "Boss Life: "+this.boss.children.entries[0].lifePoints;
		//document.getElementById("bossBoard").innerHTML = "Boss Life: "+this.boss.children.entries[0].lifePoints;

	}
	cleanScene(){
		//this.physics.destroy();
	}
	restartGame(){
		runOnce = 0;
		//this.scene.start();
	}
	hitChest(player,chest){
		chest.checkLock(player);
	}
}

class MenuScreen extends Phaser.Scene{
	constructor(){
		super({key:"MenuScreen",active:true});
		this.active;
		this.currentScene;
	}
	preload(){
		this.load.image('logo', 'assets/sprites/logo_small.png');
	}
	create(){
		console.log('Menu Screen');
		var logo = this.physics.add.image(400, 250, 'logo');
		this.menuText = [];
		this.introText = "Press  the  corresponding  key for  selected  difficulty:";
		this.choices = ["1 - Normal", "2 - Hard"];
		this.menuText.push(this.introText);
		this.menuText.push(this.choices[0]);
		this.menuText.push(this.choices[1]);
		this.add.text(150, 430, this.menuText, { fontFamily: 'arcadeclassicregular', color: '#00ff00', align: 'center', fontSize:'20px' });

        this.input.keyboard.once('keyup_ONE', function () {

            this.scene.start('SceneA', {gameMode: 1});

        }, this);

        this.input.keyboard.once('keyup_TWO', function () {

            this.scene.start('SceneA', {gameMode: 2});

        }, this);

        this.events.on('shutdown', this.shutdown, this);
		//this.scene.start('SceneA');
	}
	shutdown ()
    {
        //  We need to clear keyboard events, or they'll stack up when the Menu is re-run
        this.input.keyboard.shutdown();
    }
}

function getCurrLevel(obj){
	var level;
	return level;
}

function pickAns(player,ans,letter){
	if(!player.picking){
		player.picking = true;
		player.ansKey = letter;
		star.play({loop:false});
		console.log('your answer is: '+letter+': '+choiceSets[SelectionLevel][ans]);
		game.scene.scenes[1].time.addEvent({delay:1000,callback:function(){
			player.picking = false;
		},callbackScope:this,repeat:0});
	}
}


function getRed(player,beacon){
	letterChosen = 'a'
	choiceIndex = 0;
	choiceRed.anims.play('redcrystal',true);
        choiceBlue.anims.stop();
        choiceGreen.anims.stop();
        choiceYellow.anims.stop();
        choiceRed.setScale(1,1);
        choiceBlue.setScale(0.75,0.75);
        choiceGreen.setScale(0.75,0.75);
        choiceYellow.setScale(0.75,0.75);
	pickAns(player,choiceIndex,letterChosen);
}

function getBlue(player,beacon){
	letterChosen = 'b'
	choiceIndex = 1;
    choiceBlue.anims.play('bluecrystal',true);
     	choiceRed.anims.stop();
        choiceGreen.anims.stop();
        choiceYellow.anims.stop();
        choiceBlue.setScale(1,1);
        choiceRed.setScale(0.75,0.75);
        choiceGreen.setScale(0.75,0.75);
        choiceYellow.setScale(0.75,0.75);
	pickAns(player,choiceIndex,letterChosen);
}

function getGreen(player,beacon){
	letterChosen = 'c'
	choiceIndex = 2;
	choiceGreen.anims.play('greencrystal',true);
		choiceRed.anims.stop();
        choiceBlue.anims.stop();
        choiceYellow.anims.stop();
        choiceGreen.setScale(1,1);
        choiceRed.setScale(0.75,0.7);
        choiceBlue.setScale(0.75,0.75);
        choiceYellow.setScale(0.75,0.75);
	pickAns(player,choiceIndex,letterChosen);
}

function getYellow(player,beacon){
	letterChosen = 'd'
	choiceIndex = 3;
    choiceYellow.anims.play('yellowcrystal',true);
     	choiceRed.anims.stop();
        choiceBlue.anims.stop();
        choiceGreen.anims.stop();
        choiceRed.setScale(0.75,0.75);
        choiceBlue.setScale(0.75,0.75);
        choiceGreen.setScale(0.75,0.75);
        choiceYellow.setScale(1,1);
	pickAns(player,choiceIndex,letterChosen);
}

function checkGate(player,gate){
	if(!gate.unLocking){
	//console.log('checkGate')
		//console.log(gate.question);
		if(!debug){
			console.log(gate.ans);
			console.log('gate ID: '+gate.gid+' on level: '+gate.currLevel+': a='+gate.Selection[0]+' b='+gate.Selection[1]+' c='+gate.Selection[2]+' d='+gate.Selection[3]+' ',gate.ans,choiceIndex);
			var pAns;
			choiceIndex == gate.Selection.indexOf(gate.ans);
			gate.unLocking = true;
			SelectionLevel = gate.gid-1;
			if(gate.isClosed){
				if(gate.solved == false){
					if(gate.ansKey == 'x'){
						gate.solved = true;
						player.ansKey = 'x';
						 player.clearUpgrade = true;
						openGate(player,gate);
					} else {
						if(choiceIndex == gate.Selection.indexOf(gate.ans)){
							gate.solved = true;
							playerScore = playerScore + 10;
							if(gate.gid != 8 || gate.gid != 10){
								player.clearUpgrade = true;
							}
							openGate(player,gate);
						} else {
							displayText(gate);
							gate.unLocking = true;
							if(choiceIndex && playerScore > 0 && choiceIndex != 10){
								playerScore = playerScore - 2;
								player.setTint(0xff0000);
								playerHurt.play();
							}
							game.scene.scenes[1].time.addEvent({delay:500,callback:function(){
								doorLock.play({loop:false});
								player.clearTint();
								player.ansKey = 'x';
								gate.unLocking = false;
							},callbackScope:this,repeat:0});
						}
					}
				} else {
					openGate(player,gate);
				}
			}
		} else {
			openGate(player,gate);
		}
	}
}

function displayText(gate){
	var qIntro = "Question: ";
	var que = gate.question.split('<br />');
	var spacer = 'Your choices are: ';
	var midX = game.scene.scenes[1].cameras.main.width/2;
	var midY = game.scene.scenes[1].cameras.main.height/2;
	var keys = 'A = '+gate.Selection[0]+', B = '+gate.Selection[1]+', C = '+gate.Selection[2]+', D = '+gate.Selection[3];
	console.log(que);
	que.unshift(qIntro);
	que.push(' ');
	que.push(spacer);		
	que.push(keys);
	if(gate.gid != 9 || gate.gid != 11){
		var qDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:5, backgroundColor:'#000'}).setScrollFactor(0).setDepth(2500).setOrigin(0.5, 0.5);
		//var qDisplay = game.scene.scenes[1].add.text(midX,midY, que, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'left', padding:16, backgroundColor:'#000' }).setOrigin(0.5, 0.5);						
		//qDisplay.depth = 2450;
		//qDisplay.setScrollFactor(0);
		//var qDetails = qDisplay.getBounds();
		game.scene.scenes[1].time.addEvent({delay:7000,callback:function(){
			qDisplay.alpha = 0;
			qDisplay.visible = false;
			qDisplay.destroy();
		},callbackScope:this,repeat:0});
	}
}

function openGate(player,gate){
	gate.body.enable = false;
	gate.isClosed = false;
	gate.anims.play('openGate',false);
	doorOpen.play({loop:false});			
	game.scene.scenes[1].time.addEvent({delay:2000,callback:function(){
		if(gate.isClosed == false){
			gate.solved = true;
			choiceIndex = null;
			if(player.clearUpgrade){
				player.currLevel = gate.currLevel+1;
				player.clearUpgrade = false;
			}
			gate.body.enable = true;
			gate.isClosed = true;
			gate.anims.play('closeGate',false);
			doorClose.play({loop:false});
			console.log('gate level: '+gate.currLevel+", player level: "+player.currLevel);
			player.ansKey = 'y';
                        choiceRed.setScale(0.75,0.75);
                        choiceBlue.setScale(0.75,0.75);
                        choiceGreen.setScale(0.75,0.75);
                        choiceYellow.setScale(0.75,0.75);
                        choiceRed.anims.stop();
                        choiceBlue.anims.stop();
				        choiceGreen.anims.stop();
				        choiceYellow.anims.stop();
			gate.unLocking = false;
		}
	},callbackScope:this,repeat:0});
}

function updateLockText(){
	document.getElementById("scoreBoard").innerHTML = "Player Life: "+playerLife;
}

function bulletHitsWall(bullet,wall){
	bullet.setActive = false;
	bullet.setVisible = false;
	bullet.destroy();
}

function baddieHitsWall(baddie,wall){
	console.log(baddie.body.checkCollision);
	baddie.hitWall = "hit wall!";
	/*
	if(baddie.directionY == 'stop'){
		if(baddie.directionX == 'right'){
			if(baddie.typeChar == 'skeleton'){
				baddie.anims.play('walkLeftSkeleton', true);
			}else if(baddie.typeChar == 'zombie'){
				baddie.anims.play('walkLeftZombie', true);
			} else if(baddie.typeChar == 'boss'){
				baddie.dirFace = 'west';
				baddie.anims.play('walkLeftOrc', true);
			}			
			baddie.directionX = 'left';
		} else {
			if(baddie.typeChar == 'skeleton'){
				baddie.anims.play('walkRightSkeleton', true);
			} else if(baddie.typeChar == 'zombie'){
				baddie.anims.play('walkRightZombie', true);
			} else if(baddie.typeChar == 'boss'){
				baddie.dirFace = 'east';
				baddie.anims.play('walkRightOrc', true);
			}
			baddie.directionX = 'right';
		} 
	} else {
		if(baddie.directionY == 'down'){
			if(baddie.typeChar == 'skeleton'){
				baddie.anims.play('walkUpSkeleton', true);
			}else if(baddie.typeChar == 'zombie'){
				baddie.anims.play('walkUpZombie', true);
			} else if(baddie.typeChar == 'boss'){
				baddie.dirFace = 'north';
				baddie.anims.play('walkUpOrc', true);
			}
			baddie.directionY = 'up';
		} else {
			if(baddie.typeChar == 'skeleton'){
				baddie.anims.play('walkDownSkeleton', true);
			}else if(baddie.typeChar == 'zombie'){
				baddie.anims.play('walkDownZombie', true);
			} else if(baddie.typeChar == 'boss'){
				baddie.dirFace = 'south';
				baddie.anims.play('walkDownOrc', true);
			}
			baddie.directionY = 'down';
		}
	}
	*/
}

function bossAttack(player,boss){
	if(boss.isAlive == true){
		if(bossAttackStat == 0){
			bossAttackStat = 1;
			player.setTint(0xff0000);
			playerHurt.play();
			if(boss.dirFace == 'east'){
				boss.anims.play('attackRightOrc',-1);
			} else if(boss.dirFace == 'west'){
				boss.anims.play('attackLeftOrc'),-1;
			} else if(boss.dirFace == 'north'){
				boss.anims.play('attackUpOrc',-1);
			} else {
				boss.anims.play('attackDownOrc',-1);
			}
			this.time.addEvent({delay:500,callback:function(){
				playerLife=playerLife-10;
				updateLockText();
				bossAttackStat = 0;
				player.clearTint();
			},callbackScope:this});
		}
	}
}
function bossHit(bullet,boss){
	if(boss.isAlive == true){
		enemyHit.play();
		bullet.setActive = false;
		bullet.setVisible = false;
		if(boss.isInvulnerable == false){
			boss.lifePoints--;
			boss.setTint(0xff0000);
			this.time.addEvent({delay:500,callback:function(){
				boss.clearTint();
			},callbackScope:this});
		} else {
			boss.setTint(0x00ff00);
			this.time.addEvent({delay:500,callback:function(){
				boss.clearTint();
			},callbackScope:this});
		}
		bullet.destroy();
	}
		if(boss.lifePoints <= 0){
			this.time.addEvent({delay:500,callback:function(){
				boss.setActive = false;
			},callbackScope:this});
		}
}

function hitSkeleton(player,skeleton){
	//skeleton.setTint(0xff0000);
	if(playerLife > 0 && skeleton.lifePoints > 0){
		if(skeleton.attStat == 0){
			skeleton.attStat = 1;
			playerLife = playerLife-skeletonDamage;
			player.setTint(0xff0000);
			updateLockText(true);
			playerHurt.play();
			this.time.addEvent({delay:500,callback:function(){
				player.clearTint();
				skeleton.attStat = 0;
			},callbackScope:this});
		}
	}
}

function shootSkeleton(skeleton,bullet){
	enemyHit.play();
	bullet.setActive(false);
	bullet.setVisible(false);
	console.log(skeleton.currLevel);
	var lP = skeleton.lifePoints;
	var maxLife;
	if(skeleton.typeChar == 'skeleton'){
		maxLife = skeletonMaxLife;
	} else {
		maxLife = zombieMaxLife;
	}
	lP--;
	bullet.destroy();
	if(lP <= Math.round(maxLife/2) && lP > Math.round(maxLife/3)){
		skeleton.setTint(0xffff00);
	} else {
		if(lP <=  Math.round(maxLife/3)){
			skeleton.setTint(0xff0000);
		}
	}
	skeleton.lifePoints = lP;
}


function battieHitsWall(batty,wall){
	if(batty.directionY == 'stop'){
		if(batty.directionX == 'right'){
			batty.anims.play('flyLeft', true);
			batty.directionX = 'left';
		} else {
			batty.anims.play('flyRight', true);
			batty.directionX = 'right';
		} 
	} else {
		if(batty.directionY == 'down'){
			batty.directionY = 'up';
		} else {
			batty.directionY = 'down';
		}
	}
}

function shootBat(batty,bullet){
	enemyHit.play();
	bullet.setActive(false);
	bullet.setVisible(false);
	batty.lifePoints--;
	console.log(batty.currLevel);
	bullet.destroy();
	if(batty.lifePoints <= Math.round(batMaxLife/2) && batty.lifePoints > Math.round(batMaxLife/3)){
		batty.setTint(0xffff00);
	} else if(batty.lifePoints <= Math.round(batMaxLife/3)){
		batty.setTint(0xff0000);
	}
}

function spawnBadGuys(){	
	var baddie = this.game.scene.scenes[1].physics.add.group({
	   	key:'skeleton',
	   	classType:Skeleton,
	   	repeat:Enemies-1,
	   	bounceX: 1,
	   	bounceY: 1,
	   	collideWorldBounds: false,
	   	runChildUpdate:true,
	   	enableBody:true,
	   	endFrame:272
    });
    var i=0;
   
	baddie.children.iterate(function (child) {
		if(i >= keyLocations.length){
			i=0;
		}
		child.x = keyLocations[i][0]
		child.y = keyLocations[i][1];
		child.currLevel = i+1;
       	i++;
       	child.body.setSize(32,64,8,16);
   	});
   	return baddie;
}

function spawnZombies(){	
	var zombie = this.game.scene.scenes[1].physics.add.group({
	   	key:'zombie',
	   	classType:Zombie,
	   	repeat:ZombieCount-1,
	   	bounceX: 1,
	   	bounceY: 1,
	   	collideWorldBounds: false,
	   	runChildUpdate:true,
	   	enableBody:true,
	   	endFrame:272
    });
    var i=11;
   
	zombie.children.iterate(function (child) {
		if(i >= keyLocations.length){
			i=11;
		}
		child.x = keyLocations[i][0]
		child.y = keyLocations[i][1];
		child.currLevel = i+1;
       	i++;
       	child.body.setSize(32,32,0,0);
   	});
   	return zombie;
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

function elapsedTime(){
	var ss = '0'+game.scene.scenes[1].seconds;
	var sm = '0'+game.scene.scenes[1].minutes;
	var sh = '0'+game.scene.scenes[1].hours;

	if(game.scene.scenes[1].seconds > 9 ){
		ss = game.scene.scenes[1].seconds;
	} 
	if(game.scene.scenes[1].minutes > 9){
		sm = game.scene.scenes[1].minutes;
	} else 
	if(game.scene.scenes[1].hours > 9){
		sh = game.scene.scenes[1].minutes;
	} else {
		game.scene.scenes[1].hours = game.scene.scenes[1].hours;
	}	
	game.scene.scenes[1].seconds++;
	if(game.scene.scenes[1].seconds == 60){
		game.scene.scenes[1].seconds = 0;
		game.scene.scenes[1].minutes++;
	}
	if(game.scene.scenes[1].minutes == 60){
		game.scene.scenes[1].minutes = 0;
		game.scene.scenes[1].hours++;
	}
	timeFactor++;
	game.scene.scenes[1].consolidatedTime = 'Elapsed Time: '+sh+':'+sm+':'+ss;
	//this.add.text(650,65, this.consolidatedTime, { fontFamily: 'arcadeclassicregular', color: '#fff', align: 'right', padding:5, backgroundColor:'#000' });
}

class GameOver extends Phaser.Scene{
	constructor(){
		super({key:"GameOver"});
		this.active;
		this.currentScene;
		this.req;
	}
	init(data){
		console.log(data);
		$.ajax({
			url:'includes/process.php',
			method:"POST",
			data:data,
			dataType:'json',
			crossDomain:true,
			success:function(d){
				console.log("d: ");
				console.log(d);
				console.log("data has been sent");
			},
			complete:function(f){
				console.log(f);
			}
		});
	}
	preload(){
		this.load.audio('defeat', [
	        './assets/audio/Kevin MacLeod - Teller of the Tales.mp3',
	        './assets/audio/Kevin MacLeod - Teller of the Tales.ogg'
	    ]);
	    this.load.image('backButton', 'assets/sprites/back_to_menu.png');
	}
	create(){
	var sprite = this.add.sprite(400, 400, 'backButton').setInteractive();
	sprite.setOrigin(0.5,0.5);
    sprite.on('pointerdown', function (pointer) {
        window.location.replace('index.php');
    });
	defeat = this.sound.add('defeat');
	var content = [
		"GAME OVER",
        "YOU LOSE"
    ];
    defeat.play({loop:true});
    this.add.text(400, 250, content, { fontFamily: 'arcadeclassicregular', color: '#00ff00', align: 'center', fontSize:'40px' }).setOrigin(0.5,0.5);
	}

}

class WinGame extends Phaser.Scene{
	constructor(){
		super({key:"WinGame"});
		this.active;
		this.currentScene;
	}
	init(data){
		console.log(data);
		$.ajax({
			url:'includes/process.php',
			method:"POST",
			data:data,
			dataType:'json',
			crossDomain:true,
			success:function(d){
				console.log("d: ");
				console.log(d);
				console.log("data has been sent");
			},
			complete:function(f){
				console.log(f);
			}
		});
	}
	preload(){
		this.load.audio('victory', [
	        './assets/audio/BoxCat_Games_-_25_-_Victory.mp3',
	        './assets/audio/BoxCat_Games_-_25_-_Victory.ogg'
	    ]);
	    this.load.image('backButton', 'assets/sprites/back_to_menu.png');
	}
	create(){
		//this.scene.start('SceneA');
		var success = this.sound.add('victory');
		var content = [
			"SUCCESS!!!",
	        "YOU WIN"
	    ];
	    var sprite = this.add.sprite(400, 400, 'backButton').setInteractive();
		sprite.setOrigin(0.5,0.5);
	    sprite.on('pointerdown', function (pointer) {
	       window.location.replace('index.php');
	    });
	    this.add.text(280, 250, content, { fontFamily: 'arcadeclassicregular', color: '#00ff00', align: 'center', fontSize:'40px' });
	    success.play({loop:true});
	}
}

var config = {
	type:Phaser.AUTO,
	width:800,
	height:600,
	physics:{
		default:'arcade',
		arcade:{
			setBounds:true
		}
	},
	parent:"screen",
	scene:[MenuScreen,SceneA,GameOver,WinGame],
	title:"Learn Your Way Out",
	version:"1.3b"
};

document.addEventListener('DOMContentLoaded',function(){
	document.getElementById('screen').innerHeight = (window.screen.availWidth/1200)*1600;
	runGame();
});
function runGame(){
	console.log("running...");
	game = new Phaser.Game(config);
}
var game;
var maxFrameRate = 12;
var walkSpeed = (maxFrameRate/12)*80;
var speed;
var bullets;
var lastFired = 0;
var fire;
var ang;
var angle;
var cursors;
var spacebar;
var angle2;
var gun;
var fire;
var flipX = false;
var flipY = true;
var activeDir = "Y";
var config = {
	type:Phaser.AUTO,
	width:1000,
	height:750,
	scene:{
		preload: preload,
		create: create,
		update: update
	},
	physics:{
		default:'arcade',
		arcade:{
			setBounds:true
		}
	},
	parent:"container",
	title:"Monster ShootUp"
};


class Bullet extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,player.x,player.y,'bullet');
		this.born = 0;
		this.outOfBoundsKill = true;
		this.setScale(0.2,0.2);
	
}	fire(){
	
		var mouseX = game.input.activePointer.downX;
		var mouseY = game.input.activePointer.downY;
		this.setPosition(player.x,player.y);
		this.setActive(true);
		this.setVisible(true);
		this.born = 0;
		this.speed = 0.3;
		this.speedX = this.speed;
		this.speedY = this.speed;
		this.outOfBoundsKill = true;
			/*
		var dirX = player.x - mouseX;
        var dirY = player.y - mouseY;
        var angle = Math.atan2(dirY,dirX);        
		if((player.x < mouseX && player.x < 300 && mouseX < 350) || (player.x > mouseX && player.x > 500 && mouseX > 550)){
			dirX = mouseX - player.x;
		}
        this.angle = angle;
        */
        fire.play();
        if(flipX == true){
        	this.speedX = 0-this.speedX;
        }
        if(flipY == true){
        	this.speedY = 0-this.speedY;
        }
        if(activeDir == "X"){
        	this.speedY = 0;
        } else {
        	this.speedX = 0;
        }
		
	}
	update(time,delta){
		this.born += delta;		
			this.x -= (delta * this.speedX);		
			this.y -= (delta * this.speedY);	
		
	    if(this.born > 1750){
	    	this.setActive(false);
	      	this.setVisible(false);
	    }
	}
}

function preload(){
	this.load.image('bullet', 'assets/sprites/red.png');
	this.load.image('base','./assets/maps/inner_test.jpg');
	this.load.spritesheet('player','./assets/sprites/char.png',{ frameWidth: 64, frameHeight: 64, endFrame: 272 },maxFrameRate);
	this.load.image('ground','./assets/maps/galaxy.jpg');
	this.load.audio('jungle', [
        './assets/audio/enchanted_forest.mp3',
        './assets/audio/enchanted_forest_loop.ogg'
     ]);
	this.load.audio('fire', [
        './assets/audio/carrot.mp3',
        './assets/audio/carrot.ogg'
     ]);
	
}

function create(){
	
	this.add.image(500,375,'ground').setScrollFactor(0.25).setScale(2,2);
	this.add.image(500,390,'base').setScrollFactor(1);
	var jungle = this.sound.add('jungle');
	fire = this.sound.add('fire');

    jungle.play({
        loop: true
    });
	cursors = this.input.keyboard.createCursorKeys();
	spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
	player = this.physics.add.sprite(500, 375, 'player',26);	
	player.anims.animationManager.frameRate = maxFrameRate;
	var animCastDown = {
		key:'animCastDown',
		frames: this.anims.generateFrameNumbers('player',{start:26,end:32}),
		frameRate:maxFrameRate,
		repeat:-1
	};
	var walkUp = {
		key:'walkUp',
		frames: this.anims.generateFrameNumbers('player',{start:104,end:112}),
		frameRate:maxFrameRate,
		repeat:-1
	};
	var walkDown = {
		key:'walkDown',
		frames: this.anims.generateFrameNumbers('player',{start:130,end:137}),
		frameRate:maxFrameRate,
		repeat:-1
	};
	var walkLeft = {
		key:'walkLeft',
		frames: this.anims.generateFrameNumbers('player',{start:117,end:125}),
		frameRate:maxFrameRate,
		repeat:-1
	};
	var walkRight = {
		key:'walkRight',
		frames: this.anims.generateFrameNumbers('player',{start:143,end:151}),
		frameRate:maxFrameRate,
		repeat:-1
	};
	var shootUp = {
		key:'shootUp',
		frames: this.anims.generateFrameNumbers('player',{start:208,end:220}),
		frameRate:maxFrameRate,
		repeat:false
	};
	var shootLeft = {
		key:'shootLeft',
		frames: this.anims.generateFrameNumbers('player',{start:221,end:233}),
		frameRate:maxFrameRate,
		repeat:false
	};
	var playerDie = {
		key:"playerDie",
		frames: this.anims.generateFrameNumbers('player',{start:260,end:265}),
		repeat:false
	}
	game.anims.create(animCastDown);
	game.anims.create(walkUp);
	game.anims.create(walkDown);
	game.anims.create(walkLeft);
	game.anims.create(walkRight);
	game.anims.create(playerDie);
	game.anims.create(shootUp);
	game.anims.create(shootLeft);

	this.bullets = this.add.group({
        classType: Bullet,
        maxSize: -1,
        runChildUpdate: true
    });
    var controlConfig = {
        camera: this.cameras.main,
        /*
        left: cursors.left,
        right: cursors.right,
        up: cursors.up,
        down: cursors.down,
        acceleration: 0.015,
        drag: 0.0001,
        */
        maxSpeed: 0.15
    };

    controls = new Phaser.Cameras.Controls.Smoothed(controlConfig);

    this.cameras.main.setBounds(-300,-265,1600,1280);
    //console.log(this.cameras.main);
    this.cameras.main.startFollow(player);
    this.cameras.main.zoom = 1.05;
    //this.cameras.main.setViewport(200,100,600,400);
	this.physics.add.colliders = [player];
	player.body.collideWorldBounds = true; 
	player.body.allowGravity = false;
	player.body.rotation = 0;
	this.cameras.main.fadeIn(500);
	/*
	this.input.on('pointerdown',function(){
		let bullet = this.bullets.get();
        if(bullet) {
        let offset = new Phaser.Geom.Point(0, player.height / 2);
          
          bullet.fire();
        }
        if(activeDir == 'X' && flipX == false){
	        	player.anims.play('shootLeft', true);
	    }
	},this);
	*/
	/*
	this.input.keyboard.on('keydown_LEFT',function(event){
		flipX = false;
	    activeDir = "X";
	},this);
	this.input.keyboard.on('keydown_RIGHT',function(event){
		activeDir = "X";
	    flipX = true;
	},this);
	this.input.keyboard.on('keydown_UP',function(event){
		activeDir = "Y";
	    flipY = false;
	},this);
	this.input.keyboard.on('keydown_DOWN',function(event){
		activeDir = "Y";
	    flipY = true;
	},this);
	*/
	this.input.keyboard.on('keydown_SPACE',function(event){
		let bullet = this.bullets.get();
		if(bullet) {
			bullet.fire();	
		}
	},this);
	/*
	if(Phaser.Input.Keyboard.JustDown(spacebar)){
			player.anims.play('shootLeft', true);
		}
	*/
}

function update(time, delta){
	controls.update(delta);
	//console.log(player.x+","+player.y);
	//ang = Math.atan2(player.y - this.input.activePointer.position.y,player.x - this.input.activePointer.position.x) * 180 / Math.PI;
	//console.log(ang);
	if (cursors.left.isDown)
	{
		flipX = false;
	    activeDir = "X";
	    player.setVelocityX(-walkSpeed);
	    player.setVelocityY(0);		
		player.anims.play('walkLeft', true);
		
	}
	else if (cursors.right.isDown)
	{
		activeDir = "X";
	    flipX = true;
	    player.setVelocityX(walkSpeed);
	    player.setVelocityY(0);
	    player.anims.play('walkRight', true);
	}
	else if (cursors.up.isDown)
	{
		activeDir = "Y";
	    flipY = false;
	    player.setVelocityY(-walkSpeed);
	    player.setVelocityX(0);
	    player.anims.play('walkUp', true);
	}
	else if (cursors.down.isDown)
	{
		activeDir = "Y";
	    flipY = true;
	    player.setVelocityY(walkSpeed);
	    player.setVelocityX(0);
	    player.anims.play('walkDown', true);
	}
	else {		
			if(!Phaser.Input.Keyboard.JustDown(spacebar)){
			player.anims.stop();
		    player.setVelocityX(0);
		    player.setVelocityY(0);
		}
	}


}
document.addEventListener('DOMContentLoaded',function(){
	runGame();
});


function runGame(){
	game = new Phaser.Game(config);
}
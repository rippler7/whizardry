document.addEventListener('DOMContentLoaded',function(){

var game;
var maxFrameRate = 24;
var walkSpeed = (maxFrameRate/12)*80;
var speed;
var bullets;
var lastFired = 0;
var fire;
var ang;
var angle;
var angle2;
var gun;
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
		super(scene,0,0,'bullet');
		this.born = 0;
		this.outOfBoundsKill = true;
		this.setScale(0.5,0.5);
	
}	fire(){
	
		var mouseX = game.input.activePointer.downX;
		var mouseY = game.input.activePointer.downY;
		this.setPosition(player.x,player.y);
		this.setActive(true);
		this.setVisible(true);
		this.born = 0;
		this.speed = 0.2;
		var dirX = player.x - mouseX;
        var dirY = player.y - mouseY;
        var angle = Math.atan2(dirY,dirX);  

        console.log("game:");  
        console.log(game);     
        console.log("mouseX, mouseY:");   
        console.log(mouseX,mouseY);
        console.log("player.x,player.y: ");  
        console.log(player.x,player.y);
        console.log("game.input.activePointer: ");  
        console.log(game.input.activePointer)
        console.log("player:");  
        console.log(player);
        console.log("bullet: ");  
        console.log(this);

        this.angle = angle;
		this.directionX = Math.cos(this.angle);
		this.directionY = Math.sin(this.angle);
		//this.setVelocity((Math.cos(this.angle) * this.speed),(Math.sin(this.angle) * this.speed));
    	//this.velocity.y = ((Math.sin(this.angle) * this.speed));
		/*
        var dirX = basePos.x -this.scene.input.activePointer.x;
        var dirY = basePos.y - this.scene.input.activePointer.y;
        //var pDist = Phaser.Math.Distance.Between((player.x),this.scene.input.activePointer.position.x,player.y,this.scene.input.activePointer.position.y);
        
        var angle = Math.atan2(dirY,dirX);
        this.velocity = Math.abs(Math.sqrt(dirX * dirX + dirY * dirY));
        console.log("angle: "+angle);
        this.ang = angle;
      
        //console.log("pDist: "+pDist/100);
        console.log("mouse: "+this.scene.input.activePointer.x+" , "+this.scene.input.activePointer.y);
        console.log("player: "+this.x+" , "+this.y);
        */
 
	}
	update(time,delta){
		this.born += delta;
		this.x -= this.speed * delta * this.directionX;
		this.y -= this.speed * delta * this.directionY;
	    if(this.born > 2000){
	    	this.setActive(false);
	      	this.setVisible(false);
	    }
	}
}

function d2r(d){
    var r=d*(Math.PI/180);
    return r;   
}

function preload(){
	this.load.image('bullet', 'assets/sprites/bullet.png');
	this.load.spritesheet('player','./assets/sprites/char.png',{ frameWidth: 64, frameHeight: 64, endFrame: 272 },maxFrameRate);
	this.load.image('ground','./assets/maps/samp00.jpg');
	
}

function create(){
	
	this.add.image(500,375,'ground');
	cursors = this.input.keyboard.createCursorKeys();
	player = this.physics.add.sprite(500, 375, 'player',26);	
	player.anims.animationManager.frameRate = maxFrameRate;
	console.log(this.physics);
	var animCastLeft = {
		key:'animCastLeft',
		frames: this.anims.generateFrameNumbers('player',{start:14,end:20}),
		frameRate:maxFrameRate,
		repeat:false
	};
	var animCastDown = {
		key:'animCastDown',
		frames: this.anims.generateFrameNumbers('player',{start:26,end:32}),
		frameRate:maxFrameRate,
		repeat:false
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
	var playerDie = {
		key:"playerDie",
		frames: this.anims.generateFrameNumbers('player',{start:260,end:265}),
		repeat:false
	}
	game.anims.create(animCastLeft);
	game.anims.create(animCastDown);
	game.anims.create(walkUp);
	game.anims.create(walkDown);
	game.anims.create(walkLeft);
	game.anims.create(walkRight);
	game.anims.create(playerDie);

	this.bullets = this.add.group({
        classType: Bullet,
        maxSize: 3,
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
    //this.cameras.main.setViewport(200,100,600,400);
	this.physics.add.colliders = [player];
	player.body.collideWorldBounds = true; 
	player.body.allowGravity = false;
	player.body.rotation = 0;
	this.cameras.main.fadeIn(1000);
	
	this.input.on('pointerdown',function(){
		let bullet = this.bullets.get();
        if(bullet) {
        let offset = new Phaser.Geom.Point(0, player.height / 2);
          //Phaser.Math.Rotate(offset, player.body.rotation);
          bullet.fire();
        }
	},this);
}

function update(time, delta){
	controls.update(delta);
	//console.log(player.x+","+player.y);
	//ang = Math.atan2(player.y - this.input.activePointer.position.y,player.x - this.input.activePointer.position.x) * 180 / Math.PI;
	//console.log(ang);
	else if (cursors.left.isDown)
	{
	    player.setVelocityX(-walkSpeed);
	    player.setVelocityY(0);
	    if(this.input.activePointer.isDown && cursors.left.isDown){
			player.anims.play('animCastLeft', true);
		} else {
			player.anims.play('walkLeft', true);
		}
	}
	else if (cursors.right.isDown)
	{
	    player.setVelocityX(walkSpeed);
	    player.setVelocityY(0);
	    player.anims.play('walkRight', true);
	}
	else if (cursors.up.isDown)
	{
	    player.setVelocityY(-walkSpeed);
	    player.setVelocityX(0);
	    player.anims.play('walkUp', true);
	}
	else if (cursors.down.isDown)
	{
	    player.setVelocityY(walkSpeed);
	    player.setVelocityX(0);
	    if(this.input.activePointer.isDown == true){
			player.anims.play('animCastDown', true);
		} else {
			player.anims.play('walkDown', true);
		}
	}
	else
	{	   		
		player.anims.stop();
	    player.setVelocityX(0);
	    player.setVelocityY(0);
	}

	if (cursors.up.isDown && player.body.touching.down)
	{
	    //player.setVelocityY(-330);
	}
	

}

	game = new Phaser.Game(config);

});


function runGame(){
}
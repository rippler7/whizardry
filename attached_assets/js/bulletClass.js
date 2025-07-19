class Bullet extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene, playerChar.x, playerChar.y,'bullet');
		this.born = 0;
		this.outOfBoundsKill = true;
		//this.setScale(0.5,0.5);
		this.player =  playerChar;
		this.setActive(true);
		this.setVisible(true);
		//game.scene.scenes[1].physics.add.collider(this, layer3);
}	fire(){	
		var mouseX = game.input.activePointer.downX;
		var mouseY = game.input.activePointer.downY;
		this.setPosition(playerChar.x,playerChar.y);
		this.setActive(true);
		this.setVisible(true);
		this.born = 0;
		this.speed = 0.3;
		this.speedX = this.speed;
		this.speedY = this.speed;
		this.outOfBoundsKill = true;
		this.depth = this.y;
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
		this.depth = this.y;
		this.born += delta;		
		this.body.setVelocityX(delta * this.speedX * -50);		
		this.body.setVelocityY(delta * this.speedY * -50);	
		
	    if(this.born > 1750){
	    	this.setActive(false);
	      	this.setVisible(false);
	      	this.destroy();
	    }
	}
}
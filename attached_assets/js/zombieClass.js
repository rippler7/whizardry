class Zombie extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,'zombie');
		this.collideWorldBounds = true;
		this.born = 0;
		this.speed = 0.01;
		this.setActive(true);
	    this.setVisible(true);
		this.player =  playerChar;
		this.speed = Phaser.Math.Between(-100,100);
		this.randNumX = Phaser.Math.Between(-1,1);
		this.randNumY = Phaser.Math.Between(-1,1);
		this.res = Phaser.Math.Between(0,1000);
		this.depth = this.y;
		this.attStat = 0;
		this.chaseActive = 0;
		this.dead = false;
		this.freQuency = Phaser.Math.Between(200,300);
		if(this.x <= this.player.x+100 && this.x >= this.player.x-100){
			this.x = this.player.x+100;
		}
		if(this.y <= this.player.y+100 && this.y >= this.player.y-100){
			this.y = this.player.y+100;
		}	
		//if(this.chaseActive == 0){
			this.timedEvent = this.scene.time.addEvent({ delay: this.freQuency, callback: this.walkRandomly, callbackScope: this, repeat:-1 });
		//} else {
			//this.timedEvent = this.scene.time.addEvent({ delay: 100, callback: this.walkRandomly, callbackScope: this, repeat:-1 });
		//}
		this.anims.play('walkDownZombie', true);
		this.lifePoints = zombieMaxLife;
		this.directionX;
		this.directionY;
		this.typeChar = 'zombie';
		this.isAlive = true;
	}
	update(time,delta){
		this.counter--;
		this.depth = this.y;
		this.res = Phaser.Math.Between(0,1000);
		
			if(this.lifePoints <= 0){
				this.zombieDie();
			}		
	}
	walkRandomly()
	{
		if(this.dead == false){
			this.freQuency = Phaser.Math.Between(200,300);
			if(this.body){
				var dirX = Phaser.Math.Between(-150,150);
				var dirY = Phaser.Math.Between(-150,150);
				if(Math.abs(this.x - this.player.x)> 130 && Math.abs(this.y - this.player.y)> 130){
						if(Math.abs(dirX) > Math.abs(dirY)){
							if(dirX > 0){
								this.anims.play('walkRightZombie', true);
								this.body.setVelocityX(Phaser.Math.Between(5,10)*5);
								this.body.setVelocityY(0);
							}else{
								this.body.setVelocityX(Phaser.Math.Between(-10,-5)*5);
								this.body.setVelocityY(0);
								this.anims.play('walkLeftZombie', true);
							}
						} else {
							if(dirY > 0){
								this.anims.play('walkUpZombie', true);
								this.body.setVelocityY(Phaser.Math.Between(-10,-5)*5);
								this.body.setVelocityX(0);
							} else {
								this.anims.play('walkDownZombie', true);
								this.body.setVelocityY(Phaser.Math.Between(5,10)*5);
								this.body.setVelocityX(0);
							}
						}
				}  else {
					if(Math.abs(this.x - this.player.x)< 130 && Math.abs(this.y - this.player.y)< 130){
						this.chaseActive = 1;
						this.walkToPlayer(this.x,this.y,this.player.x,this.player.y,this.chaseActive);
						//this.body.setVelocityX(0);
						//this.body.setVelocityY(0);
					} 
				}
			}
		//this.walkToPlayer(this.x,this.y,dirX,dirY);
		}
	}

	walkToPlayer(tx,ty,px,py,cA){
		this.freQuency = 5;
		var speed = 120;
		console.log('randomWalk-Zombie');
		var diff = Math.abs(tx-px) - Math.abs(ty - py);
		if(cA == 1){
			if(diff >= 1){
				/*
				this.x -= (tx-px)*0.01;
				this.y -= 0;
				*/
				this.body.setVelocityX(((-Math.round((tx-px)))/Math.abs(tx-px))*speed);
				this.body.setVelocityY(0);
				if(tx>px){
					this.anims.play('walkLeftZombie', true);
				} else {
					this.anims.play('walkRightZombie', true);
				}
				
			} else {
				/*
				this.y -= (ty-py)*0.01;
				this.x -= 0;
				*/
				this.body.setVelocityY(((-Math.round((ty-py)))/Math.abs(ty-py))*speed);
				this.body.setVelocityX(0);
				if(ty>py){
					this.anims.play('walkUpZombie', true);
					
				} else {
					this.anims.play('walkDownZombie', true);
					
				}	
			}
		}
		cA = 0;
		this.chaseActive = cA;
	}

	zombieDie(){
		//this.anims.play('playerDieSkeleton',1);
		if(this.isAlive){
			this.clearTint();
			this.anims.play('dieZombie',false);
			this.isAlive = false;
			this.body.setVelocityX(0);
			this.body.setVelocityY(0);
			playerScore = playerScore + 4;
			burst.play({
				loop: false
			});
			this.timedEvent = this.scene.time.addEvent({ delay: Phaser.Math.Between(500,700), callback: function(){
				this.setActive(false);
				this.setVisible(false);
				this.x = -100;
				this.y = -100;
				this.destroy();
			}, callbackScope: this, repeat:false });
		}
	}
}
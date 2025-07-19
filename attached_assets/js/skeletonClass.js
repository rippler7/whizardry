class Skeleton extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,Phaser.Math.Between(100,1000),Phaser.Math.Between(100,650),'Skeleton');
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
		this.rX = Phaser.Math.Between(100,1000);
		this.rY = Phaser.Math.Between(100,650);
		this.x = this.rX;
		this.y = this.rY;
		this.attStat = 0;
		this.walkRandomly;
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
		this.anims.play('walkDownSkeleton', true);
		this.lifePoints = 3;
	}
	update(time,delta){
		this.counter--;
		this.depth = this.y;
		if(this.hitWall){
			console.log(this.hitWall);
		}
		this.res = Phaser.Math.Between(0,1000);
		if(this.lifePoints <= 0){	
				this.skeletonDie();
			}
		/*
		if(this.body && this.lifePoints > 0){
			if {
				if(this.x <= 100){
					this.body.setVelocityX(Phaser.Math.Between(1,5)*delta);
					this.body.setVelocityY(0);
					this.anims.play('walkRightSkeleton', true);
				}
				else if(this.x >= 900){
					this.body.setVelocityX(Phaser.Math.Between(-5,-1)*delta);
					this.body.setVelocityY(0);
					this.anims.play('walkLeftSkeleton', true);
				}  
				else if(this.y <= 100){
					this.body.setVelocityX(0);
					this.body.setVelocityY(Phaser.Math.Between(1,5)*delta);
					this.anims.play('walkDownSkeleton', true);
				}
				else if(this.y >= 600){
					this.body.setVelocityX(0);
					this.body.setVelocityY(Phaser.Math.Between(-5,-1)*delta);
					this.anims.play('walkUpSkeleton', true);
				} 
			}
		} else {
		}
		*/
		
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
								this.anims.play('walkRightSkeleton', true);
								this.body.setVelocityX(Phaser.Math.Between(5,10)*5);
								this.body.setVelocityY(0);
							}else{
								this.body.setVelocityX(Phaser.Math.Between(-10,-5)*5);
								this.body.setVelocityY(0);
								this.anims.play('walkLeftSkeleton', true);
							}
						} else {
							if(dirY > 0){
								this.anims.play('walkUpSkeleton', true);
								this.body.setVelocityY(Phaser.Math.Between(-10,-5)*5);
								this.body.setVelocityX(0);
							} else {
								this.anims.play('walkDownSkeleton', true);
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
		console.log('randomWalk');
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
					this.anims.play('walkLeftSkeleton', true);
				} else {
					this.anims.play('walkRightSkeleton', true);
				}
				
			} else {
				/*
				this.y -= (ty-py)*0.01;
				this.x -= 0;
				*/
				this.body.setVelocityY(((-Math.round((ty-py)))/Math.abs(ty-py))*speed);
				this.body.setVelocityX(0);
				if(ty>py){
					this.anims.play('walkUpSkeleton', true);
					
				} else {
					this.anims.play('walkDownSkeleton', true);
					
				}	
			}
		}
		cA = 0;
		this.chaseActive = cA;
		
	}

	skeletonDie(){
		if(this.dead == false){
			this.dead = true;
			this.anims.play('playerDieSkeleton',1);
				this.body.setVelocityX(0);
				this.body.setVelocityY(0);
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
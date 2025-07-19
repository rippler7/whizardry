class Batty extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene);
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
		this.flyRandomly;
		this.timedEvent = this.scene.time.addEvent({ delay: Phaser.Math.Between(1000,2000), callback: this.flyNow, callbackScope: this, repeat:-1 });
		this.anims.play('flyLeft', true);
		this.lifePoints = batMaxLife;
		this.dirX = playerChar.x - this.x;
        this.dirY = playerChar.y - this.y;
		this.angle = Math.atan2(this.dirY,this.dirX); 
		this.dX = Math.cos(this.angle);
		this.dY = Math.sin(this.angle);
		this.rangeLimit = 230;
		this.isAlive = true;
	}
	update(time,delta){
		this.range = Phaser.Math.Distance.Between(this.x,this.y,playerChar.x,playerChar.y);
		this.counter--;
		this.depth = this.y;
		this.born += time;
		this.dirX = playerChar.x - this.x;
        this.dirY = playerChar.y - this.y;
		this.angle = Math.atan2(this.dirY,this.dirX); 
		this.dX = Math.cos(this.angle);
		this.dY = Math.sin(this.angle);
		this.res = Phaser.Math.Between(0,1000);
		if(this.body && this.lifePoints <= 0){
				this.batDie();
		}
	}
	flyNow(){
		if(this.isAlive){
			if(this.range <= this.rangeLimit && this.currLevel <= playerChar.currLevel){
				this.flyToPlayer(this.x,this.y,playerChar.x,playerChar.y);
				this.spitFire();
			} else {
				/*
				if(this.x <= 100){
					this.body.setVelocityX(Phaser.Math.Between(1,5)*delta);
					this.body.setVelocityY(0);
					this.anims.play('flyRight', true);
				}
				else if(this.x >= 3000){
					this.body.setVelocityX(Phaser.Math.Between(-5,-1)*delta);
					this.body.setVelocityY(0);
					this.anims.play('flyLeft', true);
				}  
				else if(this.y <= 100){
					this.body.setVelocityX(0);
					this.body.setVelocityY(Phaser.Math.Between(1,5)*delta);
				}
				else if(this.y >= 2100){
					this.body.setVelocityX(0);
					this.body.setVelocityY(Phaser.Math.Between(-5,-1)*delta);
				} 
				*/
				this.flyRandomly();
			}
		}
	}
	flyToPlayer(tx,ty,px,py){
		if(this.isAlive){
			var diff = Math.abs(tx-px) - Math.abs(ty - py);
			if(diff >= 1){
				this.body.setVelocityX(-Math.round((tx-px))/3);
				this.body.setVelocityY(0);
				if(tx>px){
					this.anims.play('flyLeft', true);
				} else {
					this.anims.play('flyRight', true);
				}
				
			} else {
				this.body.setVelocityY(-Math.round((ty-py))/3);
				this.body.setVelocityX(0);
			}
		}
	}
	flyRandomly(){
		if(this.body){
			var dirX = Phaser.Math.Between(-150,150);
			var dirY = Phaser.Math.Between(-150,150);
				var resF = Phaser.Math.Between(5,10)*5;
				var resS = Phaser.Math.Between(-10,-5)*5;
					if(Math.abs(dirX) > Math.abs(dirY)){
						if(dirX > 0){
							//this.anims.play('walkRightSkeleton', true);
							this.body.setVelocityX(resF);
							this.body.setVelocityY(0);
						}else{
							this.body.setVelocityX(resS);
							this.body.setVelocityY(0);
							//this.anims.play('walkLeftSkeleton', true);
						}
						if(this.body.velocity.x > 0){
							this.directionX = 'right';
							this.anims.play('flyRight', true);
						} else {
							this.directionX = 'left';
							this.anims.play('flyLeft', true);
						}
						//this.directionY = 'stop';
					} else {
						if(dirY > 0){
							//this.anims.play('walkUpSkeleton', true);
							this.body.setVelocityY(resS);
							this.body.setVelocityX(0);
						} else {
							//this.anims.play('walkDownSkeleton', true);
							this.body.setVelocityY(resF);
							this.body.setVelocityX(0);
						}
						if(this.body.velocity.y > 0){
							this.directionY = 'down';
							
						} else {
							this.directionY = 'up';
							
						}
						//this.directionX = 'stop';
					}
					//console.log(this.body.velocity.x,this.body.velocity.y);
			
		}
	}
	spitFire(){
		if(this.attStat == 0){
			this.attStat = 1;
			console.log("firing...");
			this.createSpit();
			this.timedEvent = this.scene.time.addEvent({ delay: Phaser.Math.Between(1500,2700), callback: function(){
				console.log("refresh...");
				this.attStat = 0;
			}, callbackScope: this, repeat:false },this);
		}
	}
	createSpit(){
		this.spits = game.scene.scenes[1].physics.add.group();
		this.spits.create(this.x,this.y,'fireball');
		console.log(this.spits);
		this.spits.children.iterate(function(sp){
			sp.setActive = true;
			sp.setVisible =true;
			console.log(this);
			sp.body.setVelocityX(this.dX*150);
			sp.body.setVelocityY(this.dY*150);
			console.log(this.dirX,this.dirY);
			console.log(this.dX,this.dY);
			spitting.play({
				loop:false
			});
			this.scene.time.addEvent({ delay: Phaser.Math.Between(3000), callback: 
				function(){
					sp.setActive = false;
					sp.setVisible = false;
					sp.destroy();
			}, 
			callbackScope: this, repeat:-1 },this);
		},this);
		game.scene.scenes[1].physics.add.colliders = [this.spits];
		game.scene.scenes[1].physics.add.collider(this.spits, layer3, this.spitHitsWall);
		game.scene.scenes[1].physics.add.collider(this.spits, game.scene.scenes[1].gates, this.spitHitsWall);
		game.scene.scenes[1].physics.add.overlap(playerChar,this.spits,this.spitHit,null,this);
	}
	spitHitsWall(spit,wall){
		spit.setActive = false;
		spit.setVisible = false;
		spit.destroy();
	}
	spitHit(player,spit){
		if(playerLife > 0){	
				spit.setActive = false;
				spit.setVisible = false;
				spit.destroy();		
				playerLife = playerLife-batDamage;
				player.setTint(0xff0000);
				updateLockText(true);
				playerHurt.play();
				game.scene.scenes[1].time.addEvent({delay:500,callback:function(){
					player.clearTint();
				},callbackScope:this});
		}
	}
	batDie(){
		if(this.isAlive){
			this.isAlive = false;
			this.anims.play('batDie',1);
			this.body.setVelocityX(0);
			this.body.setVelocityY(0);
			playerScore = playerScore + 5;
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
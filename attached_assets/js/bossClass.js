class Boss extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,'Boss');
		console.log("Boss!");
		this.lifePoints = bossMaxLife;
		this.timedEvent = this.scene.time.addEvent({ delay: Phaser.Math.Between(500,700), callback: this.walkRandomly, callbackScope: this, repeat:-1 });
		this.anims.play('walkDownOrc', true);
		this.isAlive = true;
		this.dirFace = "south";
		this.isInvulnerable = true;
		this.speed = 1.5;
		this.typeChar = 'boss';
		//this.angle = Math.atan2(this.dirY,this.dirX); 
		//this.dX = Math.cos(this.angle);
		//this.dY = Math.sin(this.angle);
		this.rangeLimit = 320;
		this.currLevel = 14;
		if(debug === true){
			this.isInvulnerable = false;
		}
	}
	update(time,delta){
		this.range = Phaser.Math.Distance.Between(this.x,this.y,playerChar.x,playerChar.y);
		this.depth = this.y;
		if(this.lifePoints <= 0){
			if(this.isAlive){
				this.orcDie();
			}
		}
	}
	walkRandomly()
	{
		/*
		var dx = this.x-playerChar.x;
		var dy = this.y-playerChar.y;
		this.range = Math.sqrt(dx * dx + dy * dy);
		*/
		//console.log(this.x,playerChar.x,this.y,playerChar.y);
		//console.log('distance is: '+this.range);
		if(this.body && this.isAlive == true){			
			if(this.range > this.rangeLimit){
					this.walkAround();
					//console.log(this.body.velocity.x,this.body.velocity.y);
			} else {
				//if(this.isAlive){
				//	if(Math.abs(this.x - playerChar.x) <= this.rangeLimit || Math.abs(this.x - playerChar.x) <= this.rangeLimit){
					if(playerChar.currLevel >= this.currLevel){
						this.walkToPlayer(this.x,this.y,playerChar.x,playerChar.y);						
					} else {
						this.walkAround();
					}
				//	} else {
				//		this.walkAround();
				//	}
				//}
			}
		}
	}

	walkAround(){
		var dirX = Phaser.Math.Between(-150,150);
		var dirY = Phaser.Math.Between(-150,150);
		//console.log(Math.abs(this.x - playerChar.x),Math.abs(this.y - playerChar.y));
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
					this.dirFace = 'east';
					this.anims.play('walkRightOrc', true);
				} else {
					this.dirFace = 'west';
					this.anims.play('walkLeftOrc', true);
				}
					this.directionY = 'stop';
			} else {
				if(dirY > 0){
					this.anims.play('walkUpOrc', true);
					this.body.setVelocityY(resS);
					this.body.setVelocityX(0);
				} else {
					this.anims.play('walkDownOrc', true);
					this.body.setVelocityY(resF);
					this.body.setVelocityX(0);
				}
				if(this.body.velocity.y > 0){
					this.dirFace = 'south';
					this.anims.play('walkDownOrc', true);
				} else {
					this.dirFace = 'north';
					this.anims.play('walkUpOrc', true);
				}
				this.directionX = 'stop';
			}
	}

	walkToPlayer(tx,ty,px,py){
		//console.log('chasing player...');
		var diff = Math.abs(tx-px) - Math.abs(ty - py);
		if(diff >= 1){
			//this.body.setVelocityX(-Math.round((tx-px))/3);
			this.body.setVelocityX(-Math.round((tx-px)));
			this.body.setVelocityY(0);
			if(tx>px){
				this.dirFace = 'west';
				this.anims.play('walkLeftOrc', true);
			} else {
				this.dirFace = 'east';
				this.anims.play('walkRightOrc', true);
			}
			
		} else {
			//this.body.setVelocityY(-Math.round((ty-py))/3);
			this.body.setVelocityY(-Math.round((ty-py)));
			this.body.setVelocityX(0);
			if(ty>py){
				this.dirFace = 'north';
				this.anims.play('walkUpOrc', true);
			} else {
				this.dirFace = 'south';
				this.anims.play('walkDownOrc', true);
			}
			
		}
	}
	orcDie(){
		if(this.isAlive == true){
			this.isAlive = false;
			this.anims.play('OrcDie',false);
			this.body.setVelocityX(0);
			this.body.setVelocityY(0);
			this.setActive = false;

			var timePenalty = 0;
			if(timeFactor > 1500){
				timePenalty = (Math.floor((timeFactor-1500)/60));
			}
			var initScore = playerScore;
			var skeletonScore = (Enemies - game.scene.scenes[1].baddies.children.entries.length);
			var batScore = (BatCount - batties.children.entries.length);
			var zombieScore = (ZombieCount-game.scene.scenes[1].zombies.children.entries.length);
			playerScore = (playerScore + bossMaxLife) + skeletonScore+batScore+zombieScore+playerLife - timePenalty;
			game.scene.scenes[1].input.keyboard.off('keydown_SPACE');
			arcade.stop();
			bossTheme.stop();
			var totalTimeSpent = secondsToHms(timeFactor);
			console.log(playerScore+" = Score: "+initScore+" + BossskeletonScore: "+bossMaxLife+" + skeletonScore: "+skeletonScore+" + batScore: "+batScore+" + zombieScore: "+zombieScore+" - timePenalty: "+timePenalty);
			game.scene.scenes[1].cameras.main.fadeOut(500);
			game.scene.scenes[1].time.addEvent({delay:500,callback:function(){
				arcade.stop();
				game.scene.scenes[1].scene.pause();
				game.scene.scenes[1].scene.start('WinGame',{pScore: playerScore, elapsedTime:game.scene.scenes[1].consolidatedTime, totalTime:timeFactor, date:Date.now(), timeSpent:totalTimeSpent});
			},callbackScope:this});
		}
	}
}

class Door extends Phaser.GameObjects.Sprite{
	constructor(scene){
		super(scene,0,0,'gate');
		this.born = 0;
		this.outOfBoundsKill = true;
		this.setActive(true);
		this.setVisible(true);
		this.depth = this.y;
		this.currLevel;
		this.repeat;
		this.question;
		this.ans;
		this.ansKey;
		this.isClosed = true;
		this.unLocking = false;
	}
	open(){

	}
	close(){

	}
	update(time,delta){
		this.depth = this.y;
		this.born += delta;	
		if(!this.isClosed){
			//this.anims.play('closeGate',false);
			//game.scene.scenes[1].time.addEvent({delay:500,callback:function(){
				//this.body.enable = true;
				//this.isClosed = true;
			//},callbackScope:this,repeat:0});
		} 
	}
}
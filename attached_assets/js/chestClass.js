class ChestRed extends Phaser.GameObjects.Sprite{
	constructor(config){
		super(config.scene,config.key);
		console.log('accessed!',config);
		this.x = config.x;
		this.y = config.y;
		this.frame.texture.key = config.key;
		console.log(this);
	}
	checkLock(){

	}
	update(time,delta){

	}
}
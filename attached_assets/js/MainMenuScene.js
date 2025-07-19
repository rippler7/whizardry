// MainMenuScene.js
export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 100, 'MY GAME', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

    const startButton = this.add.text(width / 2, height / 2, 'Start Game', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('SceneA', { gameMode: 1 });
    });

    const quitButton = this.add.text(width / 2, height / 2 + 60, 'Quit', { fontSize: '24px', fill: '#f00' }).setOrigin(0.5).setInteractive();
    quitButton.on('pointerdown', () => {
      this.game.destroy(true);
    });
  }
}

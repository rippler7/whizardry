// PauseScene.js
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 50, 'GAME PAUSED', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

    const resumeButton = this.add.text(width / 2, height / 2, 'Resume', { fontSize: '24px', fill: '#0f0' }).setOrigin(0.5).setInteractive();
    resumeButton.on('pointerdown', () => {
      this.scene.resume('SceneA');
      this.scene.stop();
    });

    const quitButton = this.add.text(width / 2, height / 2 + 60, 'Quit to Menu', { fontSize: '24px', fill: '#f00' }).setOrigin(0.5).setInteractive();
    quitButton.on('pointerdown', () => {
      this.scene.stop('SceneA');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });
  }
}

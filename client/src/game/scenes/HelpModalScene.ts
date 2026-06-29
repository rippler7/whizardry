import * as Phaser from 'phaser';

export class HelpModalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HelpModalScene' });
  }

  create() {
    console.log('HelpModalScene: create');
    this.game.events.emit('pauseGame');

    const { width, height } = this.scale;

    // --- Overlay ---
    // This semi-transparent overlay covers the entire screen and closes the modal when clicked.
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
      .setInteractive()
      .setDepth(0); // Lowest depth within this scene

    overlay.on('pointerdown', () => {
      // Visual feedback on click
      this.tweens.add({
        targets: overlay,
        alpha: 0.7,
        duration: 100,
        yoyo: true,
        onComplete: () => this.close()
      });
    });

    // --- Modal Content ---
    const modalBox = this.add.rectangle(width / 2, height / 2, Math.min(width * 0.9, 640), 550, 0x1c1917, 0.95)
      .setStrokeStyle(2, 0xb45309)
      .setRounded(16)
      .setDepth(1)
      .setInteractive(); // This stops clicks from passing through to the overlay

    const helpTitle = this.add.text(width / 2, height / 2 - 210, 'How to Play', {
      fontSize: '32px', fill: '#fbbf24', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1);

    const isDesktop = this.sys.game.device.os.desktop;
    const helpTextContent = [
      isDesktop ? '• Use WASD or Arrow Keys to move' : '• Use the Left Side of screen to move',
      isDesktop ? '• SPACE or Click to shoot (aim with mouse)' : '• Tap the Right Side of screen to shoot',
      isDesktop ? '• Click chests when near them to open' : '• Tap chests when near them to open',
      '• Answer all 4 questions to unlock the door',
      '• Reach dungeon 5 and defeat the boss!'
    ].join('\n\n');

    const helpTextDesc = this.add.text(width / 2, height / 2 - 140, helpTextContent, {
      fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif', lineSpacing: 10, wordWrap: { width: Math.min(width * 0.8, 560) }
    }).setOrigin(0.5, 0).setDepth(1);

    // --- Resume Button ---
    const closeBtnBg = this.add.rectangle(width / 2, height / 2 + 200, 180, 50, 0x78350f)
      .setRounded(12)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);

    const closeBtnText = this.add.text(width / 2, height / 2 + 200, 'RESUME', {
      fontSize: '22px', fill: '#fef3c7', fontFamily: '"Georgia", "Times New Roman", serif'
    }).setOrigin(0.5).setDepth(1);

    closeBtnBg.on('pointerover', () => {
      closeBtnBg.setScale(1.05);
      closeBtnText.setScale(1.05);
      closeBtnBg.setFillStyle(0x92400e);
    });
    closeBtnBg.on('pointerout', () => {
      closeBtnBg.setScale(1.0);
      closeBtnText.setScale(1.0);
      closeBtnBg.setFillStyle(0x78350f);
    });
    closeBtnBg.on('pointerdown', () => this.close());

    // Listen for the Escape key to close the modal
    this.input.keyboard?.on('keydown-ESC', this.close, this);
  }

  /**
   * Closes the modal scene and resumes the main game.
   */
  private close() {
    console.log('HelpModalScene: close');
    this.game.events.emit('resumeGame');
    this.scene.stop();
  }
}
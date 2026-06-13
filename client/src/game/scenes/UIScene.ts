import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;

  constructor() {
    // Give this scene a key so we can launch it from the main game scene
    super({ key: 'UIScene' });
  }

  create() {
    // 1. Draw a Medieval Panel Background using Phaser Graphics
    const panel = this.add.graphics();
    
    // Stone-900 background (#1c1917) with 80% opacity
    panel.fillStyle(0x1c1917, 0.85);
    panel.fillRoundedRect(16, 16, 250, 100, 8);
    
    // Outer border: Amber-700 (#b45309)
    panel.lineStyle(2, 0xb45309, 1);
    panel.strokeRoundedRect(16, 16, 250, 100, 8);

    // Inner gold trim: Amber-500 (#f59e0b)
    panel.lineStyle(1, 0xf59e0b, 0.4);
    panel.strokeRoundedRect(20, 20, 242, 92, 6);

    // 2. Setup Medieval Serif Text Styles
    const textStyle = {
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
      fontSize: '18px',
      color: '#fde68a', // amber-200
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 3,
        fill: true
      }
    };

    // 3. Add Player Name & Score Text
    this.add.text(32, 28, 'Player One', {
      ...textStyle,
      fontSize: '20px',
      color: '#fbbf24', // amber-400
      fontStyle: 'bold'
    });

    this.scoreText = this.add.text(32, 56, 'Score: 0', textStyle);

    // 4. Create the Health Bar
    this.add.text(32, 82, 'HP', { ...textStyle, fontSize: '14px', color: '#f87171' }); // red-400
    this.healthBar = this.add.graphics();
    this.drawHealthBar(100); // Initialize with 100% health
  }

  drawHealthBar(percentage: number) {
    this.healthBar.clear();

    const x = 65;
    const y = 84;
    const width = 180;
    const height = 14;

    // Health bar background (dark stone - #292524)
    this.healthBar.fillStyle(0x292524, 1);
    this.healthBar.fillRect(x, y, width, height);

    // Health bar border (dark amber - #92400e)
    this.healthBar.lineStyle(1, 0x92400e, 1);
    this.healthBar.strokeRect(x, y, width, height);

    // Health bar fill (crimson/red - #991b1b)
    if (percentage > 0) {
      const fillWidth = (width - 4) * (Math.max(0, Math.min(100, percentage)) / 100);
      this.healthBar.fillStyle(0x991b1b, 1);
      this.healthBar.fillRect(x + 2, y + 2, fillWidth, height - 4);
    }
  }
}
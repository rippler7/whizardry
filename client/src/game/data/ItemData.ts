import { Player, InventoryItem } from '../entities/Player';
import { DungeonGameScene } from '../scenes/DungeonGameScene';

type ItemDefinition = Omit<InventoryItem, 'quantity'>;

export const ITEM_DATA: Record<string, ItemDefinition> = {
  redcrystal: {
    id: 'max_health_potion',
    name: 'Max Health Potion',
    description: 'Restores health to full.',
    iconTexture: 'redcrystal',
    onUse: (player, scene) => {
      player.heal(player.maxHealth);
      const textStr = 'MAX HP!';
      const textColor = '#ff4444';
      const healText = scene.add.text(player.x, player.y - 30, textStr, {
        fontSize: '16px', fill: textColor, fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      scene.tweens.add({ targets: healText, y: healText.y - 30, alpha: 0, duration: 1000, onComplete: () => healText.destroy() });
    }
  },
  greencrystal: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores a small amount of health.',
    iconTexture: 'greencrystal',
    onUse: (player, scene) => {
      player.heal(25);
      const textStr = '+25 HP';
      const textColor = '#00ff00';
      const healText = scene.add.text(player.x, player.y - 30, textStr, {
        fontSize: '16px', fill: textColor, fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      scene.tweens.add({ targets: healText, y: healText.y - 30, alpha: 0, duration: 1000, onComplete: () => healText.destroy() });
    }
  },
  bluecrystal: {
    id: 'freeze_crystal',
    name: 'Freeze Crystal',
    description: 'Freezes all enemies on screen.',
    iconTexture: 'bluecrystal',
    onUse: (player, scene) => {
      scene.enemiesFrozenUntil = scene.time.now + 8000;
      scene.enemies.getChildren().forEach((enemy: any) => {
        if (enemy.setVelocity) enemy.setVelocity(0, 0);
        if (enemy.anims) enemy.anims.stop();
      });
      if (scene.boss) {
        scene.boss.setVelocity(0, 0);
        scene.boss.anims.stop();
      }
      scene.addOrResetEffect('blue', 8000, '#60a5fa');
      const freezeText = scene.add.text(player.x, player.y - 30, 'TIME FREEZE!', {
        fontSize: '16px', fill: '#60a5fa', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      scene.tweens.add({ targets: freezeText, y: freezeText.y - 30, alpha: 0, duration: 1000, onComplete: () => freezeText.destroy() });
    }
  },
  yellowcrystal: {
    id: 'invincibility_crystal',
    name: 'Invincibility Crystal',
    description: 'Become invincible for a short time.',
    iconTexture: 'yellowcrystal',
    onUse: (player, scene) => {
      player.isInvincible = true;
      player.setTint(0xffff33);
      scene.yellowEffectEndTime = scene.time.now + 5000;
      scene.addOrResetEffect('yellow', 5000, '#fbbf24');
      const invulnText = scene.add.text(player.x, player.y - 30, 'INVINCIBLE!', {
        fontSize: '16px', fill: '#fbbf24', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      scene.tweens.add({ targets: invulnText, y: invulnText.y - 30, alpha: 0, duration: 1000, onComplete: () => invulnText.destroy() });
    }
  },
  orangecrystal: {
    id: 'fireball_crystal',
    name: 'Fireball Crystal',
    description: 'Unleashes a powerful, piercing fireball.',
    iconTexture: 'orangecrystal',
    onUse: (player, scene) => {
      scene.isOrangeCrystalActive = true;
      player.hasFireball = true;
      scene.orangeEffectEndTime = scene.time.now + 8000;
      scene.addOrResetEffect('orange', 8000, '#f97316');
      const specialText = scene.add.text(player.x, player.y - 30, 'FIREBALL!', {
        fontSize: '16px', fill: '#ffb47e', fontFamily: '"Georgia", "Times New Roman", serif', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(100);
      scene.tweens.add({ targets: specialText, y: specialText.y - 30, alpha: 0, duration: 1000, onComplete: () => specialText.destroy() });
    }
  }
};
import * as Phaser from 'phaser';
import { Player, InventoryItem } from '../entities/Player';
import { DungeonGameScene } from './DungeonGameScene';

export class InventoryUIScene extends Phaser.Scene {
  private gameScene!: DungeonGameScene;
  private player!: Player;
  private inventoryModalContainer: Phaser.GameObjects.Container | null = null;
  private isModalOpen: boolean = false;

  constructor() {
    super({ key: 'InventoryUIScene' });
  }

  init(data: { gameScene: DungeonGameScene }) {
    this.gameScene = data.gameScene;
  }

  create(): void {
    // This check is crucial for when the game scene restarts
    if (!this.gameScene || !this.gameScene.sys.isActive()) {
        this.scene.stop();
        return;
    }

    this.player = this.gameScene.player;

    this.createInventoryButton();

    // Listen for events from the game scene
    this.gameScene.events.on('inventoryChanged', this.handleInventoryChange, this);
    this.events.on('shutdown', () => {
      if (this.gameScene) {
        this.gameScene.events.off('inventoryChanged', this.handleInventoryChange, this);
      }
    });

    // Listen for keyboard input
    this.input.keyboard!.on('keydown-I', this.toggleInventory, this);
  }

  private createInventoryButton() {
    // Re-calculate button positions to place inventory button correctly
    const exitBtnX = this.scale.width - 120 - 20;
    const sliderX = exitBtnX - 120 - 150 - 30;
    const iconX = sliderX - 52;
    const fsX = iconX - 75;
    const helpX = fsX - 75;
    const inventoryBtnX = helpX - 75;

    const inventoryBtn = this.add.container(inventoryBtnX, 44).setScrollFactor(0).setDepth(10001);
    const inventoryBg = this.add.rectangle(0, 0, 60, 60, 0x4a2511).setStrokeStyle(2, 0xd4af37).setRounded(12);
    const inventoryIcon = this.add.text(0, 0, '🎒', { fontSize: '30px' }).setOrigin(0.5);
    inventoryBtn.add([inventoryBg, inventoryIcon]);
    inventoryBtn.setSize(60, 60).setInteractive({ useHandCursor: true });

    inventoryBtn.on('pointerover', () => inventoryBg.setFillStyle(0x6b3619));
    inventoryBtn.on('pointerout', () => inventoryBg.setFillStyle(0x4a2511));
    inventoryBtn.on('pointerdown', () => this.toggleInventory());
  }

  private toggleInventory() {
    if (this.isModalOpen) {
      this.hideInventory();
    } else {
      this.showInventory();
    }
  }

  private handleInventoryChange() {
    if (this.isModalOpen && this.inventoryModalContainer) {
      this.renderInventoryItems();
    }
  }

  private showInventory() {
    if (this.isModalOpen) return;
    this.isModalOpen = true;
    this.gameScene.scene.pause();

    const { width, height } = this.scale;
    const MODAL_DEPTH = 20000;

    this.inventoryModalContainer = this.add.container(0, 0).setDepth(MODAL_DEPTH);

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setInteractive();
    overlay.on('pointerdown', () => this.hideInventory());
    this.inventoryModalContainer.add(overlay);

    const modalContentContainer = this.add.container(width / 2, height / 2);
    this.inventoryModalContainer.add(modalContentContainer);

    const modalBox = this.add.rectangle(0, 0, 600, 400, 0x1c1917, 0.95).setStrokeStyle(2, 0xb45309).setRounded(16).setInteractive();
    modalBox.on('pointerdown', () => {
      this.hideItemContextMenu();
    });
    modalContentContainer.add(modalBox);

    const title = this.add.text(0, -170, 'Inventory', {
        fontSize: '32px', fill: '#fbbf24', fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif', fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(280, -180, 'X', {
        fontSize: '24px', fill: '#f87171', backgroundColor: '#451a03', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.hideInventory();
    });

    modalContentContainer.add(title);
    modalContentContainer.add(closeBtn);

    this.renderInventoryItems();
  }

  private renderInventoryItems() {
    if (!this.inventoryModalContainer) return;

    const modalContentContainer = this.inventoryModalContainer.getAt(1) as Phaser.GameObjects.Container;
    if (!modalContentContainer) return;

    if (modalContentContainer.list) {
      modalContentContainer.list.filter(c => c.getData && c.getData('isInventoryItem')).forEach(c => c.destroy());
    }

    const slotSize = 64;
    const slotMargin = 10;
    const cols = 8;
    const startX = -((cols / 2) * (slotSize + slotMargin)) + (slotSize / 2) + (slotMargin / 2);
    const startY = -120;

    let i = 0;
    this.player.inventory.forEach((item) => {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const x = startX + col * (slotSize + slotMargin);
        const y = startY + row * (slotSize + slotMargin);

        const slotBg = this.add.rectangle(x, y, slotSize, slotSize, 0x44403c, 0.8).setStrokeStyle(1, 0x78350f).setOrigin(0.5);
        const itemIcon = this.add.sprite(x, y, item.iconTexture, 0).setScale(1.5);
        const quantityText = this.add.text(x + slotSize / 2 - 5, y + slotSize / 2 - 5, `x${item.quantity}`, {
            fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2
        }).setOrigin(1, 1);

        slotBg.setInteractive({ useHandCursor: true });
        slotBg.on('pointerdown', () => {
            this.showItemContextMenu(item, x, y);
        });

        slotBg.setData('isInventoryItem', true);
        itemIcon.setData('isInventoryItem', true);
        quantityText.setData('isInventoryItem', true);

        modalContentContainer.add(slotBg);
        modalContentContainer.add(itemIcon);
        modalContentContainer.add(quantityText);
        i++;
    });
  }

  private showItemContextMenu(item: InventoryItem, x: number, y: number) {
    this.hideItemContextMenu();
    
    const modalContentContainer = this.inventoryModalContainer?.getAt(1) as Phaser.GameObjects.Container;
    if (!modalContentContainer) return;

    const contextMenu = this.add.container(x, y + 32);
    
    const menuBg = this.add.rectangle(0, 0, 100, 70, 0x292524).setStrokeStyle(1, 0xb45309).setOrigin(0.5, 0);
    const useBtn = this.add.text(0, 15, 'Use', { fontSize: '16px', fill: '#60a5fa' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const discardBtn = this.add.text(0, 45, 'Discard', { fontSize: '16px', fill: '#f87171' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    useBtn.on('pointerdown', () => {
        this.player.useItem(item.id);
        this.hideItemContextMenu();
    });

    discardBtn.on('pointerdown', () => {
        this.player.removeItem(item.id);
        this.hideItemContextMenu();
    });

    contextMenu.add([menuBg, useBtn, discardBtn]);
    contextMenu.setData('isContextMenu', true);
    modalContentContainer.add(contextMenu);
  }

  private hideItemContextMenu() {
    const modalContentContainer = this.inventoryModalContainer?.getAt(1) as Phaser.GameObjects.Container;
    if (modalContentContainer?.list) {
      modalContentContainer.list.filter(c => c.getData && c.getData('isContextMenu')).forEach(c => c.destroy());
    }
  }

  private hideInventory() {
    if (!this.isModalOpen) return;
    this.isModalOpen = false;
    this.inventoryModalContainer?.destroy();
    this.inventoryModalContainer = null;
    this.gameScene.scene.resume();
  }
}
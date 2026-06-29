import * as Phaser from 'phaser';
import { Player, InventoryItem } from '../entities/Player';

export class InventoryUIScene extends Phaser.Scene {
  private player!: Player;
  private gameScene!: Phaser.Scene;
  private inventoryModalContainer: Phaser.GameObjects.Container | null = null;
  private isModalOpen: boolean = false;
  private modalOpenTimestamp: number = 0;

  constructor() {
    super({ key: 'InventoryUIScene' });
  }

  init(data: { gameScene: Phaser.Scene, player: Player }) {
    this.gameScene = data.gameScene;
    this.player = data.player;
  }

  create(): void {
    // This check is crucial for when the game scene restarts
    if (!this.gameScene || !this.gameScene.scene.isActive()) {
        this.scene.stop();
        return;
    }

    this.createInventoryButton();

    // When the game scene shuts down, this UI scene should also shut down.
    this.gameScene.events.on('shutdown', () => {
      this.scene.stop();
    });

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
    // Re-calculate button positions to place inventory button correctly, matching DungeonGameScene's layout logic.
    const exitBtnWidth = 240;
    const exitBtnX = this.scale.width - exitBtnWidth / 2 - 20;
    const sliderWidth = 150;
    const sliderX = exitBtnX - exitBtnWidth / 2 - sliderWidth - 30;
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

  public toggleInventory() {
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
    this.game.events.emit('pauseGame');
    this.modalOpenTimestamp = this.time.now;

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

    // --- Item Grid Container ---
    const gridContainer = this.add.container(0, -10);
    gridContainer.setName('gridContainer');
    modalContentContainer.add(gridContainer);

    this.renderInventoryItems();
  }

  private renderInventoryItems() {
    if (!this.inventoryModalContainer) return;

    const modalContentContainer = this.inventoryModalContainer.getAt(1) as Phaser.GameObjects.Container | undefined;
    const gridContainer = modalContentContainer?.getByName('gridContainer') as Phaser.GameObjects.Container | undefined;
    if (!modalContentContainer || !gridContainer) return;

    const slotSize = 64;
    const slotMargin = 10;
    const maxCols = 8;
    const numItems = this.player.inventory.size;
    const rows = Math.ceil(numItems / maxCols);
    const gridHeight = rows * (slotSize + slotMargin) - slotMargin;
    const startY = -gridHeight / 2 + slotSize / 2;

    const newPositions = new Map<string, { x: number, y: number }>();
    let i = 0;

    // 1. Calculate the final position for each item
    this.player.inventory.forEach((item) => {
        const row = Math.floor(i / maxCols);
        const col = i % maxCols;

        const itemsInThisRow = Math.min(numItems - (row * maxCols), maxCols);
        const rowWidth = itemsInThisRow * (slotSize + slotMargin) - slotMargin;
        const rowStartX = -rowWidth / 2 + slotSize / 2;

        const x = rowStartX + col * (slotSize + slotMargin);
        const y = startY + row * (slotSize + slotMargin);

        newPositions.set(item.id, { x, y });
        i++;
    });

    // 2. Animate existing items and create new ones
    this.player.inventory.forEach((item) => {
        const pos = newPositions.get(item.id)!;
        const existingContainer = gridContainer.getByName(item.id) as Phaser.GameObjects.Container | null;

        if (existingContainer) {
            // Item exists, tween it to the new position
            this.tweens.add({
                targets: existingContainer,
                x: pos.x,
                y: pos.y,
                duration: 300,
                ease: 'Power2'
            });
            // Update quantity text
            const quantityText = existingContainer.getByName('quantity') as Phaser.GameObjects.Text;
            if (quantityText) {
                quantityText.setText(`x${item.quantity}`);
            }
        } else {
            // New item, create and fade it in
            const itemContainer = this.createItemContainer(item, pos.x, pos.y);
            itemContainer.setAlpha(0);
            gridContainer.add(itemContainer);
            this.tweens.add({
                targets: itemContainer,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });
        }
    });

    // 3. Remove items that are no longer in the inventory
    gridContainer.list.forEach((child) => {
        const container = child as Phaser.GameObjects.Container;
        if (container.name && !this.player.inventory.has(container.name)) {
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => container.destroy()
            });
        }
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

  private createItemContainer(item: InventoryItem, x: number, y: number): Phaser.GameObjects.Container {
    const slotSize = 64;
    const itemContainer = this.add.container(x, y);
    itemContainer.setName(item.id);
    itemContainer.setSize(slotSize, slotSize);

    const slotBg = this.add.rectangle(0, 0, slotSize, slotSize, 0x44403c, 0.8)
        .setStrokeStyle(1, 0x78350f)
        .setOrigin(0.5);

    const itemIcon = this.add.sprite(0, 0, item.iconTexture, 0).setScale(1.5);
    if (item.iconAnimKey && this.anims.exists(item.iconAnimKey)) {
        itemIcon.play(item.iconAnimKey);
    }

    const quantityText = this.add.text(slotSize / 2 - 5, slotSize / 2 - 5, `x${item.quantity}`, {
        fontSize: '14px', fill: '#ffffff', stroke: '#000000', strokeThickness: 2
    }).setOrigin(1, 1);
    quantityText.setName('quantity');

    slotBg.setInteractive({ useHandCursor: true });
    slotBg.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.showItemContextMenu(item, itemContainer.x, itemContainer.y);
    });

    itemContainer.add([slotBg, itemIcon, quantityText]);
    return itemContainer;
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

    const timePaused = this.time.now - this.modalOpenTimestamp;
    this.game.events.emit('shiftTimers', timePaused);
    this.game.events.emit('resumeGame');
  }
}
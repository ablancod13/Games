import { W, H } from '../config/GameConfig.js';
import { SHOP_ITEMS } from '../systems/PowerUpSystem.js';
import { saveSystem } from '../systems/SaveSystem.js';

export class ShopUI {
  constructor(scene) {
    this._scene = scene;
    this._items = [];
    this._build();
  }

  _build() {
    const scene = this._scene;

    // Background
    scene.add.rectangle(W / 2, H / 2, W, H, 0x0A1628, 0.96).setDepth(0);

    // Header
    scene.add.text(W / 2, 50, '🏪 TIENDA', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#553300',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1);

    // Coins display
    scene.add.image(W / 2 - 60, 95, 'coin').setDepth(1);
    this._coinsText = scene.add.text(W / 2 - 40, 88, '', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
    }).setDepth(1);

    this._updateCoinsDisplay();

    // Scroll area - item cards
    const startY = 140;
    const cardH   = 90;
    const padding = 10;

    SHOP_ITEMS.forEach((item, i) => {
      const y = startY + i * (cardH + padding) + cardH / 2;
      this._buildCard(item, y);
    });

    // Back button
    const backBtn = scene.add.text(W / 2, H - 50, '← Volver al Menú', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#88AAFF',
      backgroundColor: '#112244',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#FFFFFF'));
    backBtn.on('pointerout',  () => backBtn.setColor('#88AAFF'));
    backBtn.on('pointerdown', () => scene.scene.start('MenuScene'));
  }

  _buildCard(item, y) {
    const scene = this._scene;
    const W_ = W - 32;
    const x = 16;

    const card = scene.add.container(x + W_ / 2, y).setDepth(1);

    const bg = scene.add.graphics();
    const owned = item.permanent ? saveSystem.hasShopItem(item.id) : saveSystem.getShopItemCount(item.id);
    const canAfford = saveSystem.get('coins') >= item.cost;

    // Card bg
    bg.fillStyle(owned ? 0x1A3A1A : (canAfford ? 0x1A1A3A : 0x2A1A1A), 0.9);
    bg.fillRoundedRect(-W_ / 2, -40, W_, 80, 10);
    bg.lineStyle(1.5, owned ? 0x44BB44 : (canAfford ? 0x4488BB : 0x553333), 0.8);
    bg.strokeRoundedRect(-W_ / 2, -40, W_, 80, 10);

    const iconText = scene.add.text(-W_ / 2 + 18, 0, item.icon, {
      fontSize: '28px',
    }).setOrigin(0.5);

    const nameText = scene.add.text(-W_ / 2 + 48, -18, item.name, {
      fontSize: '15px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0);

    const descText = scene.add.text(-W_ / 2 + 48, -2, item.description, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#AABBCC',
      wordWrap: { width: W_ - 130 },
    }).setOrigin(0, 0);

    // Buy / owned badge
    let actionText;
    if (item.permanent && owned) {
      actionText = scene.add.text(W_ / 2 - 16, 0, '✓ Comprado', {
        fontSize: '12px', color: '#44FF44',
      }).setOrigin(1, 0.5);
    } else {
      const countLabel = !item.permanent && owned > 0 ? ` (x${owned})` : '';
      actionText = scene.add.text(W_ / 2 - 16, 0, `${item.cost} 🪙${countLabel}`, {
        fontSize: '14px',
        fontFamily: 'Arial Black, Arial',
        color: canAfford ? '#FFD700' : '#FF4444',
        backgroundColor: canAfford ? '#33220088' : '#44000088',
        padding: { x: 8, y: 4 },
      }).setOrigin(1, 0.5);
    }

    card.add([bg, iconText, nameText, descText, actionText]);

    // Make interactive if can buy
    if (!(item.permanent && owned)) {
      card.setInteractive(new Phaser.Geom.Rectangle(-W_ / 2, -40, W_, 80), Phaser.Geom.Rectangle.Contains);
      card.on('pointerover', () => {
        scene.tweens.add({ targets: card, scaleX: 1.02, scaleY: 1.02, duration: 100 });
      });
      card.on('pointerout', () => {
        scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
      });
      card.on('pointerdown', () => this._purchase(item));
    }

    this._items.push({ item, card, actionText, bg });
  }

  _purchase(item) {
    const scene = this._scene;
    if (!saveSystem.spendCoins(item.cost)) {
      // Shake the card
      const entry = this._items.find(e => e.item.id === item.id);
      if (entry) {
        scene.tweens.add({
          targets: entry.card,
          x: entry.card.x + 8,
          duration: 60,
          yoyo: true,
          repeat: 3,
        });
      }
      return;
    }

    saveSystem.addShopItem(item.id, 1);
    this._updateCoinsDisplay();

    // Flash success
    scene.cameras.main.flash(200, 0, 200, 100);

    // Rebuild the shop view
    scene.time.delayedCall(300, () => {
      scene.scene.restart();
    });
  }

  _updateCoinsDisplay() {
    this._coinsText.setText(`${saveSystem.get('coins')} Coreimcitos`);
  }
}

import { getScore } from '../config/AntibioticsData.js';

const ITEM_W = 56;
const ITEM_H = 72;

export class AntibioticItem extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this._sprite = scene.add.image(0, 0, 'ab_TOL_TAZ');
    this._label  = scene.add.text(0, ITEM_H / 2 + 2, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 5,
      backgroundColor: '#000000CC',
      padding: { x: 6, y: 3 },
      align: 'center',
    }).setOrigin(0.5, 0);

    this._glowGraphic = scene.add.graphics();

    this.add([this._glowGraphic, this._sprite, this._label]);
    this.setActive(false).setVisible(false);

    this._abData    = null;
    this._mechanisms = [];
    this._score     = 0;
    this._speed     = 200;
    this._caught    = false;
    this._pulseTween = null;
  }

  activate(abData, mechanisms, x, speed) {
    this._abData      = abData;
    this._mechanisms  = mechanisms;
    this._score       = getScore(abData.id, mechanisms);
    this._speed       = speed;
    this._caught      = false;

    this._sprite.setTexture(`ab_${abData.id}`);
    this._label.setText(abData.abbrev);

    // Label color based on score
    const labelColor = this._score > 0 ? '#44FF44' : this._score === 0 ? '#FFFF44' : '#FF4444';
    this._label.setColor(labelColor);

    // Glow ring for gold antibiotics
    this._glowGraphic.clear();
    if (abData.gold) {
      this._glowGraphic.lineStyle(3, 0xFFD700, 0.8);
      this._glowGraphic.strokeCircle(0, 0, 36);
    }

    this.setActive(true).setVisible(true).setDepth(12);

    // Wobble tween while falling
    if (this._pulseTween) this._pulseTween.stop();
    this._pulseTween = this.scene.tweens.add({
      targets: this._sprite,
      angle: { from: -8, to: 8 },
      duration: 600 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Gold pulse scale
    if (abData.gold) {
      this.scene.tweens.add({
        targets: this,
        scaleX: { from: 0.95, to: 1.05 },
        scaleY: { from: 0.95, to: 1.05 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    return this;
  }

  deactivate() {
    if (this._pulseTween) { this._pulseTween.stop(); this._pulseTween = null; }
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.killTweensOf(this._sprite);
    this.setActive(false).setVisible(false);
    this.setScale(1);
    this._sprite.setAngle(0);
  }

  update(delta) {
    if (!this.active || this._caught) return;
    this.y += this._speed * delta / 1000;
    if (this.y > 1000) this.deactivate();
  }

  get score()    { return this._score; }
  get abData()   { return this._abData; }
  get caught()   { return this._caught; }

  markCaught() {
    this._caught = true;
    this.scene.tweens.killTweensOf(this._sprite);
  }
}

export function createAntibioticPool(scene, size = 14) {
  const items = [];
  for (let i = 0; i < size; i++) items.push(new AntibioticItem(scene));
  return items;
}

import { W, H, C } from '../config/GameConfig.js';

export class BackgroundSystem {
  constructor(scene) {
    this._scene = scene;

    // Three parallax layers
    this._far  = scene.add.tileSprite(0, 0, W, H, 'bg_far').setOrigin(0, 0).setDepth(0);
    this._mid  = scene.add.tileSprite(0, 0, W, H, 'bg_mid').setOrigin(0, 0).setDepth(1);
    this._near = scene.add.tileSprite(0, 0, W, H, 'bg_near').setOrigin(0, 0).setDepth(2);

    // Ground line
    this._groundLine = scene.add.tileSprite(0, C.GROUND_Y, W, 12, 'ground_line')
      .setOrigin(0, 0).setDepth(3);

    // Floating background microbes
    this._microbes = [];
    for (let i = 0; i < 5; i++) {
      const m = scene.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(80, C.GROUND_Y - 60),
        'microbe_bg',
      ).setAlpha(0.15).setDepth(1);
      this._microbes.push(m);

      // Slow drift animation
      scene.tweens.add({
        targets: m,
        y: m.y + Phaser.Math.Between(-30, 30),
        x: m.x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
  }

  update(speed, delta) {
    const dt = delta / 1000;
    this._far.tilePositionX  += speed * 0.08 * dt;
    this._mid.tilePositionX  += speed * 0.25 * dt;
    this._near.tilePositionX += speed * 0.55 * dt;
    this._groundLine.tilePositionX += speed * dt;
  }

  setAlpha(a) {
    this._far.setAlpha(a);
    this._mid.setAlpha(a);
    this._near.setAlpha(a);
    this._groundLine.setAlpha(a);
  }
}

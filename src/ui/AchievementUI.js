import { ACHIEVEMENTS } from '../config/AchievementsData.js';
import { W } from '../config/GameConfig.js';

export class AchievementUI {
  constructor(scene) {
    this._scene = scene;
    this._queue = [];
    this._showing = false;
  }

  notify(achievementId) {
    const data = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!data) return;
    this._queue.push(data);
    if (!this._showing) this._showNext();
  }

  _showNext() {
    if (this._queue.length === 0) { this._showing = false; return; }
    this._showing = true;
    const data = this._queue.shift();

    const panel = this._scene.add.container(W / 2, -80).setDepth(40);

    const bg = this._scene.add.graphics();
    bg.fillStyle(0x1A3A1A, 0.95);
    bg.fillRoundedRect(-160, -30, 320, 60, 12);
    bg.lineStyle(2, 0x44BB44, 0.9);
    bg.strokeRoundedRect(-160, -30, 320, 60, 12);

    const icon = this._scene.add.text(-130, 0, data.icon || '🏆', {
      fontSize: '26px',
    }).setOrigin(0, 0.5);

    const title = this._scene.add.text(-90, -10, '¡Logro Desbloqueado!', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#88FF88',
    }).setOrigin(0, 0);

    const name = this._scene.add.text(-90, 2, data.title, {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0);

    panel.add([bg, icon, title, name]);

    // Slide in
    this._scene.tweens.add({
      targets: panel,
      y: 90,
      duration: 500,
      ease: 'Back.Out',
    });

    // Hold then slide out
    this._scene.time.delayedCall(2800, () => {
      this._scene.tweens.add({
        targets: panel,
        y: -100,
        duration: 400,
        ease: 'Power2.In',
        onComplete: () => {
          panel.destroy();
          this._showNext();
        },
      });
    });
  }
}

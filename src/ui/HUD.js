import { W, C } from '../config/GameConfig.js';
import { saveSystem } from '../systems/SaveSystem.js';

export class HUD {
  constructor(scene) {
    this._scene = scene;

    // Top bar background
    const topBar = scene.add.graphics().setDepth(20);
    topBar.fillStyle(0x0A1628, 0.85);
    topBar.fillRect(0, 0, W, 60);
    topBar.fillStyle(0x1A2E50, 0.5);
    topBar.fillRect(0, 58, W, 3);

    // Distance icon + text
    scene.add.text(12, 8, '📏', { fontSize: '18px' }).setDepth(21);
    this._distText = scene.add.text(36, 8, '0m', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#001133',
      strokeThickness: 3,
    }).setDepth(21);

    // Coin icon + text
    scene.add.image(W / 2 - 30, 30, 'coin').setScale(0.75).setDepth(21);
    this._coinText = scene.add.text(W / 2 - 10, 22, '0', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#553300',
      strokeThickness: 3,
    }).setDepth(21);

    // Level badge
    this._levelBadge = scene.add.text(W - 12, 8, 'LVL 1', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#44FF44',
      stroke: '#002200',
      strokeThickness: 2,
      backgroundColor: '#00440044',
      padding: { x: 6, y: 3 },
    }).setOrigin(1, 0).setDepth(21);

    // Level name (small)
    this._levelName = scene.add.text(W - 12, 26, 'BLEE', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#88CCFF',
    }).setOrigin(1, 0).setDepth(21);

    // Lives — 3 hearts, top-left below distance
    this._livesText = scene.add.text(12, 36, '♥♥♥', {
      fontSize: '17px',
      fontFamily: 'Arial',
      color: '#FF3344',
      stroke: '#220011',
      strokeThickness: 3,
    }).setDepth(21);

    // Streak indicator (appears when streak > 2)
    this._streakText = scene.add.text(W / 2, 56, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF8800',
      stroke: '#330000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    // Power-up bar (bottom area, not blocking game)
    this._powerupBar = scene.add.text(8, C.H - 50, '', {
      fontSize: '20px',
    }).setDepth(21);

    // Hint text (antibiotic guide)
    this._hintText = scene.add.text(W / 2, C.H - 80, '', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#AADDFF',
      align: 'center',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setDepth(21).setVisible(false);

    // Speed indicator
    this._speedBar = scene.add.graphics().setDepth(21);
  }

  update(scoreSystem, levelSystem, powerUpSystem) {
    const dist = scoreSystem.distance;
    this._distText.setText(`${dist}m`);

    const coins = scoreSystem.coins + saveSystem.get('coins');
    this._coinText.setText(String(scoreSystem.coins));

    this._levelBadge.setText(`LVL ${levelSystem.levelNum}`);
    this._levelName.setText(levelSystem.mechanisms.join('+'));

    // Streak
    const streak = scoreSystem.streak;
    if (streak >= 3) {
      this._streakText.setVisible(true).setText(`🔥 x${streak} STREAK!`);
    } else {
      this._streakText.setVisible(false);
    }

    // Power-up icons
    const icons = [];
    if (powerUpSystem.isActive('rocket_boost'))  icons.push('🚀');
    if (powerUpSystem.isActive('immuno_shield')) icons.push('🛡️');
    if (powerUpSystem.hasBionicLegs())           icons.push('⚡');
    this._powerupBar.setText(icons.join(' '));

    // Speed bar (mini visual indicator at top left)
    const speedRatio = Math.min(1, (levelSystem.speed - 260) / 440);
    this._speedBar.clear();
    if (speedRatio > 0) {
      this._speedBar.fillStyle(0xFF4400, 0.7 * speedRatio);
      this._speedBar.fillRect(0, 60, W * speedRatio, 3);
    }
  }

  showHint(text) {
    this._hintText.setText(text).setVisible(true);
    this._scene.time.delayedCall(4000, () => this._hintText.setVisible(false));
  }

  showLevelUp(levelData) {
    const banner = this._scene.add.text(W / 2, 120, `⬆ NIVEL ${levelData.level}\n${levelData.name}`, {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFF44',
      stroke: '#333300',
      strokeThickness: 4,
      align: 'center',
      backgroundColor: '#00000099',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(30);

    this._scene.tweens.add({
      targets: banner,
      y: 80,
      alpha: { from: 0, to: 1 },
      duration: 400,
      ease: 'Back.Out',
    });
    this._scene.time.delayedCall(2200, () => {
      this._scene.tweens.add({
        targets: banner,
        alpha: 0,
        y: 40,
        duration: 500,
        onComplete: () => banner.destroy(),
      });
    });
  }

  showMechanism(mechanisms) {
    const names = mechanisms.join(' + ');
    this.showHint(`⚠ Mecanismo activo: ${names}`);
  }

  updateLives(count) {
    const full  = '♥'.repeat(Math.max(0, count));
    const empty = '♡'.repeat(Math.max(0, 3 - count));
    this._livesText.setText(full + empty);
    this._livesText.setColor(count <= 1 ? '#FF8800' : '#FF3344');

    // Pulse on life loss
    this._scene.tweens.add({
      targets: this._livesText,
      scaleX: { from: 1.6, to: 1 },
      scaleY: { from: 1.6, to: 1 },
      duration: 400,
      ease: 'Back.Out',
    });
  }
}

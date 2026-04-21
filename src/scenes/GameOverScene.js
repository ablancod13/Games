import { W, H } from '../config/GameConfig.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { EDUCATIONAL_FACTS } from '../config/AchievementsData.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this._summary = data.summary || {};
    this._isNew   = data.isNew   || false;
  }

  create() {
    const s = this._summary;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000811, 0x000811, 0x0A1628, 0x0A1628, 1);
    bg.fillRect(0, 0, W, H);

    // Animated microbes
    for (let i = 0; i < 5; i++) {
      const m = this.add.text(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        '🦠',
        { fontSize: `${Phaser.Math.Between(12, 24)}px` },
      ).setAlpha(0.10);
      this.tweens.add({
        targets: m,
        x: m.x + Phaser.Math.Between(-50, 50),
        y: m.y + Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true, repeat: -1, ease: 'Sine.InOut',
      });
    }

    // Title
    const titleText = this._isNew ? '🏆 ¡NUEVO RÉCORD!' : '🏁 FIN DE LA CARRERA';
    const titleColor = this._isNew ? '#FFD700' : '#4499FF';
    const title = this.add.text(W / 2, 60, titleText, {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: titleColor,
      stroke: '#000022',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, y: 68, duration: 600, ease: 'Back.Out' });

    // New record animation
    if (this._isNew) {
      for (let i = 0; i < 12; i++) {
        const star = this.add.text(
          Phaser.Math.Between(20, W - 20),
          Phaser.Math.Between(20, 140),
          '⭐', { fontSize: '20px' },
        ).setAlpha(0);
        this.tweens.add({
          targets: star,
          alpha: { from: 0, to: 1 },
          scaleX: { from: 0, to: 1 },
          scaleY: { from: 0, to: 1 },
          delay: i * 80,
          duration: 400,
          yoyo: true,
          repeat: 2,
        });
      }
    }

    // Distance (main stat, big)
    const distPanel = this.add.container(W / 2, 150).setAlpha(0);
    const distBg = this.add.graphics();
    distBg.fillStyle(0x1A3A5A, 0.9);
    distBg.fillRoundedRect(-140, -35, 280, 70, 12);
    distBg.lineStyle(2, 0x4499FF, 0.7);
    distBg.strokeRoundedRect(-140, -35, 280, 70, 12);

    const distLabel = this.add.text(0, -20, 'DISTANCIA', {
      fontSize: '12px', color: '#88AACC', fontFamily: 'Arial',
    }).setOrigin(0.5);

    const distValue = this.add.text(0, 0, `${s.distance || 0}m`, {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    distPanel.add([distBg, distLabel, distValue]);
    this.tweens.add({ targets: distPanel, alpha: 1, y: 158, delay: 300, duration: 500, ease: 'Power2' });

    // High score
    const hs = saveSystem.get('highScore') || 0;
    this.add.text(W / 2, 200, `Récord: ${hs}m`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#FFD700',
    }).setOrigin(0.5);

    // Stats grid
    this._buildStatsGrid(s, 230);

    // Coins earned
    this._buildCoinsPanel(s, 430);

    // Educational fact
    const fact = EDUCATIONAL_FACTS[Math.floor(Math.random() * EDUCATIONAL_FACTS.length)];
    const factPanel = this.add.container(W / 2, 520).setAlpha(0);
    const fpBg = this.add.graphics();
    fpBg.fillStyle(0x1A1A3A, 0.9);
    fpBg.fillRoundedRect(-200, -30, 400, 90, 10);
    fpBg.lineStyle(1, 0x4444AA, 0.6);
    fpBg.strokeRoundedRect(-200, -30, 400, 90, 10);
    const fpIcon = this.add.text(0, -18, '💡 ¿Sabías que...?', {
      fontSize: '11px', color: '#FFFF88', fontFamily: 'Arial Black, Arial',
    }).setOrigin(0.5);
    const fpText = this.add.text(0, -2, fact, {
      fontSize: '10px', color: '#AABBCC', fontFamily: 'Arial',
      wordWrap: { width: 370 }, align: 'center',
    }).setOrigin(0.5);
    factPanel.add([fpBg, fpIcon, fpText]);
    this.tweens.add({ targets: factPanel, alpha: 1, delay: 700, duration: 500 });

    // Buttons
    this._buildButton(W / 2, 660, '🔄 VOLVER A JUGAR', '#FFFFFF', '#1A44AA', () => {
      this.scene.start('GameScene');
    });
    this._buildButton(W / 2, 730, '🏠 MENÚ PRINCIPAL', '#AACCFF', '#112233', () => {
      this.scene.start('MenuScene');
    });
    this._buildButton(W / 2, 796, '🏪 TIENDA', '#FFD700', '#2A2200', () => {
      this.scene.start('ShopScene');
    });
  }

  _buildStatsGrid(s, startY) {
    const stats = [
      ['🏃 Distancia',     `${s.distance || 0}m`],
      ['🤝 Pacientes',      `${s.patientsHealed || 0}`],
      ['✅ Correctos',      `${s.correctCatches || 0}`],
      ['❌ Incorrectos',    `${s.wrongCatches || 0}`],
      ['📊 Precisión',      `${s.accuracy || 100}%`],
      ['🔥 Racha máx.',     `${s.bestStreak || 0}`],
    ];

    const colW = W / 2 - 16;
    stats.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 16 + col * colW + colW / 2;
      const y = startY + row * 54;

      const card = this.add.graphics();
      card.fillStyle(0x1A2A3A, 0.8);
      card.fillRoundedRect(x - colW / 2 + 4, y, colW - 8, 46, 6);

      this.add.text(x, y + 8, label, {
        fontSize: '10px', fontFamily: 'Arial', color: '#88AACC',
      }).setOrigin(0.5, 0);

      this.add.text(x, y + 22, value, {
        fontSize: '18px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
      }).setOrigin(0.5, 0);
    });
  }

  _buildCoinsPanel(s, y) {
    const coins = s.coins || 0;
    const panel = this.add.container(W / 2, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x2A2200, 0.9);
    bg.fillRoundedRect(-160, -24, 320, 48, 10);
    bg.lineStyle(2, 0xFFD700, 0.6);
    bg.strokeRoundedRect(-160, -24, 320, 48, 10);

    this.add.image(-100, 0, 'coin').setScale(0.9);
    const coinText = this.add.text(-76, 0, `+${coins} Coreimcitos ganados`, {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
    }).setOrigin(0, 0.5);

    const total = this.add.text(100, 0, `Total: ${saveSystem.get('coins')}`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#AABBCC',
    }).setOrigin(0.5);

    panel.add([bg, coinText, total]);
  }

  _buildButton(x, y, label, textColor, bgColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: textColor,
      backgroundColor: bgColor,
      padding: { x: 24, y: 12 },
      stroke: '#000022',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 100 }));
    btn.on('pointerout',   () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
    btn.on('pointerdown',  () => {
      this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true });
      this.time.delayedCall(80, callback);
    });
  }
}

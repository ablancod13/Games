import { W, H } from '../config/GameConfig.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { DAILY_CHALLENGES, EDUCATIONAL_FACTS } from '../config/AchievementsData.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    // Background gradient (dark blue hospital night)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0A0A1A, 0x0A0A1A, 0x0A1628, 0x0A1628, 1);
    bg.fillRect(0, 0, W, H);

    // Animated background microbes
    for (let i = 0; i < 8; i++) {
      const m = this.add.text(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        '🦠',
        { fontSize: `${Phaser.Math.Between(14, 28)}px` },
      ).setAlpha(0.12);
      this.tweens.add({
        targets: m,
        x: m.x + Phaser.Math.Between(-60, 60),
        y: m.y + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(3000, 7000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    // Logo
    const title = this.add.text(W / 2, 90, 'ResistoRun', {
      fontSize: '52px',
      fontFamily: 'Arial Black, Arial',
      color: '#4499FF',
      stroke: '#001133',
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.add.text(W / 2, 138, 'Resistencia Antibiótica en Enterobacterales', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#6688AA',
    }).setOrigin(0.5);

    // Doctor preview sprite
    const doc = this.add.image(W / 2, 210, 'doctor_run_0').setScale(1.4);
    this.tweens.add({
      targets: doc,
      y: 206,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // High score
    const hs = saveSystem.get('highScore') || 0;
    this.add.text(W / 2, 268, `🏆 Récord: ${hs}m`, {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#332200',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Total coins
    const coins = saveSystem.get('coins') || 0;
    this.add.image(W / 2 - 50, 296, 'coin').setScale(0.8);
    this.add.text(W / 2 - 26, 290, `${coins} Coreimcitos`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#FFD700',
    });

    // Daily challenge
    this._buildDailyChallenge(310);

    // Main buttons
    this._buildButton(W / 2, 460, '🏃 JUGAR', '#FFFFFF', '#1A44AA', () => {
      this.scene.start('GameScene');
    });

    this._buildButton(W / 2, 530, '🏪 TIENDA', '#FFD700', '#2A2200', () => {
      this.scene.start('ShopScene');
    });

    this._buildButton(W / 2, 600, '🏆 MARCADOR', '#44FF88', '#002200', () => {
      this._showLeaderboard();
    });

    // Educational fact
    const fact = EDUCATIONAL_FACTS[Math.floor(Math.random() * EDUCATIONAL_FACTS.length)];
    const factPanel = this.add.text(W / 2, H - 30, `💡 ${fact}`, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#88AACC',
      align: 'center',
      wordWrap: { width: W - 32 },
    }).setOrigin(0.5, 1);

    // Version
    this.add.text(W - 8, H - 8, 'v1.0', {
      fontSize: '10px', color: '#334455',
    }).setOrigin(1, 1);
  }

  _buildDailyChallenge(startY) {
    const dc = saveSystem.getDailyChallenge();
    if (!dc.challenges.length) {
      // Generate two random challenges for today
      const shuffled = [...DAILY_CHALLENGES].sort(() => Math.random() - 0.5);
      dc.challenges = shuffled.slice(0, 2).map(c => c.id);
      saveSystem.set('dailyChallenge', dc);
    }

    this.add.text(W / 2, startY, '📅 MISIÓN DIARIA', {
      fontSize: '12px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFAA44',
    }).setOrigin(0.5);

    dc.challenges.forEach((cid, i) => {
      const challenge = DAILY_CHALLENGES.find(c => c.id === cid);
      if (!challenge) return;
      const progress = (dc.progress && dc.progress[cid]) || 0;
      const done = progress >= challenge.target;
      const y = startY + 22 + i * 26;
      this.add.text(W / 2, y, `${done ? '✅' : '⬜'} ${challenge.text} (+${challenge.reward}🪙)`, {
        fontSize: '11px',
        fontFamily: 'Arial',
        color: done ? '#44FF44' : '#AABBCC',
        align: 'center',
      }).setOrigin(0.5);
    });
  }

  _buildButton(x, y, label, textColor, bgColor, callback) {
    const btn = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: textColor,
      backgroundColor: bgColor,
      padding: { x: 28, y: 14 },
      stroke: '#000022',
      strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => this.tweens.add({ targets: btn, scaleX: 1.06, scaleY: 1.06, duration: 100 }));
    btn.on('pointerout',   () => this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 }));
    btn.on('pointerdown',  () => {
      this.tweens.add({ targets: btn, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true });
      this.time.delayedCall(80, callback);
    });
  }

  _showLeaderboard() {
    const history = saveSystem.get('runHistory') || [];
    const hs = saveSystem.get('highScore') || 0;

    const overlay = this.add.container(W / 2, H / 2).setDepth(50);
    const bg = this.add.graphics();
    bg.fillStyle(0x0A1628, 0.97);
    bg.fillRoundedRect(-200, -280, 400, 560, 16);
    bg.lineStyle(2, 0x4488BB, 0.8);
    bg.strokeRoundedRect(-200, -280, 400, 560, 16);

    const title = this.add.text(0, -250, '🏆 MARCADOR', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
    }).setOrigin(0.5);

    const hsText = this.add.text(0, -210, `Récord absoluto: ${hs}m`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const items = [title, hsText];

    history.slice(0, 5).forEach((run, i) => {
      const y = -160 + i * 70;
      const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i];

      const panel = this.add.text(0, y,
        `${medal} ${run.distance}m  |  ${run.coins}🪙  |  ${run.accuracy}%  |  ${run.date}`,
        {
          fontSize: '13px',
          fontFamily: 'Arial',
          color: i === 0 ? '#FFD700' : '#AABBCC',
          align: 'center',
        },
      ).setOrigin(0.5);
      items.push(panel);
    });

    if (history.length === 0) {
      const empty = this.add.text(0, -100, '¡Aún no hay partidas!\nPulsa JUGAR para empezar.', {
        fontSize: '14px', color: '#667788', align: 'center',
      }).setOrigin(0.5);
      items.push(empty);
    }

    const closeBtn = this.add.text(0, 250, '✕ Cerrar', {
      fontSize: '18px', color: '#88AAFF',
      backgroundColor: '#112244',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => overlay.destroy());
    items.push(closeBtn);

    overlay.add([bg, ...items]);

    // Fade in
    overlay.setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 250 });
  }
}

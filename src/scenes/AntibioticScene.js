import { W, H, C } from '../config/GameConfig.js';
import { ANTIBIOTICS, getScore } from '../config/AntibioticsData.js';
import { createAntibioticPool } from '../entities/AntibioticItem.js';
import { burst, screenFlash, scorePopup } from '../graphics/ParticleEffects.js';

const PHASE_DURATION = C.PHASE_DURATION;  // 18 000 ms
const MAX_SIMULTANEOUS = 6;
const SPAWN_INTERVAL = 1800;              // ms between new antibiotic spawns

export class AntibioticScene extends Phaser.Scene {
  constructor() { super('AntibioticScene'); }

  create() {
    // Read data from registry
    const patient    = this.registry.get('phasePatient');
    const mechanisms = this.registry.get('phaseMechanisms') || ['BLEE'];
    const hasGuide   = this.registry.get('hasAbGuide') || false;
    const hasWbc     = this.registry.get('hasWbc') || false;
    const hasBact    = this.registry.get('hasBacteriophage') || false;

    this._mechanisms  = mechanisms;
    this._hasGuide    = hasGuide;
    this._hasWbc      = hasWbc;
    this._doubleCoins = hasBact;
    this._wbcUses     = hasWbc ? 3 : 0;

    this._coinsEarned   = 0;
    this._correctCatches = 0;
    this._wrongCatches   = 0;
    this._streak         = 0;
    this._active         = true;
    this._doctorX        = W / 2;

    // Dark overlay background (microscope view)
    this._buildBackground(mechanisms);

    // Patient info panel
    if (patient) this._buildPatientPanel(patient);

    // Antibiotic pool
    this._pool = createAntibioticPool(this, 14);

    // Doctor icon at bottom
    this._docIcon = this.add.image(W / 2, H - 100, 'doctor_run_0')
      .setScale(0.85).setDepth(15);

    // Guide overlay (glows over correct antibiotics)
    this._guideTexts = [];

    // WBC shield indicator
    if (this._hasWbc) {
      this._wbcLabel = this.add.text(W - 12, H - 80, `⚪ x${this._wbcUses}`, {
        fontSize: '16px', color: '#FFFFFF',
        backgroundColor: '#000000AA',
        padding: { x: 6, y: 3 },
      }).setOrigin(1, 0.5).setDepth(20);
    }

    // Timer bar
    this._timerBar = this.add.graphics().setDepth(20);
    this._startTime = this.time.now;
    this._updateTimerBar(1);

    // Timer label
    this._timerLabel = this.add.text(W / 2, H - 50, '18s', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    // Streak label
    this._streakLabel = this.add.text(W / 2, 180, '', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF8800',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    // Score tally (live)
    this._phaseScore = this.add.text(12, H - 80, '🧫 +0', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#44FF44',
      stroke: '#002200',
      strokeThickness: 3,
    }).setDepth(20);

    // Touch/pointer input — doctor follows finger
    this.input.on('pointermove', ptr => {
      if (this._active) this._doctorX = Phaser.Math.Clamp(ptr.x, 30, W - 30);
    });
    this.input.on('pointerdown', ptr => {
      if (this._active) this._doctorX = Phaser.Math.Clamp(ptr.x, 30, W - 30);
    });

    // Keyboard left/right
    this._cursors = this.input.keyboard
      ? this.input.keyboard.createCursorKeys()
      : null;

    // Show guide overlay
    if (hasGuide) this._buildGuideOverlay();

    // Spawn antibiotics
    this._spawnAntibiotic();
    this._spawnTimer = this.time.addEvent({
      delay: SPAWN_INTERVAL,
      callback: this._spawnAntibiotic,
      callbackScope: this,
      loop: true,
    });

    // End phase after duration
    this.time.delayedCall(PHASE_DURATION, () => this._endPhase());
  }

  _buildBackground(mechanisms) {
    // Dark sci-fi background
    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x000822, 0x000822, 0x040018, 0x040018, 1);
    bg.fillRect(0, 0, W, H);

    // Grid lines (microscope aesthetic)
    bg.lineStyle(0.5, 0x1A3A5A, 0.5);
    for (let x = 0; x < W; x += 40) bg.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);

    // Central bacteria cell art
    const bact = this.add.graphics().setDepth(1);
    const cx = W / 2, cy = H / 2 - 20;

    // Glow ring
    bact.fillStyle(0xFF2244, 0.06);
    bact.fillCircle(cx, cy, 140);
    bact.fillStyle(0xFF2244, 0.1);
    bact.fillCircle(cx, cy, 100);

    // Cell membrane
    bact.lineStyle(3, 0xFF4466, 0.7);
    bact.strokeCircle(cx, cy, 90);
    bact.lineStyle(1.5, 0xFF2244, 0.4);
    bact.strokeCircle(cx, cy, 95);

    // Inner organelles
    bact.fillStyle(0xAA2233, 0.5);
    bact.fillCircle(cx - 20, cy - 10, 22);
    bact.fillStyle(0xCC3344, 0.4);
    bact.fillCircle(cx + 18, cy + 14, 16);

    // Mechanism badges inside the cell
    mechanisms.forEach((mech, i) => {
      const angle = (i / mechanisms.length) * Math.PI * 2 - Math.PI / 2;
      const bx = cx + Math.cos(angle) * 48;
      const by = cy + Math.sin(angle) * 48;

      const mechColors = { BLEE: 0x44BB44, AmpC: 0x4488FF, KPC: 0xFFAA00, MBL: 0xFF4444, OXA48: 0xAA44FF };
      const col = mechColors[mech] || 0xFFFFFF;

      bact.fillStyle(col, 0.8);
      bact.fillCircle(bx, by, 14);
      bact.lineStyle(1.5, 0xFFFFFF, 0.5);
      bact.strokeCircle(bx, by, 14);

      this.add.text(bx, by, mech, {
        fontSize: '9px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        align: 'center',
      }).setOrigin(0.5).setDepth(3);
    });

    // Flagella (animated)
    for (let f = 0; f < 4; f++) {
      const angle = (f / 4) * Math.PI * 2;
      const fx = cx + Math.cos(angle) * 92;
      const fy = cy + Math.sin(angle) * 92;
      bact.lineStyle(2, 0xFF4466, 0.5);
      bact.lineBetween(fx, fy, fx + Math.cos(angle) * 40, fy + Math.sin(angle) * 40);
    }

    // Pulse animation on bacteria
    this.tweens.add({
      targets: bact,
      scaleX: { from: 0.96, to: 1.04 },
      scaleY: { from: 0.96, to: 1.04 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Mechanism label header
    this.add.text(W / 2, 30, mechanisms.join(' + '), {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#FF8888',
      stroke: '#220000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);

    this.add.text(W / 2, 56, '¡Atrapa los antibióticos correctos!', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#AABBCC',
    }).setOrigin(0.5).setDepth(5);

    // Ground zone line for doctor
    const ground = this.add.graphics().setDepth(4);
    ground.lineStyle(2, 0x336688, 0.7);
    ground.lineBetween(0, H - 120, W, H - 120);
    ground.fillStyle(0x112244, 0.4);
    ground.fillRect(0, H - 120, W, 120);
  }

  _buildPatientPanel(patient) {
    const panel = this.add.container(W / 2, H - 320).setDepth(6);

    const bg = this.add.graphics();
    bg.fillStyle(0x0A1628, 0.9);
    bg.fillRoundedRect(-170, -28, 340, 56, 10);
    bg.lineStyle(1.5, 0x4488BB, 0.7);
    bg.strokeRoundedRect(-170, -28, 340, 56, 10);

    const sprite = this.add.image(-140, 0, `patient_${patient.appearance}`)
      .setScale(0.38).setOrigin(0.5);

    const label = this.add.text(-110, -12, patient.label, {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0, 0);

    const desc = this.add.text(-110, 4, patient.description, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#88AACC',
    }).setOrigin(0, 0);

    panel.add([bg, sprite, label, desc]);
  }

  _buildGuideOverlay() {
    this.add.text(W / 2, 82, '📋 GUÍA ATB ACTIVA', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#FFFF44',
      backgroundColor: '#33330066',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setDepth(20);
  }

  _spawnAntibiotic() {
    if (!this._active) return;

    // Count active items
    const activeCount = this._pool.filter(a => a.active).length;
    if (activeCount >= MAX_SIMULTANEOUS) return;

    const ab = ANTIBIOTICS[Math.floor(Math.random() * ANTIBIOTICS.length)];
    const item = this._pool.find(p => !p.active);
    if (!item) return;

    const x = Phaser.Math.Between(36, W - 36);
    const speed = Phaser.Math.Between(C.AB_FALL_BASE, C.AB_FALL_MAX) * (1 + (this._mechanisms.length - 1) * 0.15);

    item.setPosition(x, -80);
    item.activate(ab, this._mechanisms, x, speed);

    // If guide is active, show score hint below antibiotic
    if (this._hasGuide) {
      const score = getScore(ab.id, this._mechanisms);
      const color = score > 0 ? '#44FF44' : score < 0 ? '#FF4444' : '#FFFF44';
      const hint = this.add.text(x, -100, score > 0 ? '✓' : score < 0 ? '✗' : '~', {
        fontSize: '14px',
        color,
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(14);
      this._guideTexts.push({ hint, item });
    }
  }

  update(time, delta) {
    if (!this._active) return;

    // Move doctor icon
    const targetX = this._doctorX;
    this._docIcon.x += (targetX - this._docIcon.x) * 0.18;

    // Keyboard movement
    if (this._cursors) {
      if (this._cursors.left.isDown)  this._doctorX = Math.max(30, this._doctorX - 4);
      if (this._cursors.right.isDown) this._doctorX = Math.min(W - 30, this._doctorX + 4);
    }

    // Update falling antibiotics
    this._pool.forEach(item => item.update(delta));

    // Update guide hints positions
    this._guideTexts = this._guideTexts.filter(({ hint, item }) => {
      if (!item.active) { hint.destroy(); return false; }
      hint.setPosition(item.x, item.y - 46);
      return true;
    });

    // Collision detection with doctor
    const docX = this._docIcon.x;
    const docY = this._docIcon.y;

    this._pool.forEach(item => {
      if (!item.active || item.caught) return;
      const dx = Math.abs(item.x - docX);
      const dy = Math.abs(item.y - docY);
      if (dx < 32 && dy < 44) {
        this._onCatch(item);
      }
    });

    // Timer
    const elapsed = this.time.now - this._startTime;
    const remaining = Math.max(0, PHASE_DURATION - elapsed);
    const ratio = remaining / PHASE_DURATION;
    this._updateTimerBar(ratio);
    this._timerLabel.setText(`${Math.ceil(remaining / 1000)}s`);

    // Timer color warning
    if (ratio < 0.25) this._timerLabel.setColor('#FF4444');
    else if (ratio < 0.5) this._timerLabel.setColor('#FFAA00');
    else this._timerLabel.setColor('#FFFFFF');
  }

  _onCatch(item) {
    item.markCaught();

    const score = item.score;
    const mult  = this._doubleCoins ? 2 : 1;

    if (score > 0) {
      // WBC never triggers on green
      this._streak++;
      const coinReward = score * mult * this._getStreakMult();
      this._coinsEarned += coinReward;
      this._correctCatches++;

      burst(this, item.x, item.y, 'green', 10);
      screenFlash(this, 'green', 150);
      scorePopup(this, item.x, item.y, `+${coinReward}`, '#44FF44');

      // Streak label
      if (this._streak >= 3) {
        this._streakLabel.setText(`🔥 RACHA x${this._streak}!`).setVisible(true);
        this.time.delayedCall(1200, () => this._streakLabel.setVisible(false));
      }

    } else if (score < 0) {
      // WBC auto-destroys wrong antibiotics
      if (this._wbcUses > 0) {
        this._wbcUses--;
        if (this._wbcLabel) this._wbcLabel.setText(`⚪ x${this._wbcUses}`);
        burst(this, item.x, item.y, 'star', 8);
        // Doesn't count as wrong catch
        item.deactivate();
        return;
      }

      this._streak = 0;
      this._coinsEarned += score; // negative
      this._wrongCatches++;

      burst(this, item.x, item.y, 'red', 10);
      screenFlash(this, 'red', 150);
      scorePopup(this, item.x, item.y, `${score}`, '#FF4444');
      this.cameras.main.shake(200, 0.01);

    } else {
      // Yellow — no effect
      burst(this, item.x, item.y, 'coin', 4);
    }

    // Update live score display
    this._phaseScore.setText(`🧫 ${this._coinsEarned >= 0 ? '+' : ''}${this._coinsEarned}`);
    this._phaseScore.setColor(this._coinsEarned >= 0 ? '#44FF44' : '#FF4444');

    // Deactivate after catch animation
    this.tweens.add({
      targets: item,
      y: item.y - 40,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => item.deactivate(),
    });
  }

  _getStreakMult() {
    const thresholds = C.STREAK_THRESHOLDS;
    const multipliers = C.STREAK_MULTIPLIERS;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (this._streak >= thresholds[i]) return multipliers[i];
    }
    return 1;
  }

  _updateTimerBar(ratio) {
    this._timerBar.clear();
    // Background
    this._timerBar.fillStyle(0x334455, 0.8);
    this._timerBar.fillRect(0, H - 25, W, 20);
    // Fill
    const col = ratio > 0.5 ? 0x44FF44 : ratio > 0.25 ? 0xFFAA00 : 0xFF4444;
    this._timerBar.fillStyle(col, 0.9);
    this._timerBar.fillRect(2, H - 23, (W - 4) * ratio, 16);
  }

  _endPhase() {
    if (!this._active) return;
    this._active = false;

    if (this._spawnTimer) this._spawnTimer.destroy();

    const patientHealed = this._correctCatches > this._wrongCatches;

    // Results overlay
    this._showResults(patientHealed, () => {
      // Return result to GameScene
      this.registry.set('antibioticResult', {
        coinsEarned:    this._coinsEarned,
        correctCatches: this._correctCatches,
        wrongCatches:   this._wrongCatches,
        patientHealed,
      });

      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }

  _showResults(healed, callback) {
    this.cameras.main.fade(200, 0, 0, 0);
    this.time.delayedCall(200, () => {
      const overlay = this.add.container(W / 2, H / 2).setDepth(100);
      const bg = this.add.graphics();
      bg.fillStyle(0x0A1628, 0.97);
      bg.fillRoundedRect(-180, -160, 360, 320, 16);
      bg.lineStyle(2, healed ? 0x44FF44 : 0xFF4444, 0.9);
      bg.strokeRoundedRect(-180, -160, 360, 320, 16);

      const result = this.add.text(0, -120, healed ? '✅ PACIENTE TRATADO' : '❌ TRATAMIENTO FALLIDO', {
        fontSize: '18px',
        fontFamily: 'Arial Black, Arial',
        color: healed ? '#44FF44' : '#FF4444',
        align: 'center',
      }).setOrigin(0.5);

      const accuracy = this._correctCatches + this._wrongCatches > 0
        ? Math.round(this._correctCatches / (this._correctCatches + this._wrongCatches) * 100)
        : 100;

      const stats = this.add.text(0, -40,
        `✓ Correctos: ${this._correctCatches}\n✗ Incorrectos: ${this._wrongCatches}\n📊 Precisión: ${accuracy}%\n💰 Coreimcitos: ${this._coinsEarned >= 0 ? '+' : ''}${this._coinsEarned}`,
        {
          fontSize: '15px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          align: 'center',
          lineSpacing: 8,
        },
      ).setOrigin(0.5);

      const cont = this.add.text(0, 120, '► Continuar', {
        fontSize: '20px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        backgroundColor: '#1A3A6A',
        padding: { x: 24, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      cont.on('pointerdown', () => { overlay.destroy(); callback(); });

      overlay.add([bg, result, stats, cont]);
      this.cameras.main.fadeIn(300);
    });
  }
}

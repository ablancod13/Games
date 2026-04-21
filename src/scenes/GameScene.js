import { W, H, C } from '../config/GameConfig.js';
import { Doctor }           from '../entities/Doctor.js';
import { BackgroundSystem } from '../systems/BackgroundSystem.js';
import { SpawnSystem }      from '../systems/SpawnSystem.js';
import { ScoreSystem }      from '../systems/ScoreSystem.js';
import { LevelSystem }      from '../systems/LevelSystem.js';
import { PowerUpSystem }    from '../systems/PowerUpSystem.js';
import { InputManager }     from '../systems/InputManager.js';
import { HUD }              from '../ui/HUD.js';
import { AchievementUI }    from '../ui/AchievementUI.js';
import { saveSystem }       from '../systems/SaveSystem.js';
import { ACHIEVEMENTS }     from '../config/AchievementsData.js';
import { burst, screenFlash, scorePopup, speedLines } from '../graphics/ParticleEffects.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    // Systems
    this._score    = new ScoreSystem();
    this._level    = new LevelSystem(lvl => this._onLevelUp(lvl));
    this._power    = new PowerUpSystem(this);
    this._input    = new InputManager(this);
    this._achUI    = new AchievementUI(this);

    // Background
    this._bg = new BackgroundSystem(this);

    // Ground physics body
    this._ground = this.physics.add.staticImage(W / 2, C.GROUND_Y + 20, '__DEFAULT')
      .setVisible(false)
      .setDisplaySize(W, 40);

    // Doctor
    this._doctor = new Doctor(this, C.PLAYER_X, C.GROUND_Y - C.DOCTOR_H / 2);
    this.physics.add.collider(this._doctor, this._ground);

    if (this._power.hasBionicLegs()) this._doctor.enableDoubleJump();

    // Spawn system
    this._spawn = new SpawnSystem(this);

    // HUD
    this._hud = new HUD(this);

    // Input bindings
    this._input.onJump(() => {
      if (this._paused || this._dead) return;
      this._doctor.jump();
    });
    this._input.onSlide(() => {
      if (this._paused || this._dead) return;
      this._doctor.slide();
    });

    // Pause button
    const pauseBtn = this.add.text(W - 12, 68, '⏸', {
      fontSize: '22px',
      backgroundColor: '#11223388',
      padding: { x: 8, y: 4 },
    }).setOrigin(1, 0).setDepth(22).setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerdown', () => this._togglePause());

    // Anti-bounce: track last patient encounter
    this._lastPatientEncountered = null;
    this._paused = false;
    this._dead   = false;
    this._pauseOverlay = null;

    // Run-start camera flash
    this.cameras.main.flash(400, 255, 255, 255);

    // Resume from antibiotic phase
    this.events.on('resume', (sys, data) => {
      const result = this.registry.get('antibioticResult');
      if (result) {
        this.registry.remove('antibioticResult');
        this._handleAntibioticResult(result);
      }
      this._paused = false;
    });
  }

  update(time, delta) {
    if (this._dead || this._paused) return;

    const speed = this._level.update(this._score.distance, C.INITIAL_SPEED);

    // Background scroll
    this._bg.update(speed, delta);

    // Doctor update
    this._doctor.update();

    // Spawn system
    this._spawn.update(speed, delta, this._score.distance, this._level.levelNum);

    // Distance tracking (pixels scrolled = movement)
    this._score.addDistance(speed * delta / 1000);

    // Coin collection
    this._checkCoinPickup();

    // Obstacle collision
    this._checkObstacleCollision();

    // Patient interaction
    this._checkPatientInteraction();

    // HUD
    this._hud.update(this._score, this._level, this._power);

    // Power-ups
    this._power.update();

    // Achievements check
    this._checkAchievements();

    // Speed lines effect at high speeds
    if (speed > 500 && Math.random() < 0.008) speedLines(this, 350);

    // Input
    this._input.update();
  }

  _checkCoinPickup() {
    this._spawn.coins.forEach(coin => {
      if (!coin.active) return;
      const dx = Math.abs(coin.x - this._doctor.x);
      const dy = Math.abs(coin.y - this._doctor.y);
      if (dx < 30 && dy < 40) {
        coin.setActive(false).setVisible(false);
        this.tweens.killTweensOf(coin);
        this._score.pickupCoin();
        burst(this, coin.x, coin.y, 'coin', 6);
        // Small coin sound cue (visual)
        const flash = this.add.text(coin.x, coin.y - 20, '+1', {
          fontSize: '16px',
          color: '#FFD700',
          stroke: '#332200',
          strokeThickness: 2,
        }).setDepth(25);
        this.tweens.add({
          targets: flash, y: coin.y - 50, alpha: 0, duration: 600,
          onComplete: () => flash.destroy(),
        });
      }
    });
  }

  _checkObstacleCollision() {
    if (this._doctor.isInvincible) return;

    this._spawn.obstacles.forEach(obs => {
      if (!obs.active) return;
      const ob = obs.body;
      const db = this._doctor.body;

      if (Phaser.Geom.Intersects.RectangleToRectangle(
        new Phaser.Geom.Rectangle(db.x, db.y, db.width, db.height),
        new Phaser.Geom.Rectangle(ob.x, ob.y, ob.width, ob.height),
      )) {
        this._onObstacleHit(obs);
      }
    });
  }

  _onObstacleHit(obs) {
    // Try shield first
    if (this._power.tryAbsorbHit()) {
      burst(this, this._doctor.x, this._doctor.y, 'star', 10);
      obs.deactivate();
      return;
    }

    if (this._doctor.takeHit()) {
      screenFlash(this, 'red', 200);
      this.cameras.main.shake(300, 0.015);
      obs.deactivate();

      // Game over after hit (single life)
      this.time.delayedCall(800, () => this._endRun());
    }
  }

  _checkPatientInteraction() {
    this._spawn.patients.forEach(patient => {
      if (!patient.active || patient === this._lastPatientEncountered) return;

      const dx = Math.abs(patient.x - this._doctor.x);
      const dy = Math.abs(patient.y - this._doctor.y);

      if (dx < 70 && dy < 100) {
        this._lastPatientEncountered = patient;
        const interacted = patient.interact();
        if (interacted) {
          this._launchAntibioticPhase(patient.patientData);
        }
      }
    });
  }

  _launchAntibioticPhase(patientData) {
    this._paused = true;

    // Pass data to antibiotic scene via registry
    this.registry.set('phasePatient', patientData);
    this.registry.set('phaseMechanisms', patientData.mechanisms);
    this.registry.set('phaseLevel', this._level.levelNum);
    this.registry.set('hasAbGuide', this._power.hasAbGuide());
    this.registry.set('hasWbc', this._power.hasWhiteBloodCell());
    this.registry.set('hasBacteriophage', this._power.hasBacteriophage());

    // Consume guide before launch (will show hints in AB scene)
    if (this._power.hasAbGuide()) this._power.consumeAbGuide();
    if (this._power.hasBacteriophage()) this._power.consumeBacteriophage();
    if (this._power.hasWhiteBloodCell()) this._power.consumeWbc();

    this.scene.pause();
    this.scene.launch('AntibioticScene');
  }

  _handleAntibioticResult(result) {
    const { coinsEarned, correctCatches, wrongCatches, patientHealed } = result;

    if (patientHealed) {
      this._score.onPatientHealed();
      burst(this, this._doctor.x, this._doctor.y, 'star', 14);
      screenFlash(this, 'green', 300);

      // Track mechanism-specific stats
      const mechanisms = this.registry.get('phaseMechanisms') || [];
      if (mechanisms.includes('KPC')) saveSystem.incrementStat('kpc_treated');
      if (mechanisms.includes('MBL')) saveSystem.incrementStat('mbl_treated');
    }

    // Apply coin delta from the phase
    const delta = coinsEarned || 0;
    if (delta !== 0) {
      this._score.addCoins(delta);
      scorePopup(this, this._doctor.x, this._doctor.y - 60, delta > 0 ? `+${delta}` : `${delta}`, delta > 0 ? '#44FF44' : '#FF4444');
    }

    // Update score counters
    for (let i = 0; i < (correctCatches || 0); i++) this._score.onAntibioticCatch(1);
    for (let i = 0; i < (wrongCatches || 0); i++) this._score.onAntibioticCatch(-2);
  }

  _onLevelUp(levelData) {
    this._hud.showLevelUp(levelData);
    this._hud.showMechanism(levelData.mechanisms);
    this.cameras.main.flash(500, 30, 80, 200);

    if (levelData.level >= 6) {
      const ach = this._score.distance > 0 ? 'speed_demon' : null;
      if (ach) this._unlockAchievement(ach);
    }
  }

  _checkAchievements() {
    if (this._score.distance >= 2000 && !saveSystem.hasAchievement('marathon_runner')) {
      this._unlockAchievement('marathon_runner');
    }
    if (this._score.bestStreak >= 5 && !saveSystem.hasAchievement('combo_doctor')) {
      this._unlockAchievement('combo_doctor');
    }
    if (saveSystem.getStat('kpc_treated') >= 10 && !saveSystem.hasAchievement('carbapenem_master')) {
      this._unlockAchievement('carbapenem_master');
    }
    if (saveSystem.getStat('mbl_treated') >= 1 && !saveSystem.hasAchievement('mbl_fighter')) {
      this._unlockAchievement('mbl_fighter');
    }
    if (saveSystem.getStat('total_coins') >= 500 && !saveSystem.hasAchievement('rich_doctor')) {
      this._unlockAchievement('rich_doctor');
    }
  }

  _unlockAchievement(id) {
    if (saveSystem.unlockAchievement(id)) {
      this._achUI.notify(id);
    }
  }

  _togglePause() {
    if (this._dead) return;
    this._paused = !this._paused;

    if (this._paused) {
      this._pauseOverlay = this._buildPauseOverlay();
    } else {
      if (this._pauseOverlay) { this._pauseOverlay.destroy(); this._pauseOverlay = null; }
    }
  }

  _buildPauseOverlay() {
    const overlay = this.add.container(W / 2, H / 2).setDepth(60);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7); bg.fillRect(-W / 2, -H / 2, W, H);

    const title = this.add.text(0, -80, '⏸ PAUSA', {
      fontSize: '36px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    const resume = this.add.text(0, 0, '▶ Continuar', {
      fontSize: '24px', color: '#44FF44',
      backgroundColor: '#002200',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resume.on('pointerdown', () => this._togglePause());

    const quit = this.add.text(0, 80, '✕ Salir', {
      fontSize: '20px', color: '#FF4444',
      backgroundColor: '#220000',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    quit.on('pointerdown', () => {
      this._endRun();
    });

    overlay.add([bg, title, resume, quit]);
    return overlay;
  }

  _endRun() {
    if (this._dead) return;
    this._dead = true;

    // Commit coins
    this._score.commitToSave();
    const summary = this._score.runSummary;

    // Update high score
    const isNew = saveSystem.updateHighScore(summary.distance);
    saveSystem.addRun({ ...summary, newRecord: isNew });

    // Update daily challenge progress
    this._updateDailyChallenges(summary);

    // Transition
    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(700, () => {
      this.scene.start('GameOverScene', { summary, isNew });
    });
  }

  _updateDailyChallenges(summary) {
    const dc = saveSystem.getDailyChallenge();
    dc.challenges.forEach(cid => {
      let prog = dc.progress[cid] || 0;
      if (cid === 'run_2000m' && summary.distance >= 2000) prog = 1;
      else if (cid === 'collect_50' && summary.coins >= 50) prog = Math.max(prog, 1);
      else if (cid === 'catch_10_green') prog += summary.correctCatches;
      dc.progress[cid] = prog;
    });
    saveSystem.set('dailyChallenge', dc);
  }
}

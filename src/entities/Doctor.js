import { C } from '../config/GameConfig.js';

export class Doctor extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'doctor_run_0');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(C.DOCTOR_W, C.DOCTOR_H);
    this.body.setGravityY(0); // use scene's global gravity
    this.setDepth(10);

    this._jumpCount  = 0;
    this._maxJumps   = 1;    // 2 if bionic_legs
    this._isSliding  = false;
    this._isHit      = false;
    this._isInvincible = false;
    this._slideTimer = null;

    this._setupAnimations(scene);
    this.play('doc_run');
  }

  enableDoubleJump() { this._maxJumps = 2; }

  setInvincible(active) {
    this._isInvincible = active;
    this.setAlpha(active ? 0.6 : 1);
  }

  get isSliding()   { return this._isSliding; }
  get isHit()       { return this._isHit; }
  get isInvincible(){ return this._isInvincible; }

  jump() {
    if (this._jumpCount >= this._maxJumps) return false;
    if (this._isSliding) this._stopSlide();

    const vel = this._jumpCount === 0 ? C.JUMP_VEL : C.DOUBLE_JUMP_VEL;
    this.body.setVelocityY(vel);
    this._jumpCount++;
    this.play('doc_jump', true);
    return true;
  }

  slide() {
    if (this._isSliding || !this._onGround()) return;

    this._isSliding = true;
    this.body.setSize(C.DOCTOR_SLIDE_W, C.DOCTOR_SLIDE_H);
    // Offset so feet stay on ground
    this.body.setOffset(0, C.DOCTOR_H - C.DOCTOR_SLIDE_H);
    this.play('doc_slide', true);

    this._slideTimer = this.scene.time.delayedCall(C.SLIDE_DURATION, () => {
      this._stopSlide();
    });
  }

  _stopSlide() {
    this._isSliding = false;
    this.body.setSize(C.DOCTOR_W, C.DOCTOR_H);
    this.body.setOffset(0, 0);
    if (this._slideTimer) { this._slideTimer.remove(); this._slideTimer = null; }
    if (this._onGround()) this.play('doc_run', true);
  }

  takeHit() {
    if (this._isInvincible || this._isHit) return false;
    this._isHit = true;
    this.play('doc_hit', true);
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.2 },
      duration: 120,
      repeat: 4,
      yoyo: true,
      onComplete: () => {
        this.setAlpha(1);
        this._isHit = false;
        if (!this._isSliding) this.play('doc_run', true);
      },
    });
    return true;
  }

  _onGround() {
    return this.body.blocked.down;
  }

  update() {
    if (this._onGround() && this._jumpCount > 0 && !this._isSliding) {
      this._jumpCount = 0;
      if (!this._isHit && !this._isSliding) this.play('doc_run', true);
    }
  }

  _setupAnimations(scene) {
    if (scene.anims.exists('doc_run')) return;

    scene.anims.create({
      key: 'doc_run',
      frames: [
        { key: 'doctor_run_0' }, { key: 'doctor_run_1' },
        { key: 'doctor_run_2' }, { key: 'doctor_run_3' },
      ],
      frameRate: 12,
      repeat: -1,
    });

    scene.anims.create({
      key: 'doc_jump',
      frames: [{ key: 'doctor_jump' }],
      frameRate: 1,
      repeat: -1,
    });

    scene.anims.create({
      key: 'doc_slide',
      frames: [{ key: 'doctor_slide' }],
      frameRate: 1,
      repeat: -1,
    });

    scene.anims.create({
      key: 'doc_hit',
      frames: [
        { key: 'doctor_hit' }, { key: 'doctor_run_0' },
        { key: 'doctor_hit' }, { key: 'doctor_run_0' },
      ],
      frameRate: 8,
      repeat: 2,
    });
  }
}

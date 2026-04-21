const SWIPE_DOWN_THRESHOLD = 50;
const SWIPE_MIN_DISTANCE = 30;

export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this._jumpCallback = null;
    this._slideCallback = null;

    this._pointerStartX = 0;
    this._pointerStartY = 0;
    this._pointerStartTime = 0;
    this._pointerDown = false;

    // Keyboard
    this._keys = scene.input.keyboard
      ? scene.input.keyboard.addKeys({
          up:    Phaser.Input.Keyboard.KeyCodes.UP,
          w:     Phaser.Input.Keyboard.KeyCodes.W,
          space: Phaser.Input.Keyboard.KeyCodes.SPACE,
          down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
          s:     Phaser.Input.Keyboard.KeyCodes.S,
        })
      : null;

    // Touch / pointer
    scene.input.on('pointerdown', this._onDown, this);
    scene.input.on('pointerup',   this._onUp,   this);
  }

  onJump(cb)  { this._jumpCallback  = cb; }
  onSlide(cb) { this._slideCallback = cb; }

  _onDown(pointer) {
    this._pointerDown = true;
    this._pointerStartX = pointer.x;
    this._pointerStartY = pointer.y;
    this._pointerStartTime = Date.now();
  }

  _onUp(pointer) {
    if (!this._pointerDown) return;
    this._pointerDown = false;

    const dx = pointer.x - this._pointerStartX;
    const dy = pointer.y - this._pointerStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > SWIPE_MIN_DISTANCE && dy > SWIPE_DOWN_THRESHOLD && dy > Math.abs(dx)) {
      this._slideCallback && this._slideCallback();
    } else {
      this._jumpCallback && this._jumpCallback();
    }
  }

  update() {
    if (!this._keys) return;
    if (Phaser.Input.Keyboard.JustDown(this._keys.up)    ||
        Phaser.Input.Keyboard.JustDown(this._keys.w)     ||
        Phaser.Input.Keyboard.JustDown(this._keys.space)) {
      this._jumpCallback && this._jumpCallback();
    }
    if (Phaser.Input.Keyboard.JustDown(this._keys.down) ||
        Phaser.Input.Keyboard.JustDown(this._keys.s)) {
      this._slideCallback && this._slideCallback();
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this._onDown, this);
    this.scene.input.off('pointerup',   this._onUp,   this);
  }
}

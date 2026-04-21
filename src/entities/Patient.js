import { C } from '../config/GameConfig.js';
import { MECHANISMS } from '../config/AntibioticsData.js';

export class Patient extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);

    this._sprite = scene.add.image(0, 0, 'patient_feverish').setOrigin(0.5, 1);
    this._bubble = this._createBubble(scene);
    this._interacted = false;
    this._data = null;

    this.add([this._sprite, this._bubble]);
    this.setActive(false).setVisible(false).setDepth(9);
  }

  _createBubble(scene) {
    const container = scene.add.container(0, 0);

    // Speech bubble background
    const bg = scene.add.graphics();
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillRoundedRect(-64, -130, 128, 56, 10);
    bg.fillStyle(0x333344, 0.8);
    bg.fillRoundedRect(-62, -128, 124, 52, 9);
    // Bubble tail
    bg.fillStyle(0xFFFFFF, 0.95);
    bg.fillTriangle(-10, -76, 10, -76, 0, -60);
    bg.fillStyle(0x333344, 0.8);
    bg.fillTriangle(-8, -76, 8, -76, 0, -62);

    // Organism label text
    const orgText = scene.add.text(0, -118, '', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#AACCFF',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Mechanism label text
    const mechText = scene.add.text(0, -106, '', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5, 0);

    // Mechanism colored badge
    const badge = scene.add.graphics();

    container.add([bg, orgText, mechText, badge]);
    container._orgText  = orgText;
    container._mechText = mechText;
    container._badge    = badge;
    return container;
  }

  activate(patientData, x) {
    this._data = patientData;
    this._interacted = false;

    this._sprite.setTexture(`patient_${patientData.appearance}`);

    // Update bubble text
    this._bubble._orgText.setText(patientData.organism || '');
    this._bubble._mechText.setText(patientData.label);

    // Mechanism badge colors
    const badge = this._bubble._badge;
    badge.clear();
    patientData.mechanisms.forEach((mechId, i) => {
      const mech = MECHANISMS[mechId];
      if (!mech) return;
      badge.fillStyle(mech.color, 0.8);
      badge.fillRoundedRect(-56 + i * 38, -86, 34, 12, 4);
    });

    this.setPosition(x, C.GROUND_Y);
    this.setActive(true).setVisible(true);

    // Bounce in animation
    this._sprite.setScale(0.3);
    this.scene.tweens.add({
      targets: this._sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: 'Back.Out',
    });

    // Bubble fade in
    this._bubble.setAlpha(0);
    this.scene.tweens.add({
      targets: this._bubble,
      alpha: 1,
      delay: 200,
      duration: 300,
    });

    return this;
  }

  deactivate() {
    this.setActive(false).setVisible(false);
  }

  get interacted() { return this._interacted; }
  get patientData() { return this._data; }

  // Called when doctor overlaps this patient
  interact() {
    if (this._interacted) return false;
    this._interacted = true;

    // Bounce out
    this.scene.tweens.add({
      targets: this,
      x: this.x - 80,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => this.deactivate(),
    });
    return true;
  }

  update(speed, delta) {
    if (!this.active) return;
    this.x -= speed * delta / 1000;
    if (this.x < -100) this.deactivate();
  }
}

export function createPatientPool(scene, size = 3) {
  const patients = [];
  for (let i = 0; i < size; i++) patients.push(new Patient(scene));
  return patients;
}

import { generateDoctorTextures }     from '../graphics/DoctorGraphics.js';
import { generateHospitalTextures }   from '../graphics/HospitalGraphics.js';
import { generateAntibioticTextures } from '../graphics/AntibioticGraphics.js';
import { generatePatientTextures }    from '../graphics/PatientGraphics.js';
import { generateParticleTextures }   from '../graphics/ParticleEffects.js';
import { W, H } from '../config/GameConfig.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Loading screen
    const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x0A0A1A);

    const logo = this.add.text(W / 2, H / 2 - 120, 'ResistoRun', {
      fontSize: '46px',
      fontFamily: 'Arial Black, Arial',
      color: '#4499FF',
      stroke: '#001133',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.add.text(W / 2, H / 2 - 64, 'El juego de la resistencia antibiótica', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#88AACC',
    }).setOrigin(0.5);

    // Animated bacteria
    const bact = this.add.text(W / 2, H / 2 + 20, '🦠', {
      fontSize: '60px',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: bact,
      angle: 360,
      duration: 2000,
      repeat: -1,
      ease: 'Linear',
    });
    this.tweens.add({
      targets: bact,
      scale: { from: 0.8, to: 1.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    const loadingText = this.add.text(W / 2, H / 2 + 120, 'Generando bacterias...', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AAAACC',
    }).setOrigin(0.5);

    // Progress bar
    const barBg = this.add.rectangle(W / 2, H / 2 + 160, 300, 16, 0x222244).setOrigin(0.5);
    const bar   = this.add.rectangle(W / 2 - 150, H / 2 + 160, 0, 14, 0x4499FF).setOrigin(0, 0.5);

    const steps = [
      { fn: () => generateDoctorTextures(this),      text: 'Animando al médico...' },
      { fn: () => generateHospitalTextures(this),    text: 'Construyendo el hospital...' },
      { fn: () => generateAntibioticTextures(this),  text: 'Preparando antibióticos...' },
      { fn: () => generatePatientTextures(this),     text: 'Creando pacientes...' },
      { fn: () => generateParticleTextures(this),    text: 'Añadiendo efectos...' },
    ];

    let step = 0;
    const runStep = () => {
      if (step >= steps.length) {
        bar.width = 300;
        loadingText.setText('¡Listo!');
        this.time.delayedCall(400, () => this.scene.start('MenuScene'));
        return;
      }

      const s = steps[step];
      loadingText.setText(s.text);

      try {
        s.fn();
      } catch (err) {
        // Show error on screen to aid debugging
        console.error('BootScene error at step "' + s.text + '":', err);
        loadingText.setText('Error: ' + err.message);
        this.add.text(W / 2, H / 2 + 180, '⚠ ' + s.text + '\n' + err.message, {
          fontSize: '13px', fontFamily: 'Arial', color: '#FF4444',
          align: 'center', wordWrap: { width: W - 40 },
          backgroundColor: '#00000099', padding: { x: 8, y: 6 },
        }).setOrigin(0.5);
        // Skip broken step and continue
        bar.width = ((step + 1) / steps.length) * 300;
        step++;
        this.time.delayedCall(100, runStep);
        return;
      }

      bar.width = ((step + 1) / steps.length) * 300;
      step++;

      // Small delay between steps so loading bar is visible
      this.time.delayedCall(50, runStep);
    };

    this.time.delayedCall(200, runStep);
  }
}

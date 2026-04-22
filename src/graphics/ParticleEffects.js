function fillStar(g, x, y, points, outerR, innerR, rotation) {
  const step = Math.PI / points;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step + rotation - Math.PI / 2;
    pts.push({ x: x + Math.cos(angle) * r, y: y + Math.sin(angle) * r });
  }
  g.fillPoints(pts, true);
}

// Generates small particle textures and provides helper functions for effects
export function generateParticleTextures(scene) {
  const g = scene.add.graphics();

  // Green burst particle (correct antibiotic)
  g.clear();
  g.fillStyle(0x44FF44); g.fillCircle(8, 8, 7);
  g.fillStyle(0xAAFFAA, 0.8); g.fillCircle(8, 8, 4);
  g.generateTexture('particle_green', 16, 16);

  // Red burst particle (wrong antibiotic)
  g.clear();
  g.fillStyle(0xFF4444); g.fillCircle(8, 8, 7);
  g.fillStyle(0xFFAAAA, 0.8); g.fillCircle(8, 8, 4);
  g.generateTexture('particle_red', 16, 16);

  // Gold coin sparkle
  g.clear();
  g.fillStyle(0xFFD700); g.fillCircle(6, 6, 5);
  g.fillStyle(0xFFEE88, 0.9); g.fillCircle(6, 6, 3);
  g.generateTexture('particle_coin', 12, 12);

  // Star particle
  g.clear();
  g.fillStyle(0xFFFF44, 0.9); fillStar(g, 8, 8, 5, 7, 3, 0);
  g.generateTexture('particle_star', 16, 16);

  // Speed line particle
  g.clear();
  g.fillStyle(0xCCDDEE, 0.4); g.fillRect(0, 2, 40, 2);
  g.generateTexture('particle_speed', 40, 6);

  // White flash (screen flash)
  g.clear();
  g.fillStyle(0xFFFFFF, 0.6); g.fillRect(0, 0, 480, 854);
  g.generateTexture('flash_white', 480, 854);

  // Green flash
  g.clear();
  g.fillStyle(0x00FF44, 0.35); g.fillRect(0, 0, 480, 854);
  g.generateTexture('flash_green', 480, 854);

  // Red flash
  g.clear();
  g.fillStyle(0xFF2222, 0.35); g.fillRect(0, 0, 480, 854);
  g.generateTexture('flash_red', 480, 854);

  g.destroy();
}

/**
 * Explode a burst of particles at (x, y) in the given scene.
 * type: 'green' | 'red' | 'coin' | 'star'
 */
export function burst(scene, x, y, type = 'green', count = 12) {
  const key = `particle_${type}`;
  const particles = scene.add.particles(x, y, key, {
    speed: { min: 80, max: 240 },
    angle: { min: 0, max: 360 },
    scale: { start: 1.2, end: 0 },
    lifespan: 500,
    quantity: count,
    emitting: false,
  });
  particles.explode(count);
  scene.time.delayedCall(600, () => particles.destroy());
}

/**
 * Flash the screen with a color overlay.
 * type: 'white' | 'green' | 'red'
 */
export function screenFlash(scene, type = 'green', duration = 180) {
  const key = `flash_${type}`;
  const img = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(50);
  scene.tweens.add({
    targets: img,
    alpha: { from: 1, to: 0 },
    duration,
    onComplete: () => img.destroy(),
  });
}

/**
 * Floating score text popup (+1, -2, etc.)
 */
export function scorePopup(scene, x, y, text, color = '#44FF44') {
  const t = scene.add.text(x, y, text, {
    fontSize: '28px',
    fontFamily: 'Arial Black, Arial',
    color,
    stroke: '#000000',
    strokeThickness: 4,
  }).setOrigin(0.5).setDepth(30);

  scene.tweens.add({
    targets: t,
    y: y - 70,
    alpha: 0,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 900,
    ease: 'Power2',
    onComplete: () => t.destroy(),
  });
}

/**
 * Speed lines effect (runs for `duration` ms)
 */
export function speedLines(scene, duration = 400) {
  const lines = [];
  for (let i = 0; i < 8; i++) {
    const y = Phaser.Math.Between(80, 700);
    const x = Phaser.Math.Between(100, 480);
    const l = scene.add.image(x, y, 'particle_speed').setDepth(5).setAlpha(0.7);
    lines.push(l);
    scene.tweens.add({
      targets: l,
      x: x - 200,
      alpha: 0,
      duration: duration + Phaser.Math.Between(-100, 100),
      onComplete: () => l.destroy(),
    });
  }
}

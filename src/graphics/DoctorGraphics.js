// Procedurally generates all doctor sprite textures using Phaser Graphics API.
// Must be called inside a Scene's create() after renderer is initialized.

const W = 50;
const H = 90;
const SW = 80;  // slide width
const SH = 46;  // slide height

const COL = {
  skin:    0xFFCBA4,
  hair:    0x3D2B1F,
  coat:    0xF4F4FF,
  coatSh:  0xCCCCEE,
  navy:    0x1A237E,
  shoe:    0x1A1A2E,
  steth:   0xAAAAAA,
  outline: 0x111111,
  red:     0xFF4444,
  eye:     0x222222,
};

function rect(g, col, x, y, w, h) {
  g.fillStyle(col); g.fillRect(x, y, w, h);
}
function circle(g, col, x, y, r) {
  g.fillStyle(col); g.fillCircle(x, y, r);
}
function outline(g, x, y, w, h, col = COL.outline, lw = 1.5) {
  g.lineStyle(lw, col, 1); g.strokeRect(x, y, w, h);
}

function drawDoctorBase(g, legOffset, armOffset) {
  // Back leg (visually behind coat)
  rect(g, COL.navy, 19 - legOffset, 58, 11, 26);
  rect(g, COL.shoe, 17 - legOffset, 80, 16, 8);

  // Coat body
  rect(g, COL.coat, 12, 26, 26, 38);
  // Coat shadow
  rect(g, COL.coatSh, 32, 30, 6, 30);
  outline(g, 12, 26, 26, 38);

  // Front leg
  rect(g, COL.navy, 21 + legOffset, 58, 11, 26);
  rect(g, COL.shoe, 19 + legOffset, 80, 16, 8);

  // Arms
  rect(g, COL.coat, 4,  30 - armOffset, 9, 22);
  outline(g, 4, 30 - armOffset, 9, 22);
  rect(g, COL.coat, 37, 30 + armOffset, 9, 22);
  outline(g, 37, 30 + armOffset, 9, 22);

  // Stethoscope
  g.lineStyle(2.5, COL.steth, 1);
  g.beginPath();
  g.arc(25, 36, 9, Math.PI * 0.15, Math.PI * 0.85, false);
  g.strokePath();
  circle(g, COL.steth, 25, 45, 3);

  // Head
  circle(g, COL.skin, 25, 15, 13);
  g.lineStyle(1.5, COL.outline, 1); g.strokeCircle(25, 15, 13);

  // Hair
  rect(g, COL.hair, 13,  4, 24, 9);
  circle(g, COL.hair, 13, 8, 4);
  circle(g, COL.hair, 37, 8, 4);

  // Eyes
  circle(g, COL.eye, 21, 14, 2.2);
  circle(g, COL.eye, 29, 14, 2.2);
  // Pupils
  g.fillStyle(0xFFFFFF); g.fillCircle(21.8, 13.2, 0.9); g.fillCircle(29.8, 13.2, 0.9);

  // Smile
  g.lineStyle(1.5, 0x554433, 1);
  g.beginPath(); g.arc(25, 17, 5, 0.1 * Math.PI, 0.9 * Math.PI, false); g.strokePath();

  // Coat collar / lapels
  g.fillStyle(COL.coat);
  g.fillTriangle(22, 26, 19, 36, 25, 26);
  g.fillTriangle(28, 26, 31, 36, 25, 26);
}

export function generateDoctorTextures(scene) {
  const g = scene.add.graphics();

  // 4 run frames
  const runPhases = [0, 0.25, 0.5, 0.75];
  runPhases.forEach((phase, i) => {
    g.clear();
    const legOffset = Math.round(Math.sin(phase * Math.PI * 2) * 9);
    const armOffset = Math.round(Math.sin(phase * Math.PI * 2) * 7);
    drawDoctorBase(g, legOffset, armOffset);
    g.generateTexture(`doctor_run_${i}`, W, H);
  });

  // Jump frame
  g.clear();
  rect(g, COL.navy, 17, 60, 11, 22); rect(g, COL.shoe, 14, 78, 16, 8);
  rect(g, COL.navy, 22, 60, 11, 22); rect(g, COL.shoe, 20, 78, 16, 8);
  rect(g, COL.coat, 12, 26, 26, 36); rect(g, COL.coatSh, 32, 30, 6, 28);
  outline(g, 12, 26, 26, 36);
  // Arms raised
  rect(g, COL.coat, 2, 20, 9, 22); outline(g, 2, 20, 9, 22);
  rect(g, COL.coat, 39, 20, 9, 22); outline(g, 39, 20, 9, 22);
  g.lineStyle(2.5, COL.steth, 1);
  g.beginPath(); g.arc(25, 36, 9, Math.PI * 0.15, Math.PI * 0.85, false); g.strokePath();
  circle(g, COL.steth, 25, 45, 3);
  circle(g, COL.skin, 25, 15, 13);
  g.lineStyle(1.5, COL.outline); g.strokeCircle(25, 15, 13);
  rect(g, COL.hair, 13, 4, 24, 9); circle(g, COL.hair, 13, 8, 4); circle(g, COL.hair, 37, 8, 4);
  circle(g, COL.eye, 21, 14, 2.2); circle(g, COL.eye, 29, 14, 2.2);
  g.fillStyle(0xFFFFFF); g.fillCircle(21.8, 13.2, 0.9); g.fillCircle(29.8, 13.2, 0.9);
  g.generateTexture('doctor_jump', W, H);

  // Slide frame (wider, lower)
  g.clear();
  // Body horizontal
  rect(g, COL.coat, 0, 6, 58, 22); outline(g, 0, 6, 58, 22);
  rect(g, COL.coatSh, 50, 10, 8, 14);
  // Legs extended back
  rect(g, COL.navy, 56, 20, 22, 12); rect(g, COL.shoe, 72, 26, 14, 8);
  // Head
  circle(g, COL.skin, 14, 16, 12);
  g.lineStyle(1.5, COL.outline); g.strokeCircle(14, 16, 12);
  rect(g, COL.hair, 4, 6, 20, 8); circle(g, COL.hair, 4, 10, 4); circle(g, COL.hair, 24, 10, 4);
  circle(g, COL.eye, 11, 14, 2); circle(g, COL.eye, 18, 14, 2);
  g.lineStyle(2, COL.steth); g.beginPath(); g.arc(28, 14, 8, -0.3, Math.PI - 0.3, false); g.strokePath();
  g.generateTexture('doctor_slide', SW, SH);

  // Hit frame (red flash)
  g.clear();
  drawDoctorBase(g, 0, 0);
  g.fillStyle(0xFF0000, 0.45);
  g.fillRect(0, 0, W, H);
  g.generateTexture('doctor_hit', W, H);

  g.destroy();
}

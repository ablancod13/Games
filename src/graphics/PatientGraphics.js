// Generates patient NPC textures for all appearance types
export function generatePatientTextures(scene) {
  const appearances = ['feverish', 'bandaged', 'elderly', 'ventilator', 'icu', 'critical', 'abdominal'];
  const g = scene.add.graphics();

  appearances.forEach(a => {
    g.clear();
    _drawPatient(g, a);
    g.generateTexture(`patient_${a}`, 64, 92);
  });

  g.destroy();
}

const COL = {
  skin:  0xFFCBA4,
  gown:  0xB8D4F0,
  gownD: 0x88AACC,
  hair:  0x5C4033,
  white: 0xFFFFFF,
  grey:  0xAAAAAA,
  red:   0xFF5555,
  green: 0x55BB55,
};

function base(g) {
  // Gown body
  g.fillStyle(COL.gown); g.fillRect(14, 32, 36, 48);
  g.fillStyle(COL.gownD); g.fillRect(38, 36, 10, 40); // shadow
  g.lineStyle(1.5, 0x7799BB); g.strokeRect(14, 32, 36, 48);
  // Legs below gown
  g.fillStyle(COL.skin); g.fillRect(16, 76, 10, 16); g.fillRect(38, 76, 10, 16);
  // Head
  g.fillStyle(COL.skin); g.fillCircle(32, 20, 14);
  g.lineStyle(1.5, 0xCC9977); g.strokeCircle(32, 20, 14);
  // Eyes
  g.fillStyle(0x222222); g.fillCircle(27, 19, 2); g.fillCircle(37, 19, 2);
  // Gown tie
  g.lineStyle(2, COL.gownD); g.lineBetween(32, 32, 32, 50);
}

function _drawPatient(g, appearance) {
  switch (appearance) {
    case 'feverish': {
      base(g);
      // Hair (messy)
      g.fillStyle(COL.hair); g.fillRect(19, 8, 26, 10);
      g.fillCircle(19, 12, 5); g.fillCircle(45, 12, 5);
      // Red fever cheeks
      g.fillStyle(0xFF8888, 0.55); g.fillCircle(24, 22, 6); g.fillCircle(40, 22, 6);
      // Sweat drops
      g.fillStyle(0x88CCFF, 0.9);
      g.fillTriangle(44, 8, 40, 4, 48, 4);
      g.fillCircle(44, 10, 3);
      // Worried mouth
      g.lineStyle(1.5, 0x884444); g.beginPath(); g.arc(32, 26, 4, Math.PI * 0.15, Math.PI * 0.85, true); g.strokePath();
      break;
    }
    case 'bandaged': {
      base(g);
      g.fillStyle(COL.hair); g.fillRect(20, 8, 24, 9); g.fillCircle(20, 12, 5); g.fillCircle(44, 12, 5);
      // White bandage on leg
      g.fillStyle(COL.white); g.fillRect(14, 68, 14, 22);
      for (let y = 68; y < 90; y += 6) { g.lineStyle(1, COL.grey, 0.5); g.lineBetween(14, y, 28, y); }
      g.lineStyle(1.5, COL.grey); g.strokeRect(14, 68, 14, 22);
      // Neutral mouth
      g.lineStyle(1.5, 0x664433); g.lineBetween(28, 26, 36, 26);
      break;
    }
    case 'elderly': {
      base(g);
      // White hair
      g.fillStyle(0xEEEEEE); g.fillRect(20, 8, 24, 10); g.fillCircle(20, 13, 5); g.fillCircle(44, 13, 5);
      // Wrinkles
      g.lineStyle(1, 0xBB9977, 0.7);
      g.lineBetween(24, 20, 29, 21); g.lineBetween(35, 20, 40, 21);
      g.lineBetween(26, 26, 38, 26);
      // Cane
      g.lineStyle(3, 0x886655); g.lineBetween(54, 32, 58, 88); g.lineBetween(54, 32, 62, 28);
      break;
    }
    case 'ventilator': {
      base(g);
      g.fillStyle(0x334455); g.fillRect(20, 8, 24, 10); g.fillCircle(20, 12, 5); g.fillCircle(44, 12, 5);
      // Oxygen mask
      g.fillStyle(0x4466AA, 0.8); g.fillRoundedRect(20, 18, 24, 14, 4);
      g.fillStyle(0x88AACC, 0.4); g.fillRoundedRect(22, 20, 20, 10, 3);
      // Tube to ventilator
      g.lineStyle(3, 0x8899BB); g.lineBetween(44, 25, 64, 25);
      // Ventilator box
      g.fillStyle(0x445566); g.fillRect(54, 18, 10, 16);
      g.fillStyle(0x00FF88, 0.8); g.fillRect(56, 20, 6, 4);
      // Eyes open wide (concerned)
      g.fillStyle(0x222222); g.fillCircle(27, 17, 2.5); g.fillCircle(37, 17, 2.5);
      break;
    }
    case 'icu': {
      base(g);
      g.fillStyle(0x222233); g.fillRect(20, 8, 24, 9); g.fillCircle(20, 12, 5); g.fillCircle(44, 12, 5);
      // Multiple IV lines
      g.lineStyle(2, 0xFF4444, 0.9); g.lineBetween(50, 36, 64, 24);
      g.lineStyle(2, 0x4444FF, 0.9); g.lineBetween(50, 42, 64, 36);
      g.lineStyle(2, 0x44BB44, 0.7); g.lineBetween(50, 48, 64, 48);
      // ECG leads
      g.lineStyle(1.5, 0xFFAA00, 0.7); g.lineBetween(22, 40, 8, 40);
      // Monitoring badge
      g.fillStyle(0xFF4444, 0.9); g.fillRect(16, 32, 8, 6);
      // Serious eyes
      g.fillStyle(0x222222); g.fillCircle(27, 19, 2); g.fillCircle(37, 19, 2);
      g.lineStyle(1.5, 0x443333); g.lineBetween(28, 26, 36, 26);
      break;
    }
    case 'critical': {
      base(g);
      // Pale/grey skin override
      g.fillStyle(0xEEDDCC); g.fillCircle(32, 20, 14);
      g.lineStyle(1.5, 0xBBAA99); g.strokeCircle(32, 20, 14);
      g.fillStyle(0x222222); g.fillCircle(27, 19, 2); g.fillCircle(37, 19, 2);
      // Grey hair
      g.fillStyle(0x888888); g.fillRect(20, 8, 24, 9); g.fillCircle(20, 12, 5); g.fillCircle(44, 12, 5);
      // Multiple lines and tubes
      g.lineStyle(2, 0xFF4444); g.lineBetween(48, 34, 64, 22);
      g.lineStyle(2, 0x4466FF); g.lineBetween(48, 40, 64, 32);
      g.lineStyle(2, 0xFFAA00); g.lineBetween(48, 46, 64, 42);
      // Sad mouth
      g.lineStyle(1.5, 0x664444); g.beginPath(); g.arc(32, 28, 4, Math.PI * 0.15, Math.PI * 0.85, true); g.strokePath();
      // Red danger badge
      g.fillStyle(0xFF0000, 0.9); g.fillCircle(10, 12, 7);
      g.lineStyle(2, 0xFFFFFF); g.lineBetween(10, 8, 10, 16); g.fillCircle(10, 17, 2);
      break;
    }
    case 'abdominal': {
      base(g);
      g.fillStyle(COL.hair); g.fillRect(20, 8, 24, 10); g.fillCircle(20, 13, 5); g.fillCircle(44, 13, 5);
      // Abdominal wound bandage
      g.fillStyle(COL.white); g.fillRect(12, 44, 40, 16);
      for (let y = 44; y < 60; y += 4) { g.lineStyle(1, COL.grey, 0.4); g.lineBetween(12, y, 52, y); }
      g.lineStyle(1.5, COL.grey); g.strokeRect(12, 44, 40, 16);
      // Small red dot (surgical site)
      g.fillStyle(0xFF4444, 0.7); g.fillCircle(32, 52, 4);
      // Neutral expression
      g.lineStyle(1.5, 0x664433); g.lineBetween(28, 26, 36, 26);
      break;
    }
  }
}

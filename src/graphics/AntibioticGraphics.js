import { ANTIBIOTICS } from '../config/AntibioticsData.js';

// Phaser 3 does not have fillArc or fillStar — use these helpers
function fillArc(g, x, y, radius, startAngle, endAngle, anticlockwise) {
  g.beginPath();
  g.moveTo(x, y);
  g.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  g.fillPath();
}

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

// Generates one texture per antibiotic style
export function generateAntibioticTextures(scene) {
  const g = scene.add.graphics();

  ANTIBIOTICS.forEach(ab => {
    g.clear();
    _drawAntibiotic(g, ab);
    g.generateTexture(`ab_${ab.id}`, 56, 72);
  });

  g.destroy();
}

function hex(c) { return c; }

function _drawAntibiotic(g, ab) {
  const col = ab.color;
  const isGold = ab.gold;

  switch (ab.style) {
    case 'iv_bag':      _ivBag(g, col, isGold); break;
    case 'syringe':     _syringe(g, col, isGold); break;
    case 'gold_syringe':_syringe(g, col, true); break;
    case 'capsule':     _capsule(g, col, isGold); break;
    case 'vial':        _vial(g, col, isGold); break;
    case 'double_syringe': _doubleSyringe(g, col); break;
    case 'pill':        _pill(g, col); break;
    case 'tablet':      _tablet(g, col); break;
    default:            _ivBag(g, col, isGold);
  }

  if (isGold) _goldGlow(g);
}

function _ivBag(g, col, gold) {
  // Bag body
  g.fillStyle(col, 0.85);
  g.fillRoundedRect(8, 16, 40, 50, 8);
  // Highlight
  g.fillStyle(0xFFFFFF, 0.25); g.fillRoundedRect(12, 20, 14, 20, 4);
  // Outline
  g.lineStyle(2, _darken(col)); g.strokeRoundedRect(8, 16, 40, 50, 8);
  // Hanger loop
  g.lineStyle(3, _darken(col)); g.strokeCircle(28, 10, 8);
  g.fillStyle(_darken(col)); g.fillCircle(28, 10, 4);
  // Tube connector
  g.fillStyle(0xCCCCCC); g.fillRect(24, 64, 8, 8);
  if (gold) {
    g.lineStyle(2, 0xFFAA00, 0.8); g.strokeRoundedRect(8, 16, 40, 50, 8);
  }
}

function _syringe(g, col, gold) {
  // Barrel
  g.fillStyle(col, 0.8); g.fillRoundedRect(12, 8, 32, 48, 4);
  g.fillStyle(0xFFFFFF, 0.2); g.fillRect(16, 12, 10, 36);
  g.lineStyle(2, _darken(col)); g.strokeRoundedRect(12, 8, 32, 48, 4);
  // Plunger
  g.fillStyle(0xDDDDDD); g.fillRect(24, 4, 8, 10);
  g.fillStyle(0xEE4444); g.fillRect(20, 4, 16, 4);
  // Needle
  g.fillStyle(0xBBBBCC); g.fillRect(25, 56, 6, 14);
  g.fillStyle(0xAABBCC); g.fillRect(26, 68, 4, 4);
  // Scale marks
  g.lineStyle(1, _darken(col), 0.6);
  for (let i = 0; i < 4; i++) g.lineBetween(12, 18 + i * 10, 20, 18 + i * 10);
  if (gold) {
    g.lineStyle(2.5, 0xFFD700, 0.9); g.strokeRoundedRect(12, 8, 32, 48, 4);
    g.fillStyle(0xFFD700, 0.15); g.fillRoundedRect(12, 8, 32, 48, 4);
  }
}

function _doubleSyringe(g, col) {
  // Two overlapping syringes (gold)
  // Back syringe (offset)
  g.fillStyle(0xFFCC44, 0.6); g.fillRoundedRect(18, 6, 28, 44, 4);
  g.lineStyle(1.5, 0xCC8800); g.strokeRoundedRect(18, 6, 28, 44, 4);
  // Front syringe
  g.fillStyle(col, 0.9); g.fillRoundedRect(10, 12, 28, 46, 4);
  g.fillStyle(0xFFFFFF, 0.3); g.fillRect(14, 16, 8, 34);
  g.lineStyle(2.5, 0xFFAA00); g.strokeRoundedRect(10, 12, 28, 46, 4);
  // Needles
  g.fillStyle(0xBBBBCC); g.fillRect(21, 56, 5, 12); g.fillRect(29, 50, 5, 12);
  // Gold glow
  _goldGlow(g);
}

function _capsule(g, col) {
  // Two-tone capsule
  const light = _lighten(col);
  g.fillStyle(0xFFFFFF); g.fillRoundedRect(14, 10, 28, 52, 14);
  // Top half
  g.fillStyle(col); g.fillRoundedRect(14, 10, 28, 30, { tl: 14, tr: 14, bl: 0, br: 0 });
  // Bottom half
  g.fillStyle(light); g.fillRoundedRect(14, 38, 28, 26, { tl: 0, tr: 0, bl: 14, br: 14 });
  // Shine
  g.fillStyle(0xFFFFFF, 0.3); g.fillRoundedRect(18, 14, 10, 22, 6);
  g.lineStyle(2, _darken(col)); g.strokeRoundedRect(14, 10, 28, 52, 14);
}

function _vial(g, col) {
  // Scientific vial (FDC - iron-siderophore)
  g.fillStyle(0xDDEEFF, 0.7); g.fillRect(18, 12, 20, 48);
  // Content
  g.fillStyle(col, 0.75); g.fillRect(20, 30, 16, 28);
  // Cap
  g.fillStyle(_darken(col)); g.fillRoundedRect(16, 6, 24, 12, 4);
  g.fillStyle(col, 0.5); g.fillRect(20, 18, 16, 14);
  // Label
  g.fillStyle(0xFFFFFF, 0.8); g.fillRect(20, 34, 16, 16);
  // Comet sparkle (iron receptor motif)
  g.fillStyle(0xFFAA00, 0.9); g.fillTriangle(28, 26, 24, 34, 32, 34);
  g.lineStyle(2, _darken(col)); g.strokeRect(18, 12, 20, 48);
  // Neck
  g.fillStyle(0xCCDDEE, 0.9); g.fillRect(22, 8, 12, 8);
}

function _pill(g, col) {
  // Round pill (SUL-DUR - grey, always wrong)
  g.fillStyle(col); g.fillCircle(28, 32, 20);
  g.fillStyle(0x000000, 0.15); fillArc(g, 28, 32, 20, 0, Math.PI, false);
  g.fillStyle(0xFFFFFF, 0.15); fillArc(g, 28, 32, 20, Math.PI, Math.PI * 2, false);
  g.lineStyle(2.5, _darken(col)); g.strokeCircle(28, 32, 20);
  // X mark (warning)
  g.lineStyle(3, 0xFF4444, 0.8);
  g.lineBetween(20, 24, 36, 40); g.lineBetween(36, 24, 20, 40);
}

function _tablet(g, col) {
  // Flat tablet (ERV - teal, tetracycline class)
  g.fillStyle(col, 0.85); g.fillRoundedRect(10, 18, 36, 36, 8);
  g.fillStyle(0xFFFFFF, 0.2); g.fillRoundedRect(14, 22, 12, 14, 4);
  g.lineStyle(2, _darken(col)); g.strokeRoundedRect(10, 18, 36, 36, 8);
  // Score line
  g.lineStyle(1.5, _darken(col), 0.6); g.lineBetween(28, 22, 28, 50);
  // T mark (tetracycline)
  g.lineStyle(2.5, 0xFFFFFF, 0.7);
  g.lineBetween(20, 30, 36, 30); g.lineBetween(28, 30, 28, 46);
}

function _goldGlow(g) {
  // Pulsing gold outline effect
  g.lineStyle(3, 0xFFD700, 0.7); g.strokeRoundedRect(4, 4, 48, 64, 8);
  g.lineStyle(1, 0xFFEE88, 0.4); g.strokeRoundedRect(1, 1, 54, 70, 10);
  // Stars
  g.fillStyle(0xFFFF88, 0.9);
  fillStar(g, 8,  8,  5, 4, 2, 0);
  fillStar(g, 48, 8,  5, 4, 2, 0);
  fillStar(g, 8,  64, 5, 4, 2, 0);
  fillStar(g, 48, 64, 5, 4, 2, 0);
}

function _darken(hex, amt = 0x444444) {
  const r = Math.max(0, ((hex >> 16) & 0xFF) - ((amt >> 16) & 0xFF));
  const gv = Math.max(0, ((hex >> 8)  & 0xFF) - ((amt >> 8)  & 0xFF));
  const b = Math.max(0, ( hex        & 0xFF) - ( amt        & 0xFF));
  return (r << 16) | (gv << 8) | b;
}

function _lighten(hex, amt = 0x303030) {
  const r = Math.min(255, ((hex >> 16) & 0xFF) + ((amt >> 16) & 0xFF));
  const gv = Math.min(255, ((hex >> 8)  & 0xFF) + ((amt >> 8)  & 0xFF));
  const b = Math.min(255, ( hex        & 0xFF) + ( amt        & 0xFF));
  return (r << 16) | (gv << 8) | b;
}

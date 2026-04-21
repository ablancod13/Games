import { W, H, GROUND_Y } from '../config/GameConfig.js';

// Generates hospital environment textures: background layers, ground, obstacles
export function generateHospitalTextures(scene) {
  _genBgFar(scene);
  _genBgMid(scene);
  _genBgNear(scene);
  _genGround(scene);
  _genObstacles(scene);
  _genCoin(scene);
  _genMicrobes(scene);
}

function _genBgFar(scene) {
  const TW = 960, TH = H;
  const g = scene.add.graphics();

  // Wall base
  g.fillStyle(0xE8EEF5); g.fillRect(0, 0, TW, TH);

  // Wainscoting (dado rail zone)
  g.fillStyle(0xC8D8E8); g.fillRect(0, GROUND_Y - 30, TW, 30);
  g.fillStyle(0xAABBCC); g.fillRect(0, GROUND_Y - 35, TW, 5);

  // Ceiling strip
  g.fillStyle(0xD0DCE8); g.fillRect(0, 0, TW, 60);
  g.fillStyle(0xB8C8D8); g.fillRect(0, 58, TW, 4);

  // Ceiling lights (recessed panels)
  for (let x = 80; x < TW; x += 200) {
    g.fillStyle(0xFFFFF0); g.fillRect(x, 8, 80, 20);
    g.fillStyle(0xFFFFCC, 0.8); g.fillRect(x + 2, 10, 76, 16);
    g.lineStyle(1, 0x8899AA); g.strokeRect(x, 8, 80, 20);
  }

  // Wall tiles (subtle grid)
  g.lineStyle(0.5, 0xCCDDEE, 0.4);
  for (let x = 0; x < TW; x += 80) { g.lineBetween(x, 60, x, GROUND_Y - 35); }
  for (let y = 100; y < GROUND_Y - 35; y += 80) { g.lineBetween(0, y, TW, y); }

  // Doors
  const doorPositions = [100, 380, 660, 900];
  doorPositions.forEach(dx => {
    // Door frame
    g.fillStyle(0x8899BB); g.fillRect(dx - 5, GROUND_Y - 280, 90, 250);
    g.fillStyle(0xA8B8D0); g.fillRect(dx, GROUND_Y - 275, 80, 240);
    // Door panel
    g.fillStyle(0x9AAABB); g.fillRect(dx + 8, GROUND_Y - 260, 28, 100);
    g.fillStyle(0x9AAABB); g.fillRect(dx + 44, GROUND_Y - 260, 28, 100);
    g.fillStyle(0x9AAABB); g.fillRect(dx + 8, GROUND_Y - 150, 28, 60);
    g.fillStyle(0x9AAABB); g.fillRect(dx + 44, GROUND_Y - 150, 28, 60);
    // Handle
    g.fillStyle(0xCCBB88); g.fillCircle(dx + 70, GROUND_Y - 160, 6);
    g.lineStyle(1, 0x7788AA); g.strokeRect(dx - 5, GROUND_Y - 280, 90, 250);
  });

  // Medical posters / signs
  _drawPoster(g, 220, 140, 120, 90, 'HIGIENE\nDE MANOS', 0x4488CC);
  _drawPoster(g, 520, 130, 110, 80, 'ZONA UCI\n★', 0xCC4444);
  _drawPoster(g, 800, 145, 130, 85, 'RESISTENCIAS\nBANDERA ROJA', 0xFF8800);

  // Windows with frosted effect
  [260, 580].forEach(wx => {
    g.fillStyle(0xAACCEE); g.fillRect(wx, 90, 100, 80);
    g.fillStyle(0xCCEEFF, 0.7); g.fillRect(wx + 4, 94, 92, 72);
    // Window panes
    g.lineStyle(2, 0x8AABCC); g.lineBetween(wx + 50, 94, wx + 50, 166);
    g.lineBetween(wx + 4, 130, wx + 96, 130);
    g.lineStyle(2, 0x6688AA); g.strokeRect(wx, 90, 100, 80);
  });

  g.generateTexture('bg_far', TW, TH);
  g.destroy();
}

function _drawPoster(g, x, y, w, h, text, bgColor) {
  g.fillStyle(bgColor); g.fillRect(x, y, w, h);
  g.fillStyle(0xFFFFFF, 0.15); g.fillRect(x + 2, y + 2, w - 4, 18);
  g.lineStyle(2, 0xFFFFFF, 0.5); g.strokeRect(x, y, w, h);
  // Red cross icon
  g.fillStyle(0xFF4444, 0.9);
  g.fillRect(x + w/2 - 3, y + h/2 - 12, 6, 20);
  g.fillRect(x + w/2 - 10, y + h/2 - 5, 20, 6);
}

function _genBgMid(scene) {
  const TW = 480, TH = H;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0); g.fillRect(0, 0, TW, TH);

  // Equipment trolleys
  [60, 300].forEach(tx => {
    // Trolley base
    g.fillStyle(0x7799BB, 0.7); g.fillRect(tx, GROUND_Y - 120, 70, 90);
    g.fillStyle(0x9ABBDD, 0.7); g.fillRect(tx + 4, GROUND_Y - 116, 62, 82);
    // Drawers
    g.lineStyle(1, 0x5577AA, 0.8);
    for (let i = 0; i < 3; i++) g.strokeRect(tx + 6, GROUND_Y - 110 + i * 26, 58, 22);
    // Handles
    g.fillStyle(0xCCBB88, 0.9);
    for (let i = 0; i < 3; i++) g.fillRect(tx + 26, GROUND_Y - 104 + i * 26, 18, 4);
    // Wheels
    g.fillStyle(0x334455, 0.8);
    g.fillCircle(tx + 12, GROUND_Y - 2, 7); g.fillCircle(tx + 58, GROUND_Y - 2, 7);
  });

  // Wall notice boards
  g.fillStyle(0x88AA66, 0.8); g.fillRect(150, 100, 160, 120);
  g.fillStyle(0x99BB77, 0.6); g.fillRect(155, 105, 150, 110);
  g.lineStyle(2, 0x557744, 0.9); g.strokeRect(150, 100, 160, 120);
  // Notice pins
  [170, 210, 260, 290].forEach(px => {
    g.fillStyle(0xFF4444); g.fillCircle(px, 118, 4);
    g.fillStyle(0xFFFFEE, 0.8); g.fillRect(px - 16, 122, 32, 8);
    g.fillStyle(0xFFFFEE, 0.6); g.fillRect(px - 12, 134, 24, 6);
  });

  // IV pole stand (decorative mid-layer)
  g.fillStyle(0xBBBBCC, 0.6); g.fillRect(410, 60, 8, GROUND_Y - 80);
  g.fillStyle(0xCCCCDD, 0.6); g.fillRect(400, 60, 28, 8);

  g.generateTexture('bg_mid', TW, TH);
  g.destroy();
}

function _genBgNear(scene) {
  const TW = 240, TH = H;
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0); g.fillRect(0, 0, TW, TH);

  // Floor tiles (near layer, high contrast)
  const tileH = 36, tileW = 80;
  for (let x = 0; x < TW; x += tileW) {
    for (let y = GROUND_Y; y < TH; y += tileH) {
      const shade = ((x / tileW + y / tileH) % 2 === 0) ? 0xDDE5EE : 0xCCD4DD;
      g.fillStyle(shade); g.fillRect(x, y, tileW, tileH);
      g.lineStyle(1, 0xBBCCDD, 0.8); g.strokeRect(x, y, tileW, tileH);
    }
  }

  // Floor reflection strip
  g.fillStyle(0xEEF4FF, 0.3); g.fillRect(0, GROUND_Y, TW, 6);

  // Speed lines (subtle, near wall)
  g.lineStyle(1, 0xCCDDEE, 0.2);
  for (let y = 80; y < GROUND_Y - 40; y += 30) {
    g.lineBetween(0, y, TW, y);
  }

  g.generateTexture('bg_near', TW, TH);
  g.destroy();
}

function _genGround(scene) {
  const g = scene.add.graphics();
  // Thick floor line
  g.fillStyle(0xBBCCDD); g.fillRect(0, 0, W, 8);
  g.fillStyle(0xAABBCC); g.fillRect(0, 8, W, 4);
  g.generateTexture('ground_line', W, 12);
  g.destroy();
}

function _genObstacles(scene) {
  const g = scene.add.graphics();

  // Hospital bed
  g.clear();
  g.fillStyle(0xFFFFFF); g.fillRect(0, 10, 100, 50);
  g.fillStyle(0xEEEEFF); g.fillRect(0, 10, 30, 50); // headboard
  g.fillStyle(0xDDDDEE); g.fillRect(70, 10, 30, 50); // footboard
  g.fillStyle(0x88AACC); g.fillRect(30, 20, 40, 30); // sheets
  // Pillow
  g.fillStyle(0xFFFFEE); g.fillRect(6, 14, 24, 18);
  g.lineStyle(1, 0xBBBBCC); g.strokeRect(0, 10, 100, 50);
  // Legs
  g.fillStyle(0x999999);
  g.fillRect(6, 58, 8, 14); g.fillRect(86, 58, 8, 14);
  // Wheels
  g.fillStyle(0x555555); g.fillCircle(10, 72, 5); g.fillCircle(90, 72, 5);
  // Rails
  g.lineStyle(2, 0xAAAAAA); g.lineBetween(0, 15, 0, 58); g.lineBetween(100, 15, 100, 58);
  g.generateTexture('obs_bed', 102, 76);

  // IV Pole
  g.clear();
  g.fillStyle(0xBBBBCC); g.fillRect(13, 0, 8, 120);
  g.fillStyle(0x999999); g.fillRect(4, 0, 26, 8);
  // IV bag
  g.fillStyle(0xDDEEFF); g.fillRect(6, 10, 22, 30);
  g.fillStyle(0xCCDDFF); g.fillRect(8, 12, 18, 26);
  g.lineStyle(1.5, 0x8899BB); g.strokeRect(6, 10, 22, 30);
  // Tube
  g.lineStyle(2, 0xAABBCC); g.lineBetween(17, 40, 17, 120);
  // Base cross
  g.fillStyle(0x777788); g.fillRect(0, 112, 34, 8); g.fillRect(13, 108, 8, 20);
  // Wheels
  g.fillStyle(0x444455); g.fillCircle(4, 120, 5); g.fillCircle(30, 120, 5);
  g.generateTexture('obs_ivpole', 34, 126);

  // Wheelchair
  g.clear();
  // Seat
  g.fillStyle(0xAABBCC); g.fillRect(16, 20, 50, 20);
  // Backrest
  g.fillStyle(0x9AABBC); g.fillRect(56, 0, 12, 24);
  // Big wheels
  g.lineStyle(6, 0x555566); g.strokeCircle(24, 58, 22);
  g.lineStyle(6, 0x555566); g.strokeCircle(60, 58, 22);
  g.fillStyle(0x777788); g.fillCircle(24, 58, 5); g.fillCircle(60, 58, 5);
  // Spokes
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    g.lineStyle(2, 0x666677);
    g.lineBetween(24 + Math.cos(a) * 5, 58 + Math.sin(a) * 5, 24 + Math.cos(a) * 18, 58 + Math.sin(a) * 18);
    g.lineBetween(60 + Math.cos(a) * 5, 58 + Math.sin(a) * 5, 60 + Math.cos(a) * 18, 58 + Math.sin(a) * 18);
  }
  // Small front wheel
  g.lineStyle(3, 0x555566); g.strokeCircle(16, 70, 8);
  // Footrest
  g.fillStyle(0x8899AA); g.fillRect(8, 38, 50, 6);
  g.generateTexture('obs_wheelchair', 84, 82);

  // Medical cart
  g.clear();
  g.fillStyle(0x4477BB); g.fillRect(0, 0, 70, 80);
  g.fillStyle(0x5588CC); g.fillRect(4, 4, 62, 72);
  // Drawers
  g.lineStyle(1.5, 0x2255AA);
  for (let i = 0; i < 3; i++) {
    g.strokeRect(8, 8 + i * 24, 54, 20);
    g.fillStyle(0xBBCCDD); g.fillRect(24, 14 + i * 24, 22, 6);
  }
  // Top tray
  g.fillStyle(0x99BBDD); g.fillRect(0, -10, 70, 12);
  g.fillStyle(0xAACCEE, 0.5); g.fillRect(4, -8, 62, 8);
  // Wheels
  g.fillStyle(0x333344); g.fillCircle(12, 80, 8); g.fillCircle(58, 80, 8);
  g.generateTexture('obs_cart', 72, 90);

  // Bioscreen / privacy screen
  g.clear();
  g.fillStyle(0x88AACC, 0.85); g.fillRect(0, 0, 10, 100);
  g.fillStyle(0x99BBDD, 0.85); g.fillRect(10, 0, 50, 100);
  g.fillStyle(0xAABBCC, 0.85); g.fillRect(60, 0, 10, 100);
  g.lineStyle(2, 0x5577AA); g.strokeRect(0, 0, 70, 100);
  // Horizontal rails
  g.lineStyle(2, 0x6688BB); g.lineBetween(0, 12, 70, 12); g.lineBetween(0, 88, 70, 88);
  // Caster base
  g.fillStyle(0x666677); g.fillRect(5, 100, 12, 8); g.fillRect(53, 100, 12, 8);
  g.generateTexture('obs_screen', 72, 110);

  g.destroy();
}

function _genCoin(scene) {
  const g = scene.add.graphics();
  // Coreimcito - golden coin with DNA helix motif
  g.fillStyle(0xFFD700); g.fillCircle(14, 14, 13);
  g.fillStyle(0xFFAA00); g.fillCircle(14, 14, 10);
  g.fillStyle(0xFFCC00); g.fillCircle(14, 14, 7);
  // DNA cross
  g.lineStyle(2, 0xFFEE44, 0.9);
  g.lineBetween(9, 9, 19, 19); g.lineBetween(19, 9, 9, 19);
  // Outer ring
  g.lineStyle(2, 0xCC8800); g.strokeCircle(14, 14, 13);
  g.generateTexture('coin', 28, 28);
  g.destroy();
}

function _genMicrobes(scene) {
  const g = scene.add.graphics();
  // Background floating microbe sprite (subtle)
  g.fillStyle(0x4499CC, 0.3); g.fillCircle(16, 16, 12);
  g.fillStyle(0x66BBEE, 0.2); g.fillCircle(16, 16, 8);
  // Flagella
  g.lineStyle(1.5, 0x4499CC, 0.25);
  g.lineBetween(28, 16, 44, 10); g.lineBetween(28, 16, 44, 22);
  g.lineBetween(4,  16, -12, 10); g.lineBetween(4, 16, -12, 22);
  g.generateTexture('microbe_bg', 48, 32);
  g.destroy();
}

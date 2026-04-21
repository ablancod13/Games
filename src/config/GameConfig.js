export const W = 480;
export const H = 854;
export const GROUND_Y = H - 130;
export const PLAYER_X = 110;

export const C = {
  // Canvas
  W,
  H,
  GROUND_Y,
  PLAYER_X,

  // Physics
  GRAVITY: 1400,
  JUMP_VEL: -760,
  DOUBLE_JUMP_VEL: -640,
  SLIDE_DURATION: 650,

  // Runner speed (pixels/sec)
  INITIAL_SPEED: 260,
  MAX_SPEED: 700,
  // Speed gained per meter travelled
  SPEED_PER_METER: 0.06,

  // 1 game-meter = this many pixels of world scroll
  PIXELS_PER_METER: 10,

  // Obstacle spacing (pixels between spawn points)
  MIN_OBS_GAP: 380,
  MAX_OBS_GAP: 720,

  // Corridor coin spacing (pixels)
  COIN_SPACING: 220,

  // Patient encounter distance range (meters)
  PATIENT_MIN_DIST: 300,
  PATIENT_MAX_DIST: 600,

  // Antibiotic phase duration (ms)
  PHASE_DURATION: 18000,

  // Falling antibiotic speed (px/s)
  AB_FALL_BASE: 170,
  AB_FALL_MAX: 340,

  // Economy
  COINS_PER_100M: 1,

  // Streak thresholds and multipliers
  STREAK_THRESHOLDS: [3, 5, 10],
  STREAK_MULTIPLIERS: [2, 3, 5],

  // Player body dimensions
  DOCTOR_W: 48,
  DOCTOR_H: 82,
  DOCTOR_SLIDE_W: 76,
  DOCTOR_SLIDE_H: 42,
};

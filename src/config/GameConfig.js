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
  SPEED_PER_METER: 0.06,

  PIXELS_PER_METER: 10,

  // Obstacle spacing — wider gaps so obstacles are less frequent
  MIN_OBS_GAP: 620,
  MAX_OBS_GAP: 1100,

  // Corridor coin spacing (pixels)
  COIN_SPACING: 280,

  // Patient encounter distance range (meters) — more frequent
  PATIENT_MIN_DIST: 150,
  PATIENT_MAX_DIST: 320,

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

  // Lives system
  MAX_LIVES: 3,
  OBS_HITS_PER_LIFE: 3,   // obstacle hits needed to lose 1 life
};

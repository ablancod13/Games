export const MECHANISMS = {
  BLEE:  { name: 'BLEE',    fullName: 'Betalactamasas de espectro extendido',   color: 0x44BB44, badge: '🟢' },
  AmpC:  { name: 'AmpC',    fullName: 'Cefalosporinasas AmpC inducibles',        color: 0x4488FF, badge: '🔵' },
  KPC:   { name: 'KPC',     fullName: 'Carbapenemasa clase A (KPC/IMI)',          color: 0xFFAA00, badge: '🟠' },
  MBL:   { name: 'MBL',     fullName: 'Metalobetalactamasas (NDM/VIM/IMP)',       color: 0xFF4444, badge: '🔴' },
  OXA48: { name: 'OXA-48',  fullName: 'Oxacilinasa clase D (OXA-48)',             color: 0xAA44FF, badge: '🟣' },
};

// score values: +1 active, 0 variable, -2 not recommended
export const ANTIBIOTICS = [
  {
    id: 'TOL_TAZ',
    name: 'Ceftolozano-tazobactam',
    abbrev: 'TOL-TAZ',
    color: 0xFF8C00,
    style: 'iv_bag',
    scores: { BLEE: 1, AmpC: 0, KPC: -2, MBL: -2, OXA48: -2 },
  },
  {
    id: 'CAZ_AVI',
    name: 'Ceftazidima-avibactam',
    abbrev: 'CAZ-AVI',
    color: 0x4499FF,
    style: 'syringe',
    scores: { BLEE: 1, AmpC: 1, KPC: 1, MBL: -2, OXA48: 1 },
  },
  {
    id: 'MER_VAB',
    name: 'Meropenem-vaborbactam',
    abbrev: 'MER-VAB',
    color: 0xFFDD00,
    style: 'iv_bag',
    scores: { BLEE: 1, AmpC: 1, KPC: 1, MBL: -2, OXA48: -2 },
  },
  {
    id: 'IMI_REL',
    name: 'Imipenem-relebactam',
    abbrev: 'IMI-REL',
    color: 0x44CC44,
    style: 'capsule',
    scores: { BLEE: 1, AmpC: 1, KPC: 1, MBL: -2, OXA48: -2 },
  },
  {
    id: 'FDC',
    name: 'Cefiderocol',
    abbrev: 'FDC',
    color: 0xBB44FF,
    style: 'vial',
    scores: { BLEE: 1, AmpC: 1, KPC: 0, MBL: 0, OXA48: 0 },
  },
  {
    id: 'CAZ_AVI_ATM',
    name: 'CAZ-AVI + Aztreonam',
    abbrev: 'CAZ+ATM',
    color: 0xFFD700,
    style: 'double_syringe',
    gold: true,
    scores: { BLEE: 1, AmpC: 1, KPC: 1, MBL: 1, OXA48: 1 },
  },
  {
    id: 'ATM_AVI',
    name: 'Aztreonam-avibactam',
    abbrev: 'ATM-AVI',
    color: 0xFFD700,
    style: 'gold_syringe',
    gold: true,
    scores: { BLEE: 1, AmpC: 1, KPC: 1, MBL: 1, OXA48: 1 },
  },
  {
    id: 'FEP_ENM',
    name: 'Cefepima-enmetazobactam',
    abbrev: 'FEP-ENM',
    color: 0xDDDDDD,
    style: 'iv_bag',
    scores: { BLEE: 1, AmpC: 1, KPC: -2, MBL: -2, OXA48: 0 },
  },
  {
    id: 'SUL_DUR',
    name: 'Sulbactam-durlobactam',
    abbrev: 'SUL-DUR',
    color: 0x999999,
    style: 'pill',
    scores: { BLEE: -2, AmpC: -2, KPC: -2, MBL: -2, OXA48: -2 },
  },
  {
    id: 'ERV',
    name: 'Eravaciclina',
    abbrev: 'ERV',
    color: 0x00CED1,
    style: 'tablet',
    scores: { BLEE: 1, AmpC: 1, KPC: 0, MBL: 0, OXA48: 0 },
  },
];

export const LEVELS = [
  { level: 1,  name: 'El Enemigo Clásico',        mechanisms: ['BLEE'],                               distMin: 0,    distMax: 500   },
  { level: 2,  name: 'La Cefalosporinasa',         mechanisms: ['AmpC'],                               distMin: 500,  distMax: 1000  },
  { level: 3,  name: 'Carbapenemasa Serina',       mechanisms: ['KPC'],                                distMin: 1000, distMax: 1500  },
  { level: 4,  name: 'La Oxacilinasa',             mechanisms: ['OXA48'],                              distMin: 1500, distMax: 2000  },
  { level: 5,  name: 'La Metalo-BL',               mechanisms: ['MBL'],                                distMin: 2000, distMax: 2500  },
  { level: 6,  name: 'KPC + OXA-48',               mechanisms: ['KPC', 'OXA48'],                       distMin: 2500, distMax: 3000  },
  { level: 7,  name: 'KPC + MBL',                  mechanisms: ['KPC', 'MBL'],                         distMin: 3000, distMax: 3500  },
  { level: 8,  name: 'OXA-48 + MBL',               mechanisms: ['OXA48', 'MBL'],                       distMin: 3500, distMax: 4000  },
  { level: 9,  name: 'Triple Amenaza',              mechanisms: ['KPC', 'OXA48', 'MBL'],                distMin: 4000, distMax: 4500  },
  { level: 10, name: '☠ PANRESISTENTE',            mechanisms: ['BLEE', 'AmpC', 'KPC', 'MBL', 'OXA48'], distMin: 4500, distMax: Infinity },
];

/**
 * Returns the point delta for a given antibiotic against a set of mechanisms.
 * Multi-mechanism rule: any red → -2, all green → +1, mixed green/yellow → 0
 */
export function getScore(antibioticId, mechanisms) {
  const ab = ANTIBIOTICS.find(a => a.id === antibioticId);
  if (!ab) return 0;
  for (const m of mechanisms) {
    if ((ab.scores[m] ?? 0) < 0) return -2;
  }
  const allGreen = mechanisms.every(m => (ab.scores[m] ?? 0) > 0);
  return allGreen ? 1 : 0;
}

export function getLevelByDistance(dist) {
  return LEVELS.find(l => dist >= l.distMin && dist < l.distMax) || LEVELS[LEVELS.length - 1];
}

export function getAntibioticById(id) {
  return ANTIBIOTICS.find(a => a.id === id);
}

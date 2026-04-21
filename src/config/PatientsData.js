export const PATIENTS = [
  {
    id: 'ecoli_blee',
    label: 'E. coli BLEE',
    mechanisms: ['BLEE'],
    appearance: 'feverish',
    description: 'Betalactamasa de espectro extendido',
    levelMin: 1,
    organism: 'E. coli',
  },
  {
    id: 'enterobacter_ampc',
    label: 'Enterobacter spp. AmpC',
    mechanisms: ['AmpC'],
    appearance: 'abdominal',
    description: 'Cefalosporinasa AmpC inducible',
    levelMin: 2,
    organism: 'Enterobacter',
  },
  {
    id: 'kpneumo_kpc',
    label: 'K. pneumoniae KPC',
    mechanisms: ['KPC'],
    appearance: 'bandaged',
    description: 'Carbapenemasa Ambler clase A',
    levelMin: 3,
    organism: 'K. pneumoniae',
  },
  {
    id: 'kpneumo_oxa48',
    label: 'K. pneumoniae OXA-48',
    mechanisms: ['OXA48'],
    appearance: 'elderly',
    description: 'Oxacilinasa clase D',
    levelMin: 4,
    organism: 'K. pneumoniae',
  },
  {
    id: 'kpneumo_ndm',
    label: 'K. pneumoniae NDM',
    mechanisms: ['MBL'],
    appearance: 'ventilator',
    description: 'Metalobetalactamasa NDM',
    levelMin: 5,
    organism: 'K. pneumoniae',
  },
  {
    id: 'ecoli_vim',
    label: 'E. coli VIM',
    mechanisms: ['MBL'],
    appearance: 'ventilator',
    description: 'Metalobetalactamasa VIM',
    levelMin: 5,
    organism: 'E. coli',
  },
  {
    id: 'kpneumo_kpc_oxa',
    label: 'K. pneumoniae KPC+OXA-48',
    mechanisms: ['KPC', 'OXA48'],
    appearance: 'icu',
    description: 'Doble carbapenemasa (clase A + clase D)',
    levelMin: 6,
    organism: 'K. pneumoniae',
  },
  {
    id: 'ecoli_kpc_ndm',
    label: 'E. coli KPC+NDM',
    mechanisms: ['KPC', 'MBL'],
    appearance: 'critical',
    description: 'KPC + Metalobetalactamasa NDM',
    levelMin: 7,
    organism: 'E. coli',
  },
  {
    id: 'kpneumo_oxa_ndm',
    label: 'K. pneumoniae OXA-48+NDM',
    mechanisms: ['OXA48', 'MBL'],
    appearance: 'critical',
    description: 'OXA-48 + Metalobetalactamasa',
    levelMin: 8,
    organism: 'K. pneumoniae',
  },
  {
    id: 'kpneumo_triple',
    label: 'K. pneumoniae KPC+OXA+NDM',
    mechanisms: ['KPC', 'OXA48', 'MBL'],
    appearance: 'icu',
    description: 'Triple carbapenemasa',
    levelMin: 9,
    organism: 'K. pneumoniae',
  },
  {
    id: 'kpneumo_pan',
    label: 'K. pneumoniae XDR',
    mechanisms: ['BLEE', 'AmpC', 'KPC', 'MBL', 'OXA48'],
    appearance: 'critical',
    description: '¡Todos los mecanismos!',
    levelMin: 10,
    organism: 'K. pneumoniae',
  },
];

export function getPatientsForLevel(levelNum) {
  return PATIENTS.filter(p => p.levelMin <= levelNum);
}

export function getRandomPatientForLevel(levelNum) {
  const eligible = getPatientsForLevel(levelNum);
  return eligible[Math.floor(Math.random() * eligible.length)];
}

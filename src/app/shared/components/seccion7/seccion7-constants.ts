/**
 * Constantes compartidas para Sección 7 (PEA - Población Económicamente Activa)
 */

export const SECCION7_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'petTabla',
  'peaTabla',
  'peaOcupacionesTabla',
  'peaOcupadaTabla',
  'textoPEACompleto',
  'fotografiaPEA'
];

export const SECCION7_PHOTO_PREFIX = {
  PEA: 'fotografiaPEA'
} as const;

export const SECCION7_SECTION_ID = '3.1.4.A.1.3';
export const SECCION7_DEFAULT_SUBSECTION = '3.1.4.A.1.3';

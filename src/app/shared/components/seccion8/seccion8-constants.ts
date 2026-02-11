/**
 * Constantes compartidas para Sección 8 (Actividades Económicas)
 */

export const SECCION8_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'parrafoSeccion8_ganaderia_completo',
  'parrafoSeccion8_agricultura_completo',
  'peaOcupacionesTabla',
  'poblacionPecuariaTabla',
  'caracteristicasAgriculturaTabla',
  'fotografiaGanaderia',
  'fotografiaAgricultura',
  'fotografiaComercio'
];

export const SECCION8_PHOTO_PREFIXES = {
  GANADERIA: 'fotografiaGanaderia',
  AGRICULTURA: 'fotografiaAgricultura',
  COMERCIO: 'fotografiaComercio'
} as const;

export const SECCION8_SECTION_ID = '3.1.4.A.1.4';
export const SECCION8_DEFAULT_SUBSECTION = '3.1.4.A.1.4';

/**
 * Constantes compartidas para Sección 6 (Aspectos Demográficos)
 * Usadas en form y view para evitar duplicación
 */

export const SECCION6_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'poblacionSexoAISD',
  'poblacionEtarioAISD',
  'textoPoblacionSexoAISD',
  'textoPoblacionEtarioAISD',
  'fotografiaDemografia'
];

export const SECCION6_PHOTO_PREFIXES = {
  DEMOGRAFIA: 'fotografiaDemografia'
} as const;

export const SECCION6_SECTION_ID = '3.1.4';
export const SECCION6_DEFAULT_SUBSECTION = '3.1.4.A.1.2';

// Campos de tablas con prefijo dinámico
export const SECCION6_TABLE_FIELDS = {
  SEXO: 'poblacionSexoAISD',
  ETARIO: 'poblacionEtarioAISD',
  TEXTO_SEXO: 'textoPoblacionSexoAISD',
  TEXTO_ETARIO: 'textoPoblacionEtarioAISD',
  TITULO_SEXO: 'tituloPoblacionSexoAISD',
  TITULO_ETARIO: 'tituloPoblacionEtarioAISD',
  FUENTE_SEXO: 'fuentePoblacionSexoAISD',
  FUENTE_ETARIO: 'fuentePoblacionEtarioAISD'
} as const;

// Número máximo de fotos por grupo
export const SECCION6_MAX_PHOTOS = 10;

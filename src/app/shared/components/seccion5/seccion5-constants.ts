/**
 * ✅ SECCION5_CONSTANTS
 * Constantes centralizadas para Sección 5 - Institucionalidad AISD
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - IDs de sección
 */

export const SECCION5_WATCHED_FIELDS = [
  'parrafoSeccion5_institucionalidad',
  'institucionesSeccion5',
  'tituloInstituciones',
  'fuenteInstituciones',
  'grupoAISD',
  // Variantes con prefijos
  'parrafoSeccion5_institucionalidad_A1',
  'parrafoSeccion5_institucionalidad_A2',
  'institucionesSeccion5_A1',
  'institucionesSeccion5_A2',
  'tituloInstituciones_A1',
  'tituloInstituciones_A2',
  'fuenteInstituciones_A1',
  'fuenteInstituciones_A2',
  'grupoAISD_A1',
  'grupoAISD_A2',
  // Fotos con prefijos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaInstitucionalidad${i + 1}Imagen`),
];

export const SECCION5_PHOTO_PREFIX = {
  INSTITUCIONALIDAD: 'fotografiaInstitucionalidad'
} as const;

export const SECCION5_SECTION_ID = '3.1.4.A.1.1';
export const SECCION5_DEFAULT_SUBSECTION = '3.1.4.A.1.1';

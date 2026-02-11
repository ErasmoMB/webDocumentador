/**
 * ✅ SECCION4_CONSTANTS
 * Constantes centralizadas para Sección 4 - Caracterización Socioeconómica
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - IDs de sección
 */

export const SECCION4_WATCHED_FIELDS = [
  'tablaAISD1Datos',
  'tablaAISD2Datos',
  'tablaAISD1Datos_A1',
  'tablaAISD2Datos_A1',
  'tablaAISD1Datos_A2',
  'tablaAISD2Datos_A2',
  'parrafoSeccion4_introduccion_aisd',
  'parrafoSeccion4_comunidad_completo',
  'parrafoSeccion4_caracterizacion_indicadores',
  'cuadroTituloAISD1',
  'cuadroTituloAISD2',
  // Fotos con prefijos (10 máximo por tipo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaUbicacionReferencial${i + 1}Imagen`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPoblacionViviendas${i + 1}Imagen`),
];

export const SECCION4_PHOTO_PREFIXES = {
  UBICACION: 'fotografiaUbicacionReferencial',
  POBLACION: 'fotografiaPoblacionViviendas'
} as const;

export const SECCION4_SECTION_ID = '3.1.4';
export const SECCION4_DEFAULT_SUBSECTION = '3.1.4.A.1';

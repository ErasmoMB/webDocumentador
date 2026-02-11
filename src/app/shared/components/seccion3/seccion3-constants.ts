/**
 * ✅ SECCION3_CONSTANTS
 * Constantes centralizadas para Sección 3 - Características Sociodemográficas
 * - Campos observados para persistencia
 * - Configuración de fotos
 * - Tablas (entrevistados, fuentes secundarias)
 */

export const SECCION3_WATCHED_FIELDS = [
  'parrafoSeccion3_introduccion',
  'parrafoSeccion3_metodologia',
  'parrafoSeccion3_fuentesPrimarias',
  'parrafoSeccion3_fuentesSecundarias',
  'entrevistados',
  'fuentesSecundariasLista',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion3${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion3${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion3${i + 1}Imagen`),
];

export const SECCION3_CONFIG = {
  sectionId: '3.1.3',
  title: 'Características Sociodemográficas',
  photoPrefix: 'fotografiaSeccion3',
  maxPhotos: 10,
};

export const SECCION3_TEMPLATES = {
  introduccionDefault: `Las características sociodemográficas constituyen atributos
fundamentales para caracterizar la población del área de influencia social del proyecto, permitiendo
identificar y comprendre la estructura poblacional, su composición, dinámica, así como sus condiciones
socioeconómicas y sus principales indicadores de desarrollo.`,
  
  metodologiaDefault: `El levantamiento de información para caracterizar la población del
área de influencia social del proyecto se llevó a cabo mediante el análisis de diversos documentos técnicos,
informes estadísticos, así como mediante entrevistas con actores clave de la zona de estudio.`,
  
  fuentesPrimariasDefault: `Entrevistas semiestructuradas con líderes y actores clave de
la zona de estudio, directivos de instituciones públicas y privadas ubicadas en el área de influencia social.`,
  
  fuentesSecundariasDefault: `Documentos técnicos, estudios previos, informes estadísticos,
datos del Instituto Nacional de Estadística e Informática (INEI), entre otros.`,
};

/**
 * ✅ SECCION2_CONSTANTS
 * Constantes centralizadas para Sección 2
 * - Campos observados para persistencia
 * - Configuración de grupos (AISD, AISI)
 */

export const SECCION2_WATCHED_FIELDS = [
  'parrafoSeccion2_introduccion',
  'parrafoSeccion2_aisd_completo',
  'parrafoSeccion2_aisi_completo',
  'comunidadesCampesinas',
  'distritosAISI',
  'aisdComponente1',
  'aisdComponente2',
  'geoInfo',
  // Fotos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSeccion2${i + 1}Imagen`),
];

export const SECCION2_CONFIG = {
  sectionId: '3.1.2',
  title: 'Delimitación de las áreas de influencia social',
  photoPrefix: 'fotografiaSeccion2',
  maxPhotos: 10,
};

export const SECCION2_TEMPLATES = {
  introduccionDefault: `En términos generales, la delimitación del ámbito de estudio
de las áreas de influencia social se hace tomando en consideración a los agentes e instancias sociales,
individuales y/o colectivas, públicas y/o privadas, que tengan derechos o propiedad sobre el espacio o los
recursos respecto de los cuales el proyecto de exploración minera tiene incidencia.

Asimismo, el área de influencia social de un Proyecto tiene en
consideración a los grupos de interés que puedan ser potencialmente afectadas por el desarrollo de dicho
proyecto (según La Guía de Relaciones Comunitarias de la DGAAM del MINEM, se denomina "grupos de interés" a
aquellos grupos humanos que son impactados por dicho Proyecto).

El criterio social para la delimitación de un área de
influencia debe tener en cuenta la influencia que el Proyecto pudiera tener sobre el entorno social, que será o no ambientalmente impactado, considerando también la posibilidad de generar otro tipo de impactos,
expectativas, intereses y/o demandas del entorno social.

En base a estos criterios se han identificado las áreas de
influencia social directa e indirecta:`,
};

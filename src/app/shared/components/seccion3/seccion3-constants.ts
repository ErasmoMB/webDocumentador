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
  'cuadroTituloEntrevistados',
  'cuadroFuenteEntrevistados',
  'cantidadEntrevistas',
  'fechaTrabajoCampo',
  'consultora',
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
  
  // ✅ Valores por defecto para Tabla de Entrevistados
  cuadroTituloEntrevistadosDefault: 'Lista de Entrevistados',
  cuadroFuenteEntrevistadosDefault: 'GEADES (2024)',
  mensajeNoDatosRegistradosDefault: 'No hay datos registrados',
  
  // ✅ Valores por defecto para fallback de textos
  metodologiaDefaultFallback: `Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.`,
  
  fuentesPrimariasDefaultFallback: `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de {{cantidadEntrevistas}} entrevistas en profundidad a informantes calificados y autoridades locales.`,
  
  fuentesSecundariasDefaultFallback: `En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:`,
  
  fuentesSecundariasVaciasMessage: 'No hay fuentes secundarias registradas.',
  
  // ✅ Valores por defecto para Fotografías
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  
  // ✅ Placeholder para tabla de entrevistados
  placeholderTituloTabla: 'Ej: Lista de Entrevistados',
  
  // ✅ Labels completos para Fotografías en Formulario
  labelFotoTituloCompleto: 'Título de la fotografía',
  labelFotoFuenteCompleto: 'Fuente de la fotografía',
  labelFotoImagenCompleto: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Fotografía de la sección 3',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Sección 3',
  fuenteFotoDefault: 'GEADES, 2024',
};

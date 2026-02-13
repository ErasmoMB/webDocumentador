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
  // Textos principales
  tituloSeccion: '3.1.3 Índices demográficos, sociales, económicos, de ocupación laboral y otros similares',
  tituloMetodologia: 'Metodología',
  tituloFuentesPrimarias: 'A. Fuentes primarias',
  tituloFuentesSecundarias: 'B. Fuentes secundarias',
  tituloEditarParrafos: 'Editar Párrafos',
  tituloListaEntrevistados: 'Lista de Entrevistados',
  tituloFuentesSecundariasIntro: 'Fuentes Secundarias - Texto Introductorio',
  tituloSeccionView: '3.1.3 Características Sociodemográficas',

  // Hints
  hintMetodologia: 'Edite el texto completo. Deje vacío para usar el texto por defecto.',
  hintFuentesPrimarias: 'Edite el texto completo. El número de entrevistas se agregará automáticamente. Deje vacío para usar el texto por defecto.',
  hintFuentesSecundarias: 'Edite el texto completo. Deje vacío para usar el texto por defecto.',

  // Labels
  labelCantidadEntrevistas: 'Cantidad de Entrevistas',
  labelFechaTrabajoCampo: 'Fecha de Trabajo de Campo',
  labelTituloTabla: 'Título de la Tabla',
  labelListaEntrevistados: 'Lista de Entrevistados',
  labelFuenteTabla: 'Fuente de la Tabla',
  labelFuentesSecundarias: 'Lista de Fuentes Secundarias',
  labelRequired: '*',
  labelFotografias: 'Fotografías',

  // Placeholders
  placeholderCantidadEntrevistas: 'Ej: 18',
  placeholderFechaTrabajoCampo: 'Ej: noviembre 2024',
  placeholderTituloTabla: 'Ej: Lista de Entrevistados',
  placeholderFuenteTabla: 'Ej: GEADES (2024)',

  // Botones
  btnEliminar: 'Eliminar',
  btnAgregarFuente: 'Agregar Nueva Fuente',

  introduccionDefault: `Las características sociodemográficas constituyen atributos fundamentales para caracterizar la población del área de influencia social del proyecto, permitiendo identificar y compreender la estructura poblacional, su composición, dinámica, así como sus condiciones socioeconómicas y sus principales indicadores de desarrollo.`,

  metodologiaDefault: `El levantamiento de información para caracterizar la población del área de influencia social del proyecto se llevó a cabo mediante el análisis de diversos documentos técnicos, informes estadísticos, así como mediante entrevistas con actores clave de la zona de estudio.`,

  fuentesPrimariasDefault: `Entrevistas semiestructuradas con líderes y actores clave de la zona de estudio, directivos de instituciones públicas y privadas ubicadas en el área de influencia social.`,

  fuentesSecundariasDefault: `Documentos técnicos, estudios previos, informes estadísticos, datos del Instituto Nacional de Estadística e Informática (INEI), entre otros.`,

  // Valores por defecto para Tabla de Entrevistados
  cuadroTituloEntrevistadosDefault: 'Lista de Entrevistados',
  cuadroFuenteEntrevistadosDefault: 'GEADES (2024)',
  mensajeNoDatosRegistradosDefault: 'No hay datos registrados',

  // Labels y placeholders para Tabla de Entrevistados
  labelColumnaNombre: 'Nombre',
  labelColumnaCargo: 'Cargo',
  labelColumnaOrganizacion: 'Organización',
  placeholderColumnaNombre: 'Nombre completo',
  placeholderColumnaCargo: 'Cargo o función',
  placeholderColumnaOrganizacion: 'Organización',

  // Fallback para textos metodológicos
  metodologiaDefaultFallback: `Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.`,

  fuentesPrimariasDefaultFallback: `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como poblado\ res que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de {{cantidadEntrevistas}} entrevistas en profundidad a informantes calificados y autoridades locales.
  A continuación, se muestra en el siguiente cuadro los cargos u ocupaciones principales de las {{cantidadEntrevistas}} autoridades e informantes que fueron entrevistados durante el trabajo de campo llevado a cabo en el mes de {{fechaTrabajoCampo}}.`,

  fuentesSecundariasDefaultFallback: `En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:`,

  fuentesSecundariasVaciasMessage: 'No hay fuentes secundarias registradas.',

  // Valores por defecto para Fotografías
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',

  // Labels completos para Fotografías en Formulario
  labelFotoTituloCompleto: 'Título de la fotografía',
  labelFotoFuenteCompleto: 'Fuente de la fotografía',
  labelFotoImagenCompleto: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Fotografía de la sección 3',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Sección 3',
  fuenteFotoDefault: 'GEADES, 2024',
};

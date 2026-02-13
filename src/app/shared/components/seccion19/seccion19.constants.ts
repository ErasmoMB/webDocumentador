/**
 * ✅ SECCION19_CONSTANTS
 * Constantes centralizadas para Sección 19 - Organización Social y Liderazgo
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados (TEMPLATES)
 */

// ✅ CAMPOS OBSERVADOS (para persistencia con FormChangeService)
export const SECCION19_WATCHED_FIELDS = [
  'textoOrganizacionSocial',
  'tituloAutoridades',
  'fuenteAutoridades',
  'autoridades',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaOrganizacionSocial${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaOrganizacionSocial${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaOrganizacionSocial${i + 1}Imagen`),
];

// ✅ CONFIGURACION
export const SECCION19_CONFIG = {
  sectionId: '3.1.4.A.1.15',
  title: 'Organización social y liderazgo',
  photoPrefix: 'fotografiaOrganizacionSocial',
  maxPhotos: 10,
};

// ✅ TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS
export const SECCION19_TEMPLATES = {
  // ENCABEZADOS Y TÍTULOS PRINCIPALES
  tituloSeccion: 'A.1.15. Organización social y liderazgo',
  tituloEditarParrafo: 'Editar Párrafo',

  // PÁRRAFO ORGANIZACION SOCIAL
  labelParrafoOrganizacion: 'Organización Social y Liderazgo - Texto Completo',
  hintParrafoOrganizacion: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  parrafoOrganizacionDefault: `La organización social más importante y con mayor poder es la CC ____. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.

Al momento del trabajo de campo, según los entrevistados, se cuenta con ____ comuneros calificados dentro de la CC ____. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.

Respecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.

También se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.`,

  // TABLA DE AUTORIDADES: TÍTULOS Y FUENTES
  labelTituloAutoridades: 'Título - Tabla Autoridades',
  labelFuenteAutoridades: 'Fuente - Tabla Autoridades',
  tituloAutoridadesDefault: 'Autoridades y líderes sociales – CC ____',
  fuenteAutoridadesDefault: 'GEADES (2024)',
  placeholderTituloAutoridades: 'Autoridades y líderes sociales – CC Ayroca',
  placeholderFuenteAutoridades: 'GEADES (2024)',

  // TABLA COLUMNAS
  labelColumnaOrganizacion: 'Organización',
  labelColumnaCargo: 'Cargo',
  labelColumnaPersona: 'Nombres y Apellidos',
  placeholderColumnaOrganizacion: 'CC Ayroca',
  placeholderColumnaCargo: 'Presidente',
  placeholderColumnaPersona: 'Nombres y Apellidos',

  // FOTOGRAFÍAS
  labelFotografias: 'Fotografías de Organización Social',
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Organización social',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Organización social',
  fuenteFotoDefault: 'GEADES, 2024',

  // MENSAJES Y VALORES
  comunerosCalificadosDefault: '65',
  grupoAISDDefault: '____',
};

// ✅ CONFIGURACION LEGACY (por compatibilidad)
export const SECCION19_CONSTANTS = {
  PHOTO_PREFIX: SECCION19_CONFIG.photoPrefix,
  TEXTO_ORGANIZACION_SOCIAL: 'textoOrganizacionSocial',
  TITULO_AUTORIDADES: 'tituloAutoridades',
  FUENTE_AUTORIDADES: 'fuenteAutoridades',
  TABLA_AUTORIDADES: 'autoridades',
  TITULO_DEFAULT: SECCION19_TEMPLATES.tituloAutoridadesDefault,
  FUENTE_DEFAULT: SECCION19_TEMPLATES.fuenteAutoridadesDefault,
  TABLA_CONFIG_INICIAL: [{ organizacion: '', cargo: '', nombre: '' }],
};

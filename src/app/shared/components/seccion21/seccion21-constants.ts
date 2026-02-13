/**
 * ✅ SECCION 21 CONSTANTES - AISI (Área de Influencia Social Indirecta)
 * Constantes centralizadas para Sección 21 - Caracterización socioeconómica del AISI
 * 
 * CAMPOS OBSERVADOS (con aislamiento por prefijo):
 * - Párrafos: parrafoSeccion21_aisi_intro_completo, parrafoSeccion21_centro_poblado_completo
 * - Históricos: leyCreacionDistrito, fechaCreacionDistrito, distritoAnterior, etc.
 * - Tabla: ubicacionCpTabla
 * - Foto: fotografia
 */

export const SECCION21_WATCHED_FIELDS = [
  // Párrafos (pueden tener prefijo)
  'parrafoSeccion21_aisi_intro_completo',
  'parrafoSeccion21_centro_poblado_completo',
  
  // Datos históricos del centro poblado (pueden tener prefijo)
  'leyCreacionDistrito',
  'fechaCreacionDistrito',
  'distritoAnterior',
  'origenPobladores1',
  'origenPobladores2',
  'departamentoOrigen',
  'anexosEjemplo',
  
  // Tabla de ubicación (puede tener prefijo)
  'ubicacionCpTabla',
  
  // Título y fuente de tabla (pueden tener prefijo)
  'cuadroTituloUbicacionCp',
  'cuadroFuenteUbicacionCp',
  
  // Datos base (sin prefijo, compartidos entre grupos)
  'centroPobladoAISI',
  'provinciaSeleccionada',
  'departamentoSeleccionado',
  
  // Fotografías (pueden tener prefijo)
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografia${i + 1}Imagen`),
];

export const SECCION21_SECTION_ID = '3.1.4.B';

export const SECCION21_CONFIG = {
  sectionId: SECCION21_SECTION_ID,
  title: 'Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
  photoPrefix: 'fotografia',
  maxPhotos: 10,
};

/**
 * TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS (0% HARDCODEADOS)
 */
export const SECCION21_TEMPLATES = {
  // ========== TÍTULOS PRINCIPALES ==========
  tituloSeccion: 'B. Caracterización socioeconómica del Área de Influencia Social Indirecta (AISI)',
  tituloSubseccion: 'B.1. Centro Poblado',
  labelEditarParrafos: 'Editar Párrafos',
  labelDatosParrafos: 'Datos para Generar Párrafos del Centro Poblado',

  // ========== LABELS DE CAMPOS ==========
  labelParrafoAISI: 'AISI - Introducción - Texto Completo',
  labelParrafoCentro: 'Centro Poblado - Texto Completo',
  labelLeyCreacion: 'Ley N° de Creación del Distrito',
  labelFechaCreacion: 'Fecha de Creación del Distrito',
  labelDistritoAnterior: 'Distrito Anterior',
  labelOrigenPobladores1: 'Origen de Pobladores (Lugar/Provincia)',
  labelOrigenPobladores2: 'Origen de Pobladores (Provincia)',
  labelDepartamentoOrigen: 'Departamento de Origen',
  labelAnexosEjemplo: 'Anexos Ejemplo',
  labelTituloUbicacion: 'Título del Cuadro',
  labelFuenteUbicacion: 'Fuente del Cuadro',
  labelFotografias: 'Fotografías de',

  // ========== PLACEHOLDERS ==========
  placeholderLey: 'Ej: 8004',
  placeholderFecha: 'Ej: 22 de febrero de 1935',
  placeholderDistrito: 'Ej: Caravelí',
  placeholderOrigen1: 'Ej: Caravelí',
  placeholderOrigen2: 'Ej: Parinacochas',
  placeholderDepartamento: 'Ej: Arequipa',
  placeholderAnexos: 'Ej: Llacsahuanca, Salome',
  placeholderTituloUbicacion: 'Ubicación referencial – Centro Poblado',
  placeholderFuenteUbicacion: 'Ej: GEADES (2024)',
  placeholderTituloFoto: 'Ej: Centro Poblado',
  placeholderFuenteFoto: 'Ej: GEADES, 2024',

  // ========== HINTS / AYUDAS ==========
  hintParrafoAISI: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  hintParrafoCentro: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // ========== TEXTOS POR DEFECTO (FALLBACK) ==========
  parrafoAISITemplate: `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el CP {CENTRO}, capital distrital de la jurisdicción homónima, en la provincia de {PROVINCIA}, en el departamento de {DEPARTAMENTO}. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`,

  parrafoCentroTemplate: `El CP {CENTRO} es la capital del distrito homónimo, perteneciente a la provincia de {PROVINCIA}, en el departamento de {DEPARTAMENTO}. Su designación como capital distrital se oficializó mediante la Ley N°{LEY}, promulgada el {FECHA}, fecha en que se creó el distrito de {DISTRITO}. Antes de ello, este asentamiento era un caserío del distrito de {DISTRITOANTERIOR}, marcando un importante cambio en su desarrollo administrativo y social.`,

  // ========== FOTOGRAFÍAS ==========
  tituloFotoDefault: 'Centro Poblado',
  fuenteFotoDefault: 'GEADES, 2024',
  labelTituloFoto: 'Título de la fotografía',
  labelFuenteFoto: 'Fuente de la fotografía',
  labelImagenFoto: 'Fotografía - Imagen',

  // ========== TABLA UBICACIÓN ==========
  labelColLocalidad: 'Localidad',
  labelColCoordenadas: 'Coordenadas',
  labelColAltitud: 'Altitud',
  labelColDistrito: 'Distrito',
  labelColProvincia: 'Provincia',
  labelColDepartamento: 'Departamento',
  tituloTablaCuadroUbicacion: 'Ubicación referencial – Centro Poblado',
  fuenteTablaCuadroUbicacion: 'GEADES (2024)',

  // ========== MENSAJES Y VALORES VACÍOS ==========
  placeholderVacio: '____',
  mensajeNoFotografias: 'No hay fotografías registradas',
  mensajeNoTabla: 'No hay datos de ubicación registrados',
};

export const SECCION21_PHOTO_PREFIX = 'fotografia';

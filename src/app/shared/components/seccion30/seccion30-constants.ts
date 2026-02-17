/**
 * 🎯 SECCION 30 - CONSTANTES CENTRALIZADAS
 * Indicadores de Educación
 * 
 * MODO IDEAL ✅:
 * - CERO hardcodeados de texto
 * - 100% de textos en SECCION30_TEMPLATES
 * - Campos observados para persistencia
 * - Configuración de sección y tablas
 */

/**
 * 1️⃣ CAMPOS OBSERVADOS - Todos los campos que se deben persistir
 */
export const SECCION30_WATCHED_FIELDS = [
  // Párrafos
  'parrafoSeccion30_indicadores_educacion_intro',
  'textoNivelEducativo',
  'textoTasaAnalfabetismo',

  // Títulos y Fuentes
  'tituloNivelEducativo',
  'fuenteNivelEducativo',
  'tituloTasaAnalfabetismo',
  'fuenteTasaAnalfabetismo',

  // Tablas (base)
  'nivelEducativoTabla',
  'tasaAnalfabetismoTabla',

  // Centro Poblado
  'centroPobladoAISI',

  // Fotografías (10)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaCahuacho${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaCahuacho${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaCahuacho${i + 1}Imagen`),
];

/**
 * 2️⃣ CONFIGURACIÓN DE SECCIÓN
 */
export const SECCION30_CONFIG = {
  sectionId: '3.1.4.B.1.9',
  title: 'Indicadores de educación',
  photoPrefix: 'fotografiaCahuacho',
  maxPhotos: 10,
};

/**
 * 3️⃣ TEMPLATES - TODO CENTRALIZADO
 * CERO hardcodeados permitidos en TS/HTML después de refactorización ✅
 */
export const SECCION30_TEMPLATES = {
  // SECCIÓN PRINCIPAL
  sectionTitle: 'B.1.9. Indicadores de educación',

  // PÁRRAFO INTRODUCTORIO
  labelIntroduccion: 'Introducción - Indicadores de Educación',
  hintIntroduccion: 'Edite el texto completo. Deje vacío para usar el texto por defecto.',
  rowsIntroduccion: 5,
  
  parrafoIntroDefault: `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`,

  // SUBSECCIÓN A: NIVEL EDUCATIVO
  subseccionA: 'a. Nivel Educativo de la población',
  
  labelTextoNivelEducativo: 'Texto descriptivo - Nivel Educativo',
  hintTextoNivelEducativo: 'Edite el texto. Deje vacío para usar el texto por defecto con datos del centro poblado.',
  rowsTextoNivelEducativo: 3,
  
  textoNivelEducativoDefault: (centroPoblado: string = '____') =>
    `En el CP ${centroPoblado}, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la secundaria. A continuación se presentan los datos de nivel educativo según el censo nacional.`,

  labelTituloNivelEducativo: 'Título del cuadro',
  placeholderTituloNivelEducativo: 'Ej: Población de 15 años a más según nivel educativo alcanzado – CP {{centroPoblado}} (2017)',
  tituloNivelEducativoDefault: 'Población de 15 años a más según nivel educativo alcanzado',
  
  labelTablatNivelEducativo: 'Tabla Población según nivel educativo',
  tablaColumnas: [
    { label: 'Categoría', key: 'nivel' },
    { label: 'Casos', key: 'casos' },
    { label: 'Porcentaje', key: 'porcentaje' },
  ],

  labelFuenteNivelEducativo: 'Fuente',
  placeholderFuenteNivelEducativo: 'Ej: Censos Nacionales 2017',
  fuenteNivelEducativoDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',

  // SUBSECCIÓN B: TASA DE ANALFABETISMO
  subseccionB: 'b. Tasa de analfabetismo',

  labelTextoTasaAnalfabetismo: 'Texto descriptivo - Tasa de Analfabetismo',
  hintTextoTasaAnalfabetismo: 'Edite el texto. Deje vacío para usar el texto por defecto con datos del centro poblado.',
  rowsTextoTasaAnalfabetismo: 3,

  textoTasaAnalfabetismoDefault: (centroPoblado: string = '____') =>
    `En el CP ${centroPoblado}, tomando en cuenta a la población de 15 años a más, se presentan los datos de tasa de analfabetismo según el censo nacional.`,

  labelTituloTasaAnalfabetismo: 'Título del cuadro',
  placeholderTituloTasaAnalfabetismo: 'Ej: Tasa de analfabetismo en población de 15 años a más – CP {{centroPoblado}} (2017)',
  tituloTasaAnalfabetismoDefault: 'Tasa de analfabetismo en población de 15 años a más',

  labelTablatTasaAnalfabetismo: 'Tabla Tasa de analfabetismo',
  tablaColumnasTasa: [
    { label: 'Indicador', key: 'indicador' },
    { label: 'Casos', key: 'casos' },
    { label: 'Porcentaje', key: 'porcentaje' },
  ],

  labelFuenteTasaAnalfabetismo: 'Fuente',
  placeholderFuenteTasaAnalfabetismo: 'Ej: Censos Nacionales 2017',
  fuenteTasaAnalfabetismoDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',

  // FOTOGRAFÍAS
  labelFotografias: 'Fotografías de Indicadores de educación',
  labelTituloFoto: 'Título de la fotografía',
  labelFuenteFoto: 'Fuente de la fotografía',
  labelImagenFoto: 'Fotografía - Imagen',
  placeholderTituloFoto: 'Ej: Indicadores de educación',
  placeholderFuenteFoto: 'Ej: GEADES, 2024',
  tituloFotoDefault: 'Indicadores de educación',
  fuenteFotoDefault: 'GEADES, 2024',

  // MENSAJES Y ETIQUETAS
  mensajeTablaVacia: 'No hay datos registrados',
  lblCategoría: 'Categoría',
  lblCasos: 'Casos',
  lblPorcentaje: 'Porcentaje',
  lblIndicador: 'Indicador',
  lblFuente: 'FUENTE: ',
};

/**
 * 4️⃣ CONFIGURACIÓN DE TABLAS DINÁMICAS
 */
export const SECCION30_TABLE_CONFIG = {
  nivelEducativo: {
    tablaKey: 'nivelEducativoTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  },
  tasaAnalfabetismo: {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: '',
    campoTotal: '',
    campoPorcentaje: '',
    calcularPorcentajes: false,
    camposParaCalcular: ['casos'],
    noInicializarDesdeEstructura: true,
    permiteAgregarFilas: true,
    permiteEliminarFilas: true
  },
};

/**
 * 5️⃣ PREFIJOS DE FOTOGRAFÍAS (DINÁMICOS)
 * ✅ MEJORA APLICADA: Prefijos específicos por tema para mejor aislamiento
 */
export const SECCION30_PHOTO_PREFIXES = {
  centroPoblado: 'fotografiaCahuacho',
  educacion: 'fotografiaEducacionAISI',
  analfabetismo: 'fotografiaAnalfabetismoAISI'
};

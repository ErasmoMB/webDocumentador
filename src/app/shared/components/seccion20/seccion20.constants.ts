/**
 * ✅ SECCION20_CONSTANTS
 * Constantes centralizadas para Seccion 20 - Festividades, Costumbres y Turismo
 * - Campos observados para persistencia
 * - Configuracion de seccion
 * - Todos los textos centralizados (100% constantes)
 * 
 * ACTUALIZACION: 12/02/2026
 * Estado: ✅ MODO IDEAL - CERO HARDCODEADOS
 */

// ✅ CAMPOS OBSERVADOS PARA PERSISTENCIA (FormChangeService)
export const SECCION20_WATCHED_FIELDS = [
  'textoFestividades',
  'tituloFestividades',
  'fuenteFestividades',
  'festividades', // tabla
  // Fotos (10 máx)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaFestividades${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaFestividades${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaFestividades${i + 1}Imagen`),
];

// ✅ CONFIGURACION DE SECCION
export const SECCION20_CONFIG = {
  sectionId: '3.1.16',
  title: 'A.1.16. Festividades, Costumbres y Turismo',
  photoPrefix: 'fotografiaFestividades',
  maxPhotos: 10,
  tablaKey: 'festividades',
  totalKey: 'festividad',
};

// ✅ TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS (0% HARDCODEADOS)
export const SECCION20_TEMPLATES = {
  // --- TITULOS Y ENCABEZADOS ---
  tituloSeccion: 'A.1.16. Festividades, Costumbres y Turismo',
  labelEditarParrafos: 'Editar Párrafos',
  labelTextoCompleto: 'Festividades, Costumbres y Turismo - Texto Completo',
  hintTextoCompleto: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // --- LABELS DE FORMULARIO ---
  labelTextoFestividades: 'Festividades, Costumbres y Turismo - Texto Completo',
  labelTituloTabla: 'Título - Tabla Festividades',
  labelTablaFestividades: 'Tabla Festividades',
  labelFuenteTabla: 'Fuente - Tabla Festividades',
  labelFotografias: 'Fotografías de Festividades',

  // --- PLACEHOLDERS ---
  placeholderTituloTabla: 'Festividades principales – CC ____',
  placeholderFuenteTabla: 'GEADES (2024)',
  placeholderFestividad: 'Carnavales',
  placeholderFecha: 'Febrero',

  // --- LABELS DE TABLA ---
  columnFestividad: 'Festividad',
  columnFecha: 'Fecha',

  // --- LABELS DE FOTO ---
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',

  // --- VALORES POR DEFECTO ---
  tituloDefault: 'Festividades principales – CC {{nombreComunidad}}',
  fuenteDefault: 'GEADES (2024)',
  sitioArqueologicoDefault: 'Incahuasi',

  // --- TEXTO POR DEFECTO (PARRAFO COMPLETO) ---
  textoFestividadesDefault: `En la CC {{nombreComunidad}}, las festividades son momentos de gran importancia cultural y social que refuerzan los lazos comunitarios y mantienen vivas las tradiciones locales. Entre las celebraciones más destacadas se encuentran los carnavales, que tienen lugar en el mes de febrero. Esta festividad está marcada por el entusiasmo de la población, quienes participan en juegos con agua y desfiles.

Otra celebración significativa es la dedicada a la Virgen de Chapi, que se lleva a cabo cada 1° de mayo. En esta fecha, los devotos organizan misas solemnes, procesiones en honor a la Virgen y actividades sociales que congregan a familias locales y visitantes. Del 3 al 5 de mayo, se celebra la Fiesta de las Cruces, en la que se realizan ceremonias religiosas, procesiones y actividades tradicionales, como la tauromaquia, acompañadas por grupos musicales que animan el ambiente.

En junio, el calendario festivo incluye dos importantes celebraciones: la festividad de San Vicente Ferrer (que es la fiesta patronal principal de la comunidad), que se realiza del 21 al 23 de junio, y el aniversario de la comunidad, celebrado el 24 de junio con actos protocolares, actividades culturales y sociales. Ambas fechas están caracterizadas por su componente religioso, con misas y procesiones, además de eventos que integran a toda la comunidad.

Una festividad de gran relevancia ambiental y cultural es el Chaku, o esquila de vicuñas, una actividad tradicional vinculada al aprovechamiento sostenible de esta especie emblemática de los Andes. Aunque las fechas de esta celebración suelen variar, se tiene la propuesta de realizarla cada 15 de noviembre, coincidiendo con el Día de la Vicuña. Durante el Chaku, además de la esquila, se realizan actividades culturales, ceremonias andinas y eventos de integración comunitaria.

En cuanto al potencial turístico, la CC {{nombreComunidad}} destaca no solo por sus festividades tradicionales, sino también por las ruinas arqueológicas de {{sitioArqueologico}}, un sitio de valor histórico y cultural. Este lugar, que guarda vestigios del pasado incaico, representa una oportunidad para atraer visitantes interesados en la historia, la arqueología y el turismo vivencial. La promoción de este recurso puede complementar las festividades y posicionar a la comunidad como un destino atractivo para el turismo sostenible, generando beneficios económicos y culturales para sus habitantes.`,

  // --- TABLA ESTRUCTURA INICIAL ---
  tablaEstructuraInicial: [{ festividad: '', fecha: '' }],

  // --- ETIQUETAS DE FOTO ---
  tituloFotoDefault: 'Festividad',
  fuenteFotoDefault: 'GEADES, 2024',
};

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION20_PHOTO_PREFIXES = {
  base: SECCION20_CONFIG.photoPrefix
};

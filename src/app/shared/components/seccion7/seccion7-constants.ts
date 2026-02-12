/**
 * ✅ SECCION7_CONSTANTS
 * Constantes centralizadas para Sección 7 - PEA (Población Económicamente Activa)
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION7_WATCHED_FIELDS: string[] = [
  // Datos base
  'grupoAISD',
  // Tablas PET
  'petTabla',
  'cuadroTituloPET',
  'cuadroFuentePET',
  // Tablas PEA
  'peaTabla',
  'cuadroTituloPEA',
  'cuadroFuentePEA',
  // Tablas PEA Ocupada
  'peaOcupadaTabla',
  'cuadroTituloPEAOcupada',
  'cuadroFuentePEAOcupada',
  // Párrafos y textos
  'parrafoSeccion7_pet_completo',
  'textoDetalePEA',
  'textoDefinicionPEA',
  'textoAnalisisPEA',
  'parrafoSeccion7_situacion_empleo_completo',
  'parrafoSeccion7_ingresos_completo',
  'textoIndiceDesempleo',
  'textoAnalisisOcupacion',
  // Fotografías (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaPEA${i + 1}Imagen`),
];

export const SECCION7_SECTION_ID = '3.1.4.A.1.3';
export const SECCION7_DEFAULT_SUBSECTION = '3.1.4.A.1.3';

export const SECCION7_CONFIG = {
  sectionId: '3.1.4.A.1.3',
  title: 'Indicadores y distribución de la PEA',
  photoPrefix: 'fotografiaPEA',
  maxPhotos: 10,
};

export const SECCION7_PHOTO_PREFIX = {
  PEA: 'fotografiaPEA'
} as const;

// ✅ Textos por defecto (fallbacks)
export const SECCION7_TEXTOS_DEFAULT = {
  PET_COMPLETO: 'En concordancia con el Convenio 138 de la Organización Internacional de Trabajo (OIT), aprobada por Resolución Legislativa Nº27453 de fecha 22 de mayo del 2001 y ratificado por DS Nº038-2001-RE, publicado el 31 de mayo de 2001, la población cumplida los 14 años de edad se encuentra en edad de trabajar.\n\nLa población en edad de trabajar (PEA) de la CC {nombreComunidad}, considerada desde los 15 años a más, se compone de la población total. El bloque etario que más aporta a la PEA es el de 15 a 29 años. Por otro lado, el grupo etario que menos aporta al indicador es el de 65 años a más.',
  DEFINICION_PEA: 'La Población Económicamente Activa (PEA) corresponde a todas aquellas personas en edad de trabajar que se encuentran empleadas o desempleadas activamente buscando empleo.',
  ANALISIS_OCUPACION: 'Del cuadro precedente, se halla que la PEA Desocupada representa un porcentaje del total de la PEA. En adición a ello, se aprecia que tanto hombres como mujeres se encuentran predominantemente en el indicador de PEA Ocupada.',
  DETALLE_PEA: '____',
  ANALISIS_PEA: '____',
  SITUACION_EMPLEO: '____',
  INGRESOS_POBLACION: '____',
  INDICE_DESEMPLEO: '____',
};

export const SECCION7_TEMPLATES = {
  // Títulos principales
  TITULO_PRINCIPAL: 'A.1.3. Indicadores y distribución de la Población Económicamente Activa por rama de actividad, tipo de empleo, tasas e ingresos.',
  
  // Subtítulos de secciones
  SUBTITULO_PET: 'a. Población en edad de Trabajar (PET)',
  SUBTITULO_PEA: 'b. Población Económicamente Activa (PEA)',
  SUBTITULO_SITUACION_EMPLEO: 'b.1. Situación del empleo (independiente o dependiente)',
  SUBTITULO_INGRESOS: 'b.2. Ingresos de la población',
  SUBTITULO_INDICE_DESEMPLEO: 'b.3. Índice de desempleo',
  
  // Labels de formulario
  LABEL_EDITAR_PARRAFOS: 'Editar Párrafos',
  LABEL_PET_TEXTO_COMPLETO: 'PET - Texto Completo',
  LABEL_DETALLE_PEA_TEXTO: 'Detalle PEA - Texto Completo',
  LABEL_DEFINICION_PEA_TEXTO: 'Definición PEA - Texto Completo',
  LABEL_ANALISIS_PEA_TEXTO: 'Análisis PEA - Texto Completo',
  LABEL_SITUACION_EMPLEO_TEXTO: 'Situación del Empleo - Texto Completo',
  LABEL_INGRESOS_TEXTO: 'Ingresos - Texto Completo',
  LABEL_INDICE_DESEMPLEO_TEXTO: 'Índice de Desempleo - Texto Completo',
  LABEL_ANALISIS_OCUPACION_TEXTO: 'Análisis de Ocupación - Texto Completo',
  LABEL_TITULO_TABLA: 'Título de la Tabla',
  LABEL_TITULO_TABLA_PEA: 'Título de la Tabla PEA',
  LABEL_TITULO_TABLA_PEA_OCUPADA: 'Título de la Tabla PEA Ocupada',
  LABEL_FUENTE_TABLA: 'Fuente de la Tabla',
  LABEL_FUENTE_TABLA_PEA: 'Fuente de la Tabla PEA',
  LABEL_FUENTE_TABLA_PEA_OCUPADA: 'Fuente de la Tabla PEA Ocupada',
  LABEL_FOTOGRAFIAS: 'Fotografías de PEA',
  
  // Hints
  HINT_TEXTO_COMPLETO: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  HINT_TABLA: 'Tabla editable - ingrese los datos',
  
  // Placeholders
  PLACEHOLDER_TITULO_PET: 'Ej: PET según grupos de edad',
  PLACEHOLDER_FUENTE_PET: 'Ej: GEADES, 2024',
  PLACEHOLDER_TITULO_PEA: 'Ej: Conformación de la PEA y No PEA, según sexo',
  PLACEHOLDER_FUENTE_PEA: 'Ej: INEI 2018',
  PLACEHOLDER_TITULO_PEA_OCUPADA: 'Ej: Conformación de la PEA Ocupada y Desocupada, según sexo',
  PLACEHOLDER_FUENTE_PEA_OCUPADA: 'Ej: INEI 2018',
  PLACEHOLDER_FOTO_TITULO: 'Ej: Población de la CC Ayroca',
  PLACEHOLDER_FOTO_FUENTE: 'Ej: GEADES, 2024',
  
  // Valores por defecto de Fotografías
  FOTO_TITULO_DEFAULT: 'PEA',
  FOTO_FUENTE_DEFAULT: 'GEADES, 2024',
  
  // Etiquetas de columnas de tabla
  LABEL_CATEGORIA: 'Categoría',
  LABEL_CASOS: 'Casos',
  LABEL_PORCENTAJE: 'Porcentaje',
  LABEL_HOMBRES: 'Hombres',
  LABEL_MUJERES: 'Mujeres',
  LABEL_TOTAL: 'Total',
};

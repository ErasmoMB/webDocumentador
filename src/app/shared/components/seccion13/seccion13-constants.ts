/**
 * ✅ SECCION13_CONSTANTS
 * Constantes centralizadas para Sección 13 - Indicadores de Salud
 * - Campos observados para persistencia
 * - Configuración de sección
 * - Todos los textos centralizados
 */

export const SECCION13_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'provinciaSeleccionada',
  'distritoSeleccionado',
  'parrafoSeccion13_natalidad_mortalidad_completo',
  'parrafoSeccion13_morbilidad_completo',
  'textoAfiliacionSalud',
  'natalidadMortalidadTabla',
  'morbilidadTabla',
  'afiliacionSaludTabla',
  'cuadroTituloNatalidadMortalidad',
  'cuadroFuenteNatalidadMortalidad',
  'cuadroTituloMorbilidad',
  'cuadroFuenteMorbilidad',
  'cuadroTituloAfiliacionSalud',
  'cuadroFuenteAfiliacionSalud',
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludIndicadores${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludIndicadores${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaSaludIndicadores${i + 1}Imagen`),
];

export const SECCION13_SECTION_ID = '3.1.4.A.1.9';
export const SECCION13_DEFAULT_SUBSECTION = '3.1.4.A.1.9';
export const SECCION13_PHOTO_PREFIX = 'fotografiaSaludIndicadores';

// ✅ PATRÓN IDEAL - Prefijos de fotos específicos por tema
export const SECCION13_PHOTO_PREFIXES = {
  base: 'fotografiaSaludIndicadores'
};

// ============================================================================
// TEMPLATES - TODOS LOS TEXTOS CENTRALIZADOS
// ============================================================================

export const SECCION13_TEMPLATES = {
  // =========== TITULOS Y LABELS ===========
  tituloSeccion: 'A.1.9. Indicadores de salud',
  labelNatalidadMortalidad: 'a. Natalidad y Mortalidad',
  labelMorbilidad: 'b. Morbilidad',
  labelAfiliacionSalud: 'c. Población afiliada a Seguros de Salud',
  labelEditarParrafos: 'Editar Párrafos',
  labelTituloDelCuadro: 'Título del cuadro',
  labelTablaNatalidadMortalidad: 'Tabla Natalidad y Mortalidad',
  labelTablaMorbilidad: 'Tabla Morbilidad',
  labelTablaAfiliacionSalud: 'Tabla Afiliación de Salud',
  labelFuente: 'Fuente',
  labelFotos: 'Fotografías',

  // =========== LABELS DE CAMPOS ===========
  labelParrafoNatalidadMortalidad: 'Natalidad y Mortalidad - Texto Completo',
  labelParrafoMorbilidad: 'Morbilidad - Texto Completo',
  labelParrafoAfiliacionSalud: 'Población afiliada a Seguros de Salud - Texto Completo',

  // =========== HINTS (AYUDA) ===========
  hintParrafo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',

  // =========== TEXTOS POR DEFECTO - NATALIDAD Y MORTALIDAD ===========
  textoNatalidadMortalidadDefault: `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ____ durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.

Respecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ____, hasta la fecha indicada.`,

  cuadroTituloNatalidadMortalidadDefault: 'Indicadores de natalidad y mortalidad – CC ____',
  cuadroFuenteNatalidadMortalidadDefault: 'GEADES (2024)',

  // =========== TEXTOS POR DEFECTO - MORBILIDAD ===========
  textoMorbilidadDefault: `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ____ son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.

En cuanto a los grupos de morbilidad que se hallan a nivel distrital de ____ (jurisdicción que abarca a los poblados de la CC ____) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`,

  cuadroTituloMorbilidadDefault: 'Casos por grupos de morbilidad – Distrito ____ (2023)',
  cuadroFuenteMorbilidadDefault: 'REUNIS (2024)',

  // =========== TEXTOS POR DEFECTO - AFILIACION SALUD ===========
  textoAfiliacionSaludDefault: `Dentro de la CC ____, la mayoría de habitantes se encuentran afiliados a algún tipo de seguro de salud. Es así que el Seguro Integral de Salud (SIS) se halla en primer lugar, al abarcar el ____ % de la población. A ello le sigue ESSALUD, con un ____ %. Por otro lado, el ____ % de la población no cuenta con ningún tipo de seguro de salud.`,

  cuadroTituloAfiliacionSaludDefault: 'Población según tipo de seguro de salud afiliado – CC ____ (2017)',
  cuadroFuenteAfiliacionSaludDefault: 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas',

  // =========== COLUMNAS TABLA NATALIDAD Y MORTALIDAD ===========
  labelColumnaNatalidad: 'Natalidad',
  labelColumnaMortalidad: 'Mortalidad',

  // =========== COLUMNAS TABLA MORBILIDAD ===========
  labelColumnaGrupoMorbilidad: 'Grupo de Morbilidad',
  labelColumnaRango0_11: '0 – 11',
  labelColumnaRango12_17: '12 – 17',
  labelColumnaRango18_29: '18 – 29',
  labelColumnaRango30_59: '30 – 59',
  labelColumnaRango60: '60 ->',
  labelColumnaCasosTotales: 'Casos Totales',

  // =========== COLUMNAS TABLA AFILIACION ===========
  labelColumnaCategoria: 'Categoría',
  labelColumnaCasos: 'Casos',
  labelColumnaPorcentaje: 'Porcentaje',

  // =========== FOTOGRAFIAS ===========
  labelFotoTitulo: 'Título',
  labelFotoFuente: 'Fuente',
  labelFotoImagen: 'Imagen',
  placeholderFotoTitulo: 'Ej: Vista del centro de salud',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
};

// ============================================================================
// CONFIGURACIÓN DE TABLAS
// ============================================================================

export const SECCION13_TABLE_CONFIGS = {
  NATALIDAD_MORTALIDAD: {
    tablaKeyBase: 'natalidadMortalidadTabla',
    campos: ['anio', 'natalidad', 'mortalidad']
  },
  MORBILIDAD: {
    tablaKeyBase: 'morbilidadTabla',
    campos: ['grupo', 'rango0_11', 'rango12_17', 'rango18_29', 'rango30_59', 'rango60', 'casos']
  },
  AFILIACION_SALUD: {
    tablaKeyBase: 'afiliacionSaludTabla',
    campoTotal: 'categoria',
    campoCasos: 'casos',
    campoPorcentaje: 'porcentaje'
  }
};

// ============================================================================
// COLUMNAS PARA TABLAS (EXPORT PARA COMPATIBILIDAD)
// ============================================================================

export const SECCION13_COLUMNAS_NATALIDAD_MORTALIDAD = [
  { field: 'anio', label: SECCION13_TEMPLATES.labelColumnaNatalidad, type: 'text' as const, placeholder: '2023' },
  { field: 'natalidad', label: SECCION13_TEMPLATES.labelColumnaNatalidad, type: 'number' as const, placeholder: '0' },
  { field: 'mortalidad', label: SECCION13_TEMPLATES.labelColumnaMortalidad, type: 'number' as const, placeholder: '0' }
];

export const SECCION13_COLUMNAS_MORBILIDAD = [
  { field: 'grupo', label: SECCION13_TEMPLATES.labelColumnaGrupoMorbilidad, type: 'text' as const, placeholder: 'Infecciones agudas' },
  { field: 'rango0_11', label: SECCION13_TEMPLATES.labelColumnaRango0_11, type: 'number' as const, placeholder: '0' },
  { field: 'rango12_17', label: SECCION13_TEMPLATES.labelColumnaRango12_17, type: 'number' as const, placeholder: '0' },
  { field: 'rango18_29', label: SECCION13_TEMPLATES.labelColumnaRango18_29, type: 'number' as const, placeholder: '0' },
  { field: 'rango30_59', label: SECCION13_TEMPLATES.labelColumnaRango30_59, type: 'number' as const, placeholder: '0' },
  { field: 'rango60', label: SECCION13_TEMPLATES.labelColumnaRango60, type: 'number' as const, placeholder: '0' },
  { field: 'casos', label: SECCION13_TEMPLATES.labelColumnaCasosTotales, type: 'number' as const, placeholder: '0', readonly: true }
];

export const SECCION13_COLUMNAS_AFILIACION_SALUD = [
  { field: 'categoria', label: SECCION13_TEMPLATES.labelColumnaCategoria, type: 'text' as const, placeholder: 'SIS' },
  { field: 'casos', label: SECCION13_TEMPLATES.labelColumnaCasos, type: 'number' as const, placeholder: '0' },
  { field: 'porcentaje', label: SECCION13_TEMPLATES.labelColumnaPorcentaje, type: 'text' as const, placeholder: '0%', readonly: true }
];

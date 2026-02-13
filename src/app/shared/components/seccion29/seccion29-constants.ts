/**
 * Constantes y configuración para Sección 29
 * Natalidad, mortalidad, morbilidad y afiliación de salud
 */

export const SECCION29_SECTION_ID = '3.1.4.B.1.8';

export const SECCION29_WATCHED_FIELDS = [
  // Párrafos de texto
  'textoNatalidadCP1',
  'textoNatalidadCP2',
  'textoMorbilidadCP',
  'textoAfiliacionSalud',
  
  // Títulos y fuentes
  'tituloNatalidadMortalidad',
  'fuenteNatalidadMortalidad',
  'tituloMorbilidad',
  'fuenteMorbilidad',
  'tituloAfiliacionSalud',
  'fuenteAfiliacionSalud',
  
  // Tablas
  'natalidadMortalidadCpTabla',
  'morbilidadCpTabla',
  'afiliacionSaludTabla',
  
  // Centro poblado
  'centroPobladoAISI',
  
  // Otro
  'fotografiasInstitucionalidad',
  'distritoSeleccionado'
];

export const SECCION29_CONFIG = {
  sectionId: SECCION29_SECTION_ID,
  title: 'Indicadores de salud',
  photoPrefix: 'fotografiaCahuacho',
  maxPhotos: 10,
};

export const SECCION29_TEMPLATES = {
  // ============ TÍTULOS PRINCIPALES ============
  tituloSeccion: 'B.1.8. Indicadores de salud',
  
  // ============ SECCIÓN A: NATALIDAD Y MORTALIDAD ============
  tituloSubseccionA: 'a. Natalidad y Mortalidad',
  labelParrafosNatalidad: 'Editar Párrafos',
  labelNatalidadParrafo1: 'Natalidad - Párrafo 1',
  labelNatalidadParrafo2: 'Natalidad - Párrafo 2',
  hintNatalidadParrafo1: 'Párrafo que describe los indicadores de natalidad del centro poblado',
  hintNatalidadParrafo2: 'Párrafo que describe los indicadores de mortalidad del centro poblado',
  placeholderNatalidadParrafo1: 'Ej: Este ítem proporciona una visión crucial de la dinámica demográfica...',
  placeholderNatalidadParrafo2: 'Ej: Respecto a la mortalidad, se puede observar que el número de defunciones...',
  
  labelTituloNatalidad: 'Título — Indicadores de natalidad y mortalidad',
  placeholderTituloNatalidad: 'Ej: Indicadores de natalidad y mortalidad – CP _____ (2023-2024)',
  labelTabdlaNatalidad: 'Tabla Indicadores de natalidad y mortalidad',
  labelFuenteNatalidad: 'Fuente',
  placeholderFuenteNatalidad: 'Ej: GEADES (2024)',
  
  // ============ SECCIÓN B: MORBILIDAD ============
  tituloSubseccionB: 'b. Morbilidad',
  labelMorbilidadParrafo: 'Morbilidad - Texto Completo',
  hintMorbilidadParrafo: 'Párrafo que describe los indicadores de morbilidad del distrito',
  placeholderMorbilidadParrafo: 'Ej: Entre los grupos de morbilidad que se hallan a nivel distrital...',
  
  labelTituloMorbilidad: 'Título — Casos por grupos de morbilidad',
  placeholderTituloMorbilidad: 'Ej: Casos por grupos de morbilidad – Distrito _____ (2023)',
  labelTablaMorbilidad: 'Tabla Casos por grupos de morbilidad',
  labelFuenteMorbilidad: 'Fuente',
  placeholderFuenteMorbilidad: 'Ej: REUNIS (2024)',
  
  // ============ SECCIÓN C: AFILIACIÓN A SEGUROS ============
  tituloSubseccionC: 'c. Población afiliada a Seguros de Salud',
  labelAfiliacionParrafo: 'Población afiliada a Seguros de Salud - Texto Completo',
  hintAfiliacionParrafo: 'Párrafo que describe la afiliación a seguros de salud de la población',
  placeholderAfiliacionParrafo: 'Ej: En el CP _____, la mayor parte de los habitantes se encuentra afiliada...',
  
  labelTituloAfiliacion: 'Título — Población según tipo de seguro de salud afiliado',
  placeholderTituloAfiliacion: 'Ej: Población según tipo de seguro de salud afiliado – CP _____ (2017)',
  labelTablaAfiliacion: 'Tabla Población según tipo de seguro de salud afiliado',
  labelFuenteAfiliacion: 'Fuente',
  placeholderFuenteAfiliacion: 'Ej: INEI (2017)',
  
  // ============ VALORES POR DEFECTO Y FALLBACKS ============
  centroPobladoDefault: 'Cahuacho',
  distritoDefault: 'Cahuacho',
  fotoTituloDefault: 'Sección 29',
  fotoFuenteDefault: 'GEADES, 2024',
  
  // ============ TABLAS - COLUMNAS ============
  columnAñoLabel: 'Año',
  columnNatalidadLabel: 'Natalidad',
  columnMortalidadLabel: 'Mortalidad',
  columnGrupoMorbilidadLabel: 'Grupo de Morbilidad',
  columnEdad0_11Label: '0 – 11',
  columnEdad12_17Label: '12 – 17',
  columnEdad18_29Label: '18 – 29',
  columnEdad30_59Label: '30 – 59',
  columnEdad60_masLabel: '60 - >',
  columnCasosTotalesLabel: 'Casos Totales',
  columnCategoriaAfiliacionLabel: 'Categoría de Afiliación',
  columnPoblacionLabel: 'Población',
  columnPorcentajeLabel: 'Porcentaje',
};

// ============ TEXTOS POR DEFECTO GENERADOS (FALLBACKS) ============
export const SECCION29_DEFAULT_TEXTS = {
  natalidadCP1: (centroPoblado: string, natalidad2023: number, natalidad2024: number) => 
    `Este ítem proporciona una visión crucial de la dinámica demográfica, reflejando las tendencias de crecimiento poblacional. Los datos obtenidos del trabajo de campo del Puesto de Salud ${centroPoblado} indican que, durante el año 2023, se registró un total de ${natalidad2023} nacimientos. Para el año 2024 (hasta el 14 de noviembre), se registró únicamente ${natalidad2024} nacimiento.`,
  
  natalidadCP2: (mortalidad2023: number, mortalidad2024: number) =>
    `Respecto a la mortalidad, se puede observar que el número de defunciones en la localidad fue de ${mortalidad2023} durante el año 2023. Sin embargo, para el año 2024, sí se registró ${mortalidad2024} defunción.`,
  
  morbilidadCP: (distrito: string, centroPoblado: string, infecciones: number, obesidad: number) =>
    `Entre los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca al Puesto de Salud ${centroPoblado}), para el año 2023, los más frecuentes fueron las infecciones agudas de las vías respiratorias superiores (${infecciones} casos) y la obesidad y otros de hiperalimentación (${obesidad} casos).`,
  
  afiliacionSalud: (centroPoblado: string, sis: string, essalud: string, sinseguro: string) =>
    `En el CP ${centroPoblado}, la mayor parte de los habitantes se encuentra afiliada a algún tipo de seguro de salud. Es así que el grupo mayoritario corresponde al Seguro Integral de Salud (SIS), el cual representa el ${sis} de la población. En menor medida, se halla la afiliación a ESSALUD, que representa el ${essalud} de la población. Por último, cabe mencionar que el ${sinseguro} de la población no cuenta con ningún tipo de seguro de salud.`,
};

export const SECCION29_PHOTO_PREFIXES = [
  'fotografiaCahuacho'
];

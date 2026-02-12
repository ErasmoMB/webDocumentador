/**
 * Constantes compartidas para Sección 13 - Indicadores de Salud
 * Usadas en form y view para evitar duplicación
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
  'afiliacionSaludTabla'
];

export const SECCION13_PHOTO_PREFIX = 'fotografiaSaludIndicadores';

export const SECCION13_SECTION_ID = '3.1.4.A.1.9';
export const SECCION13_DEFAULT_SUBSECTION = '3.1.4.A.1.9';

// Configuración de tablas
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

// Columnas para tablas
export const SECCION13_COLUMNAS_NATALIDAD_MORTALIDAD = [
  { field: 'anio', label: 'Año', type: 'text' as const, placeholder: '2023' },
  { field: 'natalidad', label: 'Natalidad', type: 'number' as const, placeholder: '0' },
  { field: 'mortalidad', label: 'Mortalidad', type: 'number' as const, placeholder: '0' }
];

export const SECCION13_COLUMNAS_MORBILIDAD = [
  { field: 'grupo', label: 'Grupo de Morbilidad', type: 'text' as const, placeholder: 'Infecciones agudas' },
  { field: 'rango0_11', label: '0 – 11', type: 'number' as const, placeholder: '0' },
  { field: 'rango12_17', label: '12 – 17', type: 'number' as const, placeholder: '0' },
  { field: 'rango18_29', label: '18 – 29', type: 'number' as const, placeholder: '0' },
  { field: 'rango30_59', label: '30 – 59', type: 'number' as const, placeholder: '0' },
  { field: 'rango60', label: '60 ->', type: 'number' as const, placeholder: '0' },
  { field: 'casos', label: 'Casos Totales', type: 'number' as const, placeholder: '0', readonly: true }
];

export const SECCION13_COLUMNAS_AFILIACION_SALUD = [
  { field: 'categoria', label: 'Categoría', type: 'text' as const, placeholder: 'SIS' },
  { field: 'casos', label: 'Casos', type: 'number' as const, placeholder: '0' },
  { field: 'porcentaje', label: 'Porcentaje', type: 'text' as const, placeholder: '0%', readonly: true }
];

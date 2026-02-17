/**
 * Constantes compartidas para Sección 6 (Aspectos Demográficos)
 * Usadas en form y view para evitar duplicación
 */

import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableColumn } from 'src/app/shared/components/dynamic-table/dynamic-table.component';

export const SECCION6_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'poblacionSexoAISD',
  'poblacionEtarioAISD',
  'textoPoblacionSexoAISD',
  'textoPoblacionEtarioAISD',
  'tituloPoblacionSexoAISD',
  'tituloPoblacionEtarioAISD',
  'fuentePoblacionSexoAISD',
  'fuentePoblacionEtarioAISD',
  'fotografiaDemografia',
  // Variantes con prefijos
  'poblacionSexoAISD_A1',
  'poblacionSexoAISD_A2',
  'poblacionEtarioAISD_A1',
  'poblacionEtarioAISD_A2',
  'textoPoblacionSexoAISD_A1',
  'textoPoblacionSexoAISD_A2',
  'textoPoblacionEtarioAISD_A1',
  'textoPoblacionEtarioAISD_A2',
  'tituloPoblacionSexoAISD_A1',
  'tituloPoblacionSexoAISD_A2',
  'tituloPoblacionEtarioAISD_A1',
  'tituloPoblacionEtarioAISD_A2',
  'fuentePoblacionSexoAISD_A1',
  'fuentePoblacionSexoAISD_A2',
  'fuentePoblacionEtarioAISD_A1',
  'fuentePoblacionEtarioAISD_A2',
  // Fotos con prefijos (10 máximo)
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDemografia${i + 1}Titulo`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDemografia${i + 1}Fuente`),
  ...Array.from({ length: 10 }, (_, i) => `fotografiaDemografia${i + 1}Imagen`),
];

export const SECCION6_PHOTO_PREFIXES = {
  DEMOGRAFIA: 'fotografiaDemografia'
} as const;

export const SECCION6_SECTION_ID = '3.1.4';
export const SECCION6_DEFAULT_SUBSECTION = '3.1.4.A.1.2';
export const SECCION6_CONFIG = {
  sectionId: '3.1.4.A.1.2',
  title: 'Aspectos Demográficos',
  photoPrefix: 'fotografiaDemografia',
  maxPhotos: 10
} as const;

// Campos de tablas con prefijo dinámico
export const SECCION6_TABLE_FIELDS = {
  SEXO: 'poblacionSexoAISD',
  ETARIO: 'poblacionEtarioAISD',
  TEXTO_SEXO: 'textoPoblacionSexoAISD',
  TEXTO_ETARIO: 'textoPoblacionEtarioAISD',
  TITULO_SEXO: 'tituloPoblacionSexoAISD',
  TITULO_ETARIO: 'tituloPoblacionEtarioAISD',
  FUENTE_SEXO: 'fuentePoblacionSexoAISD',
  FUENTE_ETARIO: 'fuentePoblacionEtarioAISD'
} as const;

// Número máximo de fotos por grupo
export const SECCION6_MAX_PHOTOS = 10;

/**
 * ✅ SECCION6_TEMPLATES - Todos los textos visibles
 */
export const SECCION6_TEMPLATES = {
  // Títulos y encabezados
  tituloSeccion: 'Aspectos Demográficos',
  tituloSubseccion: 'A.1.2 Aspectos Demográficos',
  tituloEditarParrafos: 'Editar Párrafos',

  // Sección a: Población por sexo
  tituloSexo: 'a. Población según sexo',
  labelTextoPoblacionSexo: 'Población según Sexo - Texto Completo',
  hintTextoPoblacionSexo: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  labelTituloTablaSexo: 'Título de la Tabla',
  placeholderTituloTablaSexo: 'Ej: Población por sexo',
  labelTablaPoblacionSexo: 'Población por Sexo',
  labelFuenteTablaSexo: 'Fuente de la Tabla',
  placeholderFuenteTablaSexo: 'Ej: GEADES, 2024',
  tituloTablaSexoDefault: 'Población por sexo – CC {COMUNIDAD} (2017)',
  fuenteTablaSexoDefault: 'GEADES (2024)',

  // Sección b: Población por grupo etario
  tituloEtario: 'b. Población según grupo etario',
  labelTextoPoblacionEtario: 'Población por Grupo Etario - Texto Completo',
  hintTextoPoblacionEtario: 'Edite el texto completo. Use Enter para crear nuevos párrafos. Deje vacío para usar el texto por defecto.',
  labelTituloTablaEtario: 'Título de la Tabla',
  placeholderTituloTablaEtario: 'Ej: Población por grupo etario',
  labelTablaEtario: 'Población por Grupo Etario',
  labelFuenteTablaEtario: 'Fuente de la Tabla',
  placeholderFuenteTablaEtario: 'Ej: GEADES, 2024',
  tituloTablaEtarioDefault: 'Población por grupo etario – CC {COMUNIDAD} (2017)',
  fuenteTablaEtarioDefault: 'GEADES (2024)',

  // Labels fotos
  labelFotografias: 'Fotografías de Aspectos Demográficos',
  labelFotoTitulo: 'Título de la fotografía',
  labelFotoFuente: 'Fuente de la fotografía',
  labelFotoImagen: 'Fotografía - Imagen',
  placeholderFotoTitulo: 'Ej: Vivienda de la CC {COMUNIDAD}',
  placeholderFotoFuente: 'Ej: GEADES, 2024',
  fotoTituloDefault: 'Vivienda de la CC {COMUNIDAD}',
  fotoFuenteDefault: 'GEADES, 2024',

  // Tabla headers
  headerSexo: 'Sexo',
  headerCasos: 'Casos',
  headerPorcentaje: 'Porcentaje',
  headerCategoria: 'Categoría',
  headerGrupoEdad: 'Grupo de edad',
  headerTotal: 'Total',

  // Placeholders
  placeholderVacio: '____',

  // Textos por defecto para párrafos
  textoPoblacionSexoDefault: `En la CC {COMUNIDAD}, según datos del censo nacional más reciente, la población se distribuye de la siguiente manera según sexo:

La estructura de la población por sexo refleja características típicas del ámbito rural andino, donde se observa una distribución relativamente equilibrada entre hombres y mujeres. Esta composición poblacional tiene implicaciones importantes para el diseño e implementación de políticas de desarrollo local.`,

  textoPoblacionEtarioDefault: `La estructura etaria de la CC {COMUNIDAD} presenta la siguiente configuración:

La composición por grupos de edad refleja patrones de migración y acceso a servicios de salud característicos de comunidades campesinas de la región. La predominancia de población en edad productiva es un factor importante para el análisis de oportunidades de desarrollo local.`,

  // Labels vista
  labelFuente: 'FUENTE'
} as const;

/**
 * ✅ CONFIGURACIÓN DE TABLAS - SECCIÓN 6
 */

/**
 * Configuración para tabla de población por sexo
 */
export const SECCION6_TABLA_POBLACION_SEXO_CONFIG: TableConfig = {
  tablaKey: 'poblacionSexoAISD',
  totalKey: '',
  campoTotal: '',
  campoPorcentaje: '',
  calcularPorcentajes: false,
  camposParaCalcular: ['casos'],
  noInicializarDesdeEstructura: true,
  permiteAgregarFilas: true,
  permiteEliminarFilas: true
};

/**
 * Columnas para tabla de población por sexo
 */
export const SECCION6_COLUMNAS_POBLACION_SEXO: TableColumn[] = [
  {
    field: 'sexo',
    label: SECCION6_TEMPLATES.headerSexo,
    type: 'text' as const,
    placeholder: 'Femenino, Masculino, etc.',
    readonly: false
  },
  {
    field: 'casos',
    label: SECCION6_TEMPLATES.headerCasos,
    type: 'number' as const,
    dataType: 'number' as const
  },
  {
    field: 'porcentaje',
    label: SECCION6_TEMPLATES.headerPorcentaje,
    type: 'text' as const,
    readonly: true
  }
];

/**
 * Configuración para tabla de población por grupos etarios
 */
export const SECCION6_TABLA_POBLACION_ETARIO_CONFIG: TableConfig = {
  tablaKey: 'poblacionEtarioAISD',
  totalKey: '',
  campoTotal: '',
  campoPorcentaje: '',
  calcularPorcentajes: false,
  camposParaCalcular: ['casos'],
  noInicializarDesdeEstructura: true,
  permiteAgregarFilas: true,
  permiteEliminarFilas: true
};

/**
 * Columnas para tabla de población por grupos etarios
 */
export const SECCION6_COLUMNAS_POBLACION_ETARIO: TableColumn[] = [
  {
    field: 'categoria',
    label: SECCION6_TEMPLATES.headerCategoria,
    type: 'text' as const,
    placeholder: SECCION6_TEMPLATES.headerGrupoEdad,
    readonly: false
  },
  {
    field: 'casos',
    label: SECCION6_TEMPLATES.headerCasos,
    type: 'number' as const,
    dataType: 'number' as const
  },
  {
    field: 'porcentaje',
    label: SECCION6_TEMPLATES.headerPorcentaje,
    type: 'text' as const,
    readonly: true
  }
];

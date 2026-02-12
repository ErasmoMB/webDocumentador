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
  'fotografiaDemografia'
];

export const SECCION6_PHOTO_PREFIXES = {
  DEMOGRAFIA: 'fotografiaDemografia'
} as const;

export const SECCION6_SECTION_ID = '3.1.4';
export const SECCION6_DEFAULT_SUBSECTION = '3.1.4.A.1.2';

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
 * ✅ CONFIGURACIÓN DE TABLAS - SECCIÓN 6
 */

/**
 * Configuración para tabla de población por sexo
 */
export const SECCION6_TABLA_POBLACION_SEXO_CONFIG: TableConfig = {
  tablaKey: 'poblacionSexoAISD',
  totalKey: 'sexo',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  calcularPorcentajes: true,
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
    label: 'Sexo',
    type: 'text' as const,
    placeholder: 'Femenino, Masculino, etc.',
    readonly: true
  },
  {
    field: 'casos',
    label: 'Casos',
    type: 'number' as const,
    dataType: 'number' as const
  },
  {
    field: 'porcentaje',
    label: 'Porcentaje',
    type: 'text' as const,
    readonly: true
  }
];

/**
 * Configuración para tabla de población por grupos etarios
 */
export const SECCION6_TABLA_POBLACION_ETARIO_CONFIG: TableConfig = {
  tablaKey: 'poblacionEtarioAISD',
  totalKey: 'categoria',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  calcularPorcentajes: true,
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
    label: 'Categoría',
    type: 'text' as const,
    placeholder: 'Grupo de edad',
    readonly: true
  },
  {
    field: 'casos',
    label: 'Casos',
    type: 'number' as const,
    dataType: 'number' as const
  },
  {
    field: 'porcentaje',
    label: 'Porcentaje',
    type: 'text' as const,
    readonly: true
  }
];

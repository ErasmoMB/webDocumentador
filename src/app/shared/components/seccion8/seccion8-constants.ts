/**
 * Constantes compartidas para Sección 8 (Actividades Económicas)
 */

import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { TableColumn } from 'src/app/shared/components/dynamic-table/dynamic-table.component';

export const SECCION8_WATCHED_FIELDS: string[] = [
  'grupoAISD',
  'parrafoSeccion8_ganaderia_completo',
  'parrafoSeccion8_agricultura_completo',
  'peaOcupacionesTabla',
  'poblacionPecuariaTabla',
  'caracteristicasAgriculturaTabla',
  'fotografiaGanaderia',
  'fotografiaAgricultura',
  'fotografiaComercio'
];

export const SECCION8_PHOTO_PREFIXES = {
  GANADERIA: 'fotografiaGanaderia',
  AGRICULTURA: 'fotografiaAgricultura',
  COMERCIO: 'fotografiaComercio'
} as const;

export const SECCION8_SECTION_ID = '3.1.4.A.1.4';
export const SECCION8_DEFAULT_SUBSECTION = '3.1.4.A.1.4';

/**
 * ✅ CONFIGURACIÓN DE TABLAS - SECCIÓN 8
 */

/**
 * Configuración para tabla PEA Ocupaciones
 */
export const SECCION8_TABLA_PEA_OCUPACIONES_CONFIG: TableConfig = {
  tablaKey: 'peaOcupacionesTabla',
  totalKey: 'categoria',
  campoTotal: 'casos',
  campoPorcentaje: 'porcentaje',
  calcularPorcentajes: true,
  camposParaCalcular: ['casos'],
  estructuraInicial: []
};

/**
 * Columnas para tabla PEA Ocupaciones
 */
export const SECCION8_COLUMNAS_PEA_OCUPACIONES: TableColumn[] = [
  {
    field: 'categoria',
    label: 'Categoría',
    type: 'text' as const,
    placeholder: 'Trabajador independiente'
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
 * Configuración para tabla de población pecuaria
 */
export const SECCION8_TABLA_POBLACION_PECUARIA_CONFIG: TableConfig = {
  tablaKey: 'poblacionPecuariaTabla',
  totalKey: '',
  estructuraInicial: []
};

/**
 * Columnas para tabla de población pecuaria
 */
export const SECCION8_COLUMNAS_POBLACION_PECUARIA: TableColumn[] = [
  {
    field: 'especie',
    label: 'Especie',
    type: 'text' as const,
    placeholder: 'Vacuno, Ovino, etc.'
  },
  {
    field: 'cantidadPromedio',
    label: 'Cantidad promedio por familia',
    type: 'text' as const,
    placeholder: '5-10'
  },
  {
    field: 'ventaUnidad',
    label: 'Venta por unidad',
    type: 'text' as const,
    placeholder: 'S/ 1500'
  }
];

/**
 * Configuración para tabla de características de agricultura
 */
export const SECCION8_TABLA_CARACTERISTICAS_AGRICULTURA_CONFIG: TableConfig = {
  tablaKey: 'caracteristicasAgriculturaTabla',
  totalKey: '',
  estructuraInicial: []
};

/**
 * Columnas para tabla de características de agricultura
 */
export const SECCION8_COLUMNAS_CARACTERISTICAS_AGRICULTURA: TableColumn[] = [
  {
    field: 'categoria',
    label: 'Categoría',
    type: 'text' as const,
    placeholder: 'Cultivos principales'
  },
  {
    field: 'detalle',
    label: 'Detalle',
    type: 'text' as const,
    placeholder: 'Papa, maíz, trigo'
  }
];

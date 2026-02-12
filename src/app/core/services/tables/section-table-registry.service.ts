import { Injectable } from '@angular/core';
import { TableConfig } from './table-management.service';

/**
 * 📋 REGISTRO CENTRAL DE CONFIGURACIONES DE TABLAS
 * 
 * Centraliza TODAS las configuraciones de tablas de todas las secciones
 * en un solo lugar para facilitar mantenimiento y evitar duplicación.
 * 
 * BENEFICIOS:
 * - ✅ Single Source of Truth para configs de tablas
 * - ✅ Fácil mantenimiento (un solo archivo)
 * - ✅ Reutilizable entre secciones
 * - ✅ Tipado fuerte con TypeScript
 * 
 * USO:
 * ```typescript
 * const config = this.tableRegistry.getTableConfig('seccion10', 'abastecimientoAguaTabla');
 * ```
 */

export interface TableDefinition {
  /** Nombre del campo/tabla (sin prefijo) */
  fieldName: string;
  /** Configuración de la tabla */
  config: TableConfig;
  /** Columnas de la tabla (opcional, puede venir del metadata) */
  columns?: Array<{
    field: string;
    label: string;
    type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
    placeholder?: string;
    readonly?: boolean;
    dataType?: 'string' | 'number' | 'boolean' | 'percentage';
    allowedValues?: string[];
    errorMessage?: string;
  }>;
}

export interface SectionTableDefinitions {
  sectionId: string;
  tables: Record<string, TableDefinition>;
}

@Injectable({
  providedIn: 'root'
})
export class SectionTableRegistryService {
  
  /**
   * 🗂️ REGISTRO COMPLETO DE TABLAS POR SECCIÓN
   * 
   * Formato:
   * {
   *   'seccion1': { tabla1: {...}, tabla2: {...} },
   *   'seccion2': { tabla1: {...}, tabla2: {...} },
   *   ...
   * }
   */
  private readonly tableDefinitions: Record<string, Record<string, TableDefinition>> = {
    
    // ========================================
    // SECCIÓN 5 - Institucionalidad
    // ========================================
    'seccion5': {
      'tablepagina6': {
        fieldName: 'tablepagina6',
        config: {
          tablaKey: 'tablepagina6',
          totalKey: 'categoria',
          campoTotal: 'categoria',
          campoPorcentaje: '',
          estructuraInicial: [{ categoria: '', respuesta: '', nombre: '', comentario: '' }]
        }
      }
    },

    // ========================================
    // SECCIÓN 7 - PEA y Empleo
    // ========================================
    'seccion7': {
      'peaTabla': {
        fieldName: 'peaTabla',
        config: {
          tablaKey: 'peaTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'peaOcupadaTabla': {
        fieldName: 'peaOcupadaTabla',
        config: {
          tablaKey: 'peaOcupadaTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 9 - Viviendas
    // ========================================
    'seccion9': {
      'condicionOcupacionTabla': {
        fieldName: 'condicionOcupacionTabla',
        config: {
          tablaKey: 'condicionOcupacionTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'tiposViviendaTabla': {
        fieldName: 'tiposViviendaTabla',
        config: {
          tablaKey: 'tiposViviendaTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'materialesViviendaTabla': {
        fieldName: 'materialesViviendaTabla',
        config: {
          tablaKey: 'materialesViviendaTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 10 - Servicios Básicos
    // ========================================
    'seccion10': {
      'abastecimientoAguaTabla': {
        fieldName: 'abastecimientoAguaTabla',
        config: {
          tablaKey: 'abastecimientoAguaTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'tiposSaneamientoTabla': {
        fieldName: 'tiposSaneamientoTabla',
        config: {
          tablaKey: 'tiposSaneamientoTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'saneamientoTabla': {
        fieldName: 'saneamientoTabla',
        config: {
          tablaKey: 'saneamientoTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'alumbradoElectricoTabla': {
        fieldName: 'alumbradoElectricoTabla',
        config: {
          tablaKey: 'alumbradoElectricoTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 13 - Salud
    // ========================================
    'seccion13': {
      'morbilidadTabla': {
        fieldName: 'morbilidadTabla',
        config: {
          tablaKey: 'morbilidadTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'afiliacionSaludTabla': {
        fieldName: 'afiliacionSaludTabla',
        config: {
          tablaKey: 'afiliacionSaludTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 14 - Educación
    // ========================================
    'seccion14': {
      'nivelEducativoTabla': {
        fieldName: 'nivelEducativoTabla',
        config: {
          tablaKey: 'nivelEducativoTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 18 - NBI
    // ========================================
    'seccion18': {
      'nbiCCTabla': {
        fieldName: 'nbiCCTabla',
        config: {
          tablaKey: 'nbiCCTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      },
      'nbiDistritoTabla': {
        fieldName: 'nbiDistritoTabla',
        config: {
          tablaKey: 'nbiDistritoTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    },

    // ========================================
    // SECCIÓN 24 - Actividades Económicas AISI
    // ========================================
    'seccion24': {
      'actividadesEconomicasTabla': {
        fieldName: 'actividadesEconomicasTabla',
        config: {
          tablaKey: 'actividadesEconomicasTabla',
          totalKey: 'categoria',
          campoTotal: 'casos',
          campoPorcentaje: 'porcentaje',
          calcularPorcentajes: true,
          camposParaCalcular: ['casos']
        }
      }
    }
  };

  /**
   * 🔍 Obtiene la configuración de una tabla específica
   * 
   * @param sectionKey - Identificador de sección (ej: 'seccion10', 'seccion7')
   * @param tableKey - Nombre de la tabla (ej: 'abastecimientoAguaTabla')
   * @returns Configuración de la tabla o undefined si no existe
   */
  getTableConfig(sectionKey: string, tableKey: string): TableConfig | undefined {
    const sectionTables = this.tableDefinitions[sectionKey];
    if (!sectionTables) return undefined;
    
    const tableDef = sectionTables[tableKey];
    return tableDef?.config;
  }

  /**
   * 🔍 Obtiene la definición completa de una tabla
   * 
   * @param sectionKey - Identificador de sección
   * @param tableKey - Nombre de la tabla
   * @returns Definición completa o undefined
   */
  getTableDefinition(sectionKey: string, tableKey: string): TableDefinition | undefined {
    const sectionTables = this.tableDefinitions[sectionKey];
    if (!sectionTables) return undefined;
    
    return sectionTables[tableKey];
  }

  /**
   * 🔍 Obtiene todas las tablas de una sección
   * 
   * @param sectionKey - Identificador de sección
   * @returns Record con todas las definiciones de tablas de la sección
   */
  getSectionTables(sectionKey: string): Record<string, TableDefinition> | undefined {
    return this.tableDefinitions[sectionKey];
  }

  /**
   * ✅ Registra una nueva tabla dinámicamente
   * 
   * Útil para secciones que necesitan configuración en runtime
   * 
   * @param sectionKey - Identificador de sección
   * @param tableKey - Nombre de la tabla
   * @param definition - Definición de la tabla
   */
  registerTable(sectionKey: string, tableKey: string, definition: TableDefinition): void {
    if (!this.tableDefinitions[sectionKey]) {
      this.tableDefinitions[sectionKey] = {};
    }
    
    this.tableDefinitions[sectionKey][tableKey] = definition;
  }

  /**
   * 🔍 Verifica si una tabla existe en el registro
   * 
   * @param sectionKey - Identificador de sección
   * @param tableKey - Nombre de la tabla
   * @returns true si la tabla está registrada
   */
  hasTable(sectionKey: string, tableKey: string): boolean {
    return !!(this.tableDefinitions[sectionKey]?.hasOwnProperty(tableKey));
  }
}

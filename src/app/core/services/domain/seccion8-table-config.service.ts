import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { TableColumn } from 'src/app/shared/components/dynamic-table/dynamic-table.component';

/**
 * Servicio de Configuración de Tablas para Sección 8
 * Responsable de proporcionar configuraciones de tablas dinámicas
 * para actividades económicas (PEA, ganadería, agricultura)
 */
@Injectable({ providedIn: 'root' })
export class Seccion8TableConfigService {

  /**
   * Obtiene la configuración para la tabla PEA Ocupaciones
   */
  getTablaPEAOcupacionesConfig(): TableConfig {
    return {
      tablaKey: 'peaOcupacionesTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos'],
      estructuraInicial: [] // ✅ Tabla vacía por defecto
    };
  }

  /**
   * Obtiene las columnas para la tabla PEA Ocupaciones
   */
  getColumnasPEAOcupaciones(): TableColumn[] {
    return [
      {
        field: 'categoria',
        label: 'Categoría',
        type: 'text',
        placeholder: 'Trabajador independiente'
      },
      {
        field: 'casos',
        label: 'Casos',
        type: 'number',
        dataType: 'number'
      },
      {
        field: 'porcentaje',
        label: 'Porcentaje',
        type: 'text',
        readonly: true  // ✅ Campo calculado automáticamente
      }
    ];
  }

  /**
   * Obtiene la configuración para la tabla de población pecuaria
   */
  getTablaPoblacionPecuariaConfig(): TableConfig {
    return {
      tablaKey: 'poblacionPecuariaTabla',
      totalKey: '',
      estructuraInicial: [] // ✅ Tabla vacía por defecto
    };
  }

  /**
   * Obtiene las columnas para la tabla de población pecuaria
   */
  getColumnasPoblacionPecuaria(): TableColumn[] {
    return [
      {
        field: 'especie',
        label: 'Especie',
        type: 'text',
        placeholder: 'Vacuno, Ovino, etc.'
      },
      {
        field: 'cantidadPromedio',
        label: 'Cantidad promedio por familia',
        type: 'text',
        placeholder: '5-10'
      },
      {
        field: 'ventaUnidad',
        label: 'Venta por unidad',
        type: 'text',
        placeholder: 'S/ 1500'
      }
    ];
  }

  /**
   * Obtiene la configuración para la tabla de características de agricultura
   */
  getTablaCaracteristicasAgriculturaConfig(): TableConfig {
    return {
      tablaKey: 'caracteristicasAgriculturaTabla',
      totalKey: '',
      estructuraInicial: [] // ✅ Tabla vacía por defecto
    };
  }

  /**
   * Obtiene las columnas para la tabla de características de agricultura
   */
  getColumnasCaracteristicasAgricultura(): TableColumn[] {
    return [
      {
        field: 'categoria',
        label: 'Categoría',
        type: 'text',
        placeholder: 'Cultivos principales'
      },
      {
        field: 'detalle',
        label: 'Detalle',
        type: 'text',
        placeholder: 'Papa, maíz, trigo'
      }
    ];
  }
}

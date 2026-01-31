import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { TableColumn } from 'src/app/shared/components/dynamic-table/dynamic-table.component';

/**
 * Servicio de Configuración de Tablas para Sección 6
 * Responsable de proporcionar configuraciones de tablas dinámicas
 * para población por sexo y grupos etarios
 */
@Injectable({ providedIn: 'root' })
export class Seccion6TableConfigService {

  /**
   * Obtiene la configuración para la tabla de población por sexo
   */
  getTablaPoblacionSexoConfig(): TableConfig {
    return {
      tablaKey: 'poblacionSexoAISD',
      totalKey: 'sexo',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,          // ✅ Habilitar cálculo automático
      camposParaCalcular: ['casos'],      // ✅ Campos que disparan recálculo
      estructuraInicial: [
        { sexo: 'Femenino', casos: 0 },
        { sexo: 'Masculino', casos: 0 }
      ]
    };
  }

  /**
   * Obtiene las columnas para la tabla de población por sexo
   */
  getColumnasPoblacionSexo(): TableColumn[] {
    return [
      {
        field: 'sexo',
        label: 'Sexo',
        type: 'text',
        placeholder: 'Femenino, Masculino, etc.'
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
   * Obtiene la configuración para la tabla de población por grupos etarios
   */
  getTablaPoblacionEtarioConfig(): TableConfig {
    return {
      tablaKey: 'poblacionEtarioAISD',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,          // ✅ Habilitar cálculo automático
      camposParaCalcular: ['casos'],      // ✅ Campos que disparan recálculo
      estructuraInicial: [
        { categoria: '0-14 años', casos: 0 },
        { categoria: '15-64 años', casos: 0 },
        { categoria: '65+ años', casos: 0 }
      ]
    };
  }

  /**
   * Obtiene las columnas para la tabla de población por grupos etarios
   */
  getColumnasPoblacionEtario(): TableColumn[] {
    return [
      {
        field: 'categoria',
        label: 'Categoría',
        type: 'text',
        placeholder: 'Grupo de edad'
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
}

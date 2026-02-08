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
        { sexo: 'Hombre', casos: 0 },
        { sexo: 'Mujer', casos: 0 }
      ],
      permiteAgregarFilas: false,         // ✅ No agregar filas con estructura inicial
      permiteEliminarFilas: false,        // ✅ No eliminar filas de estructura inicial
      camposNoEditables: ['sexo']         // ✅ Campo de categoría no editable
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
        placeholder: 'Femenino, Masculino, etc.',
        readonly: true  // ✅ Campo de estructura inicial no editable
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
        { categoria: '0 a 14 años', casos: 0 },
        { categoria: '15 a 29 años', casos: 0 },
        { categoria: '30 a 44 años', casos: 0 },
        { categoria: '45 a 64 años', casos: 0 },
        { categoria: '65 años a más', casos: 0 }
      ],
      permiteAgregarFilas: false,         // ✅ No agregar filas con estructura inicial
      permiteEliminarFilas: false,        // ✅ No eliminar filas de estructura inicial
      camposNoEditables: ['categoria']    // ✅ Campo de categoría no editable
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
        placeholder: 'Grupo de edad',
        readonly: true  // ✅ Campo de estructura inicial no editable
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

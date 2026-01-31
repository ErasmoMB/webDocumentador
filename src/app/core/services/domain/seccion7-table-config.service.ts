import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { TableColumn } from '../../../shared/components/dynamic-table/dynamic-table.component';

@Injectable({
  providedIn: 'root'
})
export class Seccion7TableConfigService {

  /**
   * Configuración para la tabla PET (Población en Edad de Trabajar)
   */
  getTablaPETConfig(): TableConfig {
    return {
      tablaKey: 'petTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  getColumnasPET(): TableColumn[] {
    return [
      { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Grupo de edad' },
      { field: 'casos', label: 'Casos', type: 'number', dataType: 'number' },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ];
  }

  /**
   * Configuración para la tabla PEA (Población Económicamente Activa)
   */
  getTablaPEAConfig(): TableConfig {
    return {
      tablaKey: 'peaTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  getColumnasPEA(): TableColumn[] {
    return [
      { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'PEA, No PEA' },
      { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
      { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
      { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
      { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
      { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ];
  }

  /**
   * Configuración para la tabla PEA Ocupada
   */
  getTablaPEAOcupadaConfig(): TableConfig {
    return {
      tablaKey: 'peaOcupadaTabla',
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['hombres', 'mujeres', 'casos']
    };
  }

  getColumnasPEAOcupada(): TableColumn[] {
    return [
      { field: 'categoria', label: 'Categoría', type: 'text', placeholder: 'Ocupada, Desocupada' },
      { field: 'hombres', label: 'Hombres', type: 'number', dataType: 'number' },
      { field: 'porcentajeHombres', label: '% Hombres', type: 'text', readonly: true },
      { field: 'mujeres', label: 'Mujeres', type: 'number', dataType: 'number' },
      { field: 'porcentajeMujeres', label: '% Mujeres', type: 'text', readonly: true },
      { field: 'casos', label: 'Total', type: 'number', dataType: 'number', readonly: true },
      { field: 'porcentaje', label: 'Porcentaje', type: 'text', readonly: true }
    ];
  }
}

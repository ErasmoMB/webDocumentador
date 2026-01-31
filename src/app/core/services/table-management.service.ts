import { Injectable, Injector } from '@angular/core';
import { TableManagementFacade } from './tables/table-management.facade';
import { TableInitializationService } from './tables/table-initialization.service';
import { TableCalculationService } from './tables/table-calculation.service';
import { TableValidationService } from './tables/table-validation.service';
import { TableManipulationService } from './tables/table-manipulation.service';
import { TableQueryService } from './tables/table-query.service';
import { TableCalculationStrategyService } from './tables/table-calculation-strategy.service';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date';
  placeholder?: string;
}

export interface TableConfig {
  tablaKey: string;
  totalKey: string;
  campoTotal?: string;
  campoPorcentaje?: string;
  estructuraInicial?: any[];
  calcularPorcentajes?: boolean;
  camposParaCalcular?: string[];
}

/**
 * @deprecated FASE 2 - Migración SOLID: Este servicio está deprecated.
 * 
 * MIGRACIÓN OBLIGATORIA:
 * - Usar TableManagementFacade para compatibilidad temporal
 * - Migrar a servicios especializados según necesidad:
 *   - TableInitializationService: Solo inicialización
 *   - TableCalculationService: Solo cálculos
 *   - TableValidationService: Solo validación
 *   - TableManipulationService: Solo manipulación de filas
 *   - TableQueryService: Solo consultas
 * 
 * Fecha de eliminación: Sprint 5
 * 
 * ANTES:
 * ```typescript
 * constructor(private tableService: TableManagementService) {}
 * this.tableService.inicializarTabla(datos, config);
 * ```
 * 
 * DESPUÉS:
 * ```typescript
 * constructor(
 *   private tableFacade: TableManagementFacade,
 *   // O servicios específicos:
 *   private tableInit: TableInitializationService,
 *   private tableCalc: TableCalculationService
 * ) {}
 * this.tableFacade.inicializarTabla(datos, config);
 * // O mejor aún:
 * this.tableInit.inicializarTabla(datos, config);
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TableManagementService {
  private facade: TableManagementFacade;

  constructor(private injector: Injector) {
    const init = this.injector.get(TableInitializationService);
    const calc = this.injector.get(TableCalculationService);
    const validation = this.injector.get(TableValidationService);
    const manipulation = this.injector.get(TableManipulationService);
    const query = this.injector.get(TableQueryService);
    const calculationStrategy = this.injector.get(TableCalculationStrategyService);
    
    this.facade = new TableManagementFacade(init, calc, validation, manipulation, query, calculationStrategy);
  }

  inicializarTabla(datos: any, config: TableConfig): void {
    this.facade.inicializarTabla(datos, config);
  }

  agregarFila(datos: any, config: TableConfig, nuevaFila?: any): void {
    this.facade.agregarFila(datos, config, nuevaFila);
  }

  eliminarFila(datos: any, config: TableConfig, index: number): boolean {
    return this.facade.eliminarFila(datos, config, index);
  }

  actualizarFila(
    datos: any,
    config: TableConfig,
    index: number,
    field: string,
    value: any,
    autoCalcular: boolean = true
  ): void {
    this.facade.actualizarFila(datos, config, index, field, value, autoCalcular);
  }

  calcularPorcentajes(datos: any, config: TableConfig): void {
    this.facade.calcularPorcentajes(datos, config);
  }

  obtenerValorDeTabla(
    datos: any,
    tablaKey: string,
    campoBusqueda: string,
    valorBusqueda: string,
    campoRetorno: string
  ): string {
    return this.facade.obtenerValorDeTabla(datos, tablaKey, campoBusqueda, valorBusqueda, campoRetorno);
  }

  obtenerValorDeTablaPorIndicador(
    datos: any,
    tablaKey: string,
    indicador: string,
    campoRetorno: string
  ): string {
    return this.facade.obtenerValorDeTablaPorIndicador(datos, tablaKey, indicador, campoRetorno);
  }

  obtenerValorDeTablaPorCategoria(
    datos: any,
    tablaKey: string,
    categoria: string,
    campoRetorno: string
  ): string {
    return this.facade.obtenerValorDeTablaPorCategoria(datos, tablaKey, categoria, campoRetorno);
  }
}

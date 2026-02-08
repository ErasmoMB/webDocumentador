import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';
import { TableInitializationService } from './table-initialization.service';
import { TableCalculationService } from './table-calculation.service';
import { TableValidationService } from './table-validation.service';
import { TableManipulationService } from './table-manipulation.service';
import { TableQueryService } from './table-query.service';
import { TableCalculationStrategyService } from './table-calculation-strategy.service';
import { debugLog } from 'src/app/shared/utils/debug';

@Injectable({
  providedIn: 'root'
})
export class TableManagementFacade {

  constructor(
    private initialization: TableInitializationService,
    private calculation: TableCalculationService,
    private validation: TableValidationService,
    private manipulation: TableManipulationService,
    private query: TableQueryService,
    private calculationStrategy: TableCalculationStrategyService
  ) {}

  inicializarTabla(datos: any, config: TableConfig): void {
    this.initialization.inicializarTabla(datos, config);
  }

  agregarFila(datos: any, config: TableConfig, nuevaFila?: any): void {
    this.manipulation.agregarFila(datos, config, nuevaFila);
  }

  eliminarFila(datos: any, config: TableConfig, index: number): boolean {
    return this.manipulation.eliminarFila(datos, config, index);
  }

  /**
   * ✅ SOLID - SRP: Solo orquesta, delega la lógica de decisión a la estrategia
   * ✅ SOLID - DIP: Depende de abstracción (TableCalculationStrategyService)
   */
  actualizarFila(
    datos: any,
    config: TableConfig,
    index: number,
    field: string,
    value: any,
    autoCalcular: boolean = true
  ): void {
    // No logging ruidoso por defecto aquí. Use debugLog para trazas detalladas si es necesario.
    debugLog('[PORCENTAJES] 🔄 actualizarFila() llamado', {
      tablaKey: config.tablaKey,
      index,
      field,
      value,
      autoCalcular
    });
    
    this.manipulation.actualizarFila(datos, config, index, field, value);
    
    const campoAfectaCalculos = this.calculationStrategy.campoAfectaCalculos(config, field);
    debugLog('[PORCENTAJES] 🔍 Campo afecta cálculos?', campoAfectaCalculos);
    
    if (autoCalcular && campoAfectaCalculos) {
      debugLog('[PORCENTAJES] ⚡ Ejecutando cálculos automáticos...');
      this.ejecutarCalculosAutomaticos(datos, config);
    } else {
      debugLog('[PORCENTAJES] ⏭️ No se ejecutan cálculos automáticos');
    }
  }

  /**
   * ✅ SOLID - SRP: Método privado con responsabilidad única de ejecutar cálculos
   * ✅ SOLID - OCP: Usa estrategia que puede extenderse sin modificar este código
   */
  private ejecutarCalculosAutomaticos(datos: any, config: TableConfig): void {
    const tipoCalculo = this.calculationStrategy.obtenerTipoCalculo(config);
    debugLog('[PORCENTAJES] 🎯 Tipo de cálculo determinado:', tipoCalculo);
    
    switch (tipoCalculo) {
      case 'ambos':
        debugLog('[PORCENTAJES] 🔢 Ejecutando calcularTotalesYPorcentajes()');
        this.calcularTotalesYPorcentajes(datos, config);
        break;
      case 'porcentajes':
        debugLog('[PORCENTAJES] 🔢 Ejecutando calcularPorcentajes()');
        this.calcularPorcentajes(datos, config);
        break;
      case 'totales':
        debugLog('[PORCENTAJES] 🔢 Ejecutando calcularYActualizarTotales()');
        this.calcularYActualizarTotales(datos, config);
        break;
      case 'ninguno':
        debugLog('[PORCENTAJES] ⏭️ No se requiere cálculo');
        break;
    }
  }

  calcularPorcentajes(datos: any, config: TableConfig): void {
    this.calculation.calcularPorcentajes(datos, config);
  }

  calcularYActualizarTotales(datos: any, config: TableConfig): void {
    this.calculation.calcularYActualizarTotales(datos, config);
  }

  calcularTotalesYPorcentajes(datos: any, config: TableConfig): void {
    this.calculation.calcularTotalesYPorcentajes(datos, config);
  }

  /**
   * Cálculo especializado para tablas que tienen columnas Hombres / Mujeres / Casos
   * - Casos = Hombres + Mujeres
   * - %Hombres = Hombres / totalHombres
   * - %Mujeres = Mujeres / totalMujeres
   * - %Casos = Casos / totalCasos (ajustado para sumar 100)
   */
  calcularPorcentajesPorSexo(datos: any, config: TableConfig): void {
    if (typeof this.calculation.calcularPorcentajesPorSexo === 'function') {
      (this.calculation as any).calcularPorcentajesPorSexo(datos, config);
    }
  }

  obtenerValorDeTabla(
    datos: any,
    tablaKey: string,
    campoBusqueda: string,
    valorBusqueda: string,
    campoRetorno: string
  ): string {
    return this.query.obtenerValorDeTabla(datos, tablaKey, campoBusqueda, valorBusqueda, campoRetorno);
  }

  obtenerValorDeTablaPorIndicador(
    datos: any,
    tablaKey: string,
    indicador: string,
    campoRetorno: string
  ): string {
    return this.query.obtenerValorDeTablaPorIndicador(datos, tablaKey, indicador, campoRetorno);
  }

  obtenerValorDeTablaPorCategoria(
    datos: any,
    tablaKey: string,
    categoria: string,
    campoRetorno: string
  ): string {
    return this.query.obtenerValorDeTablaPorCategoria(datos, tablaKey, categoria, campoRetorno);
  }

  inicializarYCalcular(datos: any, config: TableConfig): void {
    this.initialization.inicializarTabla(datos, config);
    if (config.calcularPorcentajes) {
      this.calculation.calcularPorcentajes(datos, config);
    }
  }

  validarEstructura(tabla: any[], estructuraEsperada: any[]): boolean {
    return this.validation.validarEstructura(tabla, estructuraEsperada);
  }

  validarDatos(tabla: any[], config: TableConfig) {
    return this.validation.validarDatos(tabla, config);
  }
}

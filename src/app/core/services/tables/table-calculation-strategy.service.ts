import { Injectable } from '@angular/core';
import { TableConfig } from '../table-management.service';

/**
 * ✅ SOLID - SRP: Responsabilidad única de determinar cuándo y cómo calcular
 * ✅ SOLID - OCP: Abierto para extensión (nuevas estrategias), cerrado para modificación
 * ✅ SOLID - DIP: Depende de abstracción (TableConfig), no de implementación concreta
 */
@Injectable({
  providedIn: 'root'
})
export class TableCalculationStrategyService {

  /**
   * Determina si se deben calcular porcentajes basado en la configuración
   * @param config - Configuración de la tabla
   * @returns true si se deben calcular porcentajes automáticamente
   */
  debeCalcularPorcentajes(config: TableConfig): boolean {
    return !!config.campoPorcentaje && 
           (config.calcularPorcentajes !== false);
  }

  /**
   * Determina si se deben calcular totales basado en la configuración
   * @param config - Configuración de la tabla
   * @returns true si se deben calcular totales automáticamente
   */
  debeCalcularTotales(config: TableConfig): boolean {
    return !!config.campoTotal;
  }

  /**
   * Determina qué tipo de cálculo se debe realizar
   * @param config - Configuración de la tabla
   * @returns Tipo de cálculo a realizar
   */
  obtenerTipoCalculo(config: TableConfig): 'ambos' | 'porcentajes' | 'totales' | 'ninguno' {
    const debePorcentajes = this.debeCalcularPorcentajes(config);
    const debeTotales = this.debeCalcularTotales(config);

    if (debePorcentajes && debeTotales) {
      return 'ambos';
    } else if (debePorcentajes) {
      return 'porcentajes';
    } else if (debeTotales) {
      return 'totales';
    }
    return 'ninguno';
  }

  /**
   * Determina si un campo específico afecta los cálculos
   * @param config - Configuración de la tabla
   * @param field - Campo que cambió
   * @returns true si el campo afecta los cálculos
   */
  campoAfectaCalculos(config: TableConfig, field: string): boolean {
    return config.camposParaCalcular?.includes(field) || 
           config.campoTotal === field;
  }
}

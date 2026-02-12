import { Injectable } from '@angular/core';
import { PercentageCalculatorService } from '../utilities/percentage-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryTableTransformService {
  constructor(private percentageCalculator: PercentageCalculatorService) {}

  transformPEAOcupaciones(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    // ✅ FASE 1: NO calcular porcentajes automáticamente - se calcularán dinámicamente
    // Solo mapear los datos sin calcular porcentajes
    return datos.map(item => {
      const casos = parseInt(item.casos || item.total_trabajadores || item.casos || '0') || 0;
      const categoria = item.categoria || item.actividad_principal || item.ocupacion || '';

      return {
        categoria: categoria,
        casos: casos
        // porcentaje: NO se calcula aquí - se calculará dinámicamente por TableCalculationService
      };
    }).filter(item => {
      // Filtrar solo items con categoría válida
      return item.categoria.trim() !== '';
    });
  }

  calculateDirectPercentages(datos: any[]): any[] {
    if (!Array.isArray(datos) || datos.length === 0) {
      return [];
    }

    const total = datos.reduce((sum: number, item: any) => sum + (item.casos || 0), 0);

    if (total === 0) {
      return [];
    }

    return datos
      .filter((item: any) => item.categoria && item.casos > 0)
      .sort((a: any, b: any) => b.casos - a.casos)
      .map((item: any) => ({
        categoria: item.categoria,
        casos: item.casos,
        porcentaje: this.percentageCalculator.calcularPorcentaje(item.casos, total)
      }));
  }
}

import { Injectable } from '@angular/core';
import { IDataCalculator } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataCalculator implements IDataCalculator {

  calculateTotals(data: any): any {
    const transformed = { ...data };

    // Cálculo de total de población AISI
    this.calculateAisiPopulationTotal(transformed);

    return transformed;
  }

  private calculateAisiPopulationTotal(data: any): void {
    if (data.tablaAISD2TotalPoblacion === undefined && Array.isArray(data.poblacionSexoAISD) && data.poblacionSexoAISD.length > 0) {
      const total = data.poblacionSexoAISD.reduce((sum: number, item: any) => {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        return sum + casos;
      }, 0);
      data.tablaAISD2TotalPoblacion = total;
    }
  }
}

import { Injectable } from '@angular/core';

export interface TableRowWithPercentage {
  [key: string]: any;
  casos?: number;
  porcentaje?: string;
}

export interface CalculationResult {
  rows: TableRowWithPercentage[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class PercentageCalculatorService {

  calcularPorcentaje(valor: number, total: number, decimales: number = 2): string {
    if (total === 0 || isNaN(total) || isNaN(valor)) return '0,00 %';
    const porcentaje = (valor / total) * 100;
    return porcentaje.toFixed(decimales).replace('.', ',') + ' %';
  }

  calcularPorcentajeNumerico(valor: number, total: number): number {
    if (total === 0 || isNaN(total) || isNaN(valor)) return 0;
    return (valor / total) * 100;
  }

  calcularTotalYPorcentajes<T extends TableRowWithPercentage>(
    filas: T[],
    campoCasos: string = 'casos'
  ): CalculationResult {
    if (!filas || !Array.isArray(filas) || filas.length === 0) {
      return { rows: [], total: 0 };
    }

    const total = filas.reduce((sum, fila) => {
      const casos = this.parsearNumero(fila[campoCasos]);
      return sum + casos;
    }, 0);

    const filasConPorcentaje = filas.map(fila => ({
      ...fila,
      porcentaje: this.calcularPorcentaje(this.parsearNumero(fila[campoCasos]), total)
    }));

    return { rows: filasConPorcentaje, total };
  }

  calcularPorcentajesParaTabla<T extends Record<string, any>>(
    filas: T[],
    campoCasos: string = 'casos',
    campoPorcentaje: string = 'porcentaje',
    campoExcluirTotal: string | null = null,
    valorExcluirTotal: string = 'Total'
  ): T[] {
    if (!filas || !Array.isArray(filas) || filas.length === 0) {
      return [];
    }

    let filasParaCalcular = filas;
    if (campoExcluirTotal) {
      filasParaCalcular = filas.filter(fila => {
        const valor = fila[campoExcluirTotal]?.toString().toLowerCase() || '';
        return !valor.includes(valorExcluirTotal.toLowerCase());
      });
    }

    const total = filasParaCalcular.reduce((sum, fila) => {
      const casos = this.parsearNumero(fila[campoCasos]);
      return sum + casos;
    }, 0);

    return filas.map(fila => {
      const valor = campoExcluirTotal ? fila[campoExcluirTotal]?.toString().toLowerCase() || '' : '';
      if (campoExcluirTotal && valor.includes(valorExcluirTotal.toLowerCase())) {
        return { ...fila, [campoPorcentaje]: '100,00 %' };
      }
      return {
        ...fila,
        [campoPorcentaje]: this.calcularPorcentaje(this.parsearNumero(fila[campoCasos]), total)
      };
    });
  }

  sumarCampo<T extends Record<string, any>>(
    filas: T[],
    campo: string
  ): number {
    if (!filas || !Array.isArray(filas)) return 0;
    return filas.reduce((sum, fila) => {
      return sum + this.parsearNumero(fila[campo]);
    }, 0);
  }

  agregarFilaTotal<T extends Record<string, any>>(
    filas: T[],
    campoLabel: string,
    campoCasos: string = 'casos',
    campoPorcentaje: string = 'porcentaje',
    labelTotal: string = 'Total'
  ): T[] {
    if (!filas || filas.length === 0) return filas;

    const filasExistentes = filas.filter(fila => {
      const label = fila[campoLabel]?.toString().toLowerCase() || '';
      return !label.includes('total');
    });

    const totalCasos = this.sumarCampo(filasExistentes, campoCasos);

    const filaTotal = {
      [campoLabel]: labelTotal,
      [campoCasos]: totalCasos,
      [campoPorcentaje]: '100,00 %'
    } as T;

    return [...filasExistentes, filaTotal];
  }

  procesarTablaDemografica<T extends Record<string, any>>(
    filas: T[],
    campoLabel: string,
    campoCasos: string = 'casos'
  ): T[] {
    const filasSinTotal = filas.filter(fila => {
      const label = fila[campoLabel]?.toString().toLowerCase() || '';
      return !label.includes('total');
    });

    const filasConPorcentaje = this.calcularPorcentajesParaTabla(
      filasSinTotal,
      campoCasos,
      'porcentaje',
      null
    );

    return this.agregarFilaTotal(
      filasConPorcentaje,
      campoLabel,
      campoCasos,
      'porcentaje'
    );
  }

  private parsearNumero(valor: any): number {
    if (valor === null || valor === undefined) return 0;
    if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;
    const parsed = parseInt(String(valor).replace(/\s+/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  formatearNumero(valor: number): string {
    return valor.toLocaleString('es-PE');
  }

  formatearPorcentaje(valor: string | number): string {
    if (typeof valor === 'number') {
      return valor.toFixed(2).replace('.', ',') + ' %';
    }
    if (!valor) return '0,00 %';
    if (valor.includes('%')) return valor;
    const num = parseFloat(valor.replace(',', '.'));
    if (isNaN(num)) return '0,00 %';
    return num.toFixed(2).replace('.', ',') + ' %';
  }
}

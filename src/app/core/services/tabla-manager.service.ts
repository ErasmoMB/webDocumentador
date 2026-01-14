import { Injectable } from '@angular/core';
import { FormularioDatos, TablaItem } from '../models/formulario.model';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class TablaManagerService {

  constructor(private logger: LoggerService) {}

  agregarFila(tabla: TablaItem[], categoriaDefault: string = ''): TablaItem[] {
    const nuevaFila: TablaItem = {
      categoria: categoriaDefault,
      casos: 0,
      porcentaje: '0 %'
    };
    return [...tabla, nuevaFila];
  }

  eliminarFila(tabla: TablaItem[], index: number): TablaItem[] {
    if (index < 0 || index >= tabla.length) {
      this.logger.warn(`Índice inválido para eliminar fila: ${index}`);
      return tabla;
    }
    const nuevaTabla = [...tabla];
    nuevaTabla.splice(index, 1);
    return nuevaTabla;
  }

  actualizarFila(tabla: TablaItem[], index: number, campo: keyof TablaItem, valor: any): TablaItem[] {
    if (index < 0 || index >= tabla.length) {
      this.logger.warn(`Índice inválido para actualizar fila: ${index}`);
      return tabla;
    }
    const nuevaTabla = [...tabla];
    nuevaTabla[index] = { ...nuevaTabla[index], [campo]: valor };
    return nuevaTabla;
  }

  calcularTotales(tabla: TablaItem[]): { totalCasos: number; totalPorcentaje: string } {
    const totalCasos = tabla
      .filter(item => item.categoria !== 'Total')
      .reduce((sum, item) => sum + (Number(item.casos) || 0), 0);
    
    const totalPorcentaje = totalCasos > 0 
      ? ((totalCasos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %'
      : '0 %';

    return { totalCasos, totalPorcentaje };
  }

  calcularPorcentajes(tabla: TablaItem[]): TablaItem[] {
    const total = tabla
      .filter(item => item.categoria !== 'Total')
      .reduce((sum, item) => sum + (Number(item.casos) || 0), 0);

    if (total === 0) {
      return tabla.map(item => ({
        ...item,
        porcentaje: '0 %'
      }));
    }

    return tabla.map(item => {
      if (item.categoria === 'Total') {
        return {
          ...item,
          casos: total,
          porcentaje: '100,00 %'
        };
      }
      const casos = Number(item.casos) || 0;
      const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',') + ' %';
      return {
        ...item,
        porcentaje
      };
    });
  }

  inicializarTablaVacia(): TablaItem[] {
    return [];
  }

  inicializarTablaConFila(categoria: string, casos: number = 0): TablaItem[] {
    return [{
      categoria,
      casos,
      porcentaje: '0 %'
    }];
  }

  validarTabla(tabla: TablaItem[]): boolean {
    if (!Array.isArray(tabla)) {
      return false;
    }
    return tabla.every(item => 
      item && 
      typeof item === 'object' && 
      ('categoria' in item || 'casos' in item || 'porcentaje' in item)
    );
  }

  obtenerFilaTotal(tabla: TablaItem[]): TablaItem | null {
    return tabla.find(item => item.categoria === 'Total') || null;
  }

  actualizarFilaTotal(tabla: TablaItem[]): TablaItem[] {
    const sinTotal = tabla.filter(item => item.categoria !== 'Total');
    const { totalCasos } = this.calcularTotales(sinTotal);
    
    const filaTotal = this.obtenerFilaTotal(tabla);
    if (filaTotal) {
      return [
        ...sinTotal,
        {
          ...filaTotal,
          casos: totalCasos,
          porcentaje: '100,00 %'
        }
      ];
    }
    
    return sinTotal;
  }
}


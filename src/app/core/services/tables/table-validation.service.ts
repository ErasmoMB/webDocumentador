import { Injectable } from '@angular/core';
import { TableConfig } from './table-management.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TableValidationService {

  validarEstructura(
    tabla: any[],
    estructuraEsperada: any[]
  ): boolean {
    if (!Array.isArray(tabla) || !Array.isArray(estructuraEsperada)) {
      return false;
    }
    
    if (estructuraEsperada.length === 0) {
      return true;
    }
    
    if (tabla.length === 0) {
      return false;
    }
    
    const primeraFilaEsperada = estructuraEsperada[0];
    const primeraFilaActual = tabla[0];
    
    const camposEsperados = Object.keys(primeraFilaEsperada);
    const camposActuales = Object.keys(primeraFilaActual);
    
    return camposEsperados.every(campo => camposActuales.includes(campo));
  }

  validarDatos(
    tabla: any[],
    config: TableConfig
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!Array.isArray(tabla)) {
      errors.push('La tabla no es un array válido');
      return { isValid: false, errors, warnings };
    }
    
    if (tabla.length === 0) {
      warnings.push('La tabla está vacía');
      return { isValid: true, errors, warnings };
    }
    
    const { totalKey, campoTotal, campoPorcentaje } = config;
    
    tabla.forEach((item: any, index: number) => {
      // Verificar si es una fila de total (no validar totales)
      const esTotal = item[totalKey]?.toString().toLowerCase().includes('total');
      if (esTotal) return;
      
      if (campoTotal && (item[campoTotal] === undefined || item[campoTotal] === null)) {
        warnings.push(`Fila ${index + 1}: campo ${campoTotal} está vacío`);
      }
      
      if (campoTotal && typeof item[campoTotal] === 'string') {
        const valorNumerico = parseFloat(item[campoTotal]);
        if (isNaN(valorNumerico)) {
          errors.push(`Fila ${index + 1}: campo ${campoTotal} tiene valor no numérico: ${item[campoTotal]}`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  esFilaTotal(item: any, totalKey: string): boolean {
    if (item === null || item === undefined) {
      return false;
    }
    const valor = item?.[totalKey];
    return valor && valor.toString().toLowerCase().includes('total');
  }
}

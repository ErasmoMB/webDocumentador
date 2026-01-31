import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryAggregationService {
  addDirectByCategoria(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach((nuevoItem: any) => {
      if (!nuevoItem?.categoria || nuevoItem.casos === 0) return;

      const existente = resultado.find((item: any) => item.categoria === nuevoItem.categoria);
      if (existente) {
        existente.casos = (existente.casos || 0) + (nuevoItem.casos || 0);
      } else {
        resultado.push({ ...nuevoItem });
      }
    });

    return resultado;
  }

  addMateriales(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach(nuevoItem => {
      const categoria = nuevoItem.categoria || nuevoItem.tipo || '';
      const material = nuevoItem.material || nuevoItem.tipoMaterial || '';

      const existente = resultado.find(item => {
        const catExistente = (item.categoria || item.tipo || '').toLowerCase();
        const matExistente = (item.material || item.tipoMaterial || '').toLowerCase();
        return catExistente === categoria.toLowerCase() && matExistente === material.toLowerCase();
      });

      if (existente) {
        const casosExistente = parseInt(existente.casos || '0') || 0;
        const casosNuevo = parseInt(nuevoItem.casos || '0') || 0;
        existente.casos = casosExistente + casosNuevo;
      } else {
        resultado.push({ ...nuevoItem });
      }
    });

    return resultado;
  }
}

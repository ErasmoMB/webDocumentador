import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DemographyAggregatorService {
  addDemografia(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    const resultado = [...acumulado];

    nuevos.forEach(nuevoItem => {
      const existente = resultado.find(item => {
        const claveExistente = item.sexo || item.categoria || item.grupo || '';
        const claveNuevo = nuevoItem.sexo || nuevoItem.categoria || nuevoItem.grupo || '';
        return claveExistente.toLowerCase() === claveNuevo.toLowerCase();
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

  addDemograficos(acumulado: any[], nuevos: any[]): any[] {
    if (!Array.isArray(nuevos) || nuevos.length === 0) {
      return acumulado;
    }

    if (acumulado.length === 0) {
      return nuevos.map(item => ({ ...item }));
    }

    const resultado = { ...acumulado[0] };

    nuevos.forEach(item => {
      if (item.hombres !== undefined && item.hombres !== null) {
        resultado.hombres = (resultado.hombres || 0) + (item.hombres || 0);
      }
      if (item.mujeres !== undefined && item.mujeres !== null) {
        resultado.mujeres = (resultado.mujeres || 0) + (item.mujeres || 0);
      }
      if (item.de_1_a_14 !== undefined && item.de_1_a_14 !== null) {
        resultado.de_1_a_14 = (resultado.de_1_a_14 || 0) + (item.de_1_a_14 || 0);
      }
      if (item.de_15_a_29 !== undefined && item.de_15_a_29 !== null) {
        resultado.de_15_a_29 = (resultado.de_15_a_29 || 0) + (item.de_15_a_29 || 0);
      }
      if (item.de_30_a_44 !== undefined && item.de_30_a_44 !== null) {
        resultado.de_30_a_44 = (resultado.de_30_a_44 || 0) + (item.de_30_a_44 || 0);
      }
      if (item.de_45_a_64 !== undefined && item.de_45_a_64 !== null) {
        resultado.de_45_a_64 = (resultado.de_45_a_64 || 0) + (item.de_45_a_64 || 0);
      }
      if (item.mayores_65 !== undefined && item.mayores_65 !== null) {
        resultado.mayores_65 = (resultado.mayores_65 || 0) + (item.mayores_65 || 0);
      }
      if (item.poblacion_total !== undefined && item.poblacion_total !== null) {
        resultado.poblacion_total = (resultado.poblacion_total || 0) + (item.poblacion_total || 0);
      }
    });

    return [resultado];
  }
}

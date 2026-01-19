import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

export interface IBackendAutoLoadSection {
  getSectionKey(): string;
  getLoadParameters(): string | string[] | null;
  getFieldDataFromBackend(fieldName: string): any;
}

export class SectionAutoLoadHelper {
  static getSectionKeyForAISD(sectionNumber: number, group: 'aisd' | 'aisi'): string {
    return `seccion${sectionNumber}_${group}`;
  }

  static getLoadParametersForAISD(
    seccionId: string,
    centrosPobladosActivos: CentrosPobladosActivosService
  ): string[] | null {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const codigosActivos = centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);
    
    return codigosActivos && codigosActivos.length > 0 ? codigosActivos : null;
  }

  static getLoadParametersForAISI(
    distritoUbigeo: string
  ): string | null {
    return distritoUbigeo && distritoUbigeo.trim() !== '' ? distritoUbigeo : null;
  }

  static validateLoadedData(data: any, expectedFields: string[]): boolean {
    if (!data || typeof data !== 'object') return false;
    
    return expectedFields.some(field => 
      data[field] && Array.isArray(data[field]) && data[field].length > 0
    );
  }

  static applyDataTransformations(
    loadedData: { [fieldName: string]: any },
    transformations: { [fieldName: string]: (data: any) => any }
  ): { [fieldName: string]: any } {
    const transformed: { [fieldName: string]: any } = {};

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (transformations[fieldName]) {
        transformed[fieldName] = transformations[fieldName](data);
      } else {
        transformed[fieldName] = data;
      }
    }

    return transformed;
  }

  static mergeWithExistingData(
    existingData: any,
    newData: { [fieldName: string]: any },
    prefijo: string,
    preserveIfExists: boolean = true
  ): any {
    const merged = { ...existingData };

    for (const [fieldName, data] of Object.entries(newData)) {
      if (data === null || data === undefined) continue;

      const fieldKey = prefijo ? `${fieldName}_${prefijo}` : fieldName;

      if (preserveIfExists && merged[fieldKey]) {
        continue;
      }

      merged[fieldKey] = data;
    }

    return merged;
  }
}

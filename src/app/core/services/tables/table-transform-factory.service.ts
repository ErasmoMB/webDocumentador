import { Injectable } from '@angular/core';
import { TableMetadata, TransformConfigMetadata } from '../../models/table-metadata.model';

/**
 * Factory service para crear funciones de transformación de datos
 * Elimina código repetitivo y estandariza transformaciones
 */
@Injectable({
  providedIn: 'root'
})
export class TableTransformFactoryService {

  /**
   * Crea una función de transformación basada en el tipo y configuración
   */
  createTransform(metadata: TableMetadata): (data: any) => any {
    switch (metadata.transformType) {
      case 'standard':
        return this.createStandardTransform(metadata);
      case 'aggregate':
        return this.createAggregateTransform(metadata);
      case 'custom':
        return metadata.customTransform || ((d) => d);
      case 'passthrough':
        return (data) => data;
      default:
        // Si no se especifica tipo, intentar inferir
        return this.createStandardTransform(metadata);
    }
  }

  /**
   * Crea transformación estándar: mapea campos directamente
   */
  private createStandardTransform(metadata: TableMetadata): (data: any) => any {
    const config = metadata.transformConfig || {};
    const categoriaField = config.categoriaField || 'categoria';
    const casosField = config.casosField || 'casos';
    const porcentajeField = config.porcentajeField || 'porcentaje';
    const customFields = config.customFields || {};

    return (data: any) => {
      const datosArray = this.normalizeDataArray(data);
      if (datosArray.length === 0) {
        return [];
      }

      return datosArray.map((item: any) => {
        const transformed: any = {};

        // Mapear categoría
        if (categoriaField) {
          const categoriaValue = this.getFieldValue(item, categoriaField);
          transformed[categoriaField] = categoriaValue || 'Sin categoría';
        }

        // Mapear casos
        if (casosField) {
          const casosValue = this.getFieldValue(item, casosField);
          transformed[casosField] = Number(casosValue) || 0;
        }

        // ✅ FASE 1: NO agregar porcentaje por defecto - se calculará dinámicamente
        // if (porcentajeField) {
        //   transformed[porcentajeField] = '0,00 %';
        // }

        // Mapear campos personalizados
        if (customFields) {
          Object.entries(customFields).forEach(([backendField, frontendField]: [string, unknown]) => {
            transformed[frontendField as string] = this.getFieldValue(item, backendField);
          });
        }

        // Copiar otros campos del item si existen
        Object.keys(item).forEach(key => {
          if (!transformed.hasOwnProperty(key)) {
            transformed[key] = item[key];
          }
        });

        return transformed;
      });
    };
  }

  /**
   * Crea transformación agregada: agrupa y suma campos
   */
  private createAggregateTransform(metadata: TableMetadata): (data: any) => any {
    const config = metadata.transformConfig || {};
    const categoriaField = config.categoriaField || 'categoria';
    const casosField = config.casosField || 'casos';
    const porcentajeField = config.porcentajeField || 'porcentaje';
    const groupBy = config.groupBy || [categoriaField];
    const sumFields = config.sumFields || [casosField];
    const customFields = config.customFields || {};

    return (data: any) => {
      const datosArray = this.normalizeDataArray(data);
      if (datosArray.length === 0) {
        return [];
      }

      // Agrupar y sumar
      const grouped = new Map<string, any>();
      let totalCasos = 0;

      datosArray.forEach((item: any) => {
        // Crear clave de agrupación
        const groupKey = groupBy
          .map((field: string) => {
            const value = this.getFieldValue(item, field);
            return (value || '').toString().toLowerCase().trim();
          })
          .join('|||');

        // Obtener valor de categoría para mostrar
        const categoriaValue = this.getFieldValue(item, categoriaField) || 'Sin categoría';

        if (!grouped.has(groupKey)) {
          grouped.set(groupKey, {
            [categoriaField]: categoriaValue,
            [casosField]: 0
          });

          // Inicializar campos a sumar
          sumFields.forEach((field: string) => {
            if (field !== casosField) {
              (grouped.get(groupKey) as any)[field] = 0;
            }
          });

          // Inicializar campos personalizados
          Object.values(customFields).forEach(field => {
            grouped.get(groupKey)[field] = this.getFieldValue(item, Object.keys(customFields).find(k => customFields[k] === field) || '');
          });
        }

        const grupo = grouped.get(groupKey)!;

        // Sumar campos
        sumFields.forEach((field: string) => {
          const valor = Number(this.getFieldValue(item, field) || 0);
          grupo[field] = (grupo[field] || 0) + valor;
          if (field === casosField) {
            totalCasos += valor;
          }
        });
      });

      // Convertir a array y calcular porcentajes
      const resultado = Array.from(grouped.values());

      if (totalCasos > 0 && porcentajeField) {
        resultado.forEach(item => {
          const casos = item[casosField] || 0;
          const porcentaje = ((casos / totalCasos) * 100)
            .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace('.', ',') + ' %';
          item[porcentajeField] = porcentaje;
        });
      } else if (porcentajeField) {
        resultado.forEach(item => {
          item[porcentajeField] = '0,00 %';
        });
      }

      // Ordenar por casos descendente
      return resultado.sort((a, b) => (b[casosField] || 0) - (a[casosField] || 0));
    };
  }

  /**
   * Normaliza datos a array
   */
  private normalizeDataArray(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data && typeof data === 'object') {
      // Si es objeto, intentar extraer arrays de propiedades comunes
      const commonArrayKeys = ['items', 'results', 'datos', 'data'];
      for (const key of commonArrayKeys) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
      // Si no hay array, convertir objeto a array
      return [data];
    }
    return [];
  }

  /**
   * Obtiene valor de campo con soporte para múltiples variantes (case-insensitive)
   */
  private getFieldValue(item: any, field: string): any {
    if (!item || !field) return null;

    // Buscar exacto
    if (item.hasOwnProperty(field)) {
      return item[field];
    }

    // Buscar con primera letra mayúscula
    const capitalized = field.charAt(0).toUpperCase() + field.slice(1);
    if (item.hasOwnProperty(capitalized)) {
      return item[capitalized];
    }

    // Buscar todo mayúsculas
    const upper = field.toUpperCase();
    if (item.hasOwnProperty(upper)) {
      return item[upper];
    }

    // Buscar case-insensitive
    const fieldLower = field.toLowerCase();
    for (const key in item) {
      if (key.toLowerCase() === fieldLower) {
        return item[key];
      }
    }

    return null;
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FieldMapping } from '../field-mapping/field-mapping.types';
import { FieldMappingFacade } from '../field-mapping/field-mapping.facade';
import { LoggerService } from '../infrastructure/logger.service';

/**
 * FieldLoaderService
 * Carga campos de formulario desde múltiples fuentes.
 * Responsabilidades:
 * - Resolver mappings de campos (JSON → backend → fallback)
 * - Normalizar valores
 * - Manejo automático de fallbacks
 */
@Injectable({ providedIn: 'root' })
export class FieldLoaderService {
  constructor(
    private fieldMapping: FieldMappingFacade,
    private logger: LoggerService
  ) {}

  /**
   * Carga un campo resolviendo su mapping automáticamente.
   */
  loadField(fieldName: string, sectionId: string, fallbackValue?: any): Observable<any> {
    const mapping = this.fieldMapping.getMapping(fieldName);
    
    if (!mapping) {
      return of(fallbackValue || null);
    }

    return of(this.resolveMapping(mapping, fieldName)).pipe(
      map(value => value !== undefined ? value : fallbackValue),
      catchError(error => {
        this.logger.warn(`Fallback para campo ${fieldName}:`, error);
        return of(fallbackValue || null);
      })
    );
  }

  /**
   * Carga múltiples campos en paralelo.
   */
  loadFields(fieldNames: string[], sectionId: string): Observable<{ [key: string]: any }> {
    const result: { [key: string]: any } = {};
    
    fieldNames.forEach(fn => {
      const mapping = this.fieldMapping.getMapping(fn);
      result[fn] = this.resolveMapping(mapping, fn);
    });

    return of(result);
  }

  /**
   * Resuelve un mapping a su valor.
   */
  private resolveMapping(mapping: FieldMapping | undefined, fieldName: string): any {
    if (!mapping) return null;
    
    // Formato de mapping esperado: 'fuente.ruta' (ej: 'backend.educacion.escuelas[0].nombre')
    // Por ahora solo retornar null, en Sprint 3+ se integrará con backend
    return null;
  }
}

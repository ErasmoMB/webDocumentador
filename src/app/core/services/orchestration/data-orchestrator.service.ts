import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SectionDataLoaderService } from '../section-data-loader.service';
import { FieldMappingFacade } from '../field-mapping/field-mapping.facade';
import { LoggerService } from '../infrastructure/logger.service';

/**
 * DataOrchestratorService
 * Orquesta el flujo de carga de datos para secciones.
 * Responsabilidades:
 * - Coordinar cargas desde JSON, backend y fallbacks
 * - Aplicar transformaciones y normalizaciones
 * - Centralizar flujo de datos
 */
@Injectable({ providedIn: 'root' })
export class DataOrchestratorService {
  constructor(
    private sectionDataLoader: SectionDataLoaderService,
    private fieldMapping: FieldMappingFacade,
    private logger: LoggerService
  ) {}

  /**
   * Orquesta la carga de datos para una sección.
   */
  loadSectionData(sectionId: string): Observable<{ [key: string]: any }> {
    return this.sectionDataLoader.loadSectionData(sectionId, this.fieldMapping.getFieldsForSection(sectionId))
      .pipe(
        map(data => this.applyTransformations(sectionId, data)),
        catchError(error => {
          this.logger.error(`Error orquestando datos de sección ${sectionId}`, error);
          return of({});
        })
      );
  }

  /**
   * Aplica transformaciones y normalizaciones a los datos.
   */
  private applyTransformations(sectionId: string, data: any): any {
    // Aquí pueden ir transformaciones específicas por sección
    return data;
  }
}

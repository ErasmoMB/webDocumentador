import { Injectable } from '@angular/core';
import { DataOrchestratorService } from './data-orchestrator.service';
import { CacheService } from '../infrastructure/cache.service';
import { BackendApiService } from '../infrastructure/backend-api.service';
import { MockDataService } from '../infrastructure/mock-data.service';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface SectionDataTransformer {
  transform(data: any): any;
}

/**
 * Extender de DataOrchestrator con transformaciones específicas por sección
 * Permite aplicar lógica de transformación sin duplicar código en componentes
 */
@Injectable({
  providedIn: 'root'
})
export class SectionDataTransformerService {
  private transformers: Map<string, SectionDataTransformer> = new Map();

  constructor(
    private orchestrator: DataOrchestratorService,
    private cache: CacheService,
    private backend: BackendApiService,
    private mockData: MockDataService
  ) {}

  /**
   * Registra un transformador para una sección
   */
  registerTransformer(sectionId: string, transformer: SectionDataTransformer): void {
    this.transformers.set(sectionId, transformer);
  }

  /**
   * Carga datos con transformación automática
   */
  loadSectionDataWithTransform(sectionId: string): Observable<any> {
    return this.orchestrator.loadSectionData(sectionId).pipe(
      tap(data => {
        const transformer = this.transformers.get(sectionId);
        if (transformer) {
          transformer.transform(data);
        }
      }),
      catchError(error => {
        console.error(`Error cargando datos para ${sectionId}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obtiene transformador registrado
   */
  getTransformer(sectionId: string): SectionDataTransformer | undefined {
    return this.transformers.get(sectionId);
  }
}

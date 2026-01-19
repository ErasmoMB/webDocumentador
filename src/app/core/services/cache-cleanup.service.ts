import { Injectable } from '@angular/core';
import { SectionDataLoaderService } from './section-data-loader.service';
import { AutoBackendDataLoaderService } from './auto-backend-data-loader.service';
import { CacheService } from './cache.service';

/**
 * Servicio para limpiar todos los cachés globales de la aplicación.
 * Se llama automáticamente en ngOnDestroy de cada sección.
 */
@Injectable({
  providedIn: 'root'
})
export class CacheCleanupService {
  constructor(
    private sectionDataLoader: SectionDataLoaderService,
    private autoBackendDataLoader: AutoBackendDataLoaderService,
    private cacheService: CacheService
  ) {}

  /**
   * Limpia TODOS los cachés globales en memoria.
   * Llamar esto regularmente previene memory leaks.
   */
  cleanupAll(): void {
    try {
      this.sectionDataLoader.clearCache();
    } catch (e) {
    }

    try {
      this.autoBackendDataLoader.clearCache();
    } catch (e) {
    }

    try {
      this.cacheService.clearCache();
    } catch (e) {
    }

    if ((window as any).gc) {
      (window as any).gc();
    }
  }

  /**
   * Fuerza limpieza periódica cada X segundos.
   * Útil si hay memory leaks que no se atrapan.
   */
  startPeriodicCleanup(intervalMs: number = 30000): void {
    setInterval(() => {
      this.cleanupAll();
    }, intervalMs);
  }
}

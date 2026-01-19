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
    console.log('[CacheCleanup] Limpiando todos los cachés...');
    
    try {
      // Limpiar caché de carga de secciones
      this.sectionDataLoader.clearCache();
      console.log('[CacheCleanup] ✓ SectionDataLoaderService limpiado');
    } catch (e) {
      console.warn('[CacheCleanup] Error limpiando SectionDataLoaderService:', e);
    }

    try {
      // Limpiar caché de auto-backend (esto limpia loadingRequests.Map)
      this.autoBackendDataLoader.clearCache();
      console.log('[CacheCleanup] ✓ AutoBackendDataLoaderService limpiado');
    } catch (e) {
      console.warn('[CacheCleanup] Error limpiando AutoBackendDataLoaderService:', e);
    }

    try {
      // Limpiar localStorage cache
      this.cacheService.clearCache();
      console.log('[CacheCleanup] ✓ CacheService limpiado');
    } catch (e) {
      console.warn('[CacheCleanup] Error limpiando CacheService:', e);
    }

    // Notificar que limpieza completada
    if ((window as any).gc) {
      console.log('[CacheCleanup] Sugiriendo GC...');
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
    console.log(`[CacheCleanup] Limpieza periódica iniciada (cada ${intervalMs}ms)`);
  }
}

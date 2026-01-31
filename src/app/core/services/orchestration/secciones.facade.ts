import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { DataService } from '../data.service';
import { CacheService } from '../infrastructure/cache.service';
import { LoggerService } from '../infrastructure/logger.service';

/**
 * SeccionesFacade
 * Facade Pattern para simplificar la orquestación de servicios de secciones
 * Oculta la complejidad de múltiples servicios detrás de una interfaz unificada
 */
@Injectable({
  providedIn: 'root'
})
export class SeccionesFacade {
  constructor(
    private dataService: DataService,
    private cacheService: CacheService,
    private logger: LoggerService
  ) {}

  /**
   * Carga todos los datos de una sección específica
   * Orquesta múltiples servicios y maneja errores
   */
  loadSeccionData(seccionId: number): Observable<any> {
    this.logger.info(`[SeccionesFacade] Cargando datos para Sección ${seccionId}`);

    // Verificar cache primero
    const cacheKey = `seccion_${seccionId}_data`;
    const cachedData = this.cacheService.get(cacheKey);
    
    if (cachedData) {
      this.logger.debug(`[SeccionesFacade] Datos encontrados en caché: ${cacheKey}`);
      return of(cachedData);
    }

    // Cargar datos según tipo de sección
    return this.dataService.getSeccionById(seccionId).pipe(
      map(baseData => {
        const combinedData = {
          ...baseData,
          id: seccionId,
          loadedAt: new Date().toISOString()
        };

        this.cacheService.set(cacheKey, combinedData, 300000); // 5 min
        
        this.logger.info(`[SeccionesFacade] Datos cargados exitosamente para Sección ${seccionId}`);
        return combinedData;
      }),
      catchError(error => {
        this.logger.error(`[SeccionesFacade] Error cargando Sección ${seccionId}:`, error);
        return of({ error: true, message: 'Error cargando datos de la sección' });
      })
    );
  }

  /**
   * Guarda todos los datos de una sección
   */
  saveSeccionData(seccionId: number, data: any): Observable<boolean> {
    this.logger.info(`[SeccionesFacade] Guardando datos para Sección ${seccionId}`);

    return this.dataService.saveSeccionData(seccionId, data).pipe(
      map(result => {
        // Invalidar cache
        this.cacheService.delete(`seccion_${seccionId}_data`);
        
        this.logger.info(`[SeccionesFacade] Datos guardados exitosamente para Sección ${seccionId}`);
        return true;
      }),
      catchError(error => {
        this.logger.error(`[SeccionesFacade] Error guardando Sección ${seccionId}:`, error);
        return of(false);
      })
    );
  }

  /**
   * Precarga datos de múltiples secciones (optimización)
   */
  preloadSecciones(seccionIds: number[]): void {
    this.logger.debug(`[SeccionesFacade] Precargando ${seccionIds.length} secciones`);
    
    seccionIds.forEach(id => {
      this.loadSeccionData(id).subscribe({
        next: () => this.logger.debug(`Sección ${id} precargada`),
        error: err => this.logger.warn(`Error precargando Sección ${id}`, err)
      });
    });
  }

  /**
   * Limpia todos los caches de secciones
   */
  clearAllCaches(): void {
    this.logger.info('[SeccionesFacade] Limpiando todos los caches de secciones');
    
    for (let i = 1; i <= 36; i++) {
      this.cacheService.delete(`seccion_${i}_data`);
    }
  }
}

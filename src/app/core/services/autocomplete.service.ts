import { Injectable } from '@angular/core';
import { BackendApiService } from './backend-api.service';
import { LoggerService } from './logger.service';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { CentroPoblado } from '../models/api-response.model';

export interface AutocompleteData {
  sugerencias: string[];
  mostrar: boolean;
  buscado: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  private cache: Map<string, string[]> = new Map();

  constructor(
    private backendApi: BackendApiService,
    private logger: LoggerService
  ) {}

  buscarSugerenciasDistrito(termino: string, provincia?: string): Observable<string[]> {
    if (!termino || termino.trim().length < 1) {
      return of([]);
    }

    const terminoLower = termino.toLowerCase();
    const cacheKey = `distrito_${provincia}_${terminoLower}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Si tenemos provincia, buscar distritos de esa provincia
    if (provincia) {
      return this.backendApi.getProvincias().pipe(
        switchMap((respProvincias: any) => {
          // Buscar el código de la provincia
          if (respProvincias.data && Array.isArray(respProvincias.data)) {
            const provinciaEncontrada = respProvincias.data.find((p: any) => 
              (p.provincia && p.provincia.toLowerCase() === provincia.toLowerCase())
            );
            
            if (provinciaEncontrada && provinciaEncontrada.codigo) {
              // Usar el código para obtener distritos
              return this.backendApi.getDistritos(provinciaEncontrada.codigo);
            }
          }
          // Si no encontramos la provincia, traer todos
          return this.backendApi.getDistritos();
        }),
        map((response: any) => {
          if (response && response.success && Array.isArray(response.data)) {
            const distritosUnicos = new Set<string>();
            const terminoFilter = termino.toLowerCase();
            
            response.data.forEach((item: any) => {
              const distrito = item.distrito || item.nombre || item.DIST;
              if (distrito) {
                const distritoLower = distrito.toLowerCase();
                if (distritoLower.includes(terminoFilter)) {
                  distritosUnicos.add(distrito);
                }
              }
            });
            
            const sugerencias = Array.from(distritosUnicos).sort();
            this.cache.set(cacheKey, sugerencias);
            return sugerencias;
          }
          return [];
        }),
        catchError(error => {
          this.logger.error('Error al buscar sugerencias de distrito:', error);
          return of([]);
        })
      );
    }

    // Si no hay provincia, traer todos los distritos
    return this.backendApi.getDistritos().pipe(
      map((response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          const distritosUnicos = new Set<string>();
          const terminoFilter = termino.toLowerCase();
          
          response.data.forEach((item: any) => {
            const distrito = item.distrito || item.nombre || item.DIST;
            if (distrito) {
              const distritoLower = distrito.toLowerCase();
              if (distritoLower.includes(terminoFilter)) {
                distritosUnicos.add(distrito);
              }
            }
          });
          
          const sugerencias = Array.from(distritosUnicos).sort();
          this.cache.set(cacheKey, sugerencias);
          return sugerencias;
        }
        return [];
      }),
      catchError(error => {
        this.logger.error('Error al buscar sugerencias de distrito:', error);
        return of([]);
      })
    );
  }

  buscarSugerenciasCentroPoblado(termino: string, distritoSeleccionado: string): Observable<string[]> {
    if (!termino || termino.trim().length < 2 || !distritoSeleccionado || distritoSeleccionado.trim() === '') {
      return of([]);
    }

    const cacheKey = `centroPoblado_${distritoSeleccionado.toLowerCase()}_${termino.toLowerCase()}`;
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    // Obtener código del distrito (los primeros 6 dígitos del código UBIGEO)
    // Por ahora, usar el nombre del distrito para buscar
    return this.backendApi.getCentrosPoblados().pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          const terminoLower = termino.toLowerCase();
          
          response.data.forEach((cp: any) => {
            const nombreCP = cp.centro_poblado || cp.CCPP || cp.nombre;
            if (nombreCP) {
              const centroLower = nombreCP.toLowerCase();
              if (centroLower.includes(terminoLower)) {
                centrosPobladosUnicos.add(nombreCP);
              }
            }
          });
          
          const sugerencias = Array.from(centrosPobladosUnicos).sort();
          this.cache.set(cacheKey, sugerencias);
          return sugerencias;
        }
        return [];
      }),
      catchError(error => {
        this.logger.error('Error al buscar sugerencias de centro poblado:', error);
        return of([]);
      })
    );
  }

  limpiarCache(): void {
    this.cache.clear();
  }

  limpiarCachePorPrefijo(prefijo: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefijo)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}


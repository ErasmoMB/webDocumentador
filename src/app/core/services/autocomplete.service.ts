import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { LoggerService } from './logger.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
    private dataService: DataService,
    private logger: LoggerService
  ) {}

  buscarSugerenciasDistrito(termino: string, provincia?: string): Observable<string[]> {
    if (!termino || termino.trim().length < 1) {
      return of([]);
    }

    const terminoLower = termino.toLowerCase();
    const terminoBusqueda = termino.trim().toUpperCase();
    const cacheKey = `distrito_${terminoLower}`;

    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey)!);
    }

    return this.dataService.getPoblacionByDistrito(terminoBusqueda).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          const distritosUnicos = new Set<string>();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.distrito) {
              distritosUnicos.add(cp.distrito);
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

    const terminoBusqueda = termino.trim().toUpperCase();
    return this.dataService.getPoblacionByDistrito(distritoSeleccionado.toUpperCase()).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          const centrosPobladosUnicos = new Set<string>();
          const terminoLower = termino.toLowerCase();
          
          response.data.forEach((cp: CentroPoblado) => {
            if (cp.centro_poblado) {
              const centroLower = cp.centro_poblado.toLowerCase();
              if (centroLower.includes(terminoLower)) {
                centrosPobladosUnicos.add(cp.centro_poblado);
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


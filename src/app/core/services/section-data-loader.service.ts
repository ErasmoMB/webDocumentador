import { Injectable } from '@angular/core';
import { FormularioService } from './formulario.service';
import { FieldMappingService } from './field-mapping.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SectionDataLoaderService {
  private cache: Map<string, Observable<any>> = new Map();

  constructor(
    private formularioService: FormularioService,
    private fieldMappingService: FieldMappingService
  ) {}

  loadSectionData(seccionId: string, fieldsToLoad: string[]): Observable<any> {
    const cacheKey = `${seccionId}:${fieldsToLoad.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const observables: { [key: string]: Observable<any> } = {};

    fieldsToLoad.forEach(fieldName => {
      const mapping = this.fieldMappingService.getMapping(fieldName);
      if (mapping && mapping.endpoint) {
        observables[fieldName] = this.fieldMappingService.loadDataForField(fieldName, seccionId).pipe(
          catchError(error => {
            console.warn(`Error loading data for field ${fieldName}`, error);
            return of(null);
          })
        );
      } else {
        observables[fieldName] = of(this.formularioService.obtenerDatos()[fieldName as keyof FormularioService]);
      }
    });

    if (Object.keys(observables).length === 0) {
      return of({});
    }

    const result$ = forkJoin(observables).pipe(
      map(results => {
        const updatedData: any = {};
        for (const fieldName in results) {
          if (results.hasOwnProperty(fieldName)) {
            updatedData[fieldName] = results[fieldName];
          }
        }
        this.formularioService.actualizarDatos(updatedData);
        return updatedData;
      }),
      shareReplay(1)
    );

    this.cache.set(cacheKey, result$);
    return result$;
  }

  clearCache(): void {
    this.cache.clear();
  }

  loadFieldData(fieldName: string, seccionId: string): Observable<any> {
    return this.fieldMappingService.loadDataForField(fieldName, seccionId).pipe(
      map(data => {
        if (data !== null) {
          this.formularioService.actualizarDato(fieldName, data);
        }
        return data;
      }),
      catchError(error => {
        console.warn(`Error loading data for field ${fieldName}`, error);
        return of(null);
      })
    );
  }
}

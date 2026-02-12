import { Injectable } from '@angular/core';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { FieldMappingFacade } from '../field-mapping/field-mapping.facade';
import { FormChangeService } from '../state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

/**
 * SectionDataLoaderService - Servicio para carga de datos de secciones
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 */
@Injectable({
  providedIn: 'root'
})
export class SectionDataLoaderService {
  private cache: Map<string, Observable<any>> = new Map();

  constructor(
    private projectFacade: ProjectStateFacade,
    private fieldMappingFacade: FieldMappingFacade,
    private formChange: FormChangeService
  ) {}

  loadSectionData(seccionId: string, fieldsToLoad: string[]): Observable<any> {
    const cacheKey = `${seccionId}:${fieldsToLoad.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    const observables: { [key: string]: Observable<any> } = {};

    fieldsToLoad.forEach(fieldName => {
      const mapping = this.fieldMappingFacade.getMapping(fieldName);
      if (mapping && mapping.endpoint) {
        observables[fieldName] = this.fieldMappingFacade.loadDataForField(fieldName, seccionId).pipe(
          catchError(error => {
            return of(null);
          })
        );
      } else {
        const datos = this.projectFacade.obtenerDatos();
        observables[fieldName] = of((datos as any)?.[fieldName]);
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
            const valor = results[fieldName];
            if (valor !== null && valor !== undefined) {
              const esArrayVacio = Array.isArray(valor) && valor.length === 0;
              const esArrayConDatosVacios = Array.isArray(valor) && valor.length > 0 && 
                valor.every((item: any) => {
                  if (item.sexo !== undefined) {
                    return !item.sexo || item.sexo === '' || (item.casos === 0 || item.casos === '0');
                  }
                  if (item.categoria !== undefined) {
                    return !item.categoria || item.categoria === '' || (item.casos === 0 || item.casos === '0');
                  }
                  return false;
                });
              
              if (esArrayVacio || esArrayConDatosVacios) {
                continue;
              }
              
              if (prefijo && this.debeGuardarConPrefijo(fieldName)) {
                const campoConPrefijo = `${fieldName}${prefijo}`;
                updatedData[campoConPrefijo] = valor;
              } else {
                updatedData[fieldName] = valor;
              }
            }
          }
        }
        if (Object.keys(updatedData).length > 0) {
          this.formChange.persistFields(seccionId, 'form', updatedData);
        }
        return updatedData;
      }),
      shareReplay(1)
    );

    this.cache.set(cacheKey, result$);
    return result$;
  }

  private debeGuardarConPrefijo(fieldName: string): boolean {
    const camposConPrefijo = [
      'poblacionSexoAISD',
      'poblacionEtarioAISD',
      'petAISD',
      'petTabla',
      'peaOcupacionesTabla',
      'lenguasMaternasTabla',
      'religionesTabla',
      'materialesConstruccionAISD',
      'grupoAISD',
      'tablaAISD2TotalPoblacion'
    ];
    return camposConPrefijo.includes(fieldName);
  }

  clearCache(): void {
    this.cache.clear();
  }

  loadFieldData(fieldName: string, seccionId: string): Observable<any> {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(seccionId);
    return this.fieldMappingFacade.loadDataForField(fieldName, seccionId).pipe(
      map(data => {
        if (data !== null) {
          if (prefijo && this.debeGuardarConPrefijo(fieldName)) {
            const campoConPrefijo = `${fieldName}${prefijo}` as any;
            this.formChange.persistFields(seccionId, 'form', { [campoConPrefijo]: data });
          } else {
            this.formChange.persistFields(seccionId, 'form', { [fieldName as any]: data });
          }
        }
        return data;
      }),
      catchError(error => {
        return of(null);
      })
    );
  }

}

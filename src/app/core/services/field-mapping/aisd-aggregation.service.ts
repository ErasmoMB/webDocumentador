import { Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

import { CentrosPobladosActivosService } from '../centros-poblados-activos.service';
import { UbigeoHelperService } from '../ubigeo-helper.service';

@Injectable({
  providedIn: 'root'
})
export class AisdAggregationService {
  constructor(
    private ubigeoHelper: UbigeoHelperService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {}

  loadAggregated<T>(
    seccionId: string,
    consultaPorCodigo: (codigo: string) => Observable<any>,
    agregarFuncion: (acumulado: T[], nuevo: any) => T[]
  ): Observable<T[]> {
    const prefijo = this.obtenerPrefijoDeSeccionId(seccionId);

    if (!prefijo || !prefijo.startsWith('_A')) {
      const idUbigeo = this.ubigeoHelper.getIdUbigeoPrincipal(seccionId);
      if (idUbigeo) {
        return consultaPorCodigo(idUbigeo).pipe(
          map(response => this.extractData(response)),
          catchError(() => of([]))
        );
      }
      return of([]);
    }

    const codigosActivos = this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo);

    if (codigosActivos.length === 0) {
      return of([]);
    }

    if (codigosActivos.length === 1) {
      return consultaPorCodigo(codigosActivos[0]).pipe(
        map(response => this.extractData(response)),
        catchError(() => of([]))
      );
    }

    const consultas = codigosActivos.map(codigo =>
      consultaPorCodigo(codigo).pipe(
        map(response => this.extractData(response)),
        catchError(() => of([]))
      )
    );

    return forkJoin(consultas).pipe(
      map(resultados => {
        let acumulado: T[] = [];
        resultados.forEach(datos => {
          if (Array.isArray(datos) && datos.length > 0) {
            acumulado = agregarFuncion(acumulado, datos);
          }
        });
        return acumulado;
      }),
      catchError(() => of([]))
    );
  }

  private extractData(response: any): any[] {
    return response?.data || response || [];
  }

  private obtenerPrefijoDeSeccionId(seccionId: string): string {
    const matchA = seccionId.match(/^3\.1\.4\.A\.(\d+)/);
    if (matchA) {
      return `_A${matchA[1]}`;
    }

    const matchB = seccionId.match(/^3\.1\.4\.B\.(\d+)/);
    if (matchB) {
      return `_B${matchB[1]}`;
    }

    if (seccionId.startsWith('3.1.4.A')) {
      return '_A1';
    }

    if (seccionId.startsWith('3.1.4.B')) {
      return '_B1';
    }

    return '';
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status_code: number;
}

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.baseUrl = this.configService.getApiUrl();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 500) {
      const errorDetail = error.error?.detail || '';
      if (errorDetail.includes('Unknown column') || errorDetail.includes('Incorrect number of arguments')) {
        return throwError(() => error);
      }
      if (error.url?.includes('viviendas-ubicacion')) {
        return throwError(() => error);
      }
    }
    if (error.error instanceof ErrorEvent) {
      console.error('Error del cliente:', error.error.message);
    } else {
      if (error.status !== 500 || !error.url?.includes('viviendas-ubicacion')) {
        console.error(`Error del servidor: ${error.status}`, error.error);
      }
    }
    return throwError(() => error);
  }

  private transformResponse<T>(data: T): BackendResponse<T> {
    return {
      success: true,
      message: 'Datos obtenidos correctamente',
      data: data,
      status_code: 200
    };
  }

  getDatosDemograficos(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/demograficos/datos`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getPiramideDemografica(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/demograficos/piramide`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getUbicacionesConDatosDemograficos(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/demograficos/ubicaciones`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getServiciosBasicos(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/servicios/basicos`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getResumenServicios(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/servicios/resumen`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getActividadesEconomicas(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/economicos/actividades`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getActividadesPrincipales(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/economicos/principales`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getEducacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/educacion/niveles`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getEducacionPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/educacion/por-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getDepartamentos(): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/ubicaciones/departamentos`;
    return this.http.get<any[]>(url).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getProvincias(codigoDepartamento?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/ubicaciones/provincias`;
    let params = new HttpParams();
    if (codigoDepartamento) {
      params = params.set('codigo_departamento', codigoDepartamento);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getDistritos(codigoProvincia?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/ubicaciones/distritos`;
    let params = new HttpParams();
    if (codigoProvincia) {
      params = params.set('codigo_provincia', codigoProvincia);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getCentrosPoblados(codigoDistrito?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/ubicaciones/centros-poblados`;
    let params = new HttpParams();
    if (codigoDistrito) {
      params = params.set('codigo_distrito', codigoDistrito);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getResumenCompleto(idUbigeo: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/ubicaciones/resumen/${idUbigeo}`;
    return this.http.get<any[]>(url).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getLenguas(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/lenguas`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getLenguasPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/lenguas-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getReligiones(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/religiones`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getReligionesPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/religiones-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getTiposVivienda(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/viviendas`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getViviendasPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/viviendas-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getEnergiaCocina(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/energia-cocina`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getEnergiaCocinaPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/energia-cocina-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getNBI(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/nbi`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getNBIPorUbicacion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/vistas/nbi-ubicacion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getInformacionReferencialAISD(idUbigeo?: string): Observable<BackendResponse<any>> {
    const url = `${this.baseUrl}/aisd/informacion-referencial`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getCentrosPobladosAISD(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisd/centros-poblados`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getPoblacionPorSexo(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisd/poblacion-sexo`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getPoblacionPorGrupoEtario(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisd/poblacion-etario`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getPET(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisd/pet`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getMaterialesConstruccion(idUbigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisd/materiales-construccion`;
    let params = new HttpParams();
    if (idUbigeo) {
      params = params.set('id_ubigeo', idUbigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getInformacionReferencialAISI(ubigeo?: string): Observable<BackendResponse<any>> {
    const url = `${this.baseUrl}/aisi/informacion-referencial`;
    let params = new HttpParams();
    if (ubigeo) {
      params = params.set('ubigeo', ubigeo);
    }
    return this.http.get<any>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getCentrosPobladosAISI(ubigeo?: string): Observable<BackendResponse<any[]>> {
    const url = `${this.baseUrl}/aisi/centros-poblados`;
    let params = new HttpParams();
    if (ubigeo) {
      params = params.set('ubigeo', ubigeo);
    }
    return this.http.get<any[]>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getPEADistrital(ubigeo?: string): Observable<BackendResponse<any>> {
    const url = `${this.baseUrl}/aisi/pea-distrital`;
    let params = new HttpParams();
    if (ubigeo) {
      params = params.set('ubigeo', ubigeo);
    }
    return this.http.get<any>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }

  getViviendasCenso(ubigeo?: string): Observable<BackendResponse<any>> {
    const url = `${this.baseUrl}/aisi/viviendas-censo`;
    let params = new HttpParams();
    if (ubigeo) {
      params = params.set('ubigeo', ubigeo);
    }
    return this.http.get<any>(url, { params }).pipe(
      map(data => this.transformResponse(data)),
      catchError(this.handleError)
    );
  }
}


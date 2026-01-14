import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { BackendApiService } from './backend-api.service';
import { DataTransformerUtil } from '../utils/data-transformer.util';

export interface CensoCompletoResponse {
  success: boolean;
  message: string;
  data: any;
  status_code: number;
}

@Injectable({
  providedIn: 'root'
})
export class CensoCompletoService {
  constructor(
    private configService: ConfigService,
    private backendApi: BackendApiService
  ) {}

  private getMockResponse(): Observable<CensoCompletoResponse> {
    return of({
      success: false,
      message: 'Modo mock activado',
      data: null,
      status_code: 200
    });
  }

  private transformBackendResponse<T>(observable: Observable<any>): Observable<CensoCompletoResponse> {
    return observable.pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        data: response.data,
        status_code: response.status_code
      })),
      catchError(error => {
        if (error.status === 500) {
          const errorDetail = error.error?.detail || '';
          if (errorDetail.includes('Unknown column') || errorDetail.includes('Incorrect number of arguments')) {
            return throwError(() => error);
          }
          if (error.url?.includes('viviendas-ubicacion')) {
            return throwError(() => error);
          }
        }
        return throwError(() => error);
      })
    );
  }

  getDatosCompletos(cpp: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }
    return this.transformBackendResponse(this.backendApi.getResumenCompleto(cpp));
  }

  getViviendas(cpp: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }
    return this.transformBackendResponse(this.backendApi.getViviendasPorUbicacion(cpp));
  }

  getServiciosBasicos(cpp: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }
    return this.transformBackendResponse(this.backendApi.getServiciosBasicos(cpp));
  }

  getEducacion(cpp: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }
    return this.transformBackendResponse(this.backendApi.getEducacion(cpp));
  }

  getSalud(cpp: string): Observable<CensoCompletoResponse> {
    return of({
      success: false,
      message: 'Endpoint de salud no disponible en el backend',
      data: null,
      status_code: 404
    });
  }

  getGruposEdadDetallados(cpp: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }
    return this.transformBackendResponse(this.backendApi.getPiramideDemografica(cpp));
  }

  getByDistrito(distrito: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }

    return this.backendApi.getUbicacionesConDatosDemograficos().pipe(
      map(response => {
        const filtered = DataTransformerUtil.filterByDistrito(response.data, distrito);
        return {
          success: response.success,
          message: response.message,
          data: filtered,
          status_code: response.status_code
        };
      }),
      catchError(error => {
        console.error('Error al obtener datos por distrito:', error);
        return throwError(() => error);
      })
    );
  }

  getByProvincia(provincia: string): Observable<CensoCompletoResponse> {
    if (this.configService.isMockMode()) {
      return this.getMockResponse();
    }

    return this.backendApi.getUbicacionesConDatosDemograficos().pipe(
      map(response => {
        const filtered = DataTransformerUtil.filterByProvincia(response.data, provincia);
        return {
          success: response.success,
          message: response.message,
          data: filtered,
          status_code: response.status_code
        };
      }),
      catchError(error => {
        console.error('Error al obtener datos por provincia:', error);
        return throwError(() => error);
      })
    );
  }
}


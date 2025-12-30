import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { CacheService } from './cache.service';
import { 
  ApiResponse, 
  PoblacionData, 
  CentroPoblado, 
  PEAData 
} from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private cacheService: CacheService
  ) { }

  getData(filename: string): Observable<any> {
    // Siempre usar modo mock
    return this.loadMockData(filename);
  }

  private loadMockData(filename: string): Observable<any> {
    const path = `${this.configService.getMockDataPath()}/shared/${filename}`;
    return this.http.get(path).pipe(
      catchError(error => {
        console.error(`Error loading mockData: ${filename}`, error);
        return of({});
      })
    );
  }

  private loadFromAPI(filename: string): Observable<any> {
    const endpoint = `${this.configService.getApiUrl()}/${filename}`;
    return this.http.get(endpoint).pipe(
      catchError(error => {
        console.error(`Error loading from API: ${endpoint}`, error);
        return throwError(() => error);
      })
    );
  }

  getSharedData(dataType: 'economia' | 'pea' | 'poblacion'): Observable<any> {
    const filenames = {
      economia: 'economia.json',
      pea: 'pea.json',
      poblacion: 'poblacion.json'
    };
    return this.getData(filenames[dataType]);
  }

  getAisdData(section: string): Observable<any> {
    const filename = `a1-${section}.json`;
    return this.getData(filename);
  }

  getAisiData(section: string): Observable<any> {
    const filename = `b1-${section}.json`;
    return this.getData(filename);
  }

  private getApiEndpoint(path: string): string {
    const baseUrl = this.configService.getApiUrl();
    if (!baseUrl) {
      console.error('API URL no configurada. Verifica env.js');
      return `http://localhost:8000/api/v1/${path}`;
    }
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${cleanPath}`;
  }

  private handleApiError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(() => error);
  }

  getPoblacionByCpp(cppCodes: string[]): Observable<ApiResponse<PoblacionData>> {
    const url = this.getApiEndpoint('poblacion/');
    const params = { cpp: cppCodes.join(',') };

    // Si NO está en modo mock, intentar conectar al backend primero
    if (!this.configService.isMockMode()) {
      const httpParams = new HttpParams().set('cpp', cppCodes.join(','));
      return this.http.get<ApiResponse<PoblacionData>>(url, { params: httpParams }).pipe(
        catchError((error) => {
          console.warn('⚠️ Backend no disponible, usando cache o datos mock');
          // Si falla, intentar desde cache
          return this.getPoblacionFromCacheOrMock(url, params);
        })
      );
    }

    // Si está en modo mock, usar cache o datos estáticos
    return this.getPoblacionFromCacheOrMock(url, params);
  }

  private getPoblacionFromCacheOrMock(url: string, params: any): Observable<ApiResponse<PoblacionData>> {
    // Primero intentar obtener desde cache consolidado (respuestas del backend guardadas)
    const consolidatedData = this.cacheService.getConsolidatedMockData('poblacion');
    if (consolidatedData) {
      return of({
        success: true,
        message: 'Datos de población obtenidos correctamente (desde cache del backend)',
        data: consolidatedData,
        status_code: 200
      });
    }

    // Luego intentar desde cache normal
    const cached = this.cacheService.getMockDataFromCache(url, params);
    if (cached) {
      return of(cached);
    }
    
    // Finalmente usar archivos JSON estáticos
    return this.getSharedData('poblacion').pipe(
      map(data => {
        // Convertir formato del mock al formato del backend si es necesario
        const poblacionData = this.convertirFormatoMockAPoblacionData(data);
        return {
          success: true,
          message: 'Datos de población obtenidos correctamente',
          data: poblacionData,
          status_code: 200
        };
      }),
      catchError(() => {
        // Si hay error cargando mock, retornar datos por defecto sin error
        const defaultData: ApiResponse<PoblacionData> = {
          success: true,
          message: 'Datos de población obtenidos correctamente',
          data: {
            poblacion: {
              total_varones: 0,
              total_mujeres: 0,
              total_poblacion: 0,
              porcentaje_varones: '0%',
              porcentaje_mujeres: '0%',
              edad_0_14: 0,
              edad_15_29: 0,
              edad_30_44: 0,
              edad_45_64: 0,
              edad_65_mas: 0
            }
          },
          status_code: 200
        };
        return of(defaultData);
      })
    );
  }

  getPoblacionByDistrito(distrito: string): Observable<ApiResponse<CentroPoblado[]>> {
    const url = this.getApiEndpoint('poblacion/distrito');
    const params = { distrito: distrito };

    // Siempre usar modo mock
    const cached = this.cacheService.getMockDataFromCache(url, params);
    if (cached) {
      return of(cached);
    }
    
    return this.getSharedData('poblacion').pipe(
      map(data => ({
        success: true,
        message: `Datos de población para ${distrito} obtenidos correctamente`,
        data: data.centros_poblados || [],
        status_code: 200
      })),
      catchError(() => {
        // Si hay error cargando mock, retornar datos vacíos sin error
        return of({
          success: true,
          message: `Datos de población para ${distrito} obtenidos correctamente`,
          data: [],
          status_code: 200
        });
      })
    );
  }

  getPoblacionByProvincia(provincia: string): Observable<ApiResponse<CentroPoblado[]>> {
    const url = this.getApiEndpoint('poblacion/provincia');
    const params = provincia ? { provincia: provincia } : undefined;

    // Siempre usar modo mock
    const cached = params ? this.cacheService.getMockDataFromCache(url, params) : null;
    if (cached) {
      return of(cached);
    }
    
    return this.getSharedData('poblacion').pipe(
      map(data => ({
        success: true,
        message: `Datos de población para ${provincia} obtenidos correctamente`,
        data: data.centros_poblados || [],
        status_code: 200
      })),
      catchError(() => {
        // Si hay error cargando mock, retornar datos vacíos sin error
        return of({
          success: true,
          message: `Datos de población para ${provincia} obtenidos correctamente`,
          data: [],
          status_code: 200
        });
      })
    );
  }

  getPEAByDistrito(distrito: string): Observable<ApiResponse<PEAData>> {
    const url = this.getApiEndpoint('censo/pea-nopea');
    const params = { distrito: distrito };

    // Si NO está en modo mock, intentar conectar al backend primero
    if (!this.configService.isMockMode()) {
      const httpParams = new HttpParams().set('distrito', distrito);
      return this.http.get<ApiResponse<PEAData>>(url, { params: httpParams }).pipe(
        catchError((error) => {
          console.warn('⚠️ Backend no disponible, usando cache o datos mock');
          // Si falla, intentar desde cache
          return this.getPEAFromCacheOrMock(url, params, distrito);
        })
      );
    }

    // Si está en modo mock, usar cache o datos estáticos
    return this.getPEAFromCacheOrMock(url, params, distrito);
  }

  private getPEAFromCacheOrMock(url: string, params: any, distrito: string): Observable<ApiResponse<PEAData>> {
    // Primero intentar obtener desde cache consolidado (respuestas del backend guardadas)
    const consolidatedData = this.cacheService.getConsolidatedMockData('pea');
    if (consolidatedData) {
      return of({
        success: true,
        message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente (desde cache del backend)`,
        data: consolidatedData,
        status_code: 200
      });
    }

    // Luego intentar desde cache normal
    const cached = this.cacheService.getMockDataFromCache(url, params);
    if (cached) {
      return of(cached);
    }
    
    // Finalmente usar archivos JSON estáticos
    return this.getSharedData('pea').pipe(
      map(data => ({
        success: true,
        message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente`,
        data: data,
        status_code: 200
      })),
      catchError(() => {
        // Si hay error cargando mock, retornar datos por defecto sin error
        const defaultData: ApiResponse<PEAData> = {
          success: true,
          message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente`,
          data: {
            pea: 0,
            no_pea: 0,
            porcentaje_pea: '0%',
            porcentaje_no_pea: '0%',
            ocupada: 0,
            desocupada: 0,
            porcentaje_ocupada: '0%',
            porcentaje_desocupada: '0%'
          },
          status_code: 200
        };
        return of(defaultData);
      })
    );
  }

  /**
   * Convierte el formato del mock (totalPobladores, totalVarones, etc.) 
   * al formato del backend (total_poblacion, total_varones, etc.)
   */
  private convertirFormatoMockAPoblacionData(data: any): PoblacionData {
    // Si ya está en formato del backend, retornarlo tal cual
    if (data.poblacion && data.poblacion.total_poblacion !== undefined) {
      return data as PoblacionData;
    }

    // Si está en formato del mock, convertirlo
    if (data.poblacion && data.poblacion.totalPobladores !== undefined) {
      const mock = data.poblacion;
      const total = mock.totalPobladores || 0;
      const varones = mock.totalVarones || 0;
      const mujeres = mock.totalMujeres || 0;

      return {
        poblacion: {
          total_poblacion: total,
          total_varones: varones,
          total_mujeres: mujeres,
          porcentaje_varones: mock.porcentajeVarones || this.calcularPorcentaje(varones, total),
          porcentaje_mujeres: mock.porcentajeMujeres || this.calcularPorcentaje(mujeres, total),
          edad_0_14: mock.de0a14 || 0,
          edad_15_29: mock.de14a29 || 0,
          edad_30_44: mock.de30a44 || 0,
          edad_45_64: mock.de45a64 || 0,
          edad_65_mas: mock.de65amas || 0
        }
      };
    }

    // Si no tiene el formato esperado, retornar estructura vacía
    return {
      poblacion: {
        total_varones: 0,
        total_mujeres: 0,
        total_poblacion: 0,
        porcentaje_varones: '0%',
        porcentaje_mujeres: '0%',
        edad_0_14: 0,
        edad_15_29: 0,
        edad_30_44: 0,
        edad_45_64: 0,
        edad_65_mas: 0
      }
    };
  }

  private calcularPorcentaje(parte: number, total: number): string {
    if (total === 0) return '0%';
    const porcentaje = (parte / total) * 100;
    return porcentaje.toFixed(2) + '%';
  }
}

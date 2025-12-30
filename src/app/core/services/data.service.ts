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
    if (this.configService.isMockMode()) {
      return this.loadMockData(filename);
    } else {
      return this.loadFromAPI(filename);
    }
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

    if (this.configService.isMockMode()) {
      const cached = this.cacheService.getMockDataFromCache(url, params);
      if (cached) {
        console.log('Usando datos desde cache (modo MOCK)');
        return of(cached);
      }
      
      return this.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: 'Datos de población obtenidos correctamente (mock)',
          data: data,
          status_code: 200
        }))
      );
    }

    const httpParams = new HttpParams().set('cpp', cppCodes.join(','));
    return this.http.get<ApiResponse<PoblacionData>>(url, { params: httpParams }).pipe(
      catchError((error) => {
        const cached = this.cacheService.getMockDataFromCache(url, params);
        if (cached) {
          console.log('Backend no disponible, usando datos desde cache');
          return of(cached);
        }
        return this.handleApiError(error);
      })
    );
  }

  getPoblacionByDistrito(distrito: string): Observable<ApiResponse<CentroPoblado[]>> {
    const url = this.getApiEndpoint('poblacion/distrito');
    const params = { distrito: distrito };

    if (this.configService.isMockMode()) {
      const cached = this.cacheService.getMockDataFromCache(url, params);
      if (cached) {
        console.log('Usando datos desde cache (modo MOCK)');
        return of(cached);
      }
      
      console.warn('Modo MOCK activado. No hay datos en cache para este distrito.');
      return this.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: `Datos de población para ${distrito} obtenidos correctamente (mock)`,
          data: data.centros_poblados || [],
          status_code: 200
        }))
      );
    }

    const httpParams = new HttpParams().set('distrito', distrito);
    
    console.log('Consultando backend real:', url);
    console.log('Parametros:', params);
    
    return this.http.get<ApiResponse<CentroPoblado[]>>(url, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error al consultar backend:', error);
        const cached = this.cacheService.getMockDataFromCache(url, params);
        if (cached) {
          console.log('Backend no disponible, usando datos desde cache');
          return of(cached);
        }
        console.error('URL completa:', `${url}?distrito=${encodeURIComponent(distrito)}`);
        return this.handleApiError(error);
      })
    );
  }

  getPoblacionByProvincia(provincia: string): Observable<ApiResponse<CentroPoblado[]>> {
    const url = this.getApiEndpoint('poblacion/provincia');
    const params = provincia ? { provincia: provincia } : undefined;

    if (this.configService.isMockMode()) {
      const cached = params ? this.cacheService.getMockDataFromCache(url, params) : null;
      if (cached) {
        console.log('Usando datos desde cache (modo MOCK)');
        return of(cached);
      }
      
      return this.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: `Datos de población para ${provincia} obtenidos correctamente (mock)`,
          data: data.centros_poblados || [],
          status_code: 200
        }))
      );
    }

    if (!provincia || provincia.trim() === '') {
      return this.http.get<ApiResponse<CentroPoblado[]>>(url).pipe(
        catchError((error) => {
          const cached = this.cacheService.getMockDataFromCache(url, undefined);
          if (cached) {
            console.log('Backend no disponible, usando datos desde cache');
            return of(cached);
          }
          return this.handleApiError(error);
        })
      );
    }

    const httpParams = new HttpParams().set('provincia', provincia);
    return this.http.get<ApiResponse<CentroPoblado[]>>(url, { params: httpParams }).pipe(
      catchError((error) => {
        const cached = this.cacheService.getMockDataFromCache(url, params);
        if (cached) {
          console.log('Backend no disponible, usando datos desde cache');
          return of(cached);
        }
        return this.handleApiError(error);
      })
    );
  }

  getPEAByDistrito(distrito: string): Observable<ApiResponse<PEAData>> {
    const url = this.getApiEndpoint('censo/pea-nopea');
    const params = { distrito: distrito };

    if (this.configService.isMockMode()) {
      const cached = this.cacheService.getMockDataFromCache(url, params);
      if (cached) {
        console.log('Usando datos desde cache (modo MOCK)');
        return of(cached);
      }
      
      return this.getSharedData('pea').pipe(
        map(data => ({
          success: true,
          message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente (mock)`,
          data: data,
          status_code: 200
        }))
      );
    }

    const httpParams = new HttpParams().set('distrito', distrito);
    return this.http.get<ApiResponse<PEAData>>(url, { params: httpParams }).pipe(
      catchError((error) => {
        const cached = this.cacheService.getMockDataFromCache(url, params);
        if (cached) {
          console.log('Backend no disponible, usando datos desde cache');
          return of(cached);
        }
        return this.handleApiError(error);
      })
    );
  }
}

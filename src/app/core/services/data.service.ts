import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
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
    private configService: ConfigService
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
    if (this.configService.isMockMode()) {
      return this.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: 'Datos de población obtenidos correctamente (mock)',
          data: data,
          status_code: 200
        }))
      );
    }

    const params = new HttpParams().set('cpp', cppCodes.join(','));
    return this.http.get<ApiResponse<PoblacionData>>(
      this.getApiEndpoint('poblacion/'),
      { params }
    ).pipe(
      catchError(this.handleApiError)
    );
  }

  getPoblacionByDistrito(distrito: string): Observable<ApiResponse<CentroPoblado[]>> {
    if (this.configService.isMockMode()) {
      console.warn('Modo MOCK activado. Los datos no vienen del backend real.');
      return this.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: `Datos de población para ${distrito} obtenidos correctamente (mock)`,
          data: data.centros_poblados || [],
          status_code: 200
        }))
      );
    }

    const url = this.getApiEndpoint('poblacion/distrito');
    const params = new HttpParams().set('distrito', distrito);
    
    console.log('Consultando backend:', url);
    console.log('Parámetros:', { distrito });
    
    return this.http.get<ApiResponse<CentroPoblado[]>>(url, { params }).pipe(
      catchError((error) => {
        console.error('Error en la petición:', error);
        console.error('URL completa:', `${url}?distrito=${encodeURIComponent(distrito)}`);
        return this.handleApiError(error);
      })
    );
  }

  getPoblacionByProvincia(provincia: string): Observable<ApiResponse<CentroPoblado[]>> {
    if (this.configService.isMockMode()) {
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
      return this.http.get<ApiResponse<CentroPoblado[]>>(
        this.getApiEndpoint('poblacion/provincia')
      ).pipe(
        catchError(this.handleApiError)
      );
    }

    const params = new HttpParams().set('provincia', provincia);
    return this.http.get<ApiResponse<CentroPoblado[]>>(
      this.getApiEndpoint('poblacion/provincia'),
      { params }
    ).pipe(
      catchError(this.handleApiError)
    );
  }

  getPEAByDistrito(distrito: string): Observable<ApiResponse<PEAData>> {
    if (this.configService.isMockMode()) {
      return this.getSharedData('pea').pipe(
        map(data => ({
          success: true,
          message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente (mock)`,
          data: data,
          status_code: 200
        }))
      );
    }

    const params = new HttpParams().set('distrito', distrito);
    return this.http.get<ApiResponse<PEAData>>(
      this.getApiEndpoint('censo/pea-nopea'),
      { params }
    ).pipe(
      catchError(this.handleApiError)
    );
  }
}

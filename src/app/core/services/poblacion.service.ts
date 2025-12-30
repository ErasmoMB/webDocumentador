import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { DataService } from './data.service';

export interface PoblacionResponse {
  success: boolean;
  message: string;
  data: {
    poblacion: {
      total_varones: number;
      total_mujeres: number;
      total_poblacion: number;
      porcentaje_varones: string;
      porcentaje_mujeres: string;
      edad_0_14: number;
      edad_15_29: number;
      edad_30_44: number;
      edad_45_64: number;
      edad_65_mas: number;
    };
  };
  status_code: number;
}

export interface PoblacionDistritoItem {
  cpp: string;
  centro_poblado: string;
  departamento: string;
  provincia: string;
  distrito: string;
  total: number;
  hombres: number;
  mujeres: number;
}

export interface PoblacionDistritoResponse {
  success: boolean;
  message: string;
  data: PoblacionDistritoItem[];
  status_code: number;
}

export interface PEANoPEAResponse {
  success: boolean;
  message: string;
  data: {
    pea: {
      total: number;
      hombres: number;
      mujeres: number;
      porcentaje_hombres: string;
      porcentaje_mujeres: string;
    };
    no_pea: {
      total: number;
      hombres: number;
      mujeres: number;
      porcentaje_hombres: string;
      porcentaje_mujeres: string;
    };
    pea_ocupada: {
      total: number;
      hombres: number;
      mujeres: number;
    };
    pea_desocupada: {
      total: number;
      hombres: number;
      mujeres: number;
    };
  };
  status_code: number;
}

@Injectable({
  providedIn: 'root'
})
export class PoblacionService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private dataService: DataService
  ) { }

  getPoblacionByCpp(cpp: string[]): Observable<PoblacionResponse> {
    if (this.configService.isMockMode()) {
      return this.dataService.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: 'Datos de población obtenidos correctamente',
          data: { poblacion: data },
          status_code: 200
        } as PoblacionResponse))
      );
    }

    const apiUrl = `${this.configService.getApiUrl()}/poblacion/`;
    const params = new HttpParams().set('cpp', cpp.join(','));
    
    return this.http.get<PoblacionResponse>(apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener población por CPP:', error);
        return of({
          success: false,
          message: 'Error al obtener datos de población',
          data: { poblacion: {} as any },
          status_code: 500
        } as PoblacionResponse);
      })
    );
  }

  getPoblacionByDistrito(distrito: string): Observable<PoblacionDistritoResponse> {
    if (this.configService.isMockMode()) {
      return this.dataService.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: `Datos de población para ${distrito} obtenidos correctamente`,
          data: [],
          status_code: 200
        } as PoblacionDistritoResponse))
      );
    }

    const apiUrl = `${this.configService.getApiUrl()}/poblacion/distrito`;
    const params = new HttpParams().set('distrito', distrito);
    
    return this.http.get<PoblacionDistritoResponse>(apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener población por distrito:', error);
        return of({
          success: false,
          message: 'Error al obtener datos de población',
          data: [],
          status_code: 500
        } as PoblacionDistritoResponse);
      })
    );
  }

  getPoblacionByProvincia(provincia: string): Observable<PoblacionDistritoResponse> {
    if (this.configService.isMockMode()) {
      return this.dataService.getSharedData('poblacion').pipe(
        map(data => ({
          success: true,
          message: `Datos de población para ${provincia} obtenidos correctamente`,
          data: [],
          status_code: 200
        } as PoblacionDistritoResponse))
      );
    }

    const apiUrl = `${this.configService.getApiUrl()}/poblacion/provincia`;
    const params = new HttpParams().set('provincia', provincia);
    
    return this.http.get<PoblacionDistritoResponse>(apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener población por provincia:', error);
        return of({
          success: false,
          message: 'Error al obtener datos de población',
          data: [],
          status_code: 500
        } as PoblacionDistritoResponse);
      })
    );
  }

  getPEANoPEAByDistrito(distrito: string): Observable<PEANoPEAResponse> {
    if (this.configService.isMockMode()) {
      return this.dataService.getSharedData('pea').pipe(
        map(data => ({
          success: true,
          message: `Datos de PEA y No PEA para ${distrito} obtenidos correctamente`,
          data: data,
          status_code: 200
        } as PEANoPEAResponse))
      );
    }

    const apiUrl = `${this.configService.getApiUrl()}/censo/pea-nopea`;
    const params = new HttpParams().set('distrito', distrito);
    
    return this.http.get<PEANoPEAResponse>(apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener PEA/No PEA por distrito:', error);
        return of({
          success: false,
          message: 'Error al obtener datos de PEA/No PEA',
          data: {} as any,
          status_code: 500
        } as PEANoPEAResponse);
      })
    );
  }
}


import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../config.service';
import { DataService } from '../data.service';
import { BackendApiService } from '../infrastructure/backend-api.service';
import { MathUtil } from '../../utils/math.util';
import { DataTransformerUtil } from '../../utils/data-transformer.util';

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
    pea: number;
    no_pea: number;
    porcentaje_pea: string;
    porcentaje_no_pea: string;
    ocupada: number;
    desocupada: number;
    porcentaje_ocupada: string;
    porcentaje_desocupada: string;
  };
  status_code: number;
}

@Injectable({
  providedIn: 'root'
})
export class PoblacionService {

  constructor(
    private configService: ConfigService,
    private dataService: DataService,
    private backendApi: BackendApiService
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

    const idUbigeo = cpp.length > 0 ? cpp[0] : undefined;
    if (!idUbigeo) {
      return of({
        success: false,
        message: 'No se proporcionó código CPP',
        data: { poblacion: {} as any },
        status_code: 400
      } as PoblacionResponse);
    }

    return this.backendApi.getDatosDemograficos(idUbigeo).pipe(
      map(response => {
        if (response.data && response.data.length > 0) {
          const datos = response.data[0];
          const transformed = DataTransformerUtil.transformDatosDemograficos(datos);
          return {
            success: true,
            message: 'Datos de población obtenidos correctamente',
            data: {
              poblacion: {
                ...transformed,
                total_varones: datos.hombres || 0,
                total_mujeres: datos.mujeres || 0,
                porcentaje_varones: MathUtil.calcularPorcentaje(datos.hombres || 0, datos.poblacion_total || 0),
                porcentaje_mujeres: MathUtil.calcularPorcentaje(datos.mujeres || 0, datos.poblacion_total || 0)
              }
            },
            status_code: 200
          } as PoblacionResponse;
        }
        return {
          success: false,
          message: 'No se encontraron datos',
          data: { poblacion: {} as any },
          status_code: 404
        } as PoblacionResponse;
      }),
      catchError(error => {
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

    return this.backendApi.getUbicacionesConDatosDemograficos().pipe(
      map(response => {
        if (response.data && Array.isArray(response.data)) {
          const filtered = DataTransformerUtil.filterByDistrito(response.data, distrito);
          const centrosPoblados: PoblacionDistritoItem[] = filtered.map(DataTransformerUtil.mapToCentroPoblado);
          return {
            success: true,
            message: `Datos de población para ${distrito} obtenidos correctamente`,
            data: centrosPoblados,
            status_code: 200
          } as PoblacionDistritoResponse;
        }
        return {
          success: false,
          message: 'No se encontraron datos',
          data: [],
          status_code: 404
        } as PoblacionDistritoResponse;
      }),
      catchError(error => {
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

    return this.backendApi.getUbicacionesConDatosDemograficos().pipe(
      map(response => {
        if (response.data && Array.isArray(response.data)) {
          const filtered = DataTransformerUtil.filterByProvincia(response.data, provincia);
          const centrosPoblados: PoblacionDistritoItem[] = filtered.map(DataTransformerUtil.mapToCentroPoblado);
          return {
            success: true,
            message: `Datos de población para ${provincia} obtenidos correctamente`,
            data: centrosPoblados,
            status_code: 200
          } as PoblacionDistritoResponse;
        }
        return {
          success: false,
          message: 'No se encontraron datos',
          data: [],
          status_code: 404
        } as PoblacionDistritoResponse;
      }),
      catchError(error => {
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

    return this.dataService.getSharedData('pea').pipe(
      map(data => ({
        success: true,
        message: `Datos de PEA y No PEA para ${distrito} obtenidos correctamente`,
        data: data,
        status_code: 200
      } as PEANoPEAResponse)),
      catchError(error => {
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


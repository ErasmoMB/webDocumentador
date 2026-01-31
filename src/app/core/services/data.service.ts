import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { CacheService } from './infrastructure/cache.service';
import { BackendApiService } from './infrastructure/backend-api.service';
import { MathUtil } from '../utils/math.util';
import { DataTransformerUtil } from '../utils/data-transformer.util';
import { 
  ApiResponse, 
  PoblacionData, 
  CentroPoblado, 
  PEAData 
} from '../models/api-response.model';

/**
 * @deprecated Sprint 2: migrar a servicios de dominio + BackendApiService.
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private cacheService: CacheService,
    private backendApi: BackendApiService
  ) { }

  getData(filename: string): Observable<any> {
    return this.loadMockData(filename);
  }

  private loadMockData(filename: string): Observable<any> {
    const path = `${this.configService.getMockDataPath()}/shared/${filename}`;
    return this.http.get(path).pipe(
      catchError(error => {
        return of({});
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


  getPoblacionByCpp(cppCodes: string[]): Observable<ApiResponse<PoblacionData>> {
    const params = { cpp: cppCodes.join(',') };
    const idUbigeo = cppCodes.length > 0 ? cppCodes[0] : undefined;

    if (!this.configService.isMockMode() && idUbigeo) {
      return this.backendApi.getDatosDemograficos(idUbigeo).pipe(
        switchMap(response => {
          if (response.data && response.data.length > 0) {
            const datos = response.data[0];
            const transformed = DataTransformerUtil.transformDatosDemograficos(datos);
            const poblacionData: PoblacionData = {
              poblacion: {
                ...transformed,
                total_varones: datos.hombres || 0,
                total_mujeres: datos.mujeres || 0,
                porcentaje_varones: MathUtil.calcularPorcentaje(datos.hombres || 0, datos.poblacion_total || 0),
                porcentaje_mujeres: MathUtil.calcularPorcentaje(datos.mujeres || 0, datos.poblacion_total || 0)
              }
            };
            return of({
              success: true,
              message: 'Datos de población obtenidos correctamente',
              data: poblacionData,
              status_code: 200
            });
          }
          return this.getPoblacionFromCacheOrMock('', params);
        }),
        catchError((error) => {
          return this.getPoblacionFromCacheOrMock('', params);
        })
      );
    }
    return this.getPoblacionFromCacheOrMock('', params);
  }

  private getPoblacionFromCacheOrMock(url: string, params: any): Observable<ApiResponse<PoblacionData>> {
    const consolidatedData = this.cacheService.getConsolidatedMockData('poblacion');
    if (consolidatedData) {
      return of({
        success: true,
        message: 'Datos de población obtenidos correctamente (desde cache del backend)',
        data: consolidatedData,
        status_code: 200
      });
    }

    const cached = this.cacheService.getMockDataFromCache(url, params);
    if (cached) {
      return of(cached);
    }
    
    return this.getSharedData('poblacion').pipe(
      map(data => {
        const poblacionData = this.convertirFormatoMockAPoblacionData(data);
        return {
          success: true,
          message: 'Datos de población obtenidos correctamente',
          data: poblacionData,
          status_code: 200
        };
      }),
      catchError(() => {
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
    const params = { distrito: distrito };

    if (!this.configService.isMockMode()) {
      // Usar el nuevo endpoint de distritos que sí existe
      return this.backendApi.getDistritos().pipe(
        switchMap(response => {
          if (response.data && Array.isArray(response.data)) {
            // Si el distrito coincide con alguno de los devueltos, devolver con ese distrito
            const found = response.data.find((d: any) => 
              (d.distrito && d.distrito.toLowerCase() === distrito.toLowerCase())
            );
            
            if (found) {
              return of({
                success: true,
                message: `Datos de población para ${distrito} obtenidos correctamente`,
                data: [found] as any,
                status_code: 200
              });
            }
            
            return this.getPoblacionDistritoFromCacheOrMock('', params, distrito);
          }
          return this.getPoblacionDistritoFromCacheOrMock('', params, distrito);
        }),
        catchError((error) => {
          return this.getPoblacionDistritoFromCacheOrMock('', params, distrito);
        })
      );
    }

    return this.getPoblacionDistritoFromCacheOrMock('', params, distrito);
  }

  private getPoblacionDistritoFromCacheOrMock(url: string, params: any, distrito: string): Observable<ApiResponse<CentroPoblado[]>> {
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
    const params = provincia ? { provincia: provincia } : undefined;

    if (!this.configService.isMockMode() && params) {
      return this.backendApi.getUbicacionesConDatosDemograficos().pipe(
        switchMap(response => {
          if (response.data && Array.isArray(response.data)) {
            const filtered = DataTransformerUtil.filterByProvincia(response.data, provincia);
            const centrosPoblados: CentroPoblado[] = filtered.map(DataTransformerUtil.mapToCentroPoblado);
            return of({
              success: true,
              message: `Datos de población para ${provincia} obtenidos correctamente`,
              data: centrosPoblados,
              status_code: 200
            });
          }
          return this.getPoblacionProvinciaFromCacheOrMock('', params, provincia);
        }),
        catchError((error) => {
          return this.getPoblacionProvinciaFromCacheOrMock('', params, provincia);
        })
      );
    }

    return this.getPoblacionProvinciaFromCacheOrMock('', params, provincia);
  }

  private getPoblacionProvinciaFromCacheOrMock(url: string, params: any, provincia: string): Observable<ApiResponse<CentroPoblado[]>> {
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
    const params = { distrito: distrito };

    if (!this.configService.isMockMode()) {
      return this.getPEAFromCacheOrMock('', params, distrito);
    }

    return this.getPEAFromCacheOrMock('', params, distrito);
  }

  private getPEAFromCacheOrMock(url: string, params: any, distrito: string): Observable<ApiResponse<PEAData>> {
    const consolidatedData = this.cacheService.getConsolidatedMockData('pea');
    if (consolidatedData) {
      return of({
        success: true,
        message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente (desde cache del backend)`,
        data: consolidatedData,
        status_code: 200
      });
    }

    const cached = this.cacheService.getMockDataFromCache(url, params);
    if (cached) {
      return of(cached);
    }
    
    return this.getSharedData('pea').pipe(
      map(data => ({
        success: true,
        message: `Datos PEA/No PEA para ${distrito} obtenidos correctamente`,
        data: data,
        status_code: 200
      })),
      catchError(() => {
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

  getSeccionById(seccionId: number): Observable<any> {
    // Placeholder para datos de sección; se puede vincular a mock o backend real
    return of({
      id: seccionId,
      nombre: `Sección ${seccionId}`,
      descripcion: 'Datos de sección cargados desde DataService'
    });
  }

  saveSeccionData(seccionId: number, data: any): Observable<boolean> {
    // Placeholder para persistencia; en producción llamaría al backend
    return of(true);
  }

  private convertirFormatoMockAPoblacionData(data: any): PoblacionData {
    if (data.poblacion && data.poblacion.total_poblacion !== undefined) {
      return data as PoblacionData;
    }

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
          porcentaje_varones: mock.porcentajeVarones || MathUtil.calcularPorcentaje(varones, total),
          porcentaje_mujeres: mock.porcentajeMujeres || MathUtil.calcularPorcentaje(mujeres, total),
          edad_0_14: mock.de0a14 || 0,
          edad_15_29: mock.de14a29 || 0,
          edad_30_44: mock.de30a44 || 0,
          edad_45_64: mock.de45a64 || 0,
          edad_65_mas: mock.de65amas || 0
        }
      };
    }

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
}

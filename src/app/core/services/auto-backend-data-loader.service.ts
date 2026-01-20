import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { BackendApiService } from './backend-api.service';
import { BackendDataMapperService, DataMapping, SectionDataConfig } from './backend-data-mapper.service';
import { CacheService } from './cache.service';
import { CentrosPobladosActivosService } from './centros-poblados-activos.service';

@Injectable({
  providedIn: 'root'
})
export class AutoBackendDataLoaderService {
  private readonly CACHE_DURATION = 3600000;
  private readonly MAX_RETRIES = 3;
  private loadingRequests: Map<string, Observable<any>> = new Map();
  private failedRequests: Map<string, { retries: number; lastError: any }> = new Map();

  constructor(
    private backendApi: BackendApiService,
    private dataMapper: BackendDataMapperService,
    private cacheService: CacheService,
    private centrosPobladosActivos: CentrosPobladosActivosService
  ) {}

  loadSectionData(
    sectionKey: string,
    ubigeoOrCppList: string | string[],
    forceRefresh: boolean = false
  ): Observable<{ [fieldName: string]: any }> {
    const config = this.dataMapper.getConfig(sectionKey);
    if (!config) {
      return of({});
    }

    const fieldNames = Object.keys(config);
    const observables: { [key: string]: Observable<any> } = {};

    for (const fieldName of fieldNames) {
      const mapping = config[fieldName];
      observables[fieldName] = this.loadFieldData(
        sectionKey,
        fieldName,
        mapping,
        ubigeoOrCppList,
        forceRefresh
      );
    }

    return forkJoin(observables).pipe(
      catchError(() => {
        return of({});
      })
    );
  }

  private loadFieldData(
    sectionKey: string,
    fieldName: string,
    mapping: DataMapping,
    ubigeoOrCppList: string | string[],
    forceRefresh: boolean
  ): Observable<any> {
    const params = this.buildCacheParams(mapping.paramType, ubigeoOrCppList);
    const requestKey = `${fieldName}_${mapping.endpoint}_${JSON.stringify(params)}`;
    
    // Verificar si ya hemos superado el límite de reintentos
    const failedRequest = this.failedRequests.get(requestKey);
    if (failedRequest && failedRequest.retries >= this.MAX_RETRIES) {
      console.warn(`🚫 Reintentos agotados (${this.MAX_RETRIES}) para: ${mapping.endpoint} con parámetros:`, params);
      return of(null);
    }
    
    // Si es aggregatable (múltiples CCPP), no cachear aquí, dejar que aggregateMultipleCpp maneje el cache individual
    const useCache = !forceRefresh && !mapping.aggregatable;
    
    if (useCache) {
      const cached = this.cacheService.getCachedResponse(mapping.endpoint, params);
      if (cached) {
        const transformed = mapping.transform ? mapping.transform(cached) : cached;
        return of(transformed);
      }
    }

    // Para fields NO aggregatable, reutilizar requests en progreso
    if (!mapping.aggregatable && this.loadingRequests.has(requestKey)) {
      return this.loadingRequests.get(requestKey)!;
    }

    const request$ = this.fetchAndTransform(sectionKey, mapping, ubigeoOrCppList).pipe(
      map(data => {
        // Limpiar contador de fallos si la solicitud fue exitosa
        this.failedRequests.delete(requestKey);
        
        // Aplicar transform a TODOS (incluyendo agregatable)
        const transformedData = mapping.transform ? mapping.transform(data) : data;
        
        // Solo cachear si NO es aggregatable
        if (!mapping.aggregatable) {
          this.cacheService.saveResponse(mapping.endpoint, params, transformedData);
        }
        
        return transformedData;
      }),
      catchError(err => {
        // Incrementar contador de reintentos
        const current = this.failedRequests.get(requestKey) || { retries: 0, lastError: null };
        current.retries++;
        current.lastError = err;
        this.failedRequests.set(requestKey, current);
        
        console.warn(`⚠️ Error en ${mapping.endpoint} (intento ${current.retries}/${this.MAX_RETRIES}):`, err.message || err);
        
        return of(null);
      }),
      shareReplay(1)
    );

    // Solo guardar en loadingRequests si es NO aggregatable
    if (!mapping.aggregatable) {
      this.loadingRequests.set(requestKey, request$);
      
      request$.subscribe({
        complete: () => {
          setTimeout(() => {
            this.loadingRequests.delete(requestKey);
          }, 100);
        }
      });
    }

    return request$;
  }

  private fetchAndTransform(
    sectionKey: string,
    mapping: DataMapping,
    ubigeoOrCppList: string | string[]
  ): Observable<any> {
    if (Array.isArray(ubigeoOrCppList) && ubigeoOrCppList.length === 0) {
      return of([]);
    }

    // Si es POST y tenemos múltiples códigos, hacer POST con todos los códigos
    if (mapping.method === 'POST' && Array.isArray(ubigeoOrCppList)) {
      return this.callEndpointPost(mapping.endpoint, ubigeoOrCppList);
    }

    // Si es GET con múltiples códigos y aggregatable, hacer GET individual y agregar
    if (Array.isArray(ubigeoOrCppList) && mapping.aggregatable && mapping.method !== 'POST') {
      return this.aggregateMultipleCpp(sectionKey, mapping, ubigeoOrCppList);
    }
    
    const paramValue = Array.isArray(ubigeoOrCppList) 
      ? ubigeoOrCppList[0] 
      : ubigeoOrCppList;
    return this.callEndpoint(mapping.endpoint, mapping.paramType, paramValue);
  }

  private aggregateMultipleCpp(
    sectionKey: string,
    mapping: DataMapping,
    cppList: string[]
  ): Observable<any[]> {
    const requests = cppList.map((cpp, idx) => {
      const paramType = mapping.paramType || 'id_ubigeo';
      const params = this.buildCacheParams(paramType, cpp);
      
      // Crear clave única para trackear reintentos por endpoint + parámetro
      const endpointKey = `${mapping.endpoint}_${JSON.stringify(params)}`;
      
      // Verificar si ya hemos superado el límite de reintentos
      const failedRequest = this.failedRequests.get(endpointKey);
      if (failedRequest && failedRequest.retries >= this.MAX_RETRIES) {
        console.warn(`🚫 Reintentos agotados (${this.MAX_RETRIES}) para: ${mapping.endpoint} con cpp: ${cpp}`);
        return of([]);
      }
      
      const cached = this.cacheService.getCachedResponse(mapping.endpoint, params);
      
      if (cached) {
        // Si hay cache, retornar el RAW (sin transformar aún)
        return of(cached);
      }

      return this.callEndpoint(mapping.endpoint, mapping.paramType, cpp).pipe(
        map(data => {
          // Limpiar contador de fallos si fue exitoso
          this.failedRequests.delete(endpointKey);
          this.cacheService.saveResponse(mapping.endpoint, params, data);
          // NO transformar aquí, retornar datos raw para que agregateMultipleCpp los procese
          return data;
        }),
        catchError(err => {
          // Incrementar contador de reintentos
          const current = this.failedRequests.get(endpointKey) || { retries: 0, lastError: null };
          current.retries++;
          current.lastError = err;
          this.failedRequests.set(endpointKey, current);
          
          console.warn(`⚠️ Error en ${mapping.endpoint} (cpp: ${cpp}, intento ${current.retries}/${this.MAX_RETRIES}):`, err.message || err);
          
          return of([]);
        })
      );
    });

    return forkJoin(requests).pipe(
      map(results => {
        if (sectionKey === 'seccion6_aisd' && mapping.endpoint === '/demograficos/datos') {
          const aggregated = this.agregarDemograficosDesdeRespuestas(results);
          const transformed = mapping.transform ? mapping.transform(aggregated.items) : aggregated.items;
          return transformed;
        }
        
        if (mapping.endpoint === '/aisd/centros-poblados') {
          return results.flat();
        }
        
        const merged = this.mergeResults(results);
        return merged;
      })
    );
  }

  private agregarDemograficosDesdeRespuestas(results: any[][]): {
    items: any[];
    total: number;
    conDatos: number;
    hombres: number;
    mujeres: number;
    totalPoblacion: number;
  } {
    const total = results.length;
    let conDatos = 0;
    let hombres = 0;
    let mujeres = 0;
    let totalPoblacion = 0;
    let menores_1 = 0;
    let de_1_a_14 = 0;
    let de_15_a_29 = 0;
    let de_30_a_44 = 0;
    let de_45_a_64 = 0;
    let mayores_65 = 0;

    const toNum = (v: any) => {
      const n = typeof v === 'number' ? v : parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    };

    for (const r of results) {
      if (!Array.isArray(r) || r.length === 0) continue;
      const d = r[0] || {};

      const h = toNum(d.hombres);
      const m = toNum(d.mujeres);
      const t = toNum(d.poblacion_total) || h + m;

      const eMen = toNum(d.menores_1);
      const e114 = toNum(d.de_1_a_14);
      const e1529 = toNum(d.de_15_a_29);
      const e3044 = toNum(d.de_30_a_44);
      const e4564 = toNum(d.de_45_a_64);
      const e65 = toNum(d.mayores_65);

      const tieneAlgo = h + m + t + eMen + e114 + e1529 + e3044 + e4564 + e65 > 0;
      if (!tieneAlgo) continue;

      conDatos++;
      hombres += h;
      mujeres += m;
      totalPoblacion += t;
      menores_1 += eMen;
      de_1_a_14 += e114;
      de_15_a_29 += e1529;
      de_30_a_44 += e3044;
      de_45_a_64 += e4564;
      mayores_65 += e65;
    }

    const item = {
      hombres,
      mujeres,
      poblacion_total: totalPoblacion,
      menores_1,
      de_1_a_14,
      de_15_a_29,
      de_30_a_44,
      de_45_a_64,
      mayores_65
    };

    return {
      items: conDatos > 0 ? [item] : [],
      total,
      conDatos,
      hombres,
      mujeres,
      totalPoblacion
    };
  }

  private callEndpoint(
    endpoint: string,
    paramType: string | undefined,
    paramValue: string
  ): Observable<any> {
    const param = paramType || 'id_ubigeo';
    
    // Solo normalizar id_ubigeo para endpoints de demografía
    // Para seguro de salud, mantener el valor tal como viene
    const normalizedParamValue = (param === 'id_ubigeo' && endpoint === '/demograficos/datos')
      ? (paramValue ? paramValue.toString().replace(/^0+/, '') || '0' : paramValue)
      : paramValue;


    switch (endpoint) {
      case '/demograficos/datos':
        return this.backendApi.getDatosDemograficos(normalizedParamValue).pipe(
          map(response => {
            return response.data;
          })
        );
      case '/aisd/pet':
        return this.backendApi.getPET(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/economicos/principales':
        return this.backendApi.getActividadesPrincipales(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/aisd/materiales-construccion':
        return this.backendApi.getMaterialesConstruccion(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/servicios/basicos':
        return this.backendApi.getServiciosBasicos(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/vistas/lenguas-ubicacion':
        return this.backendApi.getLenguasPorUbicacion(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/vistas/religiones-ubicacion':
        return this.backendApi.getReligionesPorUbicacion(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/vistas/nbi-ubicacion':
        return this.backendApi.getNBIPorUbicacion(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/aisi/informacion-referencial':
        return this.backendApi.getInformacionReferencialAISI(paramValue).pipe(
          map(response => response.data)
        );
      case '/aisi/centros-poblados':
        return this.backendApi.getCentrosPobladosAISI(paramValue).pipe(
          map(response => response.data)
        );
      case '/aisd/centros-poblados':
        return this.backendApi.getCentrosPobladosAISD(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/aisi/pea-distrital':
        return this.backendApi.getPEADistrital(paramValue).pipe(
          map(response => response.data)
        );
      case '/aisi/viviendas-censo':
        return this.backendApi.getViviendasCenso(paramValue).pipe(
          map(response => response.data)
        );
      case '/salud/seguro-salud':
        return this.backendApi.getSeguroSalud(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/educacion/niveles':
        return this.backendApi.getEducacion(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/educacion/tasa-analfabetismo':
        return this.backendApi.getTasaAnalfabetismo(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/lenguas/maternas':
        return this.backendApi.getLenguasMaternas(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/religiones':
        return this.backendApi.getReligiones(normalizedParamValue).pipe(
          map(response => response.data)
        );
      case '/nbi/por-ubigeo':
        return this.backendApi.getNbi(normalizedParamValue).pipe(
          map(response => response.data)
        );
      default:
        return of([]);
    }
  }

  private callEndpointPost(
    endpoint: string,
    codigosUBIGEO: string[]
  ): Observable<any> {
    switch (endpoint) {
      case '/servicios/por-codigos':
        console.log('[AutoBackendDataLoader] POST /servicios/por-codigos con', codigosUBIGEO.length, 'códigos:', codigosUBIGEO);
        return this.backendApi.postServiciosPorCodigos(codigosUBIGEO).pipe(
          map(response => {
            console.log('[AutoBackendDataLoader] Respuesta de /servicios/por-codigos:', response);
            return response.data;
          }),
          catchError(error => {
            console.error('[AutoBackendDataLoader] Error en POST', endpoint, error);
            return of({});
          })
        );
      case '/centros-poblados/por-codigos-ubigeo':
        return this.backendApi.postCentrosPobladosPorCodigos(codigosUBIGEO).pipe(
          map(response => response.data?.centros_poblados || []),
          catchError(error => {
            console.error('[AutoBackendDataLoader] Error en POST', endpoint, error);
            return of([]);
          })
        );
      default:
        return of({});
    }
  }

  private mergeResults(results: any[][]): any[] {
    const merged: { [key: string]: any } = {};

    for (const result of results) {
      if (!Array.isArray(result)) continue;

      for (const item of result) {
        const key = this.generateItemKey(item);
        if (key && !merged[key]) {
          merged[key] = item;
        } else if (key) {
          merged[key] = this.sumNumericFields(merged[key], item);
        }
      }
    }

    return Object.values(merged);
  }

  private generateItemKey(item: any): string {
    if (!item || typeof item !== 'object') {
      return '__single__';
    }

    // Soporte para seguro de salud
    const tipoSeguro = item.tipo_seguro?.toString() || '';
    if (tipoSeguro) {
      return `seg|${tipoSeguro}`;
    }

    const categoria = item.categoria?.toString() || '';
    const tipoMaterial = (item.tipo_material ?? item.tipoMaterial)?.toString() || '';
    if (categoria && tipoMaterial) {
      return `mat|${categoria}|${tipoMaterial}`;
    }

    const servicio = item.servicio?.toString() || '';
    const tipoServicio = item.tipo?.toString() || '';
    if (servicio && tipoServicio) {
      return `svc|${servicio}|${tipoServicio}`;
    }

    const actividad = item.actividad?.toString() || '';
    if (actividad) {
      return `act|${actividad}`;
    }

    const idioma = item.idioma?.toString() || '';
    if (idioma) {
      return `idi|${idioma}`;
    }

    const lenguaMaterna = item.lengua_materna?.toString() || '';
    if (lenguaMaterna) {
      return `lng|${lenguaMaterna}`;
    }

    const religion = item.religion?.toString() || '';
    if (religion) {
      return `rel|${religion}`;
    }

    const necesidad = item.necesidad?.toString() || '';
    if (necesidad) {
      return `nbi|${necesidad}`;
    }

    const carencia = item.carencia?.toString() || '';
    if (carencia) {
      return `car|${carencia}`;
    }

    const sexo = item.sexo?.toString() || '';
    if (sexo) {
      return `sex|${sexo}`;
    }

    const nivelEducativo = item.nivel_educativo?.toString() || '';
    if (nivelEducativo) {
      return `edu|${nivelEducativo}`;
    }

    const indicador = item.indicador?.toString() || '';
    if (indicador) {
      return `ind|${indicador}`;
    }

    if (categoria) {
      return `cat|${categoria}`;
    }

    return '__single__';
  }

  private sumNumericFields(target: any, source: any): any {
    const result = { ...target };
    for (const key in source) {
      if (typeof source[key] === 'number' && typeof result[key] === 'number') {
        result[key] += source[key];
      }
    }
    return result;
  }

  private buildCacheParams(paramType: string | undefined, ubigeoOrCppList: string | string[]) {
    const paramValue = Array.isArray(ubigeoOrCppList) ? ubigeoOrCppList : [ubigeoOrCppList];
    return { paramType: paramType || 'id_ubigeo', values: paramValue };
  }

  clearCache(): void {
    // Limpiar el Map de requests en progreso para prevenir memory leaks
    this.loadingRequests.clear();
    // Limpiar el tracking de errores para permitir reintentos
    this.failedRequests.clear();
    // Limpiar el caché del servicio de cache
    this.cacheService.clearCache();
    console.log('✨ Cache y reintentos limpiados completamente');
  }

  /**
   * Resetea el contador de reintentos para un endpoint específico.
   * Útil para permitir reintentos después de que el backend vuelve a estar disponible.
   * @param endpoint - El endpoint para el cual resetear reintentos (ej: '/aisi/informacion-referencial')
   */
  resetRetriesForEndpoint(endpoint: string): void {
    const keysToDelete: string[] = [];
    
    this.failedRequests.forEach((value, key) => {
      if (key.includes(endpoint)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.failedRequests.delete(key));
    console.log(`🔄 Reintentos reseteados para endpoint: ${endpoint} (${keysToDelete.length} registros limpiados)`);
  }

  /**
   * Resetea TODOS los contadores de reintentos.
   * Útil cuando el backend vuelve a estar disponible o para debugging.
   */
  resetAllRetries(): void {
    const count = this.failedRequests.size;
    this.failedRequests.clear();
    console.log(`🔄 Todos los reintentos reseteados (${count} registros limpiados)`);
  }
}

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BackendApiService } from '../infrastructure/backend-api.service';

export interface AutoGetEndpointContext {
  paramValue: string;
  normalizedParamValue: string;
}

export type AutoGetEndpointHandler = (ctx: AutoGetEndpointContext) => Observable<any>;

export type AutoPostEndpointHandler = (codigosUBIGEO: string[]) => Observable<any>;

const unwrapArrayData = (responseData: any): any[] => {
  const data = responseData;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
    return (data as any).data;
  }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return ((data as any).data as any[]) || [];
  }
  return Array.isArray(data) ? data : [];
};

/**
 * Desenvuelve la respuesta del backend que tiene formato:
 * [{ rows: [...], total: number, matched: [], missing: [] }]
 */
const unwrapDemograficoData = (responseData: any): any[] => {
  if (!responseData) return [];
  // El backend devuelve un array con un objeto que contiene rows
  if (Array.isArray(responseData) && responseData.length > 0) {
    return responseData[0]?.rows || responseData;
  }
  if (responseData.data) {
    const data = responseData.data;
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.rows || data;
    }
    return data;
  }
  return [];
};

/**
 * Crea los handlers para endpoints GET (mantenidos por compatibilidad)
 * NOTA: Estos ya no deberían usarse - usar los POST en su lugar
 */
export function createAutoGetEndpointHandlers(backendApi: BackendApiService): Record<string, AutoGetEndpointHandler> {
  return {
    // Los endpoints GET están deprecated - usar POST
    // Mantenidos solo por compatibilidad temporal
  };
}

/**
 * Crea los handlers para endpoints POST del backend de demográficos
 * TODOS usan el formato: { codigos: string[] }
 * Los códigos son los centros poblados seleccionados en la sección 2
 */
export function createAutoPostEndpointHandlers(backendApi: BackendApiService): Record<string, AutoPostEndpointHandler> {
  return {
    // ============================================================================
    // ENDPOINTS BÁSICOS DE DEMOGRÁFICOS
    // ============================================================================

    /**
     * Población por sexo
     * POST /demograficos/datos
     */
    '/demograficos/datos': (codigos: string[]) =>
      backendApi.postDatosDemograficos(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * PET por grupo etario
     * POST /demograficos/pet-grupo
     */
    '/demograficos/pet-grupo': (codigos: string[]) =>
      backendApi.postPetGrupo(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * PEA por sexo
     * POST /demograficos/pea
     */
    '/demograficos/pea': (codigos: string[]) =>
      backendApi.postPea(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * PEA ocupada/desocupada
     * POST /demograficos/pea-ocupada-desocupada
     */
    '/demograficos/pea-ocupada-desocupada': (codigos: string[]) =>
      backendApi.postPeaOcupadaDesocupada(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Población por edad
     * POST /demograficos/etario
     */
    '/demograficos/etario': (codigos: string[]) =>
      backendApi.postEtario(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Condición de ocupación
     * POST /demograficos/condicion-ocupacion
     */
    '/demograficos/condicion-ocupacion': (codigos: string[]) =>
      backendApi.postCondicionOcupacion(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Materiales de construcción
     * POST /demograficos/materiales-construccion
     */
    '/demograficos/materiales-construccion': (codigos: string[]) =>
      backendApi.postMaterialesConstruccion(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Saneamiento
     * POST /demograficos/saneamiento
     */
    '/demograficos/saneamiento': (codigos: string[]) =>
      backendApi.postSaneamiento(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Alumbrado
     * POST /demograficos/alumbrado
     */
    '/demograficos/alumbrado': (codigos: string[]) =>
      backendApi.postAlumbrado(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Seguro de salud
     * POST /demograficos/seguro-salud
     */
    '/demograficos/seguro-salud': (codigos: string[]) =>
      backendApi.postSeguroSalud(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Educación
     * POST /demograficos/educacion
     */
    '/demograficos/educacion': (codigos: string[]) =>
      backendApi.postEducacion(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Alfabetización
     * POST /demograficos/alfabetizacion
     */
    '/demograficos/alfabetizacion': (codigos: string[]) =>
      backendApi.postAlfabetizacion(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Índice de Desarrollo Humano
     * POST /demograficos/idh
     */
    '/demograficos/idh': (codigos: string[]) =>
      backendApi.postIdh(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Necesidades Básicas Insatisfechas
     * POST /demograficos/nbi
     */
    '/demograficos/nbi': (codigos: string[]) =>
      backendApi.postNbi(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Actividad económica
     * POST /demograficos/actividad-economica
     */
    '/demograficos/actividad-economica': (codigos: string[]) =>
      backendApi.postActividadEconomica(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Tipo de vivienda
     * POST /demograficos/tipo-vivienda
     */
    '/demograficos/tipo-vivienda': (codigos: string[]) =>
      backendApi.postTipoVivienda(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Lengua
     * POST /demograficos/lengua
     */
    '/demograficos/lengua': (codigos: string[]) =>
      backendApi.postLengua(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Abastecimiento de agua
     * POST /demograficos/abastecimiento-agua
     */
    '/demograficos/abastecimiento-agua': (codigos: string[]) =>
      backendApi.postAbastecimientoAgua(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    // ============================================================================
    // ENDPOINTS "POR CPP" (detalle por centro poblado)
    // ============================================================================

    /**
     * Condición de ocupación por CPP
     * POST /demograficos/condicion-ocupacion-cpp
     */
    '/demograficos/condicion-ocupacion-cpp': (codigos: string[]) =>
      backendApi.postCondicionOcupacionCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Materiales por CPP
     * POST /demograficos/materiales-por-cpp
     */
    '/demograficos/materiales-por-cpp': (codigos: string[]) =>
      backendApi.postMaterialesPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Abastecimiento de agua por CPP
     * POST /demograficos/abastecimiento-agua-por-cpp
     */
    '/demograficos/abastecimiento-agua-por-cpp': (codigos: string[]) =>
      backendApi.postAbastecimientoAguaPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Saneamiento por CPP
     * POST /demograficos/saneamiento-por-cpp
     */
    '/demograficos/saneamiento-por-cpp': (codigos: string[]) =>
      backendApi.postSaneamientoPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Alumbrado por CPP
     * POST /demograficos/alumbrado-por-cpp
     */
    '/demograficos/alumbrado-por-cpp': (codigos: string[]) =>
      backendApi.postAlumbradoPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Combustibles de cocina por CPP
     * POST /demograficos/combustibles-cocina-por-cpp
     */
    '/demograficos/combustibles-cocina-por-cpp': (codigos: string[]) =>
      backendApi.postCombustiblesCocinaPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Seguro de salud por CPP
     * POST /demograficos/seguro-salud-por-cpp
     */
    '/demograficos/seguro-salud-por-cpp': (codigos: string[]) =>
      backendApi.postSeguroSaludPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    /**
     * Religión por CPP
     * POST /demograficos/religion-por-cpp
     */
    '/demograficos/religion-por-cpp': (codigos: string[]) =>
      backendApi.postReligionPorCpp(codigos).pipe(
        map(response => unwrapDemograficoData(response.data)),
        catchError(() => of([]))
      ),

    // ============================================================================
    // ENDPOINTS DE CENTROS POBLADOS
    // ============================================================================

    /**
     * Centros poblados por códigos ubigeo
     * POST /centros-poblados/por-codigos-ubigeo
     */
    '/centros-poblados/por-codigos-ubigeo': (codigos: string[]) =>
      backendApi.postCentrosPobladosPorCodigosUbigeo(codigos).pipe(
        map(response => response.data?.centros_poblados || []),
        catchError(() => of([]))
      ),
  };
}

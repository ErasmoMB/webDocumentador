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

export function createAutoGetEndpointHandlers(backendApi: BackendApiService): Record<string, AutoGetEndpointHandler> {
  return {
    '/demograficos/datos': ({ normalizedParamValue }) =>
      backendApi.getDatosDemograficos(normalizedParamValue).pipe(map(response => response.data)),

    '/aisd/pet': ({ normalizedParamValue }) =>
      backendApi.getPET(normalizedParamValue).pipe(map(response => response.data)),

    '/economicos/principales': ({ normalizedParamValue }) =>
      backendApi.getActividadesPrincipales(normalizedParamValue).pipe(map(response => response.data)),

    '/aisd/materiales-construccion': ({ normalizedParamValue }) =>
      backendApi.getMaterialesConstruccion(normalizedParamValue).pipe(map(response => response.data)),

    '/servicios/basicos': ({ normalizedParamValue }) =>
      backendApi.getServiciosBasicos(normalizedParamValue).pipe(map(response => response.data)),

    '/vistas/lenguas-ubicacion': ({ normalizedParamValue }) =>
      backendApi.getLenguasPorUbicacion(normalizedParamValue).pipe(map(response => response.data)),

    '/vistas/religiones-ubicacion': ({ normalizedParamValue }) =>
      backendApi.getReligionesPorUbicacion(normalizedParamValue).pipe(map(response => response.data)),

    '/vistas/nbi-ubicacion': ({ normalizedParamValue }) =>
      backendApi.getNBIPorUbicacion(normalizedParamValue).pipe(map(response => response.data)),

    '/aisi/informacion-referencial': ({ paramValue }) =>
      backendApi.getInformacionReferencialAISI(paramValue).pipe(map(response => response.data)),

    '/aisi/centros-poblados': ({ paramValue }) =>
      backendApi.getCentrosPobladosAISI(paramValue).pipe(map(response => response.data)),

    '/aisd/centros-poblados': ({ normalizedParamValue }) =>
      backendApi.getCentrosPobladosAISD(normalizedParamValue).pipe(map(response => response.data)),

    '/aisi/pea-distrital': ({ paramValue }) =>
      backendApi.getPEADistrital(paramValue).pipe(map(response => response.data)),

    '/aisi/viviendas-censo': ({ paramValue }) =>
      backendApi.getViviendasCenso(paramValue).pipe(map(response => response.data)),

    '/salud/seguro-salud': ({ normalizedParamValue }) =>
      backendApi.getSeguroSalud(normalizedParamValue).pipe(map(response => response.data)),

    '/educacion/niveles': ({ normalizedParamValue }) =>
      backendApi.getEducacion(normalizedParamValue).pipe(map(response => response.data)),

    '/educacion/tasa-analfabetismo': ({ normalizedParamValue }) =>
      backendApi.getTasaAnalfabetismo(normalizedParamValue).pipe(map(response => response.data)),

    '/lenguas/maternas': ({ normalizedParamValue }) =>
      backendApi.getLenguasMaternas(normalizedParamValue).pipe(map(response => response.data)),

    '/religiones': ({ normalizedParamValue }) =>
      backendApi.getReligiones(normalizedParamValue).pipe(map(response => response.data)),

    '/nbi/por-ubigeo': ({ normalizedParamValue }) =>
      backendApi.getNbi(normalizedParamValue).pipe(map(response => response.data))
  };
}

export function createAutoPostEndpointHandlers(backendApi: BackendApiService): Record<string, AutoPostEndpointHandler> {
  return {
    '/servicios/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postServiciosPorCodigos(codigosUBIGEO).pipe(
        map(response => response.data),
        catchError(() => of({}))
      ),

    '/centros-poblados/por-codigos-ubigeo': (codigosUBIGEO: string[]) =>
      backendApi.postCentrosPobladosPorCodigos(codigosUBIGEO).pipe(
        map(response => response.data?.centros_poblados || []),
        catchError(() => of([]))
      ),

    '/salud/seguro-salud/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postSeguroSaludPorCodigos(codigosUBIGEO).pipe(
        map(response => unwrapArrayData(response.data)),
        catchError(() => of([]))
      ),

    '/educacion/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postEducacionPorCodigos(codigosUBIGEO).pipe(
        map(response => unwrapArrayData(response.data)),
        catchError(() => of([]))
      ),

    '/educacion/tasa-analfabetismo/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postTasaAnalfabetismoPorCodigos(codigosUBIGEO).pipe(
        map(response => unwrapArrayData(response.data)),
        catchError(() => of([]))
      ),

    '/nbi/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postNBIPorCodigos(codigosUBIGEO).pipe(
        map(response => unwrapArrayData(response.data)),
        catchError(() => of([]))
      ),

    '/materiales/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postMaterialesPorCodigos(codigosUBIGEO).pipe(
        map(response => {
          const data = response.data;
          if (data && typeof data === 'object' && 'materiales_construccion' in data) {
            return data;
          }
          if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || data;
          }
          return data || {};
        }),
        catchError(() => of({}))
      ),

    '/vivienda/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postViviendaPorCodigos(codigosUBIGEO).pipe(
        map(response => {
          const data = response.data;
          if (data && typeof data === 'object' && 'tipos_vivienda' in data) {
            return data;
          }
          if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || data;
          }
          return Array.isArray(data) ? data : [];
        }),
        catchError(() => of([]))
      ),

    '/energia-cocina/por-codigos': (codigosUBIGEO: string[]) =>
      backendApi.postEnergiaCocinaPorCodigos(codigosUBIGEO).pipe(
        map(response => {
          const data = response.data;
          if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || data;
          }
          return Array.isArray(data) ? data : [];
        }),
        catchError(() => of([]))
      ),

    '/pea/actividades-ocupadas': (codigosUBIGEO: string[]) =>
      backendApi.postPEAActividadesOcupadas(codigosUBIGEO).pipe(
        map(response => {
          const data = response.data;
          if (data && typeof data === 'object' && 'actividades_economicas' in data) {
            return data;
          }
          if (data && typeof data === 'object' && 'data' in data) {
            return (data as any).data || data;
          }
          return Array.isArray(data) ? data : [];
        }),
        catchError(() => of([]))
      )
  };
}

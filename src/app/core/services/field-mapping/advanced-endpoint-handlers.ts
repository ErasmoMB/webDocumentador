import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { FieldMapping } from './field-mapping.types';
import type { BackendApiService } from '../infrastructure/backend-api.service';
import type { AisdAggregationService } from './aisd-aggregation.service';
import type { DemographyAggregatorService } from './demography-aggregator.service';
import type { DemographyTableTransformService } from './demography-table-transform.service';
import type { CategoryAggregationService } from './category-aggregation.service';
import type { CategoryTableTransformService } from './category-table-transform.service';

export interface AdvancedEndpointLoadContext {
  fieldName: string;
  seccionId: string;
  mapping: FieldMapping;
  params: any;
}

export interface AdvancedEndpointHandler {
  id: string;
  matches: (ctx: AdvancedEndpointLoadContext) => boolean;
  load: (ctx: AdvancedEndpointLoadContext) => Observable<any>;
}

export interface AdvancedEndpointHandlerDeps {
  backendApi: BackendApiService;
  aisdAggregation: AisdAggregationService;
  demographyAggregator: DemographyAggregatorService;
  demographyTransform: DemographyTableTransformService;
  categoryAggregation: CategoryAggregationService;
  categoryTransform: CategoryTableTransformService;
}

export function createAdvancedEndpointHandlers(deps: AdvancedEndpointHandlerDeps): AdvancedEndpointHandler[] {
  return [
    {
      id: 'aisd-poblacion-sexo',
      matches: ({ mapping }) => mapping.endpoint === '/aisd/poblacion-sexo',
      load: ({ seccionId, mapping }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) => deps.backendApi.getDatosDemograficos(codigo),
            (acumulado, nuevos) => deps.demographyAggregator.addDemograficos(acumulado, nuevos)
          )
          .pipe(map(response => deps.demographyTransform.transformarPoblacionSexo(response)))
    },
    {
      id: 'aisd-poblacion-etario',
      matches: ({ mapping }) => mapping.endpoint === '/aisd/poblacion-etario',
      load: ({ seccionId }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) => deps.backendApi.getDatosDemograficos(codigo),
            (acumulado, nuevos) => deps.demographyAggregator.addDemograficos(acumulado, nuevos)
          )
          .pipe(map(response => deps.demographyTransform.transformarPoblacionEtario(response)))
    },
    {
      id: 'aisd-pet',
      matches: ({ mapping }) => mapping.endpoint === '/aisd/pet',
      load: ({ seccionId, mapping }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) => deps.backendApi.getPET(codigo),
            (acumulado, nuevos) => deps.demographyAggregator.addDemografia(acumulado, nuevos)
          )
          .pipe(map(response => (mapping.transform ? mapping.transform(response) : response)))
    },
    {
      id: 'petTabla',
      matches: ({ fieldName }) => fieldName === 'petTabla',
      load: ({ seccionId }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) => deps.backendApi.getDatosDemograficos(codigo),
            (acumulado, nuevos) => deps.demographyAggregator.addDemograficos(acumulado, nuevos)
          )
          .pipe(map(response => deps.demographyTransform.transformarPET(response)))
    },
    {
      id: 'peaOcupacionesTabla',
      matches: ({ fieldName }) => fieldName === 'peaOcupacionesTabla',
      load: ({ seccionId }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) =>
              deps.backendApi.getActividadesPrincipales(codigo).pipe(
                map(response => {
                  const datos = response?.data || response || [];
                  const datosFiltrados = Array.isArray(datos)
                    ? datos.filter(item => {
                        if (!item) return false;
                        const categoria = item.categoria;
                        const casos = parseInt(item.casos || '0') || 0;
                        return categoria !== null && categoria !== undefined && categoria !== '' && casos > 0;
                      })
                    : [];
                  return datosFiltrados;
                })
              ),
            (acumulado, nuevos) => deps.categoryAggregation.addDirectByCategoria(acumulado, nuevos)
          )
          .pipe(map(datosAgregados => deps.categoryTransform.transformPEAOcupaciones(datosAgregados)))
    },
    {
      id: 'lenguasMaternasTabla',
      matches: ({ fieldName }) => fieldName === 'lenguasMaternasTabla',
      load: ({ seccionId }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) =>
              deps.backendApi.getLenguasPorUbicacion(codigo).pipe(
                map(response => {
                  const datos = response?.data || response || [];
                  const datosArray = Array.isArray(datos) ? datos : [];

                  return datosArray.map((item: any) => ({
                    categoria: item.lengua || '',
                    casos: parseInt(item.total_hablantes || item.total_personas || '0') || 0
                  }));
                })
              ),
            (acumulado, nuevos) => deps.categoryAggregation.addDirectByCategoria(acumulado, nuevos)
          )
          .pipe(map(datosAgregados => deps.categoryTransform.calculateDirectPercentages(datosAgregados)))
    },
    {
      id: 'religionesTabla',
      matches: ({ fieldName }) => fieldName === 'religionesTabla',
      load: ({ seccionId }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) =>
              deps.backendApi.getReligionesPorUbicacion(codigo).pipe(
                map(response => {
                  const datos = response?.data || response || [];
                  const datosArray = Array.isArray(datos) ? datos : [];

                  return datosArray.map((item: any) => ({
                    categoria: item.religion || '',
                    casos: parseInt(item.total_personas || '0') || 0
                  }));
                })
              ),
            (acumulado, nuevos) => deps.categoryAggregation.addDirectByCategoria(acumulado, nuevos)
          )
          .pipe(map(datosAgregados => deps.categoryTransform.calculateDirectPercentages(datosAgregados)))
    },
    {
      id: 'aisd-materiales-construccion',
      matches: ({ mapping }) => mapping.endpoint === '/aisd/materiales-construccion',
      load: ({ seccionId, mapping }) =>
        deps.aisdAggregation
          .loadAggregated(
            seccionId,
            (codigo) => deps.backendApi.getMaterialesConstruccion(codigo),
            (acumulado, nuevos) => deps.categoryAggregation.addMateriales(acumulado, nuevos)
          )
          .pipe(map(response => (mapping.transform ? mapping.transform(response) : response)))
    }
  ];
}

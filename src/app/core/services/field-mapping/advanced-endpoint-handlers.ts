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

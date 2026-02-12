import { DataMapping } from './backend-data-mapper.service';

export interface AutoAggregateContext {
  sectionKey: string;
  mapping: DataMapping;
  results: any[][];
}

export interface AutoAggregateDeps {
  mergeResults: (results: any[][]) => any[];
  agregarDemograficosDesdeRespuestas: (results: any[][]) => { items: any[] };
}

export interface AutoAggregateHandler {
  id: string;
  matches: (ctx: AutoAggregateContext) => boolean;
  aggregate: (ctx: AutoAggregateContext) => any[];
}

export function createAutoAggregateHandlers(deps: AutoAggregateDeps): AutoAggregateHandler[] {
  return [
    {
      id: 'demograficos-aisd',
      matches: ({ sectionKey, mapping }) => sectionKey === 'seccion6_aisd' && mapping.endpoint === '/demograficos/datos',
      aggregate: ({ mapping, results }) => {
        const aggregated = deps.agregarDemograficosDesdeRespuestas(results);
        return mapping.transform ? mapping.transform(aggregated.items) : aggregated.items;
      }
    },
    {
      id: 'centros-poblados-aisd',
      matches: ({ mapping }) => mapping.endpoint === '/aisd/centros-poblados',
      aggregate: ({ results }) => results.flat()
    },
    {
      id: 'default-merge',
      matches: () => true,
      aggregate: ({ results }) => deps.mergeResults(results)
    }
  ];
}

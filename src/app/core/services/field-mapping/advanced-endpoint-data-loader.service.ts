import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { BackendApiService } from '../infrastructure/backend-api.service';
import { AisdAggregationService } from './aisd-aggregation.service';
import type { FieldMapping } from './field-mapping.types';
import { DemographyAggregatorService } from './demography-aggregator.service';
import { DemographyTableTransformService } from './demography-table-transform.service';
import { CategoryAggregationService } from './category-aggregation.service';
import { CategoryTableTransformService } from './category-table-transform.service';
import {
  createAdvancedEndpointHandlers,
  type AdvancedEndpointHandler,
  type AdvancedEndpointLoadContext
} from './advanced-endpoint-handlers';

@Injectable({
  providedIn: 'root'
})
export class AdvancedEndpointDataLoaderService {
  private readonly handlers: AdvancedEndpointHandler[];

  constructor(
    private backendApi: BackendApiService,
    private aisdAggregation: AisdAggregationService,
    private demographyAggregator: DemographyAggregatorService,
    private demographyTransform: DemographyTableTransformService,
    private categoryAggregation: CategoryAggregationService,
    private categoryTransform: CategoryTableTransformService
  ) {
    this.handlers = createAdvancedEndpointHandlers({
      backendApi: this.backendApi,
      aisdAggregation: this.aisdAggregation,
      demographyAggregator: this.demographyAggregator,
      demographyTransform: this.demographyTransform,
      categoryAggregation: this.categoryAggregation,
      categoryTransform: this.categoryTransform
    });
  }

  tryLoad(fieldName: string, seccionId: string, mapping: FieldMapping, _params: any): Observable<any> | null {
    if (!mapping?.endpoint) return null;

    const ctx: AdvancedEndpointLoadContext = {
      fieldName,
      seccionId,
      mapping,
      params: _params
    };

    const handler = this.handlers.find(h => h.matches(ctx));
    return handler ? handler.load(ctx) : null;
  }
}

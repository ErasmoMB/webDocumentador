import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FieldMappingRegistryService } from './field-mapping-registry.service';
import { FieldRequestParamsResolverService } from './field-request-params-resolver.service';
import { SimpleEndpointDataLoaderService } from './simple-endpoint-data-loader.service';
import { AdvancedEndpointDataLoaderService } from './advanced-endpoint-data-loader.service';

@Injectable({
  providedIn: 'root'
})
export class FieldDataLoaderService {

  constructor(
    private registry: FieldMappingRegistryService,
    private requestParamsResolver: FieldRequestParamsResolverService,
    private simpleEndpointLoader: SimpleEndpointDataLoaderService,
    private advancedEndpointLoader: AdvancedEndpointDataLoaderService
  ) {}

  loadDataForField(fieldName: string, seccionId: string): Observable<any> {
    const mapping = this.registry.getMapping(fieldName);
    if (!mapping || !mapping.endpoint) {
      return of(null);
    }

    const params = this.requestParamsResolver.resolve(mapping, seccionId);
    if (!params?.id_ubigeo && !params?.ubigeo) {
      return of(null);
    }

    const simpleLoaded = this.simpleEndpointLoader.tryLoad(mapping, params);
    if (simpleLoaded) {
      return simpleLoaded;
    }

    const advancedLoaded = this.advancedEndpointLoader.tryLoad(fieldName, seccionId, mapping, params);
    if (advancedLoaded) {
      return advancedLoaded;
    }

    return of(null);
  }
}

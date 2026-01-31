import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

import type { FieldMapping } from './field-mapping.types';
import { BackendApiService } from '../infrastructure/backend-api.service';

@Injectable({
  providedIn: 'root'
})
export class SimpleEndpointDataLoaderService {
  constructor(private backendApi: BackendApiService) {}

  tryLoad(mapping: FieldMapping, params: any): Observable<any> | null {
    const idUbigeo = params?.id_ubigeo ?? params?.ubigeo;
    if (!idUbigeo) return null;

    switch (mapping.endpoint) {
      case '/demograficos/datos':
        return this.backendApi.getDatosDemograficos(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisd/informacion-referencial':
        return this.backendApi.getInformacionReferencialAISD(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisd/centros-poblados':
        return this.backendApi.getCentrosPobladosAISD(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisi/informacion-referencial':
        return this.backendApi.getInformacionReferencialAISI(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisi/centros-poblados':
        return this.backendApi.getCentrosPobladosAISI(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisi/pea-distrital':
        return this.backendApi.getPEADistrital(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      case '/aisi/viviendas-censo':
        return this.backendApi.getViviendasCenso(idUbigeo).pipe(
          map(response => (mapping.transform ? mapping.transform(response.data) : response.data))
        );

      default:
        return null;
    }
  }
}

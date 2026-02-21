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
    const codigos = params?.codigos;

    // ✅ NUEVO: Si hay codigos, usar endpoints POST
    if (codigos && Array.isArray(codigos) && codigos.length > 0) {
      return this.tryLoadPost(mapping, codigos);
    }

    // ✅ ACTUALIZADO: Usar los nuevos endpoints POST para demograficos
    if (idUbigeo) {
      return this.tryLoadGet(mapping, idUbigeo);
    }

    return null;
  }

  /**
   * Carga datos usando endpoints POST con array de codigos
   */
  private tryLoadPost(mapping: FieldMapping, codigos: string[]): Observable<any> | null {
    switch (mapping.endpoint) {
      case '/demograficos/datos':
        return this.backendApi.postDatosDemograficos(codigos).pipe(
          map(response => {
            // El backend devuelve un array directo: [{hombres, mujeres, ...}]
            const data = Array.isArray(response?.data) ? response.data : [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/pet-grupo':
        return this.backendApi.postPetGrupo(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/pet-grupo-14-29':
        return this.backendApi.postPetGrupo1429(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/pea':
        return this.backendApi.postPea(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/pea-ocupada-desocupada':
        return this.backendApi.postPeaOcupadaDesocupada(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/etario':
        return this.backendApi.postEtario(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/etario14':
        return this.backendApi.postEtario14(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/condicion-ocupacion':
        return this.backendApi.postCondicionOcupacion(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/materiales-construccion':
        return this.backendApi.postMaterialesConstruccion(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/saneamiento':
        return this.backendApi.postSaneamiento(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/saneamiento-detallado':
        return this.backendApi.postSaneamientoDetallado(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/alumbrado':
        return this.backendApi.postAlumbrado(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/seguro-salud':
        return this.backendApi.postSeguroSalud(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/educacion':
        return this.backendApi.postEducacion(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/alfabetizacion':
        return this.backendApi.postAlfabetizacion(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/idh':
        return this.backendApi.postIdh(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/nbi':
        return this.backendApi.postNbi(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/actividad-economica':
        return this.backendApi.postActividadEconomica(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/tipo-vivienda':
        return this.backendApi.postTipoVivienda(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/lengua':
        return this.backendApi.postLengua(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/abastecimiento-agua':
        return this.backendApi.postAbastecimientoAgua(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/demograficos/religion-por-cpp':
        return this.backendApi.postReligionPorCpp(codigos).pipe(
          map(response => {
            const data = response?.data?.[0]?.rows || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      case '/centros-poblados/por-codigos-ubigeo':
        return this.backendApi.postCentrosPobladosPorCodigosUbigeo(codigos).pipe(
          map(response => {
            const data = response?.data?.centros_poblados || response?.data || [];
            return mapping.transform ? mapping.transform(data) : data;
          })
        );

      default:
        return null;
    }
  }

  /**
   * Carga datos usando endpoints GET tradicionales (con id_ubigeo)
   */
  private tryLoadGet(mapping: FieldMapping, idUbigeo: string): Observable<any> | null {
    switch (mapping.endpoint) {
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

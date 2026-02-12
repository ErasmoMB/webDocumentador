import { Injectable } from '@angular/core';

import type { FieldMapping } from './field-mapping.types';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { UbigeoHelperService } from '../location/ubigeo-helper.service';

/**
 * FieldRequestParamsResolverService - Resuelve parámetros de request para campos
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 */
@Injectable({
  providedIn: 'root'
})
export class FieldRequestParamsResolverService {
  constructor(
    private projectFacade: ProjectStateFacade,
    private ubigeoHelper: UbigeoHelperService
  ) {}

  resolve(mapping: FieldMapping, seccionId: string): any {
    const datos = this.projectFacade.obtenerDatos();

    if (mapping.endpointParams) {
      return mapping.endpointParams(seccionId, datos) ?? {};
    }

    const idUbigeo = this.ubigeoHelper.getIdUbigeoPrincipal(seccionId);
    return idUbigeo ? { id_ubigeo: idUbigeo } : {};
  }
}

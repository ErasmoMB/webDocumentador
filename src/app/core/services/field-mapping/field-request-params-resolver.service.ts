import { Injectable, inject } from '@angular/core';

import type { FieldMapping } from './field-mapping.types';
import { ProjectStateFacade } from '../../state/project-state.facade';
import { UbigeoHelperService } from '../location/ubigeo-helper.service';
import { AISDGroupService } from '../groups/aisd-group.service';
import { AISIGroupService } from '../groups/aisi-group.service';

/**
 * FieldRequestParamsResolverService - Resuelve parámetros de request para campos
 * 
 * ✅ FASE 4: Migrado a usar solo ProjectStateFacade
 * ✅ Actualizado para soportar endpoints POST con {codigos: []}
 */
@Injectable({
  providedIn: 'root'
})
export class FieldRequestParamsResolverService {
  private projectFacade = inject(ProjectStateFacade);
  private ubigeoHelper = inject(UbigeoHelperService);
  private aisdGroupService = inject(AISDGroupService);
  private aisiGroupService = inject(AISIGroupService);

  resolve(mapping: FieldMapping, seccionId: string): any {
    const datos = this.projectFacade.obtenerDatos();

    if (mapping.endpointParams) {
      return mapping.endpointParams(seccionId, datos) ?? {};
    }

    // ✅ NUEVO: Detectar endpoints POST que necesitan array de codigos
    const isPostEndpoint = mapping.endpoint?.startsWith('/demograficos/') || 
                           mapping.endpoint?.startsWith('/centros-poblados/');
    
    if (isPostEndpoint) {
      // Obtener los códigos de centros poblados del grupo actual
      const codigos = this.obtenerCodigosCCPP(seccionId);
      if (codigos && codigos.length > 0) {
        return { codigos };
      }
    }

    // Para endpoints GET, usar el ubigeo tradicional
    const idUbigeo = this.ubigeoHelper.getIdUbigeoPrincipal(seccionId);
    return idUbigeo ? { id_ubigeo: idUbigeo } : {};
  }

  /**
   * Obtiene los códigos de centros poblados del grupo actual (AISD o AISI)
   */
  private obtenerCodigosCCPP(seccionId: string): string[] {
    // Determinar si es AISD o AISI basado en el prefijo del grupo
    const esAISD = this.aisdGroupService.esSeccionAISD(seccionId);
    const esAISI = this.aisiGroupService.esSeccionAISI(seccionId);

    if (esAISD) {
      const codigos = this.aisdGroupService.obtenerCodigosCentrosPoblados(seccionId);
      return [...codigos];
    }

    if (esAISI) {
      const codigos = this.aisiGroupService.obtenerCodigosCentrosPoblados(seccionId);
      return [...codigos];
    }

    // Si no es AISD ni AISI, intentar obtener del proyecto
    return [];
  }
}

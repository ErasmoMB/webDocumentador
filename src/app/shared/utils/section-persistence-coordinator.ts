import { Injector } from '@angular/core';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';
import { FormularioService } from 'src/app/core/services/formulario.service';

export interface PersistenceHost {
  seccionId: string;
  datos: any;
}

export class SectionPersistenceCoordinator {
  persistFieldChange(
    injector: Injector | undefined | null,
    host: PersistenceHost,
    fieldId: string,
    value: any
  ): void {


    let valorLimpio: any = value;
    if (value === undefined || value === 'undefined') {
      valorLimpio = '';
    }

    if (!injector) return;

    // 1. Actualizar ProjectStateFacade (store en memoria)
    const projectFacade = injector.get(ProjectStateFacade, null);
    if (projectFacade) {
      const sectionId = host.seccionId || 'global';
      projectFacade.setField(sectionId, null, fieldId, valorLimpio);
    }

    // 2. ✅ PERSISTIR a localStorage vía FormularioService
    const formularioService = injector.get(FormularioService, null);
    if (formularioService) {
      formularioService.actualizarDatos({ [fieldId]: valorLimpio });
    }
  }

  restorePersistedSectionState(injector: Injector | undefined | null, host: PersistenceHost): void {
    if (!injector) return;

    const projectFacade = injector.get(ProjectStateFacade, null);
    const formularioService = injector.get(FormularioService, null);
    if (!projectFacade && !formularioService) return;

    const sectionId = host.seccionId || 'global';
    
    // 1. ✅ PRIMERO: Cargar desde FormularioService (localStorage - fuente de persistencia real)
    if (formularioService) {
      const datosLegacy = formularioService.obtenerDatos();
      if (datosLegacy && Object.keys(datosLegacy).length > 0) {
        Object.assign(host.datos, datosLegacy);
        
        // ✅ Sincronizar al ProjectStateFacade si aún no tiene estos datos
        if (projectFacade) {
          Object.keys(datosLegacy).forEach(fieldId => {
            const value = (datosLegacy as any)[fieldId];
            // ✅ CRÍTICO: Sincronizar arrays (entrevistados, fuentesSecundariasLista) aunque estén vacíos
            // También sincronizar valores no-vacíos
            if (value !== undefined && value !== null) {
              // ✅ PERMITIR arrays vacíos, strings vacíos NO
              if (Array.isArray(value) || (typeof value === 'string' && value !== '') || typeof value !== 'string') {
                projectFacade.setField(sectionId, null, fieldId, value);
              }
            }
          });
        }
      }
    }
    
    // 2. Obtener campos adicionales de la sección desde ProjectStateFacade
    if (projectFacade) {
      const sectionFields = projectFacade.getSectionFields(sectionId, null);
      
      // Merge con los datos existentes del host (sin sobrescribir lo que ya vino de localStorage)
      if (sectionFields && Object.keys(sectionFields).length > 0) {
        Object.keys(sectionFields).forEach(key => {
          if (host.datos[key] === undefined || host.datos[key] === null || host.datos[key] === '') {
            host.datos[key] = sectionFields[key];
          }
        });
      }
    }
    
    // 3. Si no hay datos específicos, intentar desde 'global'
    if (Object.keys(host.datos || {}).length === 0 && projectFacade) {
      const globalFields = projectFacade.getSectionFields('global', null);
      if (globalFields && Object.keys(globalFields).length > 0) {
        Object.assign(host.datos, globalFields);
      }
    }
  }
}

import { Injectable, Injector } from '@angular/core';
import { FormStateService } from './form-state.service';
import { FormPersistenceService } from './form-persistence.service';
import { SectionSyncService } from './section-sync.service';

import { FormularioService } from '../formulario.service';
import { ProjectStateFacade } from '../../state/project-state.facade';

/**
 * ✅ FASE 4: Migrado - eliminada dependencia de LegacyDocumentSnapshotService
 * Usa FormularioService y FormStateService directamente
 */
@Injectable({ providedIn: 'root' })
export class FormChangeService {
  // Lazy-loaded para evitar dependencia circular
  private _formularioService: FormularioService | null = null;
  private _projectFacade: ProjectStateFacade | null = null;

  constructor(
    private injector: Injector,
    private formState: FormStateService,
    private formPersistence: FormPersistenceService,
    private sectionSync: SectionSyncService
  ) {}

  private get formularioService(): FormularioService | null {
    if (!this._formularioService) {
      try {
        this._formularioService = this.injector.get(FormularioService, null);
      } catch {
        return null;
      }
    }
    return this._formularioService;
  }

  private get projectFacade(): ProjectStateFacade | null {
    if (!this._projectFacade) {
      try {
        this._projectFacade = this.injector.get(ProjectStateFacade, null);
      } catch {
        return null;
      }
    }
    return this._projectFacade;
  }

  private resolvePersistOptions(options?: {
    updateLegacy?: boolean;
    updateState?: boolean;
    notifySync?: boolean;
    persist?: boolean;
  }): {
    updateLegacy: boolean;
    updateState: boolean;
    notifySync: boolean;
    persist: boolean;
  } {
    return {
      updateLegacy: options?.updateLegacy ?? true,
      updateState: options?.updateState ?? true,
      notifySync: options?.notifySync ?? true,
      persist: options?.persist ?? true,
    };
  }

  persistFields(
    sectionId: string | undefined,
    groupId: string,
    updates: Record<string, any>,
    options?: {
      /** Actualiza FormularioService (fuente de verdad). */
      updateLegacy?: boolean;
      /** Actualiza FormStateService (reactivo). */
      updateState?: boolean;
      /** Notifica a SectionSyncService (bus inmediato). */
      notifySync?: boolean;
      /** Persiste la sección (localStorage/TTL). */
      persist?: boolean;
    }
  ): void {
    const resolvedSectionId = sectionId || 'global';
    if (!updates || Object.keys(updates).length === 0) return;

    const opts = this.resolvePersistOptions(options);

    // 1. Actualizar FormularioService (fuente de verdad)
    if (opts.updateLegacy) {
      const formularioService = this.formularioService;
      if (formularioService) {
        formularioService.actualizarDatos(updates);
      }
    }

    // 2. Actualizar FormStateService (reactivo) - sincronizado con paso 1
    if (opts.updateState) {
      Object.keys(updates).forEach(fieldId => {
        this.formState.updateField(resolvedSectionId, groupId, fieldId, updates[fieldId]);
      });
    }

    // 2b. Actualizar store (ProjectStateFacade) para que la vista y cuadros reflejen los datos
    const facade = this.projectFacade;
    if (facade && Object.keys(updates).length > 0) {
      // ✅ Detectar si los updates contienen datos de tabla (cuando groupId es 'table')
      if (groupId === 'table') {
        // Para cada clave en updates, si contiene un array, es probablemente una tabla
        Object.keys(updates).forEach(tableKey => {
          const value = updates[tableKey];
          if (Array.isArray(value)) {
            // ✅ Usar setTableData() para tablas
            facade.setTableData(resolvedSectionId, null, tableKey, value);
          } else {
            // Fallback: si no es array, usar setField()
            facade.setField(resolvedSectionId, null, tableKey, value);
          }
        });
      } else {
        // Para campos normales, usar setFields()
        facade.setFields(resolvedSectionId, null, updates);
      }
    }

    // 3. Notificar a SectionSyncService para actualización inmediata
    if (opts.notifySync) {
      this.sectionSync.notifyChanges(resolvedSectionId, updates);
    }

    // 4. Persistir estado
    if (opts.persist && opts.updateState) {
      const sectionState = this.formState.getFormSnapshot()[resolvedSectionId];
      if (sectionState) {
        this.formPersistence.saveSectionState(resolvedSectionId, sectionState);
      }
    }
  }

  restoreSectionState(sectionId: string | undefined, currentData: Record<string, any>): void {
    const resolvedSectionId = sectionId || 'global';
    const saved = this.formPersistence.loadSectionState(resolvedSectionId);

    if (!saved) {
      return;
    }

    const updates: Record<string, any> = {};
    Object.keys(saved).forEach(groupId => {
      const group = saved[groupId];
      Object.keys(group).forEach(fieldId => {
        const savedValue = group[fieldId]?.value;
        const actual = currentData ? currentData[fieldId] : undefined;
        const isEmpty = this.isValueEmpty(actual);
        if (isEmpty && savedValue !== undefined && savedValue !== null) {
          updates[fieldId] = savedValue;
        }
      });
    });

    if (Object.keys(updates).length > 0) {
      const formularioService = this.formularioService;
      if (formularioService) {
        formularioService.actualizarDatos(updates as any);
      }

      // ✅ CRÍTICO: También actualizar ProjectStateFacade
      const facade = this.projectFacade;
      if (facade) {
        facade.setFields(resolvedSectionId, null, updates);
      }
    }

    const snapshot = this.formState.getFormSnapshot();
    this.formState.setFormState({
      ...snapshot,
      [resolvedSectionId]: saved,
    });
  }

  private isValueEmpty(value: any): boolean {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
    return false;
  }
}

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

  private saveDebounceMs = 200;
  private saveTimeouts = new Map<string, any>();

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
    // No logging por defecto para persistFields (demasiado ruidoso en producción)

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

    // 2b. También sincronizar inmediatamente con ProjectStateFacade (store) para
    // asegurar que las vistas que dependen de selectField()/selectSectionFields()
    // reevalúen de forma inmediata sin requerir recarga manual.
    const facadeImmediateSync = this.projectFacade;
    if (facadeImmediateSync && opts.updateState) {
      try {
        facadeImmediateSync.setFields(resolvedSectionId, null, updates);
      } catch (e) {
        console.warn('[FormChangeService] Error setting fields in ProjectStateFacade', e);
      }
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
            // Persistir en la tabla del store
            facade.setTableData(resolvedSectionId, null, tableKey, value);

            // Además sincronizar el campo legacy (sin prefijo y con prefijo) para compatibilidad
            try {
              // Guardar también como campo para que selectField() devuelva datos consistentes
              facade.setField(resolvedSectionId, null, tableKey, value);
              const prefixed = require('src/app/shared/utils/prefix-manager').PrefixManager.getFieldKey(resolvedSectionId, tableKey);
              if (prefixed && prefixed !== tableKey) {
                facade.setField(resolvedSectionId, null, prefixed, value);
              }
            } catch (e) {
              // Si algo falla, no romper la persistencia de tablas
              console.warn('[FormChangeService] Error sincronizando campos legacy para tabla', tableKey, e);
            }
          }
        });
      }

      // Notificar a SectionSyncService inmediatamente si se solicita (notifySync)
      try {
        if (opts.notifySync && this.sectionSync) {
          this.sectionSync.notifyChanges(resolvedSectionId, updates);
        }
      } catch (e) {
        console.warn('[FormChangeService] Error notifying SectionSyncService', e);
      }
    }

    if (opts.persist && opts.updateState) {
      const sectionIdToSave = resolvedSectionId;
      if (this.saveTimeouts.has(sectionIdToSave)) {
        clearTimeout(this.saveTimeouts.get(sectionIdToSave));
      }
      this.saveTimeouts.set(sectionIdToSave, setTimeout(() => {
        const snapshot = this.formState.getFormSnapshot();
        const sectionStateNow = snapshot[sectionIdToSave];
        if (sectionStateNow) {
          this.formPersistence.saveSectionState(sectionIdToSave, sectionStateNow);
        }
        this.saveTimeouts.delete(sectionIdToSave);
      }, this.saveDebounceMs));
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

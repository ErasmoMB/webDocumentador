/**
 * PERSISTENCE OBSERVER - PASO 7.3
 * 
 * Observa cambios en el estado y persiste automáticamente.
 * 
 * PRINCIPIOS:
 * 1. Externo al dominio (no modifica reducers)
 * 2. Usa effect() para observar isDirty
 * 3. Debounce para evitar escrituras excesivas
 * 4. Maneja errores sin propagarlos al dominio
 * 
 * ARQUITECTURA:
 * - Se suscribe al signal de estado
 * - Detecta cambios via isDirty
 * - Persiste con debounce configurable
 * - Mantiene historial de backups
 */

import { Injectable, inject, effect, DestroyRef, signal, computed } from '@angular/core';
import { ProjectState } from '../state/project-state.model';
import { UIStoreService } from '../state/ui-store.contract';
import { BackendAvailabilityService } from '../services/infrastructure/backend-availability.service';
import { SessionDataService } from '../services/session/session-data.service';
import {
  PersistenceConfig,
  DEFAULT_PERSISTENCE_CONFIG,
  STORAGE_KEYS,
  SCHEMA_VERSION
} from './persistence.contract';
import {
  serializeProjectState,
  serializeProjectStateWithoutBase64,
  autoDeserialize,
  DeserializationResult
} from './state-serializer';

// ============================================================================
// PERSISTENCE STATUS
// ============================================================================

export type PersistenceStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

export interface PersistenceStatusInfo {
  readonly status: PersistenceStatus;
  readonly lastSaveTime: number | null;
  readonly lastError: string | null;
  readonly pendingSave: boolean;
  readonly totalSaves: number;
  readonly totalErrors: number;
}

// ============================================================================
// PERSISTENCE OBSERVER SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class PersistenceObserverService {
  private readonly store = inject(UIStoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly backendAvailability = inject(BackendAvailabilityService);
  private readonly sessionDataService = inject(SessionDataService);
  
  // Configuración
  private config: PersistenceConfig = { ...DEFAULT_PERSISTENCE_CONFIG };
  
  // Estado interno
  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private _status = signal<PersistenceStatusInfo>({
    status: 'idle',
    lastSaveTime: null,
    lastError: null,
    pendingSave: false,
    totalSaves: 0,
    totalErrors: 0
  });
  
  // Señales públicas
  readonly status = this._status.asReadonly();
  readonly isAutoSaveEnabled = signal(true);
  
  // Computed
  readonly hasPendingChanges = computed(() => {
    const state = this.store.state();
    return state._internal.isDirty;
  });
  
  readonly lastSaveDisplay = computed(() => {
    const info = this._status();
    if (!info.lastSaveTime) return 'Nunca guardado';
    
    const diff = Date.now() - info.lastSaveTime;
    if (diff < 60000) return 'Hace menos de un minuto';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} minutos`;
    return new Date(info.lastSaveTime).toLocaleString();
  });
  
  constructor() {
    this.setupAutoSaveEffect();
    this.setupCleanup();
  }
  
  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================
  
  /**
   * Actualiza la configuración de persistencia.
   */
  configure(config: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Habilita o deshabilita el auto-save.
   */
  setAutoSave(enabled: boolean): void {
    this.isAutoSaveEnabled.set(enabled);
    if (!enabled && this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
      this.saveTimeoutId = null;
      this.updateStatus({ pendingSave: false });
    }
  }
  
  // ============================================================================
  // AUTO-SAVE EFFECT
  // ============================================================================
  
  private setupAutoSaveEffect(): void {
    // Effect que observa cambios en isDirty
    effect(() => {
      const state = this.store.state();
      const isDirty = state._internal.isDirty;
      const autoSaveEnabled = this.isAutoSaveEnabled();
      
      if (isDirty && autoSaveEnabled) {
        this.scheduleSave(state);
      }
    });
  }
  
  private scheduleSave(state: ProjectState): void {
    // Cancelar save pendiente
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }
    
    this.updateStatus({ pendingSave: true });
    
    // Programar nuevo save con debounce
    this.saveTimeoutId = setTimeout(() => {
      this.performSave(state);
      this.saveTimeoutId = null;
    }, this.config.autoSaveDebounce);
  }
  
  // ============================================================================
  // SAVE OPERATIONS
  // ============================================================================
  
  /**
   * Guarda el estado actual inmediatamente.
   */
  saveNow(): boolean {
    const state = this.store.state();
    return this.performSave(state);
  }
  
  /**
   * Ejecuta el guardado real.
   */
  private performSave(state: ProjectState): boolean {
    // 🔍 Si el backend está disponible, NO guardar en localStorage
    // pero SÍ guardar en SessionDataService como backup para recarga
    if (this.backendAvailability.shouldUseBackendOnly()) {
      // console.log('✅ [PersistenceObserver] Backend disponible - Guardando en SessionDataService');
      
      // ✅ Guardar en SessionDataService SIN imágenes base64 para evitar exceder cuota
      // Las imágenes base64 se persisten por separado al backend via ImageStorageService
      const result = serializeProjectStateWithoutBase64(state);
      if (result.success && result.data) {
        const dataSize = result.data.length;
        // console.log(`📊 [PersistenceObserver] Guardando ${dataSize} bytes en SessionDataService (sin imágenes base64)...`);
        
        this.sessionDataService.saveData('projectState', result.data)
          .then(() => {
            // console.log(`✅ [PersistenceObserver] Guardado exitoso en SessionDataService (${dataSize} bytes)`);
          })
          .catch(err => {
            console.error('❌ [PersistenceObserver] Error guardando en SessionDataService:', err.message || err);
          });
      }
      
      this.updateStatus({ 
        status: 'saved', 
        lastSaveTime: Date.now(),
        pendingSave: false,
        lastError: null,
        totalSaves: this._status().totalSaves + 1
      });
      this.notifySaveCompleted();
      return true;
    }
    
    // ⚠️ Backend NO disponible - Guardar en localStorage como fallback
    console.warn('⚠️ [PersistenceObserver] Backend no disponible - Usando localStorage como fallback');
    this.updateStatus({ status: 'saving', pendingSave: false });
    
    try {
      const result = serializeProjectState(state);
      
      if (!result.success || !result.data) {
        this.handleSaveError(result.error || 'Serialization failed');
        return false;
      }
      
      // Guardar en storage
      const storage = this.getStorage();
      
      // Rotar backups antes de guardar
      this.rotateBackups(storage);
      
      // Guardar estado principal
      storage.setItem(STORAGE_KEYS.PROJECT_STATE, result.data);
      
      // Guardar metadata de sesión
      this.saveSessionMeta(storage);
      
      // Actualizar estado
      this.updateStatus({
        status: 'saved',
        lastSaveTime: Date.now(),
        lastError: null,
        totalSaves: this._status().totalSaves + 1
      });
      
      // Notificar al store que se guardó (marca isDirty = false)
      this.notifySaveCompleted();
      
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown save error';
      this.handleSaveError(msg);
      return false;
    }
  }
  
  private handleSaveError(error: string): void {
    console.error('[PersistenceObserver] Save failed:', error);
    this.updateStatus({
      status: 'error',
      lastError: error,
      totalErrors: this._status().totalErrors + 1
    });
  }
  
  // ============================================================================
  // BACKUP MANAGEMENT
  // ============================================================================
  
  private rotateBackups(storage: Storage): void {
    try {
      const currentState = storage.getItem(STORAGE_KEYS.PROJECT_STATE);
      if (!currentState) return;
      
      // Obtener historial existente
      const historyRaw = storage.getItem(STORAGE_KEYS.VERSION_HISTORY);
      let history: string[] = [];
      
      try {
        history = historyRaw ? JSON.parse(historyRaw) : [];
      } catch {
        history = [];
      }
      
      // Agregar estado actual al historial
      history.unshift(currentState);
      
      // Limitar cantidad de backups
      if (history.length > this.config.maxBackups) {
        history = history.slice(0, this.config.maxBackups);
      }
      
      // Guardar historial actualizado
      storage.setItem(STORAGE_KEYS.VERSION_HISTORY, JSON.stringify(history));
      
      // Guardar backup automático (última versión)
      storage.setItem(STORAGE_KEYS.AUTO_BACKUP, currentState);
    } catch (err) {
      console.warn('[PersistenceObserver] Backup rotation failed:', err);
    }
  }
  
  private saveSessionMeta(storage: Storage): void {
    const meta = {
      lastSaved: Date.now(),
      version: SCHEMA_VERSION,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };
    storage.setItem(STORAGE_KEYS.SESSION_META, JSON.stringify(meta));
  }
  
  // ============================================================================
  // LOAD OPERATIONS (for rehydration)
  // ============================================================================
  
  /**
   * Carga el estado guardado.
   */
  loadSavedState(): DeserializationResult | null {
    this.updateStatus({ status: 'loading' });
    
    try {
      const storage = this.getStorage();
      const raw = storage.getItem(STORAGE_KEYS.PROJECT_STATE);
      
      if (!raw) {
        this.updateStatus({ status: 'idle' });
        return null;
      }
      
      const result = autoDeserialize(raw);
      
      if (result.success) {
        this.updateStatus({
          status: 'idle',
          lastSaveTime: Date.now()
        });
      } else {
        this.updateStatus({
          status: 'error',
          lastError: result.error
        });
      }
      
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown load error';
      this.updateStatus({
        status: 'error',
        lastError: msg
      });
      return null;
    }
  }
  
  /**
   * Carga el último backup disponible.
   */
  loadBackup(index: number = 0): DeserializationResult | null {
    try {
      const storage = this.getStorage();
      const historyRaw = storage.getItem(STORAGE_KEYS.VERSION_HISTORY);
      
      if (!historyRaw) return null;
      
      const history: string[] = JSON.parse(historyRaw);
      
      if (index >= history.length) return null;
      
      return autoDeserialize(history[index]);
    } catch {
      return null;
    }
  }
  
  /**
   * Lista los backups disponibles.
   */
  listBackups(): { index: number; savedAt: number }[] {
    try {
      const storage = this.getStorage();
      const historyRaw = storage.getItem(STORAGE_KEYS.VERSION_HISTORY);
      
      if (!historyRaw) return [];
      
      const history: string[] = JSON.parse(historyRaw);
      
      return history.map((raw, index) => {
        try {
          const envelope = JSON.parse(raw);
          return {
            index,
            savedAt: envelope.savedAt || 0
          };
        } catch {
          return { index, savedAt: 0 };
        }
      });
    } catch {
      return [];
    }
  }
  
  // ============================================================================
  // CLEAR OPERATIONS
  // ============================================================================
  
  /**
   * Limpia todos los datos persistidos.
   */
  clearAll(): void {
    try {
      const storage = this.getStorage();
      storage.removeItem(STORAGE_KEYS.PROJECT_STATE);
      storage.removeItem(STORAGE_KEYS.AUTO_BACKUP);
      storage.removeItem(STORAGE_KEYS.SESSION_META);
      storage.removeItem(STORAGE_KEYS.VERSION_HISTORY);
      
      this.updateStatus({
        status: 'idle',
        lastSaveTime: null,
        lastError: null,
        totalSaves: 0,
        totalErrors: 0
      });
    } catch (err) {
      console.error('[PersistenceObserver] Clear failed:', err);
    }
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  private getStorage(): Storage {
    if (this.config.storageType === 'indexedDB') {
      // TODO: Implementar wrapper IndexedDB con la misma interfaz
      console.warn('IndexedDB not implemented, falling back to localStorage');
    }
    return localStorage;
  }
  
  private updateStatus(partial: Partial<PersistenceStatusInfo>): void {
    this._status.update(current => ({ ...current, ...partial }));
  }
  
  private notifySaveCompleted(): void {
    // Usar el comando apropiado para marcar como guardado
    // Este método será llamado después de un save exitoso
    // El store debe exponer una forma de marcar que se guardó
    // Por ahora, usamos el método existente si está disponible
    if (typeof (this.store as any).markAsSaved === 'function') {
      (this.store as any).markAsSaved();
    }
  }
  
  private setupCleanup(): void {
    this.destroyRef.onDestroy(() => {
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
      }
    });
  }
}

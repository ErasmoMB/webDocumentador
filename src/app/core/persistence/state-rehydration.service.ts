/**
 * STATE REHYDRATION - PASO 7.4
 * 
 * Rehidrata el estado al iniciar la aplicación.
 * 
 * PRINCIPIOS:
 * 1. Se ejecuta en APP_INITIALIZER (antes de que la app renderice)
 * 2. Maneja errores sin bloquear la app
 * 3. Aplica migraciones automáticamente
 * 4. Provee opciones de recuperación ante corrupción
 * 
 * ARQUITECTURA:
 * - Intenta cargar estado guardado
 * - Si falla, intenta backup
 * - Si todo falla, usa estado inicial
 * - Siempre notifica resultado al usuario
 */

import { Injectable, inject, APP_INITIALIZER, Provider, signal } from '@angular/core';
import { ProjectState, INITIAL_PROJECT_STATE } from '../state/project-state.model';
import { UIStoreService } from '../state/ui-store.contract';
import { PersistenceObserverService } from './persistence-observer.service';
import { SessionDataService } from '../services/session/session-data.service';
import { 
  autoDeserialize, 
  DeserializationResult 
} from './state-serializer';
import { STORAGE_KEYS } from './persistence.contract';
import { applySection4PrefixMigration } from './migrations/section4-prefix.migration';
import { applyGroupedPrefixMigration } from './migrations/grouped-prefix.migration';
import { applyPhotoKeySuffixMigration } from './migrations/photo-key-suffix.migration';

// ============================================================================
// REHYDRATION RESULT
// ============================================================================

export type RehydrationSource = 'storage' | 'backup' | 'initial' | 'none';

export interface RehydrationResult {
  readonly success: boolean;
  readonly source: RehydrationSource;
  readonly state: ProjectState;
  readonly warnings: string[];
  readonly migrationsApplied: string[];
  readonly error: string | null;
}

export interface RehydrationOptions {
  /** Si fallar silenciosamente (usar estado inicial sin error) */
  readonly failSilently: boolean;
  /** Si intentar backups ante fallo */
  readonly tryBackups: boolean;
  /** Índice máximo de backup a intentar */
  readonly maxBackupAttempts: number;
  /** Si mostrar notificación al usuario */
  readonly notifyUser: boolean;
}

const DEFAULT_OPTIONS: RehydrationOptions = {
  failSilently: true,
  tryBackups: true,
  maxBackupAttempts: 3,
  notifyUser: true
};

// ============================================================================
// REHYDRATION SERVICE
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class StateRehydrationService {
  private readonly store = inject(UIStoreService);
  private readonly persistence = inject(PersistenceObserverService);
  private readonly sessionDataService = inject(SessionDataService);
  
  // Estado de rehidratación
  private _rehydrationResult = signal<RehydrationResult | null>(null);
  private _isRehydrating = signal(false);
  
  readonly rehydrationResult = this._rehydrationResult.asReadonly();
  readonly isRehydrating = this._isRehydrating.asReadonly();
  
  // ============================================================================
  // MAIN REHYDRATION
  // ============================================================================
  
  /**
   * Rehidrata el estado desde el storage.
   * Se llama típicamente en APP_INITIALIZER.
   */
  async rehydrate(options: Partial<RehydrationOptions> = {}): Promise<RehydrationResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    this._isRehydrating.set(true);
    
    const warnings: string[] = [];
    let migrationsApplied: string[] = [];
    
    try {
      // 1. Intentar cargar desde storage principal (localStorage)
      let mainResult = this.loadFromMainStorage();
      
      // 2. Si localStorage vacío, intentar desde SessionDataService
      if (!mainResult?.success && !mainResult?.state) {
        // console.log('📊 [StateRehydration] localStorage vacío, intentando cargar desde SessionDataService...');
        try {
          const sessionData = await this.sessionDataService.loadData('projectState');
          if (sessionData) {
            // console.log('✅ [StateRehydration] Estado cargado desde SessionDataService:', typeof sessionData);
            
            // ⚠️ SessionDataService devuelve el dato como fue guardado
            // Si fue guardado como string JSON, NO hacer JSON.stringify de nuevo
            let dataToDeserialize = sessionData;
            if (typeof sessionData === 'string') {
              // Ya es JSON string, deserializar directamente
              mainResult = autoDeserialize(sessionData);
            } else if (typeof sessionData === 'object') {
              // Es un objeto, stringificar primero
              mainResult = autoDeserialize(JSON.stringify(sessionData));
            }
          }
        } catch (err) {
          console.warn('⚠️ [StateRehydration] No se pudo cargar desde SessionDataService:', err);
        }
      }
      
      if (mainResult?.success && mainResult.state) {
        migrationsApplied = mainResult.migrationsApplied;
        if (mainResult.validation.warnings.length > 0) {
          warnings.push(...mainResult.validation.warnings);
        }

        // ✅ Migración incremental (Sección 4): legacy → campos prefijados por grupo
        const section4 = applySection4PrefixMigration(mainResult.state);
        const afterSection4 = section4.changed ? section4.state : mainResult.state;
        if (section4.changed) {
          warnings.push('Se aplicó migración automática de Sección 4 (legacy → prefijo)');
          migrationsApplied = [...migrationsApplied, 'Sección 4 legacy → prefijo'];
        }

        // ✅ Migración grouped (Secciones 5–20 y 21–36): legacy → campos prefijados por grupo
        const grouped = applyGroupedPrefixMigration(afterSection4);
        const afterGrouped = grouped.changed ? grouped.state : afterSection4;
        if (grouped.changed) {
          warnings.push('Se aplicó migración automática grouped (5–20 AISD / 21–36 AISI)');
          migrationsApplied = [...migrationsApplied, ...grouped.notes];
        }

        // ✅ Normalización de claves de fotos: esquema antiguo (…_A11Imagen) → canónico (…1Imagen_A1)
        const photoKeys = applyPhotoKeySuffixMigration(afterGrouped);
        const finalState = photoKeys.changed ? photoKeys.state : afterGrouped;
        if (photoKeys.changed) {
          warnings.push('Se normalizaron claves de fotos a esquema canónico (sufijo al final)');
          migrationsApplied = [...migrationsApplied, ...photoKeys.notes];
        }
        
        const result: RehydrationResult = {
          success: true,
          source: 'storage',
          state: finalState,
          warnings,
          migrationsApplied,
          error: null
        };
        
        this.applyState(finalState);

        // ✅ Persistir inmediatamente si migramos (para que el siguiente load ya sea “limpio”)
        if (section4.changed || grouped.changed || photoKeys.changed) {
          try {
            this.persistence.saveNow();
          } catch {
            // No bloquear rehidratación si falla persistencia
          }
        }
        this._rehydrationResult.set(result);
        this._isRehydrating.set(false);
        return result;
      }
      
      // 2. Si falló y tryBackups está habilitado, intentar backups
      if (opts.tryBackups) {
        const backupResult = this.tryLoadFromBackups(opts.maxBackupAttempts);
        
        if (backupResult?.success && backupResult.state) {
          warnings.push('Estado restaurado desde backup');
          migrationsApplied = backupResult.migrationsApplied;
          
          const result: RehydrationResult = {
            success: true,
            source: 'backup',
            state: backupResult.state,
            warnings,
            migrationsApplied,
            error: null
          };
          
          this.applyState(backupResult.state);
          this._rehydrationResult.set(result);
          this._isRehydrating.set(false);
          return result;
        }
      }
      
      // 3. No hay datos guardados o todos fallaron
      if (opts.failSilently) {
        const result: RehydrationResult = {
          success: true,
          source: this.hasAnyStoredData() ? 'initial' : 'none',
          state: INITIAL_PROJECT_STATE,
          warnings: this.hasAnyStoredData() 
            ? ['No se pudo restaurar el estado guardado, usando estado inicial'] 
            : [],
          migrationsApplied: [],
          error: null
        };
        
        // No aplicamos estado inicial porque ya es el default
        this._rehydrationResult.set(result);
        this._isRehydrating.set(false);
        return result;
      }
      
      // 4. Fallo no silencioso
      const result: RehydrationResult = {
        success: false,
        source: 'none',
        state: INITIAL_PROJECT_STATE,
        warnings,
        migrationsApplied: [],
        error: 'No se encontró estado guardado válido'
      };
      
      this._rehydrationResult.set(result);
      this._isRehydrating.set(false);
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      if (opts.failSilently) {
        const result: RehydrationResult = {
          success: true,
          source: 'initial',
          state: INITIAL_PROJECT_STATE,
          warnings: [`Error durante rehidratación: ${errorMsg}`],
          migrationsApplied: [],
          error: null
        };
        
        this._rehydrationResult.set(result);
        this._isRehydrating.set(false);
        return result;
      }
      
      const result: RehydrationResult = {
        success: false,
        source: 'none',
        state: INITIAL_PROJECT_STATE,
        warnings,
        migrationsApplied: [],
        error: errorMsg
      };
      
      this._rehydrationResult.set(result);
      this._isRehydrating.set(false);
      return result;
    }
  }
  
  // ============================================================================
  // LOAD HELPERS
  // ============================================================================
  
  private loadFromMainStorage(): DeserializationResult | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      if (!raw) return null;
      return autoDeserialize(raw);
    } catch {
      return null;
    }
  }
  
  private tryLoadFromBackups(maxAttempts: number): DeserializationResult | null {
    for (let i = 0; i < maxAttempts; i++) {
      const result = this.persistence.loadBackup(i);
      if (result?.success) {
        return result;
      }
    }
    return null;
  }
  
  private hasAnyStoredData(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.PROJECT_STATE) ||
           !!localStorage.getItem(STORAGE_KEYS.AUTO_BACKUP) ||
           !!localStorage.getItem(STORAGE_KEYS.VERSION_HISTORY);
  }
  
  // ============================================================================
  // STATE APPLICATION
  // ============================================================================
  
  private applyState(state: ProjectState): void {
    const s = this.store as any;
    if (typeof s.hydrate === 'function') {
      s.hydrate(state);
    } else if (typeof s.loadState === 'function') {
      s.loadState(state);
    } else {
      console.warn('[Rehydration] Store does not expose hydrate nor loadState method');
    }
  }
  
  // ============================================================================
  // MANUAL RECOVERY
  // ============================================================================
  
  /**
   * Intenta recuperar desde un backup específico.
   */
  recoverFromBackup(index: number): RehydrationResult {
    const result = this.persistence.loadBackup(index);
    
    if (!result?.success || !result.state) {
      return {
        success: false,
        source: 'none',
        state: INITIAL_PROJECT_STATE,
        warnings: [],
        migrationsApplied: [],
        error: result?.error || `Backup ${index} no disponible`
      };
    }
    
    this.applyState(result.state);
    
    return {
      success: true,
      source: 'backup',
      state: result.state,
      warnings: [`Recuperado desde backup #${index}`],
      migrationsApplied: result.migrationsApplied,
      error: null
    };
  }
  
  /**
   * Reinicia al estado inicial limpiando persistencia.
   */
  resetToInitial(): RehydrationResult {
    this.persistence.clearAll();
    
    return {
      success: true,
      source: 'initial',
      state: INITIAL_PROJECT_STATE,
      warnings: ['Estado reiniciado completamente'],
      migrationsApplied: [],
      error: null
    };
  }
  
  /**
   * Exporta el estado actual como string para backup manual.
   */
  exportStateForBackup(): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
      return raw;
    } catch {
      return null;
    }
  }
  
  /**
   * Importa estado desde string de backup manual.
   */
  importStateFromBackup(raw: string): RehydrationResult {
    const result = autoDeserialize(raw);
    
    if (!result.success || !result.state) {
      return {
        success: false,
        source: 'none',
        state: INITIAL_PROJECT_STATE,
        warnings: [],
        migrationsApplied: [],
        error: result.error || 'Formato de backup inválido'
      };
    }
    
    this.applyState(result.state);
    
    // Guardar el estado importado
    this.persistence.saveNow();
    
    return {
      success: true,
      source: 'backup',
      state: result.state,
      warnings: ['Estado importado desde backup externo'],
      migrationsApplied: result.migrationsApplied,
      error: null
    };
  }
}

// ============================================================================
// APP_INITIALIZER FACTORY
// ============================================================================

/**
 * Factory para APP_INITIALIZER que rehidrata el estado.
 */
export function rehydrationInitializerFactory(
  rehydration: StateRehydrationService
): () => Promise<void> {
  return async () => {
    const result = await rehydration.rehydrate();
    
    if (!result.success) {
      console.error('[App Init] Rehydration failed:', result.error);
    } else if (result.warnings.length > 0) {
      console.warn('[App Init] Rehydration warnings:', result.warnings);
    }
    
    if (result.migrationsApplied.length > 0) {
      console.info('[App Init] Applied migrations:', result.migrationsApplied);
    }
  };
}

/**
 * Provider para incluir en app.module.ts
 */
export const REHYDRATION_INITIALIZER: Provider = {
  provide: APP_INITIALIZER,
  useFactory: rehydrationInitializerFactory,
  deps: [StateRehydrationService],
  multi: true
};

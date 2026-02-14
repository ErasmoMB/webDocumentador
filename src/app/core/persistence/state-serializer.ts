/**
 * STATE SERIALIZER - PASO 7.2
 * 
 * Funciones puras para serializar/deserializar el estado.
 * 
 * PRINCIPIOS:
 * 1. Funciones puras (sin side-effects)
 * 2. Manejan compatibilidad hacia atrás
 * 3. Validan estructura antes de deserializar
 * 4. Aplicar migraciones si es necesario
 */

import { ProjectState, INITIAL_PROJECT_STATE } from '../state/project-state.model';
import {
  PersistibleState,
  PersistenceEnvelope,
  ValidationResult,
  SCHEMA_VERSION,
  MIGRATIONS,
  extractPersistibleState,
  extractPersistibleStateWithoutBase64,
  generateChecksum,
  validateChecksum,
  validateEnvelopeStructure,
  validateStateStructure,
  isVersionSupported,
  compareVersions,
  findMigrationPath
} from './persistence.contract';

// ============================================================================
// SERIALIZATION RESULT TYPES
// ============================================================================

export interface SerializationResult {
  readonly success: boolean;
  readonly data: string | null;
  readonly error: string | null;
  readonly envelope: PersistenceEnvelope | null;
}

export interface DeserializationResult {
  readonly success: boolean;
  readonly state: ProjectState | null;
  readonly error: string | null;
  readonly validation: ValidationResult;
  readonly migrationsApplied: string[];
}

// ============================================================================
// SERIALIZE
// ============================================================================

/**
 * Serializa el ProjectState a un string JSON.
 * 
 * @param state - Estado completo del proyecto
 * @returns Resultado de serialización con el JSON string
 */
export function serializeProjectState(state: ProjectState): SerializationResult {
  try {
    // 1. Extraer solo la parte persistible
    const persistible = extractPersistibleState(state);
    
    // 2. Generar checksum
    const checksum = generateChecksum(persistible);
    
    // 3. Crear envelope con metadatos
    const envelope: PersistenceEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: Date.now(),
      checksum,
      state: persistible
    };
    
    // 4. Serializar a JSON
    const json = JSON.stringify(envelope);
    
    return {
      success: true,
      data: json,
      error: null,
      envelope
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown serialization error';
    return {
      success: false,
      data: null,
      error: `Serialization failed: ${errorMessage}`,
      envelope: null
    };
  }
}

/**
 * Serializa solo para debug/log (sin envelope).
 */
export function serializeForDebug(state: ProjectState): string {
  try {
    return JSON.stringify(extractPersistibleState(state), null, 2);
  } catch {
    return '{"error": "Failed to serialize for debug"}';
  }
}

/**
 * ✅ NUEVO: Serializa el estado PERO excluye imágenes base64.
 * Usado para SessionDataService donde storage está limitado (cuota ~5-10MB).
 * Las imágenes base64 se persisten por separado vía backend.
 * 
 * @param state - Estado completo del proyecto
 * @returns Resultado de serialización sin imágenes base64
 */
export function serializeProjectStateWithoutBase64(state: ProjectState): SerializationResult {
  try {
    // 1. Extraer estado persistible SIN imágenes base64
    const persistible = extractPersistibleStateWithoutBase64(state);
    
    // 2. Generar checksum
    const checksum = generateChecksum(persistible);
    
    // 3. Crear envelope con metadatos
    const envelope: PersistenceEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: Date.now(),
      checksum,
      state: persistible
    };
    
    // 4. Serializar a JSON
    const json = JSON.stringify(envelope);
    
    return {
      success: true,
      data: json,
      error: null,
      envelope
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown serialization error';
    return {
      success: false,
      data: null,
      error: `Serialization failed (no base64): ${errorMessage}`,
      envelope: null
    };
  }
}

// ============================================================================
// DESERIALIZE
// ============================================================================

/**
 * Deserializa un JSON string a ProjectState.
 * 
 * @param raw - String JSON del estado guardado
 * @returns Resultado con el estado restaurado o error
 */
export function deserializeProjectState(raw: string): DeserializationResult {
  const migrationsApplied: string[] = [];
  
  // 1. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return {
      success: false,
      state: null,
      error: 'Invalid JSON format',
      validation: {
        isValid: false,
        errors: ['JSON parse error'],
        warnings: [],
        needsMigration: false,
        sourceVersion: null
      },
      migrationsApplied: []
    };
  }
  
  // 2. Validate envelope structure
  const envelopeValidation = validateEnvelopeStructure(parsed);
  if (!envelopeValidation.isValid) {
    return {
      success: false,
      state: null,
      error: `Invalid envelope: ${envelopeValidation.errors.join(', ')}`,
      validation: envelopeValidation,
      migrationsApplied: []
    };
  }
  
  const envelope = parsed as PersistenceEnvelope;
  
  // 3. Check version support
  if (!isVersionSupported(envelope.schemaVersion) && 
      compareVersions(envelope.schemaVersion, SCHEMA_VERSION) !== 0) {
    // Check if we can migrate
    const migrationPath = findMigrationPath(envelope.schemaVersion, SCHEMA_VERSION);
    if (migrationPath.length === 0) {
      return {
        success: false,
        state: null,
        error: `Unsupported schema version: ${envelope.schemaVersion}. Current: ${SCHEMA_VERSION}`,
        validation: {
          isValid: false,
          errors: [`Version ${envelope.schemaVersion} not supported`],
          warnings: [],
          needsMigration: true,
          sourceVersion: envelope.schemaVersion
        },
        migrationsApplied: []
      };
    }
  }
  
  // 4. Validate checksum (optional but recommended)
  if (envelope.checksum && !validateChecksum(envelope)) {
    // Warning but continue (might be minor changes)
    console.warn('Checksum mismatch - state may have been modified externally');
  }
  
  // 5. Validate state structure
  const stateValidation = validateStateStructure(envelope.state);
  if (!stateValidation.isValid) {
    return {
      success: false,
      state: null,
      error: `Invalid state structure: ${stateValidation.errors.join(', ')}`,
      validation: stateValidation,
      migrationsApplied: []
    };
  }
  
  // 6. Apply migrations if needed
  let migratedState = envelope.state;
  if (envelope.schemaVersion !== SCHEMA_VERSION) {
    const migrations = findMigrationPath(envelope.schemaVersion, SCHEMA_VERSION);
    for (const migration of migrations) {
      try {
        migratedState = migration.migrate(migratedState);
        migrationsApplied.push(`${migration.fromVersion} → ${migration.toVersion}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown migration error';
        return {
          success: false,
          state: null,
          error: `Migration failed (${migration.fromVersion} → ${migration.toVersion}): ${msg}`,
          validation: stateValidation,
          migrationsApplied
        };
      }
    }
  }
  
  // 7. Reconstruct full ProjectState with defaults for missing parts
  const fullState = reconstructProjectState(migratedState);
  
  return {
    success: true,
    state: fullState,
    error: null,
    validation: {
      isValid: true,
      errors: [],
      warnings: stateValidation.warnings,
      needsMigration: migrationsApplied.length > 0,
      sourceVersion: envelope.schemaVersion
    },
    migrationsApplied
  };
}

/**
 * Reconstruye un ProjectState completo a partir de datos persistidos.
 * Agrega valores por defecto para campos faltantes y _internal.
 */
function reconstructProjectState(persistible: PersistibleState): ProjectState {
  return {
    metadata: {
      ...INITIAL_PROJECT_STATE.metadata,
      ...persistible.metadata
    },
    groupConfig: {
      ...INITIAL_PROJECT_STATE.groupConfig,
      ...persistible.groupConfig
    },
    ccppRegistry: {
      ...INITIAL_PROJECT_STATE.ccppRegistry,
      ...persistible.ccppRegistry
    },
    sections: {
      ...INITIAL_PROJECT_STATE.sections,
      ...persistible.sections
    },
    fields: {
      ...INITIAL_PROJECT_STATE.fields,
      ...persistible.fields
    },
    tables: {
      ...INITIAL_PROJECT_STATE.tables,
      ...persistible.tables
    },
    images: {
      ...INITIAL_PROJECT_STATE.images,
      ...persistible.images
    },
    globalRegistry: {
      ...INITIAL_PROJECT_STATE.globalRegistry,
      ...persistible.globalRegistry
    },
    // _internal siempre se reinicia (no se persiste)
    _internal: {
      isDirty: false,
      lastSaved: Date.now(),
      loadedFrom: 'storage'
    }
  };
}

// ============================================================================
// COMPATIBILITY HELPERS
// ============================================================================

/**
 * Intenta deserializar datos en formato legacy (pre-envelope).
 * Útil para migrar datos antiguos que no tienen el wrapper.
 */
export function deserializeLegacyState(raw: string): DeserializationResult {
  try {
    const parsed = JSON.parse(raw);
    
    // Check if it's already an envelope
    if (parsed.schemaVersion && parsed.state) {
      return deserializeProjectState(raw);
    }
    
    // Assume it's a raw PersistibleState
    const validation = validateStateStructure(parsed);
    if (!validation.isValid) {
      return {
        success: false,
        state: null,
        error: `Invalid legacy state: ${validation.errors.join(', ')}`,
        validation,
        migrationsApplied: []
      };
    }
    
    const fullState = reconstructProjectState(parsed as PersistibleState);
    
    return {
      success: true,
      state: fullState,
      error: null,
      validation: {
        isValid: true,
        errors: [],
        warnings: ['Loaded from legacy format without envelope'],
        needsMigration: true,
        sourceVersion: 'legacy'
      },
      migrationsApplied: ['legacy → 1.0.0']
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      state: null,
      error: `Legacy deserialization failed: ${msg}`,
      validation: {
        isValid: false,
        errors: [msg],
        warnings: [],
        needsMigration: false,
        sourceVersion: null
      },
      migrationsApplied: []
    };
  }
}

/**
 * Detecta automáticamente el formato y deserializa.
 */
export function autoDeserialize(raw: string): DeserializationResult {
  // Try normal deserialization first
  const result = deserializeProjectState(raw);
  if (result.success) {
    return result;
  }
  
  // Try legacy format
  return deserializeLegacyState(raw);
}


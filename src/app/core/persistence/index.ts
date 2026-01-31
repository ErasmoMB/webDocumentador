/**
 * PERSISTENCE MODULE - BARREL EXPORT
 * 
 * Exports públicos del sistema de persistencia.
 * 
 * PASO 7: Persistencia del Estado
 * - 7.1: Persistence Contract (tipos, validación, migraciones)
 * - 7.2: Serialization (serialize/deserialize)
 * - 7.3: Persistence Observer (auto-save con debounce)
 * - 7.4: Rehydration (carga inicial con recuperación)
 */

// ============================================================================
// 7.1 - PERSISTENCE CONTRACT
// ============================================================================

export {
  // Constants
  SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  STORAGE_KEYS,
  MIGRATIONS,
  DEFAULT_PERSISTENCE_CONFIG,
  
  // Types
  type PersistibleState,
  type PersistenceEnvelope,
  type MigrationDefinition,
  type PersistenceConfig,
  type ValidationResult,
  
  // Functions
  extractPersistibleState,
  generateChecksum,
  validateChecksum,
  isVersionSupported,
  compareVersions,
  findMigrationPath,
  validateEnvelopeStructure,
  validateStateStructure
} from './persistence.contract';

// ============================================================================
// 7.2 - SERIALIZATION
// ============================================================================

export {
  // Types
  type SerializationResult,
  type DeserializationResult,
  
  // Functions
  serializeProjectState,
  serializeForDebug,
  deserializeProjectState,
  deserializeLegacyState,
  autoDeserialize
} from './state-serializer';

// ============================================================================
// 7.3 - PERSISTENCE OBSERVER
// ============================================================================

export {
  // Types
  type PersistenceStatus,
  type PersistenceStatusInfo,
  
  // Service
  PersistenceObserverService
} from './persistence-observer.service';

// ============================================================================
// 7.4 - REHYDRATION
// ============================================================================

export {
  // Types
  type RehydrationSource,
  type RehydrationResult,
  type RehydrationOptions,
  
  // Service
  StateRehydrationService,
  
  // APP_INITIALIZER
  rehydrationInitializerFactory,
  REHYDRATION_INITIALIZER
} from './state-rehydration.service';

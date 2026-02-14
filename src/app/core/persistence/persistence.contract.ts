/**
 * PERSISTENCE CONTRACT - PASO 7.1
 * 
 * Define qué partes del estado son persistibles y el esquema de versionado.
 * 
 * PRINCIPIOS:
 * 1. Solo datos serializables (no funciones, no Signals)
 * 2. Versionado explícito para migraciones
 * 3. _internal NO se persiste (estado efímero)
 * 4. Separación clara entre datos y metadatos de persistencia
 */

import { ProjectState } from '../state/project-state.model';

// ============================================================================
// SCHEMA VERSION
// ============================================================================

/**
 * Versión actual del esquema de persistencia.
 * 
 * FORMATO: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles que requieren migración
 * - MINOR: Nuevos campos opcionales, migración automática
 * - PATCH: Correcciones sin cambio de estructura
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * Versiones soportadas para migración.
 * Si se encuentra una versión no listada, se rechaza la carga.
 */
export const SUPPORTED_SCHEMA_VERSIONS = [
  '1.0.0'
] as const;

export type SupportedSchemaVersion = typeof SUPPORTED_SCHEMA_VERSIONS[number];

// ============================================================================
// PERSISTIBLE STATE
// ============================================================================

/**
 * Estado que se persiste.
 * EXCLUYE: _internal (es estado efímero de runtime)
 */
export interface PersistibleState {
  readonly metadata: ProjectState['metadata'];
  readonly groupConfig: ProjectState['groupConfig'];
  readonly ccppRegistry: ProjectState['ccppRegistry'];
  readonly sections: ProjectState['sections'];
  readonly fields: ProjectState['fields'];
  readonly tables: ProjectState['tables'];
  readonly images: ProjectState['images'];
  readonly globalRegistry: ProjectState['globalRegistry'];
}

/**
 * Metadatos de persistencia (wrapper alrededor del estado).
 */
export interface PersistenceEnvelope {
  readonly schemaVersion: string;
  readonly savedAt: number;
  readonly checksum: string;
  readonly state: PersistibleState;
}

/**
 * Resultado de la validación de persistencia.
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly needsMigration: boolean;
  readonly sourceVersion: string | null;
}

// ============================================================================
// PERSISTENCE KEYS
// ============================================================================

/**
 * Claves de almacenamiento.
 */
export const STORAGE_KEYS = {
  /** Estado principal del proyecto */
  PROJECT_STATE: 'documentador_project_state',
  /** Backup automático */
  AUTO_BACKUP: 'documentador_auto_backup',
  /** Metadatos de sesión */
  SESSION_META: 'documentador_session_meta',
  /** Historial de versiones (para rollback) */
  VERSION_HISTORY: 'documentador_version_history'
} as const;

// ============================================================================
// MIGRATION TYPES
// ============================================================================

/**
 * Función de migración entre versiones.
 */
export type MigrationFn = (state: any) => PersistibleState;

/**
 * Definición de migración.
 */
export interface MigrationDefinition {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly migrate: MigrationFn;
  readonly description: string;
}

// ============================================================================
// MIGRATIONS REGISTRY
// ============================================================================

/**
 * Registro de migraciones disponibles.
 * 
 * Las migraciones se aplican en cadena:
 * v0.9.0 → v1.0.0 → v1.1.0 (si existen)
 */
export const MIGRATIONS: MigrationDefinition[] = [
  // Placeholder para futuras migraciones
  // {
  //   fromVersion: '0.9.0',
  //   toVersion: '1.0.0',
  //   description: 'Migrar de estructura legacy',
  //   migrate: (state) => { ... }
  // }
];

// ============================================================================
// PERSISTENCE CONFIG
// ============================================================================

/**
 * Configuración de persistencia.
 */
export interface PersistenceConfig {
  /** Debounce para auto-save (ms) */
  readonly autoSaveDebounce: number;
  /** Máximo de backups a mantener */
  readonly maxBackups: number;
  /** Habilitar compresión */
  readonly enableCompression: boolean;
  /** Habilitar checksum validation */
  readonly enableChecksumValidation: boolean;
  /** Storage adapter (localStorage, IndexedDB, etc.) */
  readonly storageType: 'localStorage' | 'indexedDB' | 'memory';
}

export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  autoSaveDebounce: 2000,
  maxBackups: 5,
  enableCompression: false,
  enableChecksumValidation: true,
  storageType: 'localStorage'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extrae el estado persistible del ProjectState completo.
 */
export function extractPersistibleState(state: ProjectState): PersistibleState {
  // Destructure para excluir _internal
  const { _internal, ...persistible } = state;
  return persistible;
}

/**
 * ✅ NUEVO: Extrae estado persistible PERO excluye imágenes base64.
 * Útil para SessionDataService donde storage está limitado.
 * Las imágenes base64 se persisten por separado vía backend.
 */
export function extractPersistibleStateWithoutBase64(state: ProjectState): PersistibleState {
  const persistible = extractPersistibleState(state);
  
  // Copiar campos pero filtrar imágenes base64
  const filtered = JSON.parse(JSON.stringify(persistible));
  
  // Filtrar campos que típicamente contienen imágenes base64
  if (filtered.fields && typeof filtered.fields === 'object') {
    const fieldsToRemove: string[] = [];
    
    Object.keys(filtered.fields).forEach(key => {
      // Detectar claves de imagen: *Imagen, *Imagen_A1, etc.
      // y si el valor es base64 (comienza con "data:image")
      if (key.includes('Imagen') && typeof filtered.fields[key] === 'string') {
        const value = filtered.fields[key];
        // Si es base64, excluir
        if (value.startsWith('data:image')) {
          fieldsToRemove.push(key);
        }
      }
    });
    
    // Remover campos de imagen base64
    fieldsToRemove.forEach(key => {
      delete filtered.fields[key];
    });
  }
  
  return filtered;
}

/**
 * Verifica si una versión está soportada.
 */
export function isVersionSupported(version: string): version is SupportedSchemaVersion {
  return SUPPORTED_SCHEMA_VERSIONS.includes(version as SupportedSchemaVersion);
}

/**
 * Compara versiones semánticas.
 * @returns -1 si a < b, 0 si a === b, 1 si a > b
 */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (partsA[i] < partsB[i]) return -1;
    if (partsA[i] > partsB[i]) return 1;
  }
  
  return 0;
}

/**
 * Genera un checksum simple del estado.
 * Usa JSON stringify + hash básico para validación de integridad.
 */
export function generateChecksum(state: PersistibleState): string {
  const json = JSON.stringify(state);
  let hash = 0;
  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `v1:${Math.abs(hash).toString(36)}`;
}

/**
 * Valida el checksum de un envelope.
 */
export function validateChecksum(envelope: PersistenceEnvelope): boolean {
  const expected = generateChecksum(envelope.state);
  return envelope.checksum === expected;
}

/**
 * Encuentra la cadena de migraciones necesaria.
 */
export function findMigrationPath(fromVersion: string, toVersion: string): MigrationDefinition[] {
  const path: MigrationDefinition[] = [];
  let currentVersion = fromVersion;
  
  while (currentVersion !== toVersion) {
    const migration = MIGRATIONS.find(m => m.fromVersion === currentVersion);
    if (!migration) {
      // No hay ruta de migración
      return [];
    }
    path.push(migration);
    currentVersion = migration.toVersion;
    
    // Prevenir bucles infinitos
    if (path.length > 100) {
      console.error('Migration path too long, possible infinite loop');
      return [];
    }
  }
  
  return path;
}

/**
 * Valida la estructura básica de un PersistenceEnvelope.
 */
export function validateEnvelopeStructure(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof data !== 'object' || data === null) {
    return {
      isValid: false,
      errors: ['Data is not an object'],
      warnings: [],
      needsMigration: false,
      sourceVersion: null
    };
  }
  
  const envelope = data as Partial<PersistenceEnvelope>;
  
  // Check schemaVersion
  if (typeof envelope.schemaVersion !== 'string') {
    errors.push('Missing or invalid schemaVersion');
  }
  
  // Check savedAt
  if (typeof envelope.savedAt !== 'number') {
    errors.push('Missing or invalid savedAt timestamp');
  }
  
  // Check checksum
  if (typeof envelope.checksum !== 'string') {
    warnings.push('Missing checksum, integrity cannot be verified');
  }
  
  // Check state
  if (typeof envelope.state !== 'object' || envelope.state === null) {
    errors.push('Missing or invalid state object');
  }
  
  const sourceVersion = typeof envelope.schemaVersion === 'string' 
    ? envelope.schemaVersion 
    : null;
  
  const needsMigration = sourceVersion !== null && 
    sourceVersion !== SCHEMA_VERSION &&
    isVersionSupported(sourceVersion);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    needsMigration,
    sourceVersion
  };
}

/**
 * Valida que el estado tenga todas las partes requeridas.
 */
export function validateStateStructure(state: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (typeof state !== 'object' || state === null) {
    return {
      isValid: false,
      errors: ['State is not an object'],
      warnings: [],
      needsMigration: false,
      sourceVersion: null
    };
  }
  
  const s = state as Partial<PersistibleState>;
  
  // Required fields
  const requiredFields: (keyof PersistibleState)[] = [
    'metadata', 'groupConfig', 'ccppRegistry', 'sections',
    'fields', 'tables', 'images', 'globalRegistry'
  ];
  
  for (const field of requiredFields) {
    if (s[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate metadata structure
  if (s.metadata) {
    if (typeof s.metadata.projectName !== 'string') {
      warnings.push('metadata.projectName is not a string');
    }
  }
  
  // Validate fields structure
  if (s.fields) {
    if (typeof s.fields.byKey !== 'object') {
      errors.push('fields.byKey is not an object');
    }
    if (!Array.isArray(s.fields.allKeys)) {
      errors.push('fields.allKeys is not an array');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    needsMigration: false,
    sourceVersion: null
  };
}


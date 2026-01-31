/**
 * PERSISTENCE TESTS - PASO 7.5
 * 
 * Tests para el sistema de persistencia.
 * 
 * Casos cubiertos:
 * - Serialización/Deserialización
 * - Validación de estructura
 * - Migraciones
 * - Recuperación ante corrupción
 * - Checksums
 */

import {
  // Contract
  SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  STORAGE_KEYS,
  extractPersistibleState,
  generateChecksum,
  validateChecksum,
  isVersionSupported,
  compareVersions,
  findMigrationPath,
  validateEnvelopeStructure,
  validateStateStructure,
  PersistenceEnvelope,
  PersistibleState
} from './persistence.contract';

import {
  serializeProjectState,
  deserializeProjectState,
  deserializeLegacyState,
  autoDeserialize
} from './state-serializer';

import { 
  ProjectState, 
  INITIAL_PROJECT_STATE 
} from '../state/project-state.model';

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

function createTestProjectState(overrides: Partial<ProjectState> = {}): ProjectState {
  return {
    ...INITIAL_PROJECT_STATE,
    metadata: {
      ...INITIAL_PROJECT_STATE.metadata,
      projectId: 'test-project-123',
      projectName: 'Test Project'
    },
    _internal: {
      isDirty: false,
      lastSaved: Date.now(),
      loadedFrom: 'storage'
    },
    ...overrides
  };
}

function createCorruptedJson(): string {
  return '{ invalid json }}}';
}

function createOldVersionEnvelope(): string {
  return JSON.stringify({
    schemaVersion: '0.9.0',
    savedAt: Date.now(),
    checksum: 'old-checksum',
    state: {
      metadata: { projectId: 'old', projectName: 'Old Project' }
    }
  });
}

// ============================================================================
// PERSISTENCE CONTRACT TESTS
// ============================================================================

describe('Persistence Contract (PASO 7.1)', () => {
  
  describe('extractPersistibleState', () => {
    it('should exclude _internal from state', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      expect(persistible).toBeDefined();
      expect((persistible as any)._internal).toBeUndefined();
      expect(persistible.metadata).toBeDefined();
    });
    
    it('should preserve all other properties', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      expect(persistible.metadata).toEqual(state.metadata);
      expect(persistible.groupConfig).toEqual(state.groupConfig);
      expect(persistible.fields).toEqual(state.fields);
    });
  });
  
  describe('generateChecksum', () => {
    it('should generate consistent checksum for same state', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      const checksum1 = generateChecksum(persistible);
      const checksum2 = generateChecksum(persistible);
      
      expect(checksum1).toBe(checksum2);
    });
    
    it('should generate different checksum for different state', () => {
      const state1 = createTestProjectState({ 
        metadata: { ...INITIAL_PROJECT_STATE.metadata, projectId: 'a' } 
      });
      const state2 = createTestProjectState({ 
        metadata: { ...INITIAL_PROJECT_STATE.metadata, projectId: 'b' } 
      });
      
      const checksum1 = generateChecksum(extractPersistibleState(state1));
      const checksum2 = generateChecksum(extractPersistibleState(state2));
      
      expect(checksum1).not.toBe(checksum2);
    });
  });
  
  describe('validateChecksum', () => {
    it('should validate correct checksum', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      const checksum = generateChecksum(persistible);
      
      const envelope: PersistenceEnvelope = {
        schemaVersion: SCHEMA_VERSION,
        savedAt: Date.now(),
        checksum,
        state: persistible
      };
      
      expect(validateChecksum(envelope)).toBe(true);
    });
    
    it('should reject invalid checksum', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      const envelope: PersistenceEnvelope = {
        schemaVersion: SCHEMA_VERSION,
        savedAt: Date.now(),
        checksum: 'wrong-checksum',
        state: persistible
      };
      
      expect(validateChecksum(envelope)).toBe(false);
    });
  });
  
  describe('isVersionSupported', () => {
    it('should return true for current version', () => {
      expect(isVersionSupported(SCHEMA_VERSION)).toBe(true);
    });
    
    it('should return true for supported versions', () => {
      SUPPORTED_SCHEMA_VERSIONS.forEach(version => {
        expect(isVersionSupported(version)).toBe(true);
      });
    });
    
    it('should return false for unsupported version', () => {
      expect(isVersionSupported('0.0.1')).toBe(false);
      expect(isVersionSupported('99.99.99')).toBe(false);
    });
  });
  
  describe('compareVersions', () => {
    it('should correctly compare versions', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.1.0', '1.0.0')).toBe(1);
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    });
  });
  
  describe('validateEnvelopeStructure', () => {
    it('should validate correct envelope', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      const envelope = {
        schemaVersion: SCHEMA_VERSION,
        savedAt: Date.now(),
        checksum: generateChecksum(persistible),
        state: persistible
      };
      
      const result = validateEnvelopeStructure(envelope);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    it('should reject envelope missing schemaVersion', () => {
      const result = validateEnvelopeStructure({
        savedAt: Date.now(),
        state: {}
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject null/undefined', () => {
      expect(validateEnvelopeStructure(null).isValid).toBe(false);
      expect(validateEnvelopeStructure(undefined).isValid).toBe(false);
    });
  });
  
  describe('validateStateStructure', () => {
    it('should validate correct state', () => {
      const state = createTestProjectState();
      const persistible = extractPersistibleState(state);
      
      const result = validateStateStructure(persistible);
      expect(result.isValid).toBe(true);
    });
    
    it('should reject state missing required fields', () => {
      const result = validateStateStructure({});
      expect(result.isValid).toBe(false);
    });
  });
});

// ============================================================================
// SERIALIZATION TESTS
// ============================================================================

describe('State Serializer (PASO 7.2)', () => {
  
  describe('serializeProjectState', () => {
    it('should serialize state to valid JSON', () => {
      const state = createTestProjectState();
      const result = serializeProjectState(state);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      
      // Should be valid JSON
      expect(() => JSON.parse(result.data!)).not.toThrow();
    });
    
    it('should create envelope with correct structure', () => {
      const state = createTestProjectState();
      const result = serializeProjectState(state);
      
      expect(result.envelope).toBeDefined();
      expect(result.envelope!.schemaVersion).toBe(SCHEMA_VERSION);
      expect(result.envelope!.savedAt).toBeDefined();
      expect(result.envelope!.checksum).toBeDefined();
      expect(result.envelope!.state).toBeDefined();
    });
    
    it('should not include _internal in serialized state', () => {
      const state = createTestProjectState();
      const result = serializeProjectState(state);
      
      const parsed = JSON.parse(result.data!);
      expect(parsed.state._internal).toBeUndefined();
    });
  });
  
  describe('deserializeProjectState', () => {
    it('should deserialize valid serialized state', () => {
      const original = createTestProjectState();
      const serialized = serializeProjectState(original);
      const result = deserializeProjectState(serialized.data!);
      
      expect(result.success).toBe(true);
      expect(result.state).toBeDefined();
      expect(result.state!.metadata.projectId).toBe(original.metadata.projectId);
    });
    
    it('should restore _internal with defaults', () => {
      const original = createTestProjectState();
      const serialized = serializeProjectState(original);
      const result = deserializeProjectState(serialized.data!);
      
      expect(result.state!._internal).toBeDefined();
      expect(result.state!._internal.isDirty).toBe(false);
      expect(result.state!._internal.loadedFrom).toBe('storage');
    });
    
    it('should reject invalid JSON', () => {
      const result = deserializeProjectState(createCorruptedJson());
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
    
    it('should reject envelope with unsupported version', () => {
      const result = deserializeProjectState(createOldVersionEnvelope());
      
      // Should fail or have migration warnings
      expect(result.validation.needsMigration || !result.success).toBe(true);
    });
  });
  
  describe('deserializeLegacyState', () => {
    it('should handle legacy format without envelope', () => {
      const legacyState = JSON.stringify({
        metadata: {
          projectId: 'legacy-id',
          projectName: 'Legacy Project',
          consultora: 'Test',
          version: '1.0'
        },
        groupConfig: { aisd: [], aisi: [], lastUpdated: 0 },
        ccppRegistry: { entries: {}, allCcppIds: [] },
        sections: { byId: {}, allIds: [] },
        fields: { byKey: {}, allKeys: [] },
        tables: { byKey: {}, allKeys: [] },
        images: { byId: {}, allIds: [], bySectionGroup: {} },
        globalRegistry: { placeholders: {}, allKeys: [] }
      });
      
      const result = deserializeLegacyState(legacyState);
      
      expect(result.success).toBe(true);
      expect(result.migrationsApplied).toContain('legacy → 1.0.0');
    });
  });
  
  describe('autoDeserialize', () => {
    it('should handle modern format', () => {
      const state = createTestProjectState();
      const serialized = serializeProjectState(state);
      const result = autoDeserialize(serialized.data!);
      
      expect(result.success).toBe(true);
    });
    
    it('should fallback to legacy format', () => {
      const legacyState = JSON.stringify({
        metadata: { projectId: 'x', projectName: 'X', consultora: '', version: '' },
        groupConfig: { aisd: [], aisi: [], lastUpdated: 0 },
        ccppRegistry: { entries: {}, allCcppIds: [] },
        sections: { byId: {}, allIds: [] },
        fields: { byKey: {}, allKeys: [] },
        tables: { byKey: {}, allKeys: [] },
        images: { byId: {}, allIds: [], bySectionGroup: {} },
        globalRegistry: { placeholders: {}, allKeys: [] }
      });
      
      const result = autoDeserialize(legacyState);
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// ROUNDTRIP TESTS
// ============================================================================

describe('Persistence Roundtrip', () => {
  
  it('should preserve state through serialize/deserialize cycle', () => {
    const original = createTestProjectState({
      metadata: {
        ...INITIAL_PROJECT_STATE.metadata,
        projectId: 'roundtrip-test',
        projectName: 'Roundtrip Test Project',
        consultora: 'Test Consultora',
        version: '2.0'
      }
    });
    
    const serialized = serializeProjectState(original);
    expect(serialized.success).toBe(true);
    
    const deserialized = deserializeProjectState(serialized.data!);
    expect(deserialized.success).toBe(true);
    
    // Compare relevant fields (excluding _internal timestamps)
    expect(deserialized.state!.metadata.projectId).toBe(original.metadata.projectId);
    expect(deserialized.state!.metadata.projectName).toBe(original.metadata.projectName);
    expect(deserialized.state!.metadata.consultora).toBe(original.metadata.consultora);
  });
  
  it('should handle state with fields and tables', () => {
    // Create mutable copy for testing
    const baseState = createTestProjectState();
    const original: ProjectState = {
      ...baseState,
      fields: {
        byKey: {
          'section1::group1::fieldA': {
            sectionId: 'section1',
            groupId: 'group1',
            fieldName: 'fieldA',
            state: {
              value: 'Test Value',
              touched: true,
              dirty: true,
              autoloaded: false,
              source: 'user',
              lastModified: Date.now()
            }
          }
        },
        allKeys: ['section1::group1::fieldA']
      }
    };
    
    const serialized = serializeProjectState(original);
    const deserialized = deserializeProjectState(serialized.data!);
    
    expect(deserialized.success).toBe(true);
    expect(deserialized.state!.fields.allKeys).toContain('section1::group1::fieldA');
    expect(deserialized.state!.fields.byKey['section1::group1::fieldA'].state.value).toBe('Test Value');
  });
});

// ============================================================================
// STORAGE KEY TESTS
// ============================================================================

describe('Storage Keys', () => {
  it('should have unique storage keys', () => {
    const keys = Object.values(STORAGE_KEYS);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
  
  it('should have prefixed keys for namespacing', () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      expect(key).toMatch(/^documentador_/);
    });
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  
  it('should handle empty strings', () => {
    const result = deserializeProjectState('');
    expect(result.success).toBe(false);
  });
  
  it('should handle null state gracefully', () => {
    const envelope = {
      schemaVersion: SCHEMA_VERSION,
      savedAt: Date.now(),
      checksum: '',
      state: null
    };
    
    const result = deserializeProjectState(JSON.stringify(envelope));
    expect(result.success).toBe(false);
  });
  
  it('should handle very large state', () => {
    const baseState = createTestProjectState();
    
    // Add many fields
    const fields: { byKey: Record<string, any>; allKeys: string[] } = { byKey: {}, allKeys: [] };
    for (let i = 0; i < 1000; i++) {
      const key = `section${i}::group${i}::field${i}`;
      fields.byKey[key] = {
        sectionId: `section${i}`,
        groupId: `group${i}`,
        fieldName: `field${i}`,
        state: {
          value: `Value ${i}`.repeat(100),
          touched: false,
          dirty: false,
          autoloaded: false,
          source: 'default',
          lastModified: Date.now()
        }
      };
      fields.allKeys.push(key);
    }
    
    const state: ProjectState = {
      ...baseState,
      fields: fields as any
    };
    
    const serialized = serializeProjectState(state);
    expect(serialized.success).toBe(true);
    
    const deserialized = deserializeProjectState(serialized.data!);
    expect(deserialized.success).toBe(true);
    expect(deserialized.state!.fields.allKeys.length).toBe(1000);
  });
});

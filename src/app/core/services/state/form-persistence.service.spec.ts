import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormPersistenceService } from './form-persistence.service';
import { StorageFacade } from '../infrastructure/storage-facade.service';

describe('FormPersistenceService', () => {
  let service: FormPersistenceService;
  const TEST_SECTION_ID = 'test-section-1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageFacade]
    });
    service = TestBed.inject(FormPersistenceService);
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    // Limpiar después de cada test
    service.clearAll();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveSectionState', () => {
    it('should save section state to localStorage', () => {
      const state = {
        group1: {
          field1: {
            value: 'test value',
            touched: true,
            dirty: true
          }
        }
      };

      service.saveSectionState(TEST_SECTION_ID, state);

      const stored = localStorage.getItem('lbs:form-state:test-section-1');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.data).toEqual(state);
      expect(parsed.savedAt).toBeDefined();
      expect(parsed.ttl).toBeDefined();
    });

    it('should use custom TTL if provided', () => {
      const state = { group1: { field1: { value: 'test', touched: true, dirty: true } } };
      const customTTL = 1000 * 60 * 60; // 1 hora

      service.saveSectionState(TEST_SECTION_ID, state, customTTL);

      const stored = localStorage.getItem('lbs:form-state:test-section-1');
      const parsed = JSON.parse(stored!);
      expect(parsed.ttl).toBe(customTTL);
    });

    it('should overwrite existing state for same section', () => {
      const state1 = { group1: { field1: { value: 'old', touched: true, dirty: true } } };
      const state2 = { group1: { field1: { value: 'new', touched: true, dirty: true } } };

      service.saveSectionState(TEST_SECTION_ID, state1);
      service.saveSectionState(TEST_SECTION_ID, state2);

      const loaded = service.loadSectionState(TEST_SECTION_ID);
      expect(loaded!['group1']['field1'].value).toBe('new');
    });
  });

  describe('loadSectionState', () => {
    it('should load section state from localStorage', () => {
      const state = {
        group1: {
          field1: {
            value: 'test value',
            touched: true,
            dirty: true
          }
        }
      };

      service.saveSectionState(TEST_SECTION_ID, state);
      const loaded = service.loadSectionState(TEST_SECTION_ID);

      expect(loaded).toEqual(state);
    });

    it('should return null if section does not exist', () => {
      const loaded = service.loadSectionState('non-existent-section');
      expect(loaded).toBeNull();
    });

    it('should return null if state has expired', fakeAsync(() => {
      const state = { group1: { field1: { value: 'test', touched: true, dirty: true } } };
      const expiredTTL = 1; // 1ms - expira inmediatamente

      service.saveSectionState(TEST_SECTION_ID, state, expiredTTL);

      // Avanzar el tiempo para que expire
      tick(10);
      
      const loaded = service.loadSectionState(TEST_SECTION_ID);
      expect(loaded).toBeNull();
    }));

    it('should clear corrupted data and return null', () => {
      // Simular datos corruptos en localStorage
      localStorage.setItem('lbs:form-state:corrupted', 'invalid json');

      const loaded = service.loadSectionState('corrupted');
      expect(loaded).toBeNull();
      
      // Verificar que se limpió
      const stored = localStorage.getItem('lbs:form-state:corrupted');
      expect(stored).toBeNull();
    });

    it('should handle valid state within TTL', () => {
      const state = {
        group1: {
          field1: {
            value: 'test',
            touched: true,
            dirty: true,
            errors: { required: 'Field is required' }
          }
        }
      };

      service.saveSectionState(TEST_SECTION_ID, state);
      const loaded = service.loadSectionState(TEST_SECTION_ID);

      expect(loaded).toEqual(state);
      expect(loaded!['group1']['field1'].errors).toEqual({ required: 'Field is required' });
    });
  });

  describe('clearSectionState', () => {
    it('should remove section state from localStorage', () => {
      const state = { group1: { field1: { value: 'test', touched: true, dirty: true } } };
      
      service.saveSectionState(TEST_SECTION_ID, state);
      service.clearSectionState(TEST_SECTION_ID);

      const loaded = service.loadSectionState(TEST_SECTION_ID);
      expect(loaded).toBeNull();
    });

    it('should not affect other sections', () => {
      const state1 = { group1: { field1: { value: 'test1', touched: true, dirty: true } } };
      const state2 = { group1: { field1: { value: 'test2', touched: true, dirty: true } } };

      service.saveSectionState('section1', state1);
      service.saveSectionState('section2', state2);
      
      service.clearSectionState('section1');

      expect(service.loadSectionState('section1')).toBeNull();
      expect(service.loadSectionState('section2')).toEqual(state2);
    });
  });

  describe('clearAll', () => {
    it('should clear all persisted states', () => {
      const state1 = { group1: { field1: { value: 'test1', touched: true, dirty: true } } };
      const state2 = { group1: { field1: { value: 'test2', touched: true, dirty: true } } };

      service.saveSectionState('section1', state1);
      service.saveSectionState('section2', state2);
      
      service.clearAll();

      expect(service.loadSectionState('section1')).toBeNull();
      expect(service.loadSectionState('section2')).toBeNull();
    });

    it('should only clear states with correct prefix', () => {
      // Guardar estado con prefijo correcto
      const state = { group1: { field1: { value: 'test', touched: true, dirty: true } } };
      service.saveSectionState(TEST_SECTION_ID, state);

      // Guardar algo sin el prefijo
      localStorage.setItem('other-key', 'other-value');

      service.clearAll();

      expect(service.loadSectionState(TEST_SECTION_ID)).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty state', () => {
      const emptyState = {};
      
      service.saveSectionState(TEST_SECTION_ID, emptyState);
      const loaded = service.loadSectionState(TEST_SECTION_ID);

      expect(loaded).toEqual({});
    });

    it('should handle state with multiple groups', () => {
      const state = {
        group1: {
          field1: { value: 'value1', touched: true, dirty: true }
        },
        group2: {
          field2: { value: 'value2', touched: true, dirty: true }
        }
      };

      service.saveSectionState(TEST_SECTION_ID, state);
      const loaded = service.loadSectionState(TEST_SECTION_ID);

      expect(loaded).toEqual(state);
      expect(loaded!['group1']).toBeDefined();
      expect(loaded!['group2']).toBeDefined();
    });

    it('should handle state with metadata', () => {
      const state = {
        group1: {
          field1: {
            value: 'test',
            touched: true,
            dirty: true,
            metadata: {
              autoloadedFrom: 'backend',
              manuallyEdited: false
            }
          }
        }
      };

      service.saveSectionState(TEST_SECTION_ID, state);
      const loaded = service.loadSectionState(TEST_SECTION_ID);

      expect(loaded!['group1']['field1'].metadata).toEqual({
        autoloadedFrom: 'backend',
        manuallyEdited: false
      });
    });
  });
});

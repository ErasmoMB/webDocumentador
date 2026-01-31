/**
 * FIELDS REDUCER TESTS
 * 
 * Tests unitarios para el reducer de campos.
 * Verifica: pureza, inmutabilidad, determinismo.
 */

import { fieldsReducer, getFieldsBySection, getFieldValue, isFieldDirty } from './fields.reducer';
import { 
  INITIAL_FIELDS_STATE, 
  FieldsState, 
  generateFieldKey 
} from '../project-state.model';
import { 
  SetFieldCommand,
  SetFieldsCommand,
  ClearFieldCommand,
  ClearSectionFieldsCommand,
  TouchFieldCommand
} from '../commands.model';

describe('FieldsReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('debe retornar el mismo estado si el valor no cambia', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            fieldName: 'field1',
            state: { value: 'test', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 }
          }
        },
        allKeys: [key]
      };
      
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1', value: 'test', source: 'user' }
      };

      const result = fieldsReducer(state, command);
      expect(result).toBe(state);
    });

    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const originalByKey = { ...state.byKey };
      
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1', value: 'new value', source: 'user' }
      };

      fieldsReducer(state, command);
      
      expect(state.byKey).toEqual(originalByKey);
    });
  });

  describe('SetField', () => {
    it('debe crear nuevo campo', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'projectName', value: 'Mi Proyecto', source: 'user' }
      };

      const result = fieldsReducer(state, command);
      const key = generateFieldKey('section1', null, 'projectName');

      expect(result.byKey[key]).toBeDefined();
      expect(result.byKey[key].state.value).toBe('Mi Proyecto');
      expect(result.byKey[key].state.source).toBe('user');
      expect(result.byKey[key].state.touched).toBe(true);
      expect(result.byKey[key].state.dirty).toBe(true);
      expect(result.allKeys).toContain(key);
    });

    it('debe crear campo con grupo', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section4', groupId: 'A', fieldName: 'nombre', value: 'Comunidad A', source: 'user' }
      };

      const result = fieldsReducer(state, command);
      const key = generateFieldKey('section4', 'A', 'nombre');

      expect(result.byKey[key]).toBeDefined();
      expect(result.byKey[key].groupId).toBe('A');
    });

    it('debe marcar como autoloaded si source es api', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'data', value: [1, 2, 3], source: 'api' }
      };

      const result = fieldsReducer(state, command);
      const key = generateFieldKey('section1', null, 'data');

      expect(result.byKey[key].state.autoloaded).toBe(true);
      expect(result.byKey[key].state.touched).toBe(false);
      expect(result.byKey[key].state.dirty).toBe(false);
    });

    it('debe actualizar campo existente', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            fieldName: 'field1',
            state: { value: 'old', touched: false, dirty: false, autoloaded: false, source: 'default', lastModified: 1000 }
          }
        },
        allKeys: [key]
      };
      
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1', value: 'new', source: 'user' }
      };

      const result = fieldsReducer(state, command);

      expect(result.byKey[key].state.value).toBe('new');
      expect(result.allKeys.length).toBe(1); // No duplica
    });
  });

  describe('SetFields (múltiples)', () => {
    it('debe crear múltiples campos', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: SetFieldsCommand = {
        type: 'field/setMultiple',
        payload: {
          sectionId: 'section1',
          groupId: null,
          fields: [
            { fieldName: 'field1', value: 'value1', source: 'user' },
            { fieldName: 'field2', value: 'value2', source: 'user' },
            { fieldName: 'field3', value: 100, source: 'api' }
          ]
        }
      };

      const result = fieldsReducer(state, command);

      expect(result.allKeys.length).toBe(3);
      expect(getFieldValue(result, 'section1', null, 'field1')).toBe('value1');
      expect(getFieldValue(result, 'section1', null, 'field2')).toBe('value2');
      expect(getFieldValue(result, 'section1', null, 'field3')).toBe(100);
    });

    it('no debe cambiar si array vacío', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: SetFieldsCommand = {
        type: 'field/setMultiple',
        payload: { sectionId: 'section1', groupId: null, fields: [] }
      };

      const result = fieldsReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('ClearField', () => {
    it('debe eliminar campo', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            fieldName: 'field1',
            state: { value: 'test', touched: true, dirty: true, autoloaded: false, source: 'user', lastModified: 1000 }
          }
        },
        allKeys: [key]
      };
      
      const command: ClearFieldCommand = {
        type: 'field/clear',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1' }
      };

      const result = fieldsReducer(state, command);

      expect(result.byKey[key]).toBeUndefined();
      expect(result.allKeys).not.toContain(key);
    });

    it('no debe cambiar si campo no existe', () => {
      const state = { ...INITIAL_FIELDS_STATE };
      const command: ClearFieldCommand = {
        type: 'field/clear',
        payload: { sectionId: 'nonexistent', groupId: null, fieldName: 'field' }
      };

      const result = fieldsReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('ClearSectionFields', () => {
    it('debe eliminar todos los campos de una sección', () => {
      const key1 = generateFieldKey('section1', null, 'field1');
      const key2 = generateFieldKey('section1', null, 'field2');
      const key3 = generateFieldKey('section2', null, 'field1');
      
      const state: FieldsState = {
        byKey: {
          [key1]: { sectionId: 'section1', groupId: null, fieldName: 'field1', state: { value: 'a', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } },
          [key2]: { sectionId: 'section1', groupId: null, fieldName: 'field2', state: { value: 'b', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } },
          [key3]: { sectionId: 'section2', groupId: null, fieldName: 'field1', state: { value: 'c', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } }
        },
        allKeys: [key1, key2, key3]
      };
      
      const command: ClearSectionFieldsCommand = {
        type: 'field/clearSection',
        payload: { sectionId: 'section1', groupId: null }
      };

      const result = fieldsReducer(state, command);

      expect(result.allKeys.length).toBe(1);
      expect(result.byKey[key3]).toBeDefined();
      expect(result.byKey[key1]).toBeUndefined();
      expect(result.byKey[key2]).toBeUndefined();
    });

    it('debe eliminar campos específicos de grupo', () => {
      const key1 = generateFieldKey('section1', 'A', 'field1');
      const key2 = generateFieldKey('section1', 'B', 'field1');
      
      const state: FieldsState = {
        byKey: {
          [key1]: { sectionId: 'section1', groupId: 'A', fieldName: 'field1', state: { value: 'a', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } },
          [key2]: { sectionId: 'section1', groupId: 'B', fieldName: 'field1', state: { value: 'b', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } }
        },
        allKeys: [key1, key2]
      };
      
      const command: ClearSectionFieldsCommand = {
        type: 'field/clearSection',
        payload: { sectionId: 'section1', groupId: 'A' }
      };

      const result = fieldsReducer(state, command);

      expect(result.allKeys.length).toBe(1);
      expect(result.byKey[key2]).toBeDefined();
    });
  });

  describe('TouchField', () => {
    it('debe marcar campo como touched', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            fieldName: 'field1',
            state: { value: 'test', touched: false, dirty: false, autoloaded: false, source: 'default', lastModified: 1000 }
          }
        },
        allKeys: [key]
      };
      
      const command: TouchFieldCommand = {
        type: 'field/touch',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1' }
      };

      const result = fieldsReducer(state, command);

      expect(result.byKey[key].state.touched).toBe(true);
    });

    it('no debe cambiar si ya está touched', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            fieldName: 'field1',
            state: { value: 'test', touched: true, dirty: true, autoloaded: false, source: 'user', lastModified: 1000 }
          }
        },
        allKeys: [key]
      };
      
      const command: TouchFieldCommand = {
        type: 'field/touch',
        payload: { sectionId: 'section1', groupId: null, fieldName: 'field1' }
      };

      const result = fieldsReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('Helpers', () => {
    it('getFieldsBySection debe retornar campos de sección', () => {
      const key1 = generateFieldKey('section1', null, 'field1');
      const key2 = generateFieldKey('section1', null, 'field2');
      const key3 = generateFieldKey('section2', null, 'field1');
      
      const state: FieldsState = {
        byKey: {
          [key1]: { sectionId: 'section1', groupId: null, fieldName: 'field1', state: { value: 'a', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } },
          [key2]: { sectionId: 'section1', groupId: null, fieldName: 'field2', state: { value: 'b', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } },
          [key3]: { sectionId: 'section2', groupId: null, fieldName: 'field1', state: { value: 'c', touched: false, dirty: false, autoloaded: false, source: 'user', lastModified: 1000 } }
        },
        allKeys: [key1, key2, key3]
      };

      const fields = getFieldsBySection(state, 'section1');

      expect(fields.length).toBe(2);
    });

    it('isFieldDirty debe verificar estado dirty', () => {
      const key = generateFieldKey('section1', null, 'field1');
      const state: FieldsState = {
        byKey: {
          [key]: { sectionId: 'section1', groupId: null, fieldName: 'field1', state: { value: 'a', touched: true, dirty: true, autoloaded: false, source: 'user', lastModified: 1000 } }
        },
        allKeys: [key]
      };

      expect(isFieldDirty(state, 'section1', null, 'field1')).toBe(true);
      expect(isFieldDirty(state, 'section1', null, 'nonexistent')).toBe(false);
    });
  });
});

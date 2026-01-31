/**
 * ROOT REDUCER TESTS
 * 
 * Tests unitarios para el reducer raíz y BatchCommand.
 * Verifica: integración de reducers, batch execution, determinismo.
 */

import { 
  rootReducer, 
  createInitialState, 
  isStateDirty, 
  getStateDebugInfo 
} from './index';
import { 
  INITIAL_PROJECT_STATE,
  ProjectState
} from '../project-state.model';
import { 
  ProjectStateCommand,
  BatchCommand,
  SetProjectNameCommand,
  InitializeSectionCommand,
  SetFieldCommand,
  AddGroupCommand,
  AddImageCommand
} from '../commands.model';

describe('RootReducer', () => {
  
  describe('Integración de reducers', () => {
    it('debe delegar comando de metadata', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: SetProjectNameCommand = {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Test Project' }
      };

      const result = rootReducer(state, command);

      expect(result.metadata.projectName).toBe('Test Project');
      expect(result._internal.isDirty).toBe(true);
    });

    it('debe delegar comando de sección', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: InitializeSectionCommand = {
        type: 'section/initialize',
        payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null }
      };

      const result = rootReducer(state, command);

      expect(result.sections.byId['3.1.1']).toBeDefined();
      expect(result._internal.isDirty).toBe(true);
    });

    it('debe delegar comando de campo', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: SetFieldCommand = {
        type: 'field/set',
        payload: { sectionId: 's1', groupId: null, fieldName: 'test', value: 'value', source: 'user' }
      };

      const result = rootReducer(state, command);

      expect(result.fields.allKeys.length).toBe(1);
      expect(result._internal.isDirty).toBe(true);
    });

    it('debe delegar comando de grupo', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: AddGroupCommand = {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Comunidad', parentId: null, ccppIds: [] }
      };

      const result = rootReducer(state, command);

      expect(result.groupConfig.aisd.length).toBe(1);
      expect(result._internal.isDirty).toBe(true);
    });

    it('debe delegar comando de imagen', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: AddImageCommand = {
        type: 'image/add',
        payload: { sectionId: 's1', groupId: null, titulo: 'Test', fuente: '', preview: null, localPath: null }
      };

      const result = rootReducer(state, command);

      expect(result.images.allIds.length).toBe(1);
      expect(result._internal.isDirty).toBe(true);
    });
  });

  describe('BatchCommand', () => {
    it('debe ejecutar múltiples comandos en secuencia', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: BatchCommand = {
        type: 'batch/execute',
        payload: {
          transactionId: 'tx_001',
          commands: [
            { type: 'metadata/setProjectName', payload: { projectName: 'Proyecto' } },
            { type: 'metadata/setConsultora', payload: { consultora: 'Consultora' } },
            { type: 'section/initialize', payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null } }
          ]
        }
      };

      const result = rootReducer(state, command);

      expect(result.metadata.projectName).toBe('Proyecto');
      expect(result.metadata.consultora).toBe('Consultora');
      expect(result.sections.byId['3.1.1']).toBeDefined();
    });

    it('debe manejar batch vacío sin cambios', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: BatchCommand = {
        type: 'batch/execute',
        payload: { transactionId: 'tx_empty', commands: [] }
      };

      const result = rootReducer(state, command);

      expect(result).toBe(state);
    });

    it('debe aplicar cambios acumulativos', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const command: BatchCommand = {
        type: 'batch/execute',
        payload: {
          transactionId: 'tx_002',
          commands: [
            { type: 'groupConfig/addGroup', payload: { tipo: 'AISD', nombre: 'A', parentId: null, ccppIds: [] } },
            { type: 'groupConfig/addGroup', payload: { tipo: 'AISD', nombre: 'B', parentId: null, ccppIds: [] } },
            { type: 'groupConfig/addGroup', payload: { tipo: 'AISI', nombre: 'D1', parentId: null, ccppIds: [] } }
          ]
        }
      };

      const result = rootReducer(state, command);

      expect(result.groupConfig.aisd.length).toBe(2);
      expect(result.groupConfig.aisi.length).toBe(1);
    });

    it('no debe permitir batch anidado', () => {
      const state = { ...INITIAL_PROJECT_STATE };
      const nestedBatch: BatchCommand = {
        type: 'batch/execute',
        payload: {
          transactionId: 'nested',
          commands: [{ type: 'metadata/setProjectName', payload: { projectName: 'Nested' } }]
        }
      };
      
      const command: BatchCommand = {
        type: 'batch/execute',
        payload: {
          transactionId: 'tx_outer',
          commands: [
            { type: 'metadata/setConsultora', payload: { consultora: 'Outer' } },
            nestedBatch as any // Intentar anidar
          ]
        }
      };

      // El reducer debería ignorar el batch anidado
      const result = rootReducer(state, command);

      expect(result.metadata.consultora).toBe('Outer');
      // El batch anidado no se ejecuta
      expect(result.metadata.projectName).toBe('');
    });
  });

  describe('createInitialState', () => {
    it('debe crear estado con timestamps', () => {
      const state = createInitialState();

      expect(state.metadata.projectId).toMatch(/^project_\d+$/);
      expect(state.metadata.createdAt).toBeGreaterThan(0);
      expect(state._internal.loadedFrom).toBe('fresh');
    });
  });

  describe('isStateDirty', () => {
    it('debe detectar estado dirty', () => {
      const cleanState: ProjectState = {
        ...INITIAL_PROJECT_STATE,
        _internal: { isDirty: false, lastSaved: 0, loadedFrom: 'fresh' }
      };
      
      const dirtyState: ProjectState = {
        ...INITIAL_PROJECT_STATE,
        _internal: { isDirty: true, lastSaved: 0, loadedFrom: 'fresh' }
      };

      expect(isStateDirty(cleanState)).toBe(false);
      expect(isStateDirty(dirtyState)).toBe(true);
    });
  });

  describe('getStateDebugInfo', () => {
    it('debe retornar información de debug', () => {
      const state: ProjectState = {
        ...INITIAL_PROJECT_STATE,
        sections: { byId: { 's1': {} as any }, allIds: ['s1'], activeSectionId: null },
        fields: { byKey: { 'k1': {} as any, 'k2': {} as any }, allKeys: ['k1', 'k2'] },
        groupConfig: { 
          aisd: [{} as any, {} as any], 
          aisi: [{} as any], 
          lastUpdated: 0 
        },
        _internal: { isDirty: true, lastSaved: 1000, loadedFrom: 'storage' }
      };

      const info = getStateDebugInfo(state);

      expect(info.sectionsCount).toBe(1);
      expect(info.fieldsCount).toBe(2);
      expect(info.aiGroupsCount).toBe(2);
      expect(info.isiGroupsCount).toBe(1);
      expect(info.isDirty).toBe(true);
      expect(info.loadedFrom).toBe('storage');
    });
  });

  describe('Inmutabilidad end-to-end', () => {
    it('debe preservar inmutabilidad a través de múltiples operaciones', () => {
      const original = createInitialState();
      const originalJson = JSON.stringify(original);

      // Aplicar múltiples comandos
      let state = rootReducer(original, {
        type: 'metadata/setProjectName',
        payload: { projectName: 'Test' }
      });

      state = rootReducer(state, {
        type: 'section/initialize',
        payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null }
      });

      state = rootReducer(state, {
        type: 'field/set',
        payload: { sectionId: '3.1.1', groupId: null, fieldName: 'test', value: 'value', source: 'user' }
      });

      // El estado original no debe haber cambiado
      expect(JSON.stringify(original)).toBe(originalJson);

      // El nuevo estado debe tener los cambios
      expect(state.metadata.projectName).toBe('Test');
      expect(state.sections.allIds.length).toBe(1);
      expect(state.fields.allKeys.length).toBe(1);
    });
  });

  describe('Determinismo', () => {
    it('debe producir mismo resultado con mismos inputs', () => {
      const state = createInitialState();
      const commands: ProjectStateCommand[] = [
        { type: 'metadata/setProjectName', payload: { projectName: 'Deterministic' } },
        { type: 'groupConfig/addGroup', payload: { tipo: 'AISD', nombre: 'G1', parentId: null, ccppIds: [] } }
      ];

      // Ejecutar dos veces
      let result1 = state;
      let result2 = state;

      for (const cmd of commands) {
        result1 = rootReducer(result1, cmd);
        result2 = rootReducer(result2, cmd);
      }

      // Comparar (ignorando timestamps que cambian)
      expect(result1.metadata.projectName).toBe(result2.metadata.projectName);
      expect(result1.groupConfig.aisd[0].nombre).toBe(result2.groupConfig.aisd[0].nombre);
      expect(result1.sections.allIds).toEqual(result2.sections.allIds);
    });
  });
});

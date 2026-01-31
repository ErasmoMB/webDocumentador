/**
 * GROUPS REDUCER TESTS
 * 
 * Tests unitarios para el reducer de grupos.
 * Verifica: pureza, inmutabilidad, re-numeración jerárquica.
 */

import { 
  groupConfigReducer, 
  ccppRegistryReducer,
  getGroupById, 
  getRootGroups,
  getChildGroups,
  hasGroups,
  countGroups 
} from './groups.reducer';
import { 
  INITIAL_GROUP_CONFIG, 
  INITIAL_CCPP_REGISTRY,
  GroupConfigState, 
  CCPPRegistry,
  GroupDefinition 
} from '../project-state.model';
import { 
  AddGroupCommand,
  RemoveGroupCommand,
  RenameGroupCommand,
  ReorderGroupsCommand,
  SetGroupCCPPCommand,
  RegisterCCPPCommand,
  RegisterCCPPBatchCommand
} from '../commands.model';

describe('GroupsReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_GROUP_CONFIG };
      const originalAisd = [...state.aisd];
      
      const command: AddGroupCommand = {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Comunidad A', parentId: null, ccppIds: [] }
      };

      groupConfigReducer(state, command);
      
      expect(state.aisd).toEqual(originalAisd);
    });
  });

  describe('AddGroup', () => {
    it('debe agregar grupo raíz AISD', () => {
      const state = { ...INITIAL_GROUP_CONFIG };
      const command: AddGroupCommand = {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Comunidad Campesina', parentId: null, ccppIds: ['001', '002'] }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd.length).toBe(1);
      expect(result.aisd[0].id).toBe('A');
      expect(result.aisd[0].nombre).toBe('Comunidad Campesina');
      expect(result.aisd[0].tipo).toBe('AISD');
      expect(result.aisd[0].parentId).toBeNull();
      expect(result.aisd[0].ccppIds).toEqual(['001', '002']);
    });

    it('debe agregar múltiples grupos raíz con letras consecutivas', () => {
      let state = { ...INITIAL_GROUP_CONFIG };
      
      state = groupConfigReducer(state, {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Grupo A', parentId: null, ccppIds: [] }
      });
      
      state = groupConfigReducer(state, {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Grupo B', parentId: null, ccppIds: [] }
      });

      expect(state.aisd[0].id).toBe('A');
      expect(state.aisd[1].id).toBe('B');
    });

    it('debe agregar subgrupo con ID jerárquico', () => {
      let state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Padre', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: AddGroupCommand = {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISD', nombre: 'Hijo', parentId: 'A', ccppIds: [] }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd.length).toBe(2);
      expect(result.aisd[1].id).toBe('A.1');
      expect(result.aisd[1].parentId).toBe('A');
    });

    it('debe agregar grupo AISI', () => {
      const state = { ...INITIAL_GROUP_CONFIG };
      const command: AddGroupCommand = {
        type: 'groupConfig/addGroup',
        payload: { tipo: 'AISI', nombre: 'Distrito', parentId: null, ccppIds: [] }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisi.length).toBe(1);
      expect(result.aisi[0].tipo).toBe('AISI');
      expect(result.aisd.length).toBe(0);
    });
  });

  describe('RemoveGroup', () => {
    it('debe eliminar grupo sin cascade', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Grupo A', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] },
          { id: 'B', nombre: 'Grupo B', tipo: 'AISD', parentId: null, orden: 1, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: RemoveGroupCommand = {
        type: 'groupConfig/removeGroup',
        payload: { tipo: 'AISD', groupId: 'A', cascade: false }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd.length).toBe(1);
      expect(result.aisd[0].id).toBe('A'); // Re-numerado de B a A
      expect(result.aisd[0].nombre).toBe('Grupo B');
    });

    it('debe eliminar grupo con cascade (incluye hijos)', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Padre', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] },
          { id: 'A.1', nombre: 'Hijo 1', tipo: 'AISD', parentId: 'A', orden: 0, ccppIds: [] },
          { id: 'A.1.1', nombre: 'Nieto', tipo: 'AISD', parentId: 'A.1', orden: 0, ccppIds: [] },
          { id: 'B', nombre: 'Otro', tipo: 'AISD', parentId: null, orden: 1, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: RemoveGroupCommand = {
        type: 'groupConfig/removeGroup',
        payload: { tipo: 'AISD', groupId: 'A', cascade: true }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd.length).toBe(1);
      expect(result.aisd[0].nombre).toBe('Otro');
      expect(result.aisd[0].id).toBe('A'); // Re-numerado
    });

    it('no debe cambiar si grupo no existe', () => {
      const state = { ...INITIAL_GROUP_CONFIG };
      const command: RemoveGroupCommand = {
        type: 'groupConfig/removeGroup',
        payload: { tipo: 'AISD', groupId: 'nonexistent', cascade: false }
      };

      const result = groupConfigReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('RenameGroup', () => {
    it('debe renombrar grupo', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Nombre Original', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: RenameGroupCommand = {
        type: 'groupConfig/renameGroup',
        payload: { tipo: 'AISD', groupId: 'A', nuevoNombre: 'Nombre Nuevo' }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd[0].nombre).toBe('Nombre Nuevo');
    });

    it('no debe cambiar si nombre es igual', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Mismo', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: RenameGroupCommand = {
        type: 'groupConfig/renameGroup',
        payload: { tipo: 'AISD', groupId: 'A', nuevoNombre: 'Mismo' }
      };

      const result = groupConfigReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('ReorderGroups', () => {
    it('debe reordenar grupos y re-numerar', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Primero', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] },
          { id: 'B', nombre: 'Segundo', tipo: 'AISD', parentId: null, orden: 1, ccppIds: [] },
          { id: 'C', nombre: 'Tercero', tipo: 'AISD', parentId: null, orden: 2, ccppIds: [] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: ReorderGroupsCommand = {
        type: 'groupConfig/reorderGroups',
        payload: { tipo: 'AISD', orderedIds: ['C', 'A', 'B'] }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd[0].nombre).toBe('Tercero');
      expect(result.aisd[0].id).toBe('A');
      expect(result.aisd[1].nombre).toBe('Primero');
      expect(result.aisd[1].id).toBe('B');
      expect(result.aisd[2].nombre).toBe('Segundo');
      expect(result.aisd[2].id).toBe('C');
    });
  });

  describe('SetGroupCCPP', () => {
    it('debe reemplazar CCPPs de grupo', () => {
      const state: GroupConfigState = {
        aisd: [
          { id: 'A', nombre: 'Grupo', tipo: 'AISD', parentId: null, orden: 0, ccppIds: ['001', '002'] }
        ],
        aisi: [],
        lastUpdated: 1000
      };
      
      const command: SetGroupCCPPCommand = {
        type: 'groupConfig/setGroupCCPP',
        payload: { tipo: 'AISD', groupId: 'A', ccppIds: ['003', '004', '005'] }
      };

      const result = groupConfigReducer(state, command);

      expect(result.aisd[0].ccppIds).toEqual(['003', '004', '005']);
    });
  });

  describe('CCPP Registry', () => {
    it('debe registrar CCPP', () => {
      const state = { ...INITIAL_CCPP_REGISTRY };
      const command: RegisterCCPPCommand = {
        type: 'groupConfig/registerCCPP',
        payload: {
          ccpp: {
            item: 1,
            ubigeo: 12345,
            codigo: '001',
            nombre: 'Centro Poblado A',
            categoria: 'RURAL',
            poblacion: 500,
            dpto: 'AREQUIPA',
            prov: 'CAYLLOMA',
            dist: 'CAHUACHO',
            este: 123456,
            norte: 654321,
            altitud: 3500
          }
        }
      };

      const result = ccppRegistryReducer(state, command);

      expect(result.allIds.length).toBe(1);
      expect(result.byId['001']).toBeDefined();
      expect(result.byId['001'].nombre).toBe('Centro Poblado A');
    });

    it('debe registrar CCPP batch', () => {
      const state = { ...INITIAL_CCPP_REGISTRY };
      const command: RegisterCCPPBatchCommand = {
        type: 'groupConfig/registerCCPPBatch',
        payload: {
          ccppList: [
            { item: 1, ubigeo: 1, codigo: '001', nombre: 'CP1', categoria: 'R', poblacion: 100, dpto: 'A', prov: 'B', dist: 'C', este: 1, norte: 1, altitud: 1 },
            { item: 2, ubigeo: 2, codigo: '002', nombre: 'CP2', categoria: 'R', poblacion: 200, dpto: 'A', prov: 'B', dist: 'C', este: 2, norte: 2, altitud: 2 }
          ]
        }
      };

      const result = ccppRegistryReducer(state, command);

      expect(result.allIds.length).toBe(2);
      expect(result.byId['001'].nombre).toBe('CP1');
      expect(result.byId['002'].nombre).toBe('CP2');
    });

    it('no debe duplicar CCPPs', () => {
      const state: CCPPRegistry = {
        byId: {
          '001': { id: '001', item: 1, ubigeo: 1, codigo: '001', nombre: 'Existente', categoria: 'R', poblacion: 100, dpto: 'A', prov: 'B', dist: 'C', este: 1, norte: 1, altitud: 1 }
        },
        allIds: ['001']
      };
      
      const command: RegisterCCPPCommand = {
        type: 'groupConfig/registerCCPP',
        payload: {
          ccpp: { item: 1, ubigeo: 1, codigo: '001', nombre: 'Duplicado', categoria: 'R', poblacion: 100, dpto: 'A', prov: 'B', dist: 'C', este: 1, norte: 1, altitud: 1 }
        }
      };

      const result = ccppRegistryReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('Helpers', () => {
    const state: GroupConfigState = {
      aisd: [
        { id: 'A', nombre: 'Grupo A', tipo: 'AISD', parentId: null, orden: 0, ccppIds: [] },
        { id: 'A.1', nombre: 'Subgrupo A.1', tipo: 'AISD', parentId: 'A', orden: 0, ccppIds: [] },
        { id: 'B', nombre: 'Grupo B', tipo: 'AISD', parentId: null, orden: 1, ccppIds: [] }
      ],
      aisi: [
        { id: 'A', nombre: 'Distrito', tipo: 'AISI', parentId: null, orden: 0, ccppIds: [] }
      ],
      lastUpdated: 1000
    };

    it('getGroupById debe encontrar grupo', () => {
      const group = getGroupById(state, 'AISD', 'A.1');
      expect(group?.nombre).toBe('Subgrupo A.1');
    });

    it('getRootGroups debe retornar grupos sin padre', () => {
      const roots = getRootGroups(state, 'AISD');
      expect(roots.length).toBe(2);
      expect(roots.map(g => g.id)).toEqual(['A', 'B']);
    });

    it('getChildGroups debe retornar hijos', () => {
      const children = getChildGroups(state, 'AISD', 'A');
      expect(children.length).toBe(1);
      expect(children[0].id).toBe('A.1');
    });

    it('hasGroups debe verificar existencia', () => {
      expect(hasGroups(state, 'AISD')).toBe(true);
      expect(hasGroups(state, 'AISI')).toBe(true);
      expect(hasGroups(INITIAL_GROUP_CONFIG, 'AISD')).toBe(false);
    });

    it('countGroups debe contar', () => {
      expect(countGroups(state, 'AISD')).toBe(3);
      expect(countGroups(state, 'AISI')).toBe(1);
    });
  });
});

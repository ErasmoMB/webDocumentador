/**
 * SECTIONS REDUCER TESTS
 * 
 * Tests unitarios para el reducer de secciones.
 * Verifica: pureza, inmutabilidad, determinismo.
 */

import { sectionsReducer, getSectionsByGroup, isGroupComplete } from './sections.reducer';
import { INITIAL_SECTIONS_STATE, SectionsState } from '../project-state.model';
import { 
  InitializeSectionCommand,
  SetActiveSectionCommand,
  MarkSectionCompleteCommand,
  ResetSectionCommand,
  AssignSectionToGroupCommand
} from '../commands.model';

describe('SectionsReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('debe retornar el mismo estado si la sección ya está inicializada', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': {
            id: '3.1.1',
            isInitialized: true,
            isComplete: false,
            groupId: null,
            groupType: 'NONE',
            lastModified: 1000
          }
        },
        allIds: ['3.1.1'],
        activeSectionId: null
      };
      
      const command: InitializeSectionCommand = {
        type: 'section/initialize',
        payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null }
      };

      const result = sectionsReducer(state, command);
      
      // El estado cambia solo por lastModified
      expect(result.byId['3.1.1'].isInitialized).toBe(true);
    });

    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_SECTIONS_STATE };
      const originalState = JSON.parse(JSON.stringify(state));
      
      const command: InitializeSectionCommand = {
        type: 'section/initialize',
        payload: { sectionId: '3.1.2', groupType: 'AISD', groupId: 'A' }
      };

      sectionsReducer(state, command);
      
      expect(JSON.stringify(state)).toBe(JSON.stringify(originalState));
    });
  });

  describe('InitializeSection', () => {
    it('debe crear nueva sección', () => {
      const state = { ...INITIAL_SECTIONS_STATE };
      const command: InitializeSectionCommand = {
        type: 'section/initialize',
        payload: { sectionId: '3.1.4.A', groupType: 'AISD', groupId: 'A' }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.4.A']).toBeDefined();
      expect(result.byId['3.1.4.A'].id).toBe('3.1.4.A');
      expect(result.byId['3.1.4.A'].isInitialized).toBe(true);
      expect(result.byId['3.1.4.A'].groupType).toBe('AISD');
      expect(result.byId['3.1.4.A'].groupId).toBe('A');
      expect(result.allIds).toContain('3.1.4.A');
    });

    it('debe manejar sección sin grupo', () => {
      const state = { ...INITIAL_SECTIONS_STATE };
      const command: InitializeSectionCommand = {
        type: 'section/initialize',
        payload: { sectionId: '3.1.1', groupType: 'NONE', groupId: null }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.1'].groupId).toBeNull();
      expect(result.byId['3.1.1'].groupType).toBe('NONE');
    });
  });

  describe('SetActiveSection', () => {
    it('debe establecer sección activa', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': { id: '3.1.1', isInitialized: true, isComplete: false, groupId: null, groupType: 'NONE', lastModified: 1000 }
        },
        allIds: ['3.1.1'],
        activeSectionId: null
      };
      
      const command: SetActiveSectionCommand = {
        type: 'section/setActive',
        payload: { sectionId: '3.1.1' }
      };

      const result = sectionsReducer(state, command);

      expect(result.activeSectionId).toBe('3.1.1');
    });

    it('no debe cambiar si ya es la activa', () => {
      const state: SectionsState = {
        byId: {},
        allIds: [],
        activeSectionId: '3.1.1'
      };
      
      const command: SetActiveSectionCommand = {
        type: 'section/setActive',
        payload: { sectionId: '3.1.1' }
      };

      const result = sectionsReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('MarkSectionComplete', () => {
    it('debe marcar sección como completa', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': { id: '3.1.1', isInitialized: true, isComplete: false, groupId: null, groupType: 'NONE', lastModified: 1000 }
        },
        allIds: ['3.1.1'],
        activeSectionId: null
      };
      
      const command: MarkSectionCompleteCommand = {
        type: 'section/markComplete',
        payload: { sectionId: '3.1.1', isComplete: true }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.1'].isComplete).toBe(true);
    });

    it('debe marcar sección como incompleta', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': { id: '3.1.1', isInitialized: true, isComplete: true, groupId: null, groupType: 'NONE', lastModified: 1000 }
        },
        allIds: ['3.1.1'],
        activeSectionId: null
      };
      
      const command: MarkSectionCompleteCommand = {
        type: 'section/markComplete',
        payload: { sectionId: '3.1.1', isComplete: false }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.1'].isComplete).toBe(false);
    });

    it('no debe cambiar si sección no existe', () => {
      const state = { ...INITIAL_SECTIONS_STATE };
      
      const command: MarkSectionCompleteCommand = {
        type: 'section/markComplete',
        payload: { sectionId: 'nonexistent', isComplete: true }
      };

      const result = sectionsReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('ResetSection', () => {
    it('debe resetear sección preservando estructura', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': { id: '3.1.1', isInitialized: true, isComplete: true, groupId: 'A', groupType: 'AISD', lastModified: 1000 }
        },
        allIds: ['3.1.1'],
        activeSectionId: '3.1.1'
      };
      
      const command: ResetSectionCommand = {
        type: 'section/reset',
        payload: { sectionId: '3.1.1', preserveStructure: true }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.1']).toBeDefined();
      expect(result.byId['3.1.1'].isComplete).toBe(false);
      expect(result.byId['3.1.1'].groupId).toBe('A');
    });

    it('debe eliminar sección sin preservar estructura', () => {
      const state: SectionsState = {
        byId: {
          '3.1.1': { id: '3.1.1', isInitialized: true, isComplete: true, groupId: null, groupType: 'NONE', lastModified: 1000 }
        },
        allIds: ['3.1.1'],
        activeSectionId: '3.1.1'
      };
      
      const command: ResetSectionCommand = {
        type: 'section/reset',
        payload: { sectionId: '3.1.1', preserveStructure: false }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.1']).toBeUndefined();
      expect(result.allIds).not.toContain('3.1.1');
      expect(result.activeSectionId).toBeNull();
    });
  });

  describe('AssignSectionToGroup', () => {
    it('debe asignar sección a grupo', () => {
      const state: SectionsState = {
        byId: {
          '3.1.4.A': { id: '3.1.4.A', isInitialized: true, isComplete: false, groupId: null, groupType: 'AISD', lastModified: 1000 }
        },
        allIds: ['3.1.4.A'],
        activeSectionId: null
      };
      
      const command: AssignSectionToGroupCommand = {
        type: 'section/assignToGroup',
        payload: { sectionId: '3.1.4.A', groupId: 'A' }
      };

      const result = sectionsReducer(state, command);

      expect(result.byId['3.1.4.A'].groupId).toBe('A');
    });
  });

  describe('Helpers', () => {
    it('getSectionsByGroup debe filtrar correctamente', () => {
      const state: SectionsState = {
        byId: {
          's1': { id: 's1', isInitialized: true, isComplete: false, groupId: 'A', groupType: 'AISD', lastModified: 1000 },
          's2': { id: 's2', isInitialized: true, isComplete: true, groupId: 'A', groupType: 'AISD', lastModified: 1000 },
          's3': { id: 's3', isInitialized: true, isComplete: false, groupId: 'B', groupType: 'AISD', lastModified: 1000 }
        },
        allIds: ['s1', 's2', 's3'],
        activeSectionId: null
      };

      const sectionsA = getSectionsByGroup(state, 'A');

      expect(sectionsA.length).toBe(2);
      expect(sectionsA.map(s => s.id)).toContain('s1');
      expect(sectionsA.map(s => s.id)).toContain('s2');
    });

    it('isGroupComplete debe verificar completitud', () => {
      const stateIncomplete: SectionsState = {
        byId: {
          's1': { id: 's1', isInitialized: true, isComplete: true, groupId: 'A', groupType: 'AISD', lastModified: 1000 },
          's2': { id: 's2', isInitialized: true, isComplete: false, groupId: 'A', groupType: 'AISD', lastModified: 1000 }
        },
        allIds: ['s1', 's2'],
        activeSectionId: null
      };

      const stateComplete: SectionsState = {
        byId: {
          's1': { id: 's1', isInitialized: true, isComplete: true, groupId: 'A', groupType: 'AISD', lastModified: 1000 },
          's2': { id: 's2', isInitialized: true, isComplete: true, groupId: 'A', groupType: 'AISD', lastModified: 1000 }
        },
        allIds: ['s1', 's2'],
        activeSectionId: null
      };

      expect(isGroupComplete(stateIncomplete, 'A')).toBe(false);
      expect(isGroupComplete(stateComplete, 'A')).toBe(true);
    });
  });
});

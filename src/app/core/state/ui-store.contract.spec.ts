/**
 * UI Store Contract Tests
 * 
 * Tests simplificados para el contrato UI.
 */

import { TestBed } from '@angular/core/testing';
import { UIStoreService, Selectors, Commands } from './ui-store.contract';

describe('UIStoreContract', () => {
  let store: UIStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UIStoreService]
    });
    store = TestBed.inject(UIStoreService);
    store.reset();
  });

  describe('UIStoreService', () => {
    it('should start with initial state', () => {
      const state = store.getSnapshot();
      expect(state).toBeDefined();
      expect(state.metadata.projectName).toBe('');
    });

    it('should dispatch commands', () => {
      store.dispatch(Commands.setProjectName('Test'));
      expect(store.getSnapshot().metadata.projectName).toBe('Test');
    });

    it('should select with selectors', () => {
      store.dispatch(Commands.setProjectName('Selected'));
      const name = store.select(Selectors.getProjectName);
      expect(name()).toBe('Selected');
    });

    it('should reset state', () => {
      store.dispatch(Commands.setProjectName('To Reset'));
      store.reset();
      expect(store.getSnapshot().metadata.projectName).toBe('');
    });
  });

  describe('Selectors', () => {
    it('getProjectInfo works', () => {
      store.dispatch(Commands.setProjectName('Info'));
      const info = Selectors.getProjectInfo(store.getSnapshot());
      expect(info.projectName).toBe('Info');
    });

    it('getAISDGroups works', () => {
      store.dispatch(Commands.addGroup('AISD', 'Test'));
      const groups = Selectors.getAISDGroups(store.getSnapshot());
      expect(groups.length).toBe(1);
    });

    it('getGroupsByType returns definitions', () => {
      store.dispatch(Commands.addGroup('AISD', 'Test AISD'));
      store.dispatch(Commands.addGroup('AISI', 'Test AISI'));
      const aisdDefs = Selectors.getGroupsByType(store.getSnapshot(), 'AISD');
      const aisiDefs = Selectors.getGroupsByType(store.getSnapshot(), 'AISI');
      expect(aisdDefs.length).toBeGreaterThanOrEqual(1);
      expect(aisiDefs.length).toBeGreaterThanOrEqual(1);
    });

    it('getGroupById resolves definition', () => {
      store.dispatch(Commands.addGroup('AISD', 'Exacto'));
      const aisdDefs = Selectors.getGroupsByType(store.getSnapshot(), 'AISD');
      const created = aisdDefs.find(def => def.nombre === 'Exacto');
      expect(created).toBeDefined();
      const resolved = Selectors.getGroupById(store.getSnapshot(), 'AISD', created!.id);
      expect(resolved?.nombre).toBe('Exacto');
    });

    it('getPopulatedCenterById returns entry and getAllPopulatedCenters lists all', () => {
      const center = {
        item: 1,
        ubigeo: 999999,
        codigo: 'CENTRO_X',
        nombre: 'Centro X',
        categoria: '',
        poblacion: 0,
        dpto: '',
        prov: '',
        dist: '',
        este: 0,
        norte: 0,
        altitud: 0
      };

      store.dispatch({
        type: 'groupConfig/registerCCPPBatch',
        payload: { ccppList: [center] }
      });

      const allCenters = Selectors.getAllPopulatedCenters(store.getSnapshot());
      expect(allCenters.some(entry => entry.codigo === 'CENTRO_X')).toBe(true);
      const found = Selectors.getPopulatedCenterById(store.getSnapshot(), 'CENTRO_X');
      expect(found).toBeDefined();
      expect(found?.nombre).toBe('Centro X');
    });

    it('getGroupsByType works', () => {
      store.dispatch(Commands.addGroup('AISD', 'AISD Group'));
      const aisd = Selectors.getGroupsByType(store.getSnapshot(), 'AISD');
      expect(aisd.length).toBe(1);
      const aisi = Selectors.getGroupsByType(store.getSnapshot(), 'AISI');
      expect(aisi.length).toBe(0);
    });

    it('getGroupById resolves definitions', () => {
      store.dispatch(Commands.addGroup('AISD', 'Named'));
      const created = Selectors.getGroupsByType(store.getSnapshot(), 'AISD')[0];
      const resolved = Selectors.getGroupById(store.getSnapshot(), 'AISD', created.id);
      expect(resolved?.nombre).toBe('Named');
    });

    it('getPopulatedCenterById returns registered entry', () => {
      const center = {
        item: 1,
        ubigeo: 111111,
        codigo: 'cp_001',
        nombre: 'Centro 1',
        categoria: '',
        poblacion: 0,
        dpto: '',
        prov: '',
        dist: '',
        este: 0,
        norte: 0,
        altitud: 0
      };

      store.dispatch({
        type: 'groupConfig/registerCCPPBatch',
        payload: { ccppList: [center] }
      });

      const found = Selectors.getPopulatedCenterById(store.getSnapshot(), 'cp_001');
      expect(found).toBeDefined();
      expect(found?.nombre).toBe('Centro 1');
    });

    it('getSectionNav works', () => {
      store.dispatch(Commands.initializeSection('s1'));
      const nav = Selectors.getSectionNav(store.getSnapshot(), 's1');
      expect(nav).not.toBeNull();
    });

    it('getFieldValue works', () => {
      store.dispatch(Commands.setField('s1', null, 'f1', 'v1'));
      const value = Selectors.getFieldValue(store.getSnapshot(), 's1', null, 'f1');
      expect(value).toBe('v1');
    });
  });

  describe('Commands', () => {
    it('creates metadata commands', () => {
      const cmd = Commands.setProjectName('Test');
      expect(cmd.type).toBe('metadata/setProjectName');
    });

    it('creates group commands', () => {
      const cmd = Commands.addGroup('AISD', 'Test');
      expect(cmd.type).toBe('groupConfig/addGroup');
    });

    it('creates field commands', () => {
      const cmd = Commands.setField('s1', null, 'f1', 'v1');
      expect(cmd.type).toBe('field/set');
    });

    it('creates batch commands', () => {
      const batch = Commands.batch([Commands.setProjectName('A')]);
      expect(batch.type).toBe('batch/execute');
    });
  });
});

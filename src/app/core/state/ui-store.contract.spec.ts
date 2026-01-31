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

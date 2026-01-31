/**
 * UI Read Adapter Tests
 */

import { TestBed } from '@angular/core/testing';
import { UIReadAdapter } from './ui-read.adapter';
import { UIStoreService, Commands } from '../state/ui-store.contract';

describe('UIReadAdapter', () => {
  let adapter: UIReadAdapter;
  let store: UIStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UIStoreService, UIReadAdapter]
    });
    store = TestBed.inject(UIStoreService);
    adapter = TestBed.inject(UIReadAdapter);
    store.reset();
  });

  describe('Project Info', () => {
    it('should provide projectInfo signal', () => {
      expect(adapter.projectInfo()).toBeDefined();
    });

    it('should reflect store changes', () => {
      store.dispatch(Commands.setProjectName('Test'));
      expect(adapter.projectName()).toBe('Test');
    });

    it('should provide consultora', () => {
      store.dispatch(Commands.setConsultora('Test Consultora'));
      expect(adapter.consultora()).toBe('Test Consultora');
    });
  });

  describe('Groups', () => {
    it('should provide empty groups initially', () => {
      expect(adapter.aisdGroups().length).toBe(0);
      expect(adapter.aisiGroups().length).toBe(0);
    });

    it('should reflect group additions', () => {
      store.dispatch(Commands.addGroup('AISD', 'Group 1'));
      expect(adapter.aisdCount()).toBe(1);
    });

    it('should get group by index', () => {
      store.dispatch(Commands.addGroup('AISD', 'Group 1'));
      const group = adapter.getAISDGroup(0);
      expect(group?.nombre).toBe('Group 1');
    });
  });

  describe('Sections', () => {
    it('should get section nav signal', () => {
      store.dispatch(Commands.initializeSection('s1'));
      const nav = adapter.getSectionNavSignal('s1');
      expect(nav()).not.toBeNull();
    });

    it('should check section complete', () => {
      store.dispatch(Commands.initializeSection('s1'));
      expect(adapter.isSectionComplete('s1')()).toBe(false);
    });
  });

  describe('Fields', () => {
    it('should get field value', () => {
      store.dispatch(Commands.setField('s1', null, 'f1', 'test'));
      expect(adapter.getFieldValue('s1', null, 'f1')()).toBe('test');
    });
  });

  describe('Tables', () => {
    it('should get table signal', () => {
      const table = adapter.getTableSignal('s1', null, 't1');
      expect(table()).toEqual([]);
    });

    it('should get row count', () => {
      expect(adapter.getTableRowCount('s1', null, 't1')()).toBe(0);
    });
  });

  describe('Ubicación', () => {
    it('should get ubicacion', () => {
      store.dispatch(Commands.setUbicacion('Dept', 'Prov', 'Dist'));
      expect(adapter.ubicacion().departamento).toBe('Dept');
    });
  });
});

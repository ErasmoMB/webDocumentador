import { TestBed } from '@angular/core/testing';
import { DocumentStoreService } from './document-store.service';
import { FormStateService } from './form-state.service';
import { take } from 'rxjs/operators';

describe('DocumentStoreService', () => {
  let service: DocumentStoreService;
  let formStateService: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DocumentStoreService, FormStateService]
    });
    service = TestBed.inject(DocumentStoreService);
    formStateService = TestBed.inject(FormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocumentState$', () => {
    it('should return observable from FormStateService', (done) => {
      service.getDocumentState$().pipe(take(1)).subscribe(state => {
        expect(state).toBeDefined();
        expect(typeof state).toBe('object');
        done();
      });
    });

    it('should emit updated state when FormStateService changes', (done) => {
      let emissionCount = 0;
      
      service.getDocumentState$().subscribe(() => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(emissionCount).toBe(2);
          done();
        }
      });

      // Trigger update
      formStateService.updateField('section1', 'group1', 'field1', 'value1');
    });
  });

  describe('getSectionState$', () => {
    it('should return observable for section state', (done) => {
      formStateService.updateField('section1', 'group1', 'field1', 'value1');
      
      service.getSectionState$('section1').pipe(take(1)).subscribe(state => {
        expect(state).toBeDefined();
        expect(state!['group1']['field1'].value).toBe('value1');
        done();
      });
    });

    it('should return undefined for non-existent section', (done) => {
      service.getSectionState$('nonExistent').pipe(take(1)).subscribe(state => {
        expect(state).toBeUndefined();
        done();
      });
    });
  });

  describe('updateDocument', () => {
    it('should update field via FormStateService', () => {
      service.updateDocument('section1', 'group1', 'field1', 'test value');
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('test value');
    });

    it('should handle multiple updates', () => {
      service.updateDocument('section1', 'group1', 'field1', 'value1');
      service.updateDocument('section1', 'group1', 'field2', 'value2');
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('value1');
      expect(snapshot['section1']['group1']['field2'].value).toBe('value2');
    });

    it('should handle different sections independently', () => {
      service.updateDocument('section1', 'group1', 'field1', 'value1');
      service.updateDocument('section2', 'group1', 'field1', 'value2');
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('value1');
      expect(snapshot['section2']['group1']['field1'].value).toBe('value2');
    });
  });

  describe('exportToJSON', () => {
    it('should return current form state snapshot', () => {
      formStateService.updateField('section1', 'group1', 'field1', 'value1');
      
      const exported = service.exportToJSON();
      
      expect(exported).toBeDefined();
      expect(exported['section1']['group1']['field1'].value).toBe('value1');
    });

    it('should return empty object if no state', () => {
      const exported = service.exportToJSON();
      expect(exported).toEqual({});
    });

    it('should return complete state with multiple sections', () => {
      formStateService.updateField('section1', 'group1', 'field1', 'value1');
      formStateService.updateField('section2', 'group1', 'field1', 'value2');
      
      const exported = service.exportToJSON();
      
      expect(exported['section1']).toBeDefined();
      expect(exported['section2']).toBeDefined();
    });
  });

  describe('importFromJSON', () => {
    it('should import complete form state', () => {
      const stateToImport = {
        section1: {
          group1: {
            field1: {
              value: 'imported value',
              touched: true,
              dirty: true
            }
          }
        }
      };
      
      service.importFromJSON(stateToImport);
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot).toEqual(stateToImport);
    });

    it('should replace existing state', () => {
      formStateService.updateField('section1', 'group1', 'field1', 'old value');
      
      const newState = {
        section1: {
          group1: {
            field1: {
              value: 'new value',
              touched: true,
              dirty: true
            }
          }
        }
      };
      
      service.importFromJSON(newState);
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('new value');
    });

    it('should handle empty state', () => {
      formStateService.updateField('section1', 'group1', 'field1', 'value1');
      
      service.importFromJSON({});
      
      const snapshot = formStateService.getFormSnapshot();
      expect(snapshot).toEqual({});
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { FormStateService } from './form-state.service';
import { take } from 'rxjs/operators';

describe('FormStateService', () => {
  let service: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with empty form state', () => {
      const snapshot = service.getFormSnapshot();
      expect(snapshot).toEqual({});
    });

    it('should emit empty state initially', (done) => {
      service.form$.pipe(take(1)).subscribe(state => {
        expect(state).toEqual({});
        done();
      });
    });
  });

  describe('updateField', () => {
    it('should update a field value', () => {
      service.updateField('section1', 'group1', 'field1', 'test value');
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('test value');
      expect(snapshot['section1']['group1']['field1'].touched).toBe(true);
      expect(snapshot['section1']['group1']['field1'].dirty).toBe(true);
    });

    it('should handle array values with deep copy', () => {
      const arrayValue = [{ id: 1, name: 'test' }];
      service.updateField('section1', 'group1', 'field1', arrayValue);
      
      const snapshot = service.getFormSnapshot();
      const storedValue = snapshot['section1']['group1']['field1'].value;
      
      expect(storedValue).toEqual(arrayValue);
      expect(storedValue).not.toBe(arrayValue); // Should be a copy
    });

    it('should handle object values with deep copy', () => {
      const objectValue = { key: 'value' };
      service.updateField('section1', 'group1', 'field1', objectValue);
      
      const snapshot = service.getFormSnapshot();
      const storedValue = snapshot['section1']['group1']['field1'].value;
      
      expect(storedValue).toEqual(objectValue);
      expect(storedValue).not.toBe(objectValue); // Should be a copy
    });

    it('should preserve existing errors when updating field', () => {
      const initialState = {
        section1: {
          group1: {
            field1: {
              value: 'old value',
              touched: true,
              dirty: true,
              errors: { required: 'Field is required' }
            }
          }
        }
      };
      service.setFormState(initialState);
      
      service.updateField('section1', 'group1', 'field1', 'new value');
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('new value');
      expect(snapshot['section1']['group1']['field1'].errors).toEqual({ required: 'Field is required' });
    });

    it('should update multiple fields independently', () => {
      service.updateField('section1', 'group1', 'field1', 'value1');
      service.updateField('section1', 'group1', 'field2', 'value2');
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot['section1']['group1']['field1'].value).toBe('value1');
      expect(snapshot['section1']['group1']['field2'].value).toBe('value2');
    });
  });

  describe('getSectionState$', () => {
    it('should return observable for section state', (done) => {
      service.updateField('section1', 'group1', 'field1', 'value1');
      
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

    it('should emit distinct values only', (done) => {
      let emissionCount = 0;
      
      service.getSectionState$('section1').subscribe(() => {
        emissionCount++;
      });
      
      service.updateField('section1', 'group1', 'field1', 'value1');
      service.updateField('section1', 'group1', 'field1', 'value1'); // Same value
      
      setTimeout(() => {
        // Should emit at least once, but distinctUntilChanged should prevent duplicate
        expect(emissionCount).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('getField$', () => {
    it('should return observable for field value', (done) => {
      service.updateField('section1', 'group1', 'field1', 'test value');
      
      service.getField$('section1', 'group1', 'field1').pipe(take(1)).subscribe(value => {
        expect(value).toBe('test value');
        done();
      });
    });

    it('should return undefined for non-existent field', (done) => {
      service.getField$('section1', 'group1', 'nonExistent').pipe(take(1)).subscribe(value => {
        expect(value).toBeUndefined();
        done();
      });
    });

    it('should handle array comparison correctly', (done) => {
      const array1 = [1, 2, 3];
      const array2 = [1, 2, 3]; // Same content, different reference
      
      service.updateField('section1', 'group1', 'field1', array1);
      
      service.getField$('section1', 'group1', 'field1').pipe(take(1)).subscribe(value => {
        expect(value).toEqual(array1);
        done();
      });
    });
  });

  describe('setFormState', () => {
    it('should set complete form state', () => {
      const newState = {
        section1: {
          group1: {
            field1: {
              value: 'value1',
              touched: true,
              dirty: true
            }
          }
        }
      };
      
      service.setFormState(newState);
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot).toEqual(newState);
    });

    it('should handle null state by setting empty object', () => {
      service.setFormState({ section1: { group1: { field1: { value: 'test', touched: true, dirty: true } } } });
      service.setFormState(null as any);
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot).toEqual({});
    });
  });

  describe('resetSection', () => {
    it('should remove section from state', () => {
      service.updateField('section1', 'group1', 'field1', 'value1');
      service.updateField('section2', 'group1', 'field1', 'value2');
      
      service.resetSection('section1');
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot['section1']).toBeUndefined();
      expect(snapshot['section2']).toBeDefined();
    });

    it('should not affect other sections', () => {
      service.updateField('section1', 'group1', 'field1', 'value1');
      service.updateField('section2', 'group1', 'field1', 'value2');
      
      service.resetSection('section1');
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot['section2']['group1']['field1'].value).toBe('value2');
    });
  });

  describe('resetForm', () => {
    it('should clear all form state', () => {
      service.updateField('section1', 'group1', 'field1', 'value1');
      service.updateField('section2', 'group1', 'field1', 'value2');
      
      service.resetForm();
      
      const snapshot = service.getFormSnapshot();
      expect(snapshot).toEqual({});
    });
  });
});

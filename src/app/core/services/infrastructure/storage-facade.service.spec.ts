import { TestBed } from '@angular/core/testing';
import { StorageFacade } from './storage-facade.service';

describe('StorageFacade', () => {
  let service: StorageFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageFacade);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getItem', () => {
    it('should return value when key exists', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(service.getItem('test-key')).toBe('test-value');
    });

    it('should return null when key does not exist', () => {
      expect(service.getItem('non-existent-key')).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should save value correctly', () => {
      service.setItem('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('should overwrite existing value', () => {
      service.setItem('test-key', 'old-value');
      service.setItem('test-key', 'new-value');
      expect(localStorage.getItem('test-key')).toBe('new-value');
    });
  });

  describe('removeItem', () => {
    it('should remove existing key', () => {
      localStorage.setItem('test-key', 'test-value');
      service.removeItem('test-key');
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => service.removeItem('non-existent-key')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      service.clear();
      expect(localStorage.length).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return all keys', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      const keys = service.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return empty array when no keys', () => {
      expect(service.keys()).toEqual([]);
    });
  });

  describe('getItemParsed', () => {
    it('should parse JSON value correctly', () => {
      const obj = { foo: 'bar', num: 123 };
      localStorage.setItem('json-key', JSON.stringify(obj));
      expect(service.getItemParsed('json-key')).toEqual(obj);
    });

    it('should return null for non-existent key', () => {
      expect(service.getItemParsed('non-existent')).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('invalid-json', 'not valid json');
      expect(service.getItemParsed('invalid-json')).toBeNull();
    });
  });

  describe('setItemStringified', () => {
    it('should stringify and save object', () => {
      const obj = { foo: 'bar', num: 123 };
      service.setItemStringified('json-key', obj);
      expect(localStorage.getItem('json-key')).toBe(JSON.stringify(obj));
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      service.setItemStringified('array-key', arr);
      expect(localStorage.getItem('array-key')).toBe(JSON.stringify(arr));
    });
  });

  describe('hasKey', () => {
    it('should return true when key exists', () => {
      localStorage.setItem('existing-key', 'value');
      expect(service.hasKey('existing-key')).toBe(true);
    });

    it('should return false when key does not exist', () => {
      expect(service.hasKey('non-existent-key')).toBe(false);
    });
  });
});

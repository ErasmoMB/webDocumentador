import { TestBed } from '@angular/core/testing';
import { FormularioService } from './formulario.service';

describe('FormularioService', () => {
  let service: FormularioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormularioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve form data', () => {
    const testData = {
      pagina2Data: 'test value',
      pagina3Data: { key: 'value' }
    };

    Object.keys(testData).forEach(key => {
      service[key] = testData[key];
    });

    expect(service.pagina2Data).toBe('test value');
    expect(service.pagina3Data.key).toBe('value');
  });

  it('should initialize with empty or default values', () => {
    expect(service.pagina2Data).toBeDefined();
    expect(service.pagina3Data).toBeDefined();
  });

  it('should maintain data across service instances (singleton)', () => {
    const service2 = TestBed.inject(FormularioService);
    service.pagina2Data = 'persistence test';
    
    expect(service2.pagina2Data).toBe('persistence test');
  });
});


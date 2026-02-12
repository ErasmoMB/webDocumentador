import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormularioService } from './formulario.service';
import { FormularioStoreService } from './formulario-store.service';
import { FormularioStorageService } from './formulario-storage.service';
import { FormularioImageMigrationService } from './formulario-image-migration.service';
import { ImageBackendService } from './image-backend.service';
import { FormularioMockService } from './formulario-mock.service';
import { LoggerService } from './infrastructure/logger.service';
import { FormularioDatos } from '../models/formulario.model';
import { of } from 'rxjs';

describe('FormularioService', () => {
  let service: FormularioService;
  let mockStore: jasmine.SpyObj<FormularioStoreService>;
  let mockStorage: jasmine.SpyObj<FormularioStorageService>;
  let mockImageMigration: jasmine.SpyObj<FormularioImageMigrationService>;
  let mockImageBackend: jasmine.SpyObj<ImageBackendService>;
  let mockMockService: jasmine.SpyObj<FormularioMockService>;
  let mockLogger: jasmine.SpyObj<LoggerService>;

  const createMockDatos = (): FormularioDatos => ({
    projectName: 'Test Project',
    departamento: 'Test Dept',
    provincia: 'Test Prov',
    distrito: 'Test Dist'
  } as unknown as FormularioDatos);

  beforeEach(() => {
    mockStore = jasmine.createSpyObj('FormularioStoreService', [
      'getDatos', 'getJson', 'setJson', 'setDato', 'aplicarDatos',
      'reemplazarDatos', 'mergeDatos', 'resetDatos'
    ]);
    mockStorage = jasmine.createSpyObj('FormularioStorageService', [
      'saveDatos', 'loadDatos', 'saveJson', 'loadJson', 'saveActiveRows',
      'loadActiveRows', 'clearAll'
    ]);
    mockImageMigration = jasmine.createSpyObj('FormularioImageMigrationService', [
      'executeIfNeeded'
    ]);
    mockImageBackend = jasmine.createSpyObj('ImageBackendService', [
      'deleteAllFormularioImages'
    ]);
    mockMockService = jasmine.createSpyObj('FormularioMockService', [
      'cargarMockCapitulo3'
    ]);
    mockLogger = jasmine.createSpyObj('LoggerService', [
      'info', 'warn', 'error', 'debug'
    ]);

    // Setup default returns
    mockStore.getDatos.and.returnValue(createMockDatos());
    mockStore.getJson.and.returnValue([]);
    mockStorage.loadDatos.and.returnValue(null);
    mockStorage.loadJson.and.returnValue(null);
    mockStorage.loadActiveRows.and.returnValue([]);
    mockImageMigration.executeIfNeeded.and.returnValue(Promise.resolve(false));
    mockImageBackend.deleteAllFormularioImages.and.returnValue(of({ deleted_count: 0 }));

    TestBed.configureTestingModule({
      providers: [
        FormularioService,
        { provide: FormularioStoreService, useValue: mockStore },
        { provide: FormularioStorageService, useValue: mockStorage },
        { provide: FormularioImageMigrationService, useValue: mockImageMigration },
        { provide: ImageBackendService, useValue: mockImageBackend },
        { provide: FormularioMockService, useValue: mockMockService },
        { provide: LoggerService, useValue: mockLogger }
      ]
    });

    service = TestBed.inject(FormularioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('inicialización', () => {
    it('debe cargar datos desde localStorage al iniciar', () => {
      expect(mockStorage.loadDatos).toHaveBeenCalled();
    });

    it('debe ejecutar migración de imágenes al iniciar', () => {
      expect(mockImageMigration.executeIfNeeded).toHaveBeenCalled();
    });
  });

  describe('actualizarDato', () => {
    it('debe actualizar dato en store', () => {
      service.actualizarDato('projectName', 'Nuevo Nombre');
      expect(mockStore.setDato).toHaveBeenCalledWith('projectName', 'Nuevo Nombre');
    });
  });

  describe('actualizarDatos', () => {
    it('debe aplicar datos parciales al store', () => {
      mockStore.aplicarDatos.and.returnValue(false);
      service.actualizarDatos({ projectName: 'Test' });
      expect(mockStore.aplicarDatos).toHaveBeenCalledWith({ projectName: 'Test' });
    });

    it('debe ejecutar guardado inmediato si hay tablas', fakeAsync(() => {
      mockStore.aplicarDatos.and.returnValue(true);
      service.actualizarDatos({ projectName: 'Test' });
      tick(100);
      expect(mockStorage.saveDatos).toHaveBeenCalled();
    }));
  });

  describe('reemplazarDatos', () => {
    it('debe reemplazar datos en store', () => {
      const nuevosDatos = createMockDatos();
      service.reemplazarDatos(nuevosDatos);
      expect(mockStore.reemplazarDatos).toHaveBeenCalledWith(nuevosDatos);
    });

    it('debe ignorar datos null', () => {
      service.reemplazarDatos(null as any);
      expect(mockStore.reemplazarDatos).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('debe hacer merge si reemplazar falla', () => {
      const nuevosDatos = createMockDatos();
      mockStore.reemplazarDatos.and.throwError('Error');
      service.reemplazarDatos(nuevosDatos);
      expect(mockStore.mergeDatos).toHaveBeenCalledWith(nuevosDatos);
    });
  });

  describe('obtenerDatos', () => {
    it('debe retornar datos desde store', () => {
      const expected = createMockDatos();
      mockStore.getDatos.and.returnValue(expected);
      const result = service.obtenerDatos();
      expect(result).toEqual(expected);
    });
  });

  describe('guardarJSON', () => {
    it('debe guardar JSON en store y storage', () => {
      const data = [{ nombre: 'Test' }] as any;
      service.guardarJSON(data);
      expect(mockStore.setJson).toHaveBeenCalledWith(data);
      expect(mockStorage.saveJson).toHaveBeenCalledWith(data);
    });
  });

  describe('obtenerJSON', () => {
    it('debe retornar JSON desde store', () => {
      const expected = [{ nombre: 'Test' }] as any;
      mockStore.getJson.and.returnValue(expected);
      const result = service.obtenerJSON();
      expect(result).toEqual(expected);
    });
  });

  describe('limpiarDatos', () => {
    it('debe resetear store', () => {
      service.limpiarDatos();
      expect(mockStore.resetDatos).toHaveBeenCalled();
    });

    it('debe limpiar storage', () => {
      service.limpiarDatos();
      expect(mockStorage.clearAll).toHaveBeenCalled();
    });

    it('debe intentar eliminar imágenes del backend', () => {
      mockImageBackend.deleteAllFormularioImages.and.returnValue(of({ deleted_count: 0 }));
      service.limpiarDatos();
      expect(mockImageBackend.deleteAllFormularioImages).toHaveBeenCalled();
    });
  });

  describe('filas activas tabla AISD2', () => {
    it('debe guardar filas activas', () => {
      service.guardarFilasActivasTablaAISD2(['COD1', 'COD2'], 'prefix');
      expect(mockStorage.saveActiveRows).toHaveBeenCalledWith(['COD1', 'COD2'], 'prefix');
    });

    it('debe obtener filas activas', () => {
      mockStorage.loadActiveRows.and.returnValue(['COD1']);
      const result = service.obtenerFilasActivasTablaAISD2('prefix');
      expect(result).toEqual(['COD1']);
    });
  });

  describe('getter datos', () => {
    it('debe retornar datos desde store', () => {
      const expected = createMockDatos();
      mockStore.getDatos.and.returnValue(expected);
      expect(service.datos).toEqual(expected);
    });
  });

  describe('getter jsonData', () => {
    it('debe retornar json desde store', () => {
      const expected = [{ nombre: 'Test' }] as any;
      mockStore.getJson.and.returnValue(expected);
      expect(service.jsonData).toEqual(expected);
    });
  });
});

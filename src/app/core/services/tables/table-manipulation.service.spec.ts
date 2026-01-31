import { TestBed } from '@angular/core/testing';
import { TableManipulationService } from './table-manipulation.service';
import { TableInitializationService } from './table-initialization.service';
import { TableValidationService } from './table-validation.service';
import { TableConfig } from '../table-management.service';

describe('TableManipulationService', () => {
  let service: TableManipulationService;
  let mockInitialization: jasmine.SpyObj<TableInitializationService>;
  let mockValidation: jasmine.SpyObj<TableValidationService>;

  beforeEach(() => {
    mockInitialization = jasmine.createSpyObj('TableInitializationService', [
      'inicializarTabla',
      'crearFilaPorDefecto'
    ]);
    mockValidation = jasmine.createSpyObj('TableValidationService', ['esFilaTotal']);

    TestBed.configureTestingModule({
      providers: [
        TableManipulationService,
        { provide: TableInitializationService, useValue: mockInitialization },
        { provide: TableValidationService, useValue: mockValidation }
      ]
    });

    service = TestBed.inject(TableManipulationService);
  });

  describe('agregarFila', () => {
    it('debe agregar fila al final cuando no hay fila Total', () => {
      const datos: any = {
        tabla1: [{ categoria: 'Item 1', casos: 10 }]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };
      mockInitialization.crearFilaPorDefecto.and.returnValue({ categoria: '', casos: 0 });
      mockValidation.esFilaTotal.and.returnValue(false);

      service.agregarFila(datos, config);

      expect(datos.tabla1.length).toBe(2);
    });

    it('debe inicializar tabla si no existe', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };
      mockInitialization.crearFilaPorDefecto.and.returnValue({ categoria: '', casos: 0 });

      service.agregarFila(datos, config);

      expect(mockInitialization.inicializarTabla).toHaveBeenCalled();
    });
  });

  describe('eliminarFila', () => {
    it('debe eliminar fila cuando no es Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 10 },
          { categoria: 'Item 2', casos: 20 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };
      mockValidation.esFilaTotal.and.returnValue(false);

      const resultado = service.eliminarFila(datos, config, 0);

      expect(resultado).toBe(true);
      expect(datos.tabla1.length).toBe(1);
    });

    it('no debe eliminar fila Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 10 },
          { categoria: 'Total', casos: 10 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };
      mockValidation.esFilaTotal.and.callFake((item) => item.categoria === 'Total');

      const resultado = service.eliminarFila(datos, config, 1);

      expect(resultado).toBe(false);
      expect(datos.tabla1.length).toBe(2);
    });
  });

  describe('actualizarFila', () => {
    it('debe actualizar campo de fila', () => {
      const datos: any = {
        tabla1: [{ categoria: 'Item 1', casos: 10 }]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      service.actualizarFila(datos, config, 0, 'casos', 20);

      expect(datos.tabla1[0].casos).toBe(20);
    });
  });
});

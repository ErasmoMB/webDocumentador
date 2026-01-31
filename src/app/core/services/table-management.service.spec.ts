import { TestBed } from '@angular/core/testing';
import { TableManagementService, TableConfig } from './table-management.service';

describe('TableManagementService', () => {
  let service: TableManagementService;
  let datos: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableManagementService);
    datos = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('inicializarTabla', () => {
    it('should initialize table with estructuraInicial if provided', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        estructuraInicial: [
          { nombre: 'Item 1', casos: 10 },
          { nombre: 'Item 2', casos: 20 }
        ]
      };

      service.inicializarTabla(datos, config);

      expect(datos['testTable']).toBeDefined();
      expect(datos['testTable'].length).toBe(2);
      expect(datos['testTable'][0].nombre).toBe('Item 1');
      expect(datos['testTable']).not.toBe(config.estructuraInicial); // Should be a copy
    });

    it('should initialize table with default row if no estructuraInicial', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      service.inicializarTabla(datos, config);

      expect(datos['testTable']).toBeDefined();
      expect(datos['testTable'].length).toBe(1);
      expect(datos['testTable'][0].nombre).toBe('');
      expect(datos['testTable'][0].casos).toBe(0);
    });

    it('should include campoPorcentaje if provided', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      service.inicializarTabla(datos, config);

      // Nota: porcentaje se calcula dinámicamente, no se crea por defecto
      expect(datos['testTable'][0].porcentaje).toBeUndefined();
    });

    it('should not initialize if table already exists', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        estructuraInicial: [{ nombre: 'Existing', casos: 5 }]
      };

      datos['testTable'] = [{ nombre: 'Original', casos: 10 }];
      service.inicializarTabla(datos, config);

      expect(datos['testTable'][0].nombre).toBe('Original');
    });
  });

  describe('agregarFila', () => {
    it('should add row to table', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      service.inicializarTabla(datos, config);
      service.agregarFila(datos, config);

      expect(datos['testTable'].length).toBe(2);
    });

    it('should insert row before total row if exists', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'Total', casos: 10 }
      ];

      service.agregarFila(datos, config);

      expect(datos['testTable'].length).toBe(3);
      expect(datos['testTable'][1].nombre).toBe(''); // New row before total
      expect(datos['testTable'][2].nombre).toBe('Total');
    });

    it('should add row at end if no total row', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [{ nombre: 'Item 1', casos: 10 }];
      service.agregarFila(datos, config);

      expect(datos['testTable'].length).toBe(2);
      expect(datos['testTable'][1].nombre).toBe('');
    });

    it('should use nuevaFila if provided', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      service.inicializarTabla(datos, config);
      service.agregarFila(datos, config, { nombre: 'Custom', casos: 99 });

      expect(datos['testTable'][1].nombre).toBe('Custom');
      expect(datos['testTable'][1].casos).toBe(99);
    });

    it('should initialize table if it does not exist', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      service.agregarFila(datos, config);

      expect(datos['testTable']).toBeDefined();
      expect(datos['testTable'].length).toBeGreaterThan(0);
    });
  });

  describe('eliminarFila', () => {
    it('should remove row at index', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'Item 2', casos: 20 }
      ];

      const result = service.eliminarFila(datos, config, 0);

      expect(result).toBe(true);
      expect(datos['testTable'].length).toBe(1);
      expect(datos['testTable'][0].nombre).toBe('Item 2');
    });

    it('should not remove total row', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'Total', casos: 10 }
      ];

      const result = service.eliminarFila(datos, config, 1);

      expect(result).toBe(false);
      expect(datos['testTable'].length).toBe(2);
    });

    it('should return false if table is empty', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [];
      const result = service.eliminarFila(datos, config, 0);

      expect(result).toBe(false);
    });

    it('should handle case-insensitive total detection', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'TOTAL', casos: 10 }
      ];

      const result = service.eliminarFila(datos, config, 1);
      expect(result).toBe(false);
    });
  });

  describe('actualizarFila', () => {
    it('should update field value', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10 }
      ];

      service.actualizarFila(datos, config, 0, 'casos', 99);

      expect(datos['testTable'][0].casos).toBe(99);
    });

    it('should initialize table if it does not exist', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos'
      };

      service.actualizarFila(datos, config, 0, 'casos', 99);

      expect(datos['testTable']).toBeDefined();
    });

    it('should not calculate percentages if autoCalcular is false', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos'],
        campoPorcentaje: 'porcentaje'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 10, porcentaje: '0,00 %' }
      ];

      spyOn(service, 'calcularPorcentajes');
      service.actualizarFila(datos, config, 0, 'casos', 99, false);

      expect(service.calcularPorcentajes).not.toHaveBeenCalled();
    });
  });

  describe('calcularPorcentajes', () => {
    it('should calculate percentages correctly', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 30, porcentaje: '0,00 %' },
        { nombre: 'Item 2', casos: 70, porcentaje: '0,00 %' },
        { nombre: 'Total', casos: 100 }
      ];

      service.calcularPorcentajes(datos, config);

      expect(datos['testTable'][0].porcentaje).toBe('30,00 %');
      expect(datos['testTable'][1].porcentaje).toBe('70,00 %');
    });

    it('should calculate total from items if total row has 0', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 25, porcentaje: '0,00 %' },
        { nombre: 'Item 2', casos: 75, porcentaje: '0,00 %' },
        { nombre: 'Total', casos: 0 }
      ];

      service.calcularPorcentajes(datos, config);

      expect(datos['testTable'][0].porcentaje).toBe('25,00 %');
      expect(datos['testTable'][1].porcentaje).toBe('75,00 %');
    });

    it('should handle zero total gracefully', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 0, porcentaje: '0,00 %' },
        { nombre: 'Total', casos: 0 }
      ];

      service.calcularPorcentajes(datos, config);

      expect(datos['testTable'][0].porcentaje).toBe('0,00 %');
    });

    it('should not modify total row', () => {
      const config: TableConfig = {
        tablaKey: 'testTable',
        totalKey: 'nombre',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      datos['testTable'] = [
        { nombre: 'Item 1', casos: 50, porcentaje: '0,00 %' },
        { nombre: 'Total', casos: 50, porcentaje: '0,00 %' }
      ];

      service.calcularPorcentajes(datos, config);

      expect(datos['testTable'][1].porcentaje).toBe('0,00 %');
    });
  });
});

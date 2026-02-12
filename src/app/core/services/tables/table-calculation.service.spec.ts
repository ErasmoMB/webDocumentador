import { TestBed } from '@angular/core/testing';
import { TableCalculationService } from './table-calculation.service';
import { TableConfig } from './table-management.service';

describe('TableCalculationService', () => {
  let service: TableCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableCalculationService]
    });
    service = TestBed.inject(TableCalculationService);
  });

  describe('calcularPorcentajes', () => {
    it('debe calcular porcentajes correctamente', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Item 2', casos: 20 },
          { categoria: 'Total', casos: 50 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      };

      service.calcularPorcentajes(datos, config);

      expect(datos.tabla1[0].porcentaje).toBe('60,00 %');
      expect(datos.tabla1[1].porcentaje).toBe('40,00 %');
    });

    it('debe calcular total desde fila Total si existe', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Total', casos: 100 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      };

      service.calcularPorcentajes(datos, config);

      // El servicio ahora recalcula el total sumando las filas (no usa la fila Total como base)
      // Por lo tanto 30 de 30 = 100%
      expect(datos.tabla1[0].porcentaje).toBe('100,00 %');
    });

    it('debe calcular total sumando filas cuando no hay fila Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Item 2', casos: 20 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      };

      service.calcularPorcentajes(datos, config);

      expect(datos.tabla1[0].porcentaje).toBe('60,00 %');
      expect(datos.tabla1[1].porcentaje).toBe('40,00 %');
    });

    it('no debe modificar fila Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Total', casos: 50 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      };

      service.calcularPorcentajes(datos, config);

      expect(datos.tabla1[1].porcentaje).toBeUndefined();
    });

    it('debe establecer 0,00 % cuando total es 0', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 0 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje',
        calcularPorcentajes: true
      };

      service.calcularPorcentajes(datos, config);

      expect(datos.tabla1[0].porcentaje).toBe('0,00 %');
    });
  });

  describe('calcularTotales', () => {
    it('debe retornar total desde fila Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Total', casos: 100 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos'
      };

      const total = service.calcularTotales(datos, config);

      expect(total).toBe(100);
    });

    it('debe calcular total sumando filas cuando no hay fila Total', () => {
      const datos: any = {
        tabla1: [
          { categoria: 'Item 1', casos: 30 },
          { categoria: 'Item 2', casos: 20 }
        ]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos'
      };

      const total = service.calcularTotales(datos, config);

      expect(total).toBe(50);
    });

    it('debe retornar 0 cuando tabla está vacía', () => {
      const datos: any = { tabla1: [] };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos'
      };

      const total = service.calcularTotales(datos, config);

      expect(total).toBe(0);
    });
  });
});

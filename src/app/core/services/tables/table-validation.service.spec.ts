import { TestBed } from '@angular/core/testing';
import { TableValidationService } from './table-validation.service';
import { TableConfig } from './table-management.service';

describe('TableValidationService', () => {
  let service: TableValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableValidationService]
    });
    service = TestBed.inject(TableValidationService);
  });

  describe('validarEstructura', () => {
    it('debe retornar true cuando estructura coincide', () => {
      const tabla = [{ categoria: 'Item 1', casos: 10 }];
      const estructura = [{ categoria: 'Item 1', casos: 0 }];

      const resultado = service.validarEstructura(tabla, estructura);

      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando campos no coinciden', () => {
      const tabla = [{ categoria: 'Item 1' }];
      const estructura = [{ categoria: 'Item 1', casos: 0 }];

      const resultado = service.validarEstructura(tabla, estructura);

      expect(resultado).toBe(false);
    });

    it('debe retornar true cuando estructura está vacía', () => {
      const tabla = [{ categoria: 'Item 1' }];
      const estructura: any[] = [];

      const resultado = service.validarEstructura(tabla, estructura);

      expect(resultado).toBe(true);
    });

    it('debe retornar false cuando tabla está vacía y estructura no', () => {
      const tabla: any[] = [];
      const estructura = [{ categoria: 'Item 1' }];

      const resultado = service.validarEstructura(tabla, estructura);

      expect(resultado).toBe(false);
    });
  });

  describe('validarDatos', () => {
    it('debe retornar válido para tabla con datos correctos', () => {
      const tabla = [
        { categoria: 'Item 1', casos: 10 },
        { categoria: 'Item 2', casos: 20 }
      ];
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos'
      };

      const resultado = service.validarDatos(tabla, config);

      expect(resultado.isValid).toBe(true);
      expect(resultado.errors.length).toBe(0);
    });

    it('debe retornar error cuando tabla no es array', () => {
      const tabla: any = 'no es array';
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      const resultado = service.validarDatos(tabla, config);

      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThan(0);
    });

    it('debe retornar warning cuando tabla está vacía', () => {
      const tabla: any[] = [];
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      const resultado = service.validarDatos(tabla, config);

      expect(resultado.isValid).toBe(true);
      expect(resultado.warnings.length).toBeGreaterThan(0);
    });

    it('debe detectar valores no numéricos en campoTotal', () => {
      const tabla = [
        { categoria: 'Item 1', casos: 'no es número' }
      ];
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos'
      };

      const resultado = service.validarDatos(tabla, config);

      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.length).toBeGreaterThan(0);
    });
  });

  describe('esFilaTotal', () => {
    it('debe retornar true para fila con "total" en totalKey', () => {
      const item = { categoria: 'Total', casos: 100 };
      const resultado = service.esFilaTotal(item, 'categoria');

      expect(resultado).toBe(true);
    });

    it('debe retornar false para fila sin "total"', () => {
      const item = { categoria: 'Item 1', casos: 10 };
      const resultado = service.esFilaTotal(item, 'categoria');

      expect(resultado).toBe(false);
    });

    it('debe retornar false cuando item es null', () => {
      const resultado = service.esFilaTotal(null, 'categoria');

      expect(resultado).toBe(false);
    });
  });
});

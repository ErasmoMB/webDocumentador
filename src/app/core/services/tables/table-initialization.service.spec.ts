import { TestBed } from '@angular/core/testing';
import { TableInitializationService } from './table-initialization.service';
import { TableConfig } from '../table-management.service';

describe('TableInitializationService', () => {
  let service: TableInitializationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableInitializationService]
    });
    service = TestBed.inject(TableInitializationService);
  });

  describe('inicializarTabla', () => {
    it('debe inicializar tabla con estructura inicial cuando está definida', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        estructuraInicial: [
          { categoria: 'Item 1', casos: 0 },
          { categoria: 'Item 2', casos: 0 }
        ]
      };

      service.inicializarTabla(datos, config);

      expect(datos.tabla1).toEqual(config.estructuraInicial);
    });

    it('debe crear fila por defecto cuando no hay estructura inicial', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      service.inicializarTabla(datos, config);

      expect(datos.tabla1).toBeDefined();
      expect(datos.tabla1.length).toBe(1);
      expect(datos.tabla1[0].categoria).toBe('');
      expect(datos.tabla1[0].casos).toBe(0);
      // Nota: porcentaje se calcula dinámicamente, no se crea por defecto
      expect(datos.tabla1[0].porcentaje).toBeUndefined();
    });

    it('no debe sobrescribir tabla existente con datos', () => {
      const datos: any = {
        tabla1: [{ categoria: 'Item existente', casos: 10 }]
      };
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      service.inicializarTabla(datos, config);

      expect(datos.tabla1.length).toBe(1);
      expect(datos.tabla1[0].categoria).toBe('Item existente');
    });
  });

  describe('verificarSiNecesitaReinicializarConEstructura', () => {
    it('debe retornar false cuando no hay estructura inicial', () => {
      const resultado = service.verificarSiNecesitaReinicializarConEstructura([], undefined);
      expect(resultado).toBe(false);
    });

    it('debe retornar true cuando tabla no existe', () => {
      const estructura = [{ categoria: 'Item 1' }];
      const resultado = service.verificarSiNecesitaReinicializarConEstructura(undefined, estructura);
      expect(resultado).toBe(true);
    });
  });

  describe('crearFilaPorDefecto', () => {
    it('debe crear fila con campos básicos', () => {
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        campoPorcentaje: 'porcentaje'
      };

      const fila = service.crearFilaPorDefecto(config);

      expect(fila.categoria).toBe('');
      expect(fila.casos).toBe(0);
      // Nota: porcentaje se calcula dinámicamente, no se crea por defecto
      expect(fila.porcentaje).toBeUndefined();
    });
  });
});

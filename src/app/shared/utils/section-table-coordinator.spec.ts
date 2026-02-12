import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { SectionTableCoordinator } from './section-table-coordinator';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';

describe('SectionTableCoordinator', () => {
  let coordinator: SectionTableCoordinator;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
    coordinator = new SectionTableCoordinator();
  });

  describe('createTableConfig', () => {
    it('debe crear configuración de tabla con fallback', () => {
      const fallbackConfig: Partial<TableConfig> = {
        tablaKey: 'tabla1',
        totalKey: 'total',
        campoTotal: 'casos'
      };

      const config = coordinator.createTableConfig(injector, '3.1.2', 'tabla1', fallbackConfig);

      expect(config).toBeDefined();
      expect(config.tablaKey).toBe('tabla1');
    });

    it('debe crear configuración sin fallback', () => {
      const config = coordinator.createTableConfig(injector, '3.1.2', 'tabla1');

      expect(config).toBeDefined();
    });

    it('debe manejar injector undefined', () => {
      const config = coordinator.createTableConfig(undefined, '3.1.2', 'tabla1', {
        tablaKey: 'tabla1'
      });

      expect(config).toBeDefined();
    });
  });

  describe('createTableHandler', () => {
    let mockGetDatos: jasmine.Spy;
    let mockGetSeccionId: jasmine.Spy;
    let mockSetDatos: jasmine.Spy;
    let mockOnFieldChange: jasmine.Spy;
    let mockDetectChanges: jasmine.Spy;
    let mockAfterChange: jasmine.Spy;

    beforeEach(() => {
      mockGetDatos = jasmine.createSpy('getDatos').and.returnValue({ tabla1: [] });
      mockGetSeccionId = jasmine.createSpy('getSeccionId').and.returnValue('3.1.2');
      mockSetDatos = jasmine.createSpy('setDatos');
      mockOnFieldChange = jasmine.createSpy('onFieldChange');
      mockDetectChanges = jasmine.createSpy('detectChanges');
      mockAfterChange = jasmine.createSpy('afterChange');
    });

    it('debe crear handler de tabla con configuración estática', () => {
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'total',
        campoTotal: 'casos'
      };

      const handler = coordinator.createTableHandler(
        injector,
        mockGetDatos,
        mockGetSeccionId,
        mockSetDatos,
        mockOnFieldChange,
        mockDetectChanges,
        'tabla1',
        config
      );

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('debe crear handler de tabla con configuración dinámica', () => {
      const configFn = (): TableConfig => ({
        tablaKey: 'tabla1',
        totalKey: 'total',
        campoTotal: 'casos'
      });

      const handler = coordinator.createTableHandler(
        injector,
        mockGetDatos,
        mockGetSeccionId,
        mockSetDatos,
        mockOnFieldChange,
        mockDetectChanges,
        'tabla1',
        configFn
      );

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('debe incluir afterChange callback cuando se proporciona', () => {
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'total',
        campoTotal: 'casos'
      };

      const handler = coordinator.createTableHandler(
        injector,
        mockGetDatos,
        mockGetSeccionId,
        mockSetDatos,
        mockOnFieldChange,
        mockDetectChanges,
        'tabla1',
        config,
        mockAfterChange
      );

      expect(handler).toBeDefined();
    });

    it('debe manejar injector undefined', () => {
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'total',
        campoTotal: 'casos'
      };

      const handler = coordinator.createTableHandler(
        undefined,
        mockGetDatos,
        mockGetSeccionId,
        mockSetDatos,
        mockOnFieldChange,
        mockDetectChanges,
        'tabla1',
        config
      );

      expect(handler).toBeDefined();
    });
  });
});

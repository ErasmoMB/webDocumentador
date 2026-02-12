import { TestBed } from '@angular/core/testing';
import { TableManagementFacade } from './table-management.facade';
import { TableInitializationService } from './table-initialization.service';
import { TableCalculationService } from './table-calculation.service';
import { TableValidationService } from './table-validation.service';
import { TableManipulationService } from './table-manipulation.service';
import { TableQueryService } from './table-query.service';
import { TableCalculationStrategyService } from './table-calculation-strategy.service';
import { TableConfig } from './table-management.service';

describe('TableManagementFacade', () => {
  let facade: TableManagementFacade;
  let mockInitialization: jasmine.SpyObj<TableInitializationService>;
  let mockCalculation: jasmine.SpyObj<TableCalculationService>;
  let mockValidation: jasmine.SpyObj<TableValidationService>;
  let mockManipulation: jasmine.SpyObj<TableManipulationService>;
  let mockQuery: jasmine.SpyObj<TableQueryService>;
  let mockCalculationStrategy: jasmine.SpyObj<TableCalculationStrategyService>;

  beforeEach(() => {
    mockInitialization = jasmine.createSpyObj('TableInitializationService', [
      'inicializarTabla'
    ]);
    mockCalculation = jasmine.createSpyObj('TableCalculationService', [
      'calcularPorcentajes',
      'calcularYActualizarTotales',
      'calcularTotalesYPorcentajes'
    ]);
    mockValidation = jasmine.createSpyObj('TableValidationService', [
      'validarEstructura',
      'validarDatos'
    ]);
    mockManipulation = jasmine.createSpyObj('TableManipulationService', [
      'agregarFila',
      'eliminarFila',
      'actualizarFila'
    ]);
    mockQuery = jasmine.createSpyObj('TableQueryService', [
      'obtenerValorDeTabla',
      'obtenerValorDeTablaPorIndicador',
      'obtenerValorDeTablaPorCategoria'
    ]);
    mockCalculationStrategy = jasmine.createSpyObj('TableCalculationStrategyService', [
      'campoAfectaCalculos',
      'obtenerTipoCalculo'
    ]);
    // Default: retornar 'porcentajes' como tipo de cálculo
    mockCalculationStrategy.campoAfectaCalculos.and.returnValue(true);
    mockCalculationStrategy.obtenerTipoCalculo.and.returnValue('porcentajes');

    TestBed.configureTestingModule({
      providers: [
        TableManagementFacade,
        { provide: TableInitializationService, useValue: mockInitialization },
        { provide: TableCalculationService, useValue: mockCalculation },
        { provide: TableValidationService, useValue: mockValidation },
        { provide: TableManipulationService, useValue: mockManipulation },
        { provide: TableQueryService, useValue: mockQuery },
        { provide: TableCalculationStrategyService, useValue: mockCalculationStrategy }
      ]
    });

    facade = TestBed.inject(TableManagementFacade);
  });

  describe('inicializarTabla', () => {
    it('debe delegar a TableInitializationService', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      facade.inicializarTabla(datos, config);

      expect(mockInitialization.inicializarTabla).toHaveBeenCalledWith(datos, config);
    });
  });

  describe('agregarFila', () => {
    it('debe delegar a TableManipulationService', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      facade.agregarFila(datos, config);

      expect(mockManipulation.agregarFila).toHaveBeenCalledWith(datos, config, undefined);
    });
  });

  describe('actualizarFila', () => {
    it('debe delegar a TableManipulationService y calcular porcentajes si autoCalcular es true', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        campoTotal: 'casos',
        calcularPorcentajes: true,
        camposParaCalcular: ['casos']
      };

      facade.actualizarFila(datos, config, 0, 'casos', 10, true);

      expect(mockManipulation.actualizarFila).toHaveBeenCalled();
      expect(mockCalculation.calcularPorcentajes).toHaveBeenCalled();
    });

    it('no debe calcular porcentajes si autoCalcular es false', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      facade.actualizarFila(datos, config, 0, 'casos', 10, false);

      expect(mockManipulation.actualizarFila).toHaveBeenCalled();
      expect(mockCalculation.calcularPorcentajes).not.toHaveBeenCalled();
    });
  });

  describe('calcularPorcentajes', () => {
    it('debe delegar a TableCalculationService', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria'
      };

      facade.calcularPorcentajes(datos, config);

      expect(mockCalculation.calcularPorcentajes).toHaveBeenCalledWith(datos, config);
    });
  });

  describe('obtenerValorDeTabla', () => {
    it('debe delegar a TableQueryService', () => {
      const datos: any = {};
      mockQuery.obtenerValorDeTabla.and.returnValue('10');

      const resultado = facade.obtenerValorDeTabla(
        datos,
        'tabla1',
        'categoria',
        'Item 1',
        'casos'
      );

      expect(mockQuery.obtenerValorDeTabla).toHaveBeenCalled();
      expect(resultado).toBe('10');
    });
  });

  describe('inicializarYCalcular', () => {
    it('debe inicializar y calcular porcentajes cuando está configurado', () => {
      const datos: any = {};
      const config: TableConfig = {
        tablaKey: 'tabla1',
        totalKey: 'categoria',
        calcularPorcentajes: true
      };

      facade.inicializarYCalcular(datos, config);

      expect(mockInitialization.inicializarTabla).toHaveBeenCalled();
      expect(mockCalculation.calcularPorcentajes).toHaveBeenCalled();
    });
  });

  describe('validarEstructura', () => {
    it('debe delegar a TableValidationService', () => {
      const tabla: any[] = [];
      const estructura: any[] = [];
      mockValidation.validarEstructura.and.returnValue(true);

      const resultado = facade.validarEstructura(tabla, estructura);

      expect(mockValidation.validarEstructura).toHaveBeenCalled();
      expect(resultado).toBe(true);
    });
  });
});

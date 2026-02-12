import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { DynamicTableComponent, TableColumn } from './dynamic-table.component';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { BackendDataMapperService } from 'src/app/core/services/backend/backend-data-mapper.service';
import { TableConfigMetadata, TableMetadata } from 'src/app/core/models/table-metadata.model';

describe('DynamicTableComponent', () => {
  let component: DynamicTableComponent;
  let fixture: ComponentFixture<DynamicTableComponent>;
  let tableService: jasmine.SpyObj<TableManagementFacade>;
  let formChangeService: jasmine.SpyObj<FormChangeService>;
  let backendDataMapper: jasmine.SpyObj<BackendDataMapperService>;
  let cdRef: ChangeDetectorRef;

  const mockTableConfig: TableConfig = {
    tablaKey: 'testTable',
    totalKey: 'nombre',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    estructuraInicial: [
      { nombre: 'Item 1', casos: 10, porcentaje: '0,00 %' }
    ]
  };

  const mockTableConfigMetadata: TableConfigMetadata = {
    totalKey: 'nombre',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    estructuraInicial: [
      { nombre: 'Item 1', casos: 10, porcentaje: '0,00 %' }
    ]
  };

  const mockColumns: TableColumn[] = [
    { field: 'nombre', label: 'Nombre', dataType: 'string' },
    { field: 'casos', label: 'Casos', dataType: 'number' },
    { field: 'porcentaje', label: 'Porcentaje', dataType: 'string', readonly: true }
  ];

  beforeEach(async () => {
    const tableServiceSpy = jasmine.createSpyObj('TableManagementFacade', [
      'inicializarTabla',
      'agregarFila',
      'eliminarFila',
      'actualizarFila',
      'calcularTotalesYPorcentajes',
      'calcularPorcentajes',
      'calcularYActualizarTotales'
    ]);

    const formChangeServiceSpy = jasmine.createSpyObj('FormChangeService', [
      'persistFields'
    ]);

    const backendDataMapperSpy = jasmine.createSpyObj('BackendDataMapperService', [
      'getTableMetadata'
    ]);

    await TestBed.configureTestingModule({
      imports: [DynamicTableComponent],
      providers: [
        { provide: TableManagementFacade, useValue: tableServiceSpy },
        { provide: FormChangeService, useValue: formChangeServiceSpy },
        { provide: BackendDataMapperService, useValue: backendDataMapperSpy },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicTableComponent);
    component = fixture.componentInstance;
    tableService = TestBed.inject(TableManagementFacade) as jasmine.SpyObj<TableManagementFacade>;
    formChangeService = TestBed.inject(FormChangeService) as jasmine.SpyObj<FormChangeService>;
    backendDataMapper = TestBed.inject(BackendDataMapperService) as jasmine.SpyObj<BackendDataMapperService>;
    cdRef = TestBed.inject(ChangeDetectorRef);

    // Setup default inputs
    component.config = mockTableConfig;
    component.columns = mockColumns;
    component.datos = {};
    component.sectionId = 'test-section';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should auto-configure from metadata if available', fakeAsync(() => {
      const mockMetadata: TableMetadata = {
        sectionKey: 'seccion6_aisd',
        fieldName: 'testTable',
        tablaKey: 'testTable',
        endpoint: '/test/endpoint',
        editable: true,
        columns: mockColumns,
        tableConfig: mockTableConfigMetadata
      };

      backendDataMapper.getTableMetadata.and.returnValue(mockMetadata);
      component.fieldName = 'testTable';
      component.sectionId = '3.1.4.A.1.2';
      // Limpiar config para forzar auto-configuración desde metadata
      component.config = undefined as any;
      component.columns = [];

      component.ngOnInit();

      // drenar setTimeout(0) y el setTimeout(100) de inicialización
      tick(0);
      tick(150);

      expect(backendDataMapper.getTableMetadata).toHaveBeenCalled();
    }));

    it('should verify and initialize table', fakeAsync(() => {
      component.datos = {};
      component.config = mockTableConfig;

      component.ngOnInit();

      tick(0);
      expect(tableService.inicializarTabla).toHaveBeenCalled();

      // drenar el setTimeout(100) interno
      tick(150);
    }));

    it('should not initialize if table already has data', fakeAsync(() => {
      component.datos = {
        // Debe coincidir con la estructuraInicial para que NO reinicialice
        testTable: [{ nombre: 'Item 1', casos: 5 }]
      };

      component.ngOnInit();

      tick(0);
      // Should not call inicializarTabla if data exists
      expect(tableService.inicializarTabla).not.toHaveBeenCalled();

      // asegurar que no queden timers pendientes
      tick(150);
    }));
  });

  describe('getTableData', () => {
    it('should return cached tableData (no side effects)', () => {
      const testData = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'Item 2', casos: 20 }
      ];

      component.tableData = testData;
      expect(component.getTableData()).toEqual(testData);
    });

    it('should return empty array if tableData is undefined', () => {
      component.tableData = undefined as any;
      expect(component.getTableData()).toEqual([]);
    });

    it('should use cached data if table key has not changed', () => {
      const testData = [{ nombre: 'Item 1', casos: 10 }];
      component.tableData = testData;

      const result1 = component.getTableData();
      const result2 = component.getTableData();

      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Should be same reference (cached)
    });

    it('should update tableData from datos on ngOnChanges', () => {
      const testData = [
        { nombre: 'Item 1', casos: 10 },
        { nombre: 'Item 2', casos: 20 }
      ];

      component.config = { ...mockTableConfig, estructuraInicial: [] };
      component.tablaKey = 'testTable';
      component.datos = { testTable: testData };

      component.ngOnChanges({
        config: new SimpleChange(null, component.config, true),
        tablaKey: new SimpleChange('', component.tablaKey, true),
        datos: new SimpleChange(null, component.datos, true)
      } as any);

      expect(component.tableData).toEqual(testData);
    });
  });

  describe('onFieldChange', () => {
    it('should update field value via table service', () => {
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      // Los inputs HTML devuelven strings, el componente los normaliza a número si dataType es 'number'
      component.onFieldChange(0, 'casos', '99');

      expect(tableService.actualizarFila).toHaveBeenCalledWith(
        component.datos,
        jasmine.any(Object),
        0,
        'casos',
        99, // El componente normaliza el string '99' a número 99
        false
      );
    });

    it('should persist changes via FormChangeService', () => {
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      component.onFieldChange(0, 'casos', 99);

      expect(formChangeService.persistFields).toHaveBeenCalled();
    });

    it('should emit dataChange event', () => {
      spyOn(component.dataChange, 'emit');
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      component.onFieldChange(0, 'casos', 99);

      expect(component.dataChange.emit).toHaveBeenCalled();
    });

    it('should emit tableUpdated event', () => {
      spyOn(component.tableUpdated, 'emit');
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      component.onFieldChange(0, 'casos', 99);

      expect(component.tableUpdated.emit).toHaveBeenCalled();
    });

    it('should use customFieldChangeHandler if provided', () => {
      const customHandler = jasmine.createSpy('customHandler');
      component.customFieldChangeHandler = customHandler;
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      // Los inputs HTML devuelven strings, el componente los normaliza a número si dataType es 'number'
      component.onFieldChange(0, 'casos', '99');

      expect(customHandler).toHaveBeenCalledWith(0, 'casos', 99); // Normalizado a número
      expect(tableService.actualizarFila).not.toHaveBeenCalled();
    });

    it('should validate and normalize number values', () => {
      component.columns = [
        { field: 'casos', label: 'Casos', type: 'number', dataType: 'number' }
      ];
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;

      component.onFieldChange(0, 'casos', '99');

      expect(tableService.actualizarFila).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.any(Object),
        0,
        'casos',
        99, // Should be converted to number
        false
      );
    });

    it('should validate percentage values (0-100)', () => {
      component.columns = [
        { field: 'porcentaje', label: 'Porcentaje', type: 'number', dataType: 'percentage' }
      ];
      component.datos = { testTable: [{ nombre: 'Item 1', porcentaje: 10 }] };
      component.config = mockTableConfig;

      component.onFieldChange(0, 'porcentaje', 150); // Should be clamped to 100

      expect(tableService.actualizarFila).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.any(Object),
        0,
        'porcentaje',
        100,
        false
      );
    });
  });

  describe('onAdd', () => {
    it('should add row via table service', () => {
      component.datos = { testTable: [] };
      component.config = mockTableConfig;

      component.onAdd();

      expect(tableService.agregarFila).toHaveBeenCalled();
    });

    it('should persist changes after adding row', () => {
      component.datos = { testTable: [] };
      component.config = mockTableConfig;

      component.onAdd();

      expect(formChangeService.persistFields).toHaveBeenCalled();
    });

    it('should emit events after adding row', () => {
      spyOn(component.dataChange, 'emit');
      spyOn(component.tableUpdated, 'emit');
      component.datos = { testTable: [] };
      component.config = mockTableConfig;

      component.onAdd();

      expect(component.dataChange.emit).toHaveBeenCalled();
      expect(component.tableUpdated.emit).toHaveBeenCalled();
    });
  });

  describe('onDelete', () => {
    it('should delete row via table service', () => {
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;
      tableService.eliminarFila.and.returnValue(true);

      component.onDelete(0);

      expect(tableService.eliminarFila).toHaveBeenCalledWith(
        component.datos,
        jasmine.any(Object),
        0
      );
    });

    it('should not persist if deletion failed', () => {
      component.datos = { testTable: [{ nombre: 'Total', casos: 10 }] };
      component.config = mockTableConfig;
      tableService.eliminarFila.and.returnValue(false);

      component.onDelete(0);

      expect(formChangeService.persistFields).not.toHaveBeenCalled();
    });

    it('should persist if deletion succeeded', () => {
      component.datos = { testTable: [{ nombre: 'Item 1', casos: 10 }] };
      component.config = mockTableConfig;
      tableService.eliminarFila.and.returnValue(true);

      component.onDelete(0);

      expect(formChangeService.persistFields).toHaveBeenCalled();
    });
  });

  describe('canDelete', () => {
    it('should return false if showDeleteButton is false', () => {
      component.showDeleteButton = false;
      component.data = [{ nombre: 'Item 1', casos: 10 }];

      const result = component.canDelete(0);

      expect(result).toBe(false);
    });

    it('should return false for total rows', () => {
      component.showDeleteButton = true;
      component.data = [{ nombre: 'Total', casos: 10 }];

      const result = component.canDelete(0);

      expect(result).toBe(false);
    });

    it('should return true for regular rows', () => {
      component.showDeleteButton = true;
      component.data = [{ nombre: 'Item 1', casos: 10 }];

      const result = component.canDelete(0);

      expect(result).toBe(true);
    });

    it('should return false if table is empty', () => {
      component.showDeleteButton = true;
      component.data = [];

      const result = component.canDelete(0);

      expect(result).toBe(false);
    });
  });

  describe('initializeTable', () => {
    it('should initialize table via table service', () => {
      component.datos = {};
      component.config = mockTableConfig;

      component.initializeTable();

      expect(tableService.inicializarTabla).toHaveBeenCalled();
    });

    it('should persist after initialization', () => {
      component.datos = {};
      component.config = mockTableConfig;

      component.initializeTable();

      expect(formChangeService.persistFields).toHaveBeenCalled();
    });
  });

  describe('getFormattedValue', () => {
    it('should return formatted value if formatter exists', () => {
      const formatter = (value: number) => `$${value}`;
      const column: TableColumn = {
        field: 'price',
        label: 'Price',
        formatter: formatter
      };

      const item = { price: 10 };
      const result = component.getFormattedValue(item, column);

      expect(result).toBe('$10');
    });

    it('should return string value if no formatter', () => {
      const column: TableColumn = {
        field: 'name',
        label: 'Name'
      };

      const item = { name: 'Test' };
      const result = component.getFormattedValue(item, column);

      expect(result).toBe('Test');
    });

    it('should return empty string for null/undefined values', () => {
      const column: TableColumn = {
        field: 'name',
        label: 'Name'
      };

      const item = { name: null };
      const result = component.getFormattedValue(item, column);

      expect(result).toBe('');
    });
  });

  describe('trackByIndex', () => {
    it('should return index for tracking', () => {
      const result = component.trackByIndex(5);
      expect(result).toBe(5);
    });
  });
});

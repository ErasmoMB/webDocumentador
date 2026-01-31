import { TestBed } from '@angular/core/testing';
import { FieldMappingFacade } from './field-mapping.facade';
import { FieldMappingRegistryService } from './field-mapping-registry.service';
import { FieldDataSourceService } from './field-data-source.service';
import { FieldDataLoaderService } from './field-data-loader.service';
import { FieldTestDataService } from './field-test-data.service';
import { FieldMapping } from './field-mapping.types';
import { of } from 'rxjs';

describe('FieldMappingFacade', () => {
  let facade: FieldMappingFacade;
  let mockRegistry: jasmine.SpyObj<FieldMappingRegistryService>;
  let mockDataSource: jasmine.SpyObj<FieldDataSourceService>;
  let mockLoader: jasmine.SpyObj<FieldDataLoaderService>;
  let mockTestData: jasmine.SpyObj<FieldTestDataService>;

  beforeEach(() => {
    mockRegistry = jasmine.createSpyObj('FieldMappingRegistryService', ['getMapping']);
    mockDataSource = jasmine.createSpyObj('FieldDataSourceService', ['getDataSourceType']);
    mockLoader = jasmine.createSpyObj('FieldDataLoaderService', ['loadDataForField']);
    mockTestData = jasmine.createSpyObj('FieldTestDataService', [
      'markFieldAsTestData',
      'clearTestDataFields',
      'isTestDataField',
      'markFieldsAsTestData',
      'hasAnyTestDataForSection',
      'getFieldsForSection'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FieldMappingFacade,
        { provide: FieldMappingRegistryService, useValue: mockRegistry },
        { provide: FieldDataSourceService, useValue: mockDataSource },
        { provide: FieldDataLoaderService, useValue: mockLoader },
        { provide: FieldTestDataService, useValue: mockTestData }
      ]
    });

    facade = TestBed.inject(FieldMappingFacade);
  });

  describe('getMapping', () => {
    it('debe delegar a FieldMappingRegistryService', () => {
      const mapping: FieldMapping = { fieldName: 'campo1', dataSource: 'manual' };
      mockRegistry.getMapping.and.returnValue(mapping);

      const resultado = facade.getMapping('campo1');

      expect(mockRegistry.getMapping).toHaveBeenCalledWith('campo1');
      expect(resultado).toBe(mapping);
    });
  });

  describe('getDataSourceType', () => {
    it('debe delegar a FieldDataSourceService', () => {
      mockDataSource.getDataSourceType.and.returnValue('backend');

      const resultado = facade.getDataSourceType('campo1');

      expect(mockDataSource.getDataSourceType).toHaveBeenCalledWith('campo1');
      expect(resultado).toBe('backend');
    });
  });

  describe('loadDataForField', () => {
    it('debe delegar a FieldDataLoaderService', () => {
      mockLoader.loadDataForField.and.returnValue(of({ valor: 'test' }));

      const resultado = facade.loadDataForField('campo1', '3.1.2');

      expect(mockLoader.loadDataForField).toHaveBeenCalledWith('campo1', '3.1.2');
      resultado.subscribe(data => {
        expect(data.valor).toBe('test');
      });
    });
  });

  describe('markFieldAsTestData', () => {
    it('debe delegar a FieldTestDataService', () => {
      facade.markFieldAsTestData('campo1');

      expect(mockTestData.markFieldAsTestData).toHaveBeenCalledWith('campo1');
    });
  });

  describe('getFieldsForSection', () => {
    it('debe delegar a FieldTestDataService', () => {
      mockTestData.getFieldsForSection.and.returnValue(['campo1', 'campo2']);

      const resultado = facade.getFieldsForSection('3.1.2');

      expect(mockTestData.getFieldsForSection).toHaveBeenCalledWith('3.1.2');
      expect(resultado).toEqual(['campo1', 'campo2']);
    });
  });
});

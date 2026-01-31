import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { DataOrchestratorService } from 'src/app/core/services/orchestration/data-orchestrator.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { FieldMappingFacade } from 'src/app/core/services/field-mapping/field-mapping.facade';
import { LoggerService } from 'src/app/core/services/infrastructure/logger.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('DataOrchestratorService', () => {
  let service: DataOrchestratorService;
  let sectionDataLoader: jasmine.SpyObj<SectionDataLoaderService>;
  let fieldMapping: jasmine.SpyObj<FieldMappingFacade>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const sectionDataLoaderSpy = jasmine.createSpyObj('SectionDataLoaderService', ['loadSectionData']);
    const fieldMappingSpy = jasmine.createSpyObj('FieldMappingFacade', ['getFieldsForSection']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        DataOrchestratorService,
        { provide: SectionDataLoaderService, useValue: sectionDataLoaderSpy },
        { provide: FieldMappingFacade, useValue: fieldMappingSpy },
        { provide: LoggerService, useValue: loggerSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});

    service = TestBed.inject(DataOrchestratorService);
    sectionDataLoader = TestBed.inject(SectionDataLoaderService) as jasmine.SpyObj<SectionDataLoaderService>;
    fieldMapping = TestBed.inject(FieldMappingFacade) as jasmine.SpyObj<FieldMappingFacade>;
    logger = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadSectionData', () => {
    it('should load section data successfully', (done) => {
      const mockData = { field1: 'value1', field2: 'value2' };
      const mockFields = ['field1', 'field2'];

      fieldMapping.getFieldsForSection.and.returnValue(mockFields);
      sectionDataLoader.loadSectionData.and.returnValue(
        new Observable(observer => {
          observer.next(mockData);
          observer.complete();
        })
      );

      service.loadSectionData('test-section').subscribe(data => {
        expect(data).toEqual(mockData);
        expect(fieldMapping.getFieldsForSection).toHaveBeenCalledWith('test-section');
        expect(sectionDataLoader.loadSectionData).toHaveBeenCalledWith('test-section', mockFields);
        done();
      });
    });

    it('should handle errors gracefully', (done) => {
      const error = new Error('Test error');
      fieldMapping.getFieldsForSection.and.returnValue([]);
      sectionDataLoader.loadSectionData.and.returnValue(
        new Observable(observer => {
          observer.error(error);
        })
      );

      service.loadSectionData('test-section').subscribe(data => {
        expect(data).toEqual({});
        expect(logger.error).toHaveBeenCalled();
        done();
      });
    });

    it('should apply transformations', (done) => {
      const mockData = { field1: 'value1' };
      fieldMapping.getFieldsForSection.and.returnValue(['field1']);
      sectionDataLoader.loadSectionData.and.returnValue(
        new Observable(observer => {
          observer.next(mockData);
          observer.complete();
        })
      );

      service.loadSectionData('test-section').subscribe(data => {
        expect(data).toBeDefined();
        done();
      });
    });
  });
});


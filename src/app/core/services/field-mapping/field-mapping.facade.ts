import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldMapping } from './field-mapping.types';
import { FieldMappingRegistryService } from './field-mapping-registry.service';
import { FieldDataSourceService } from './field-data-source.service';
import { FieldDataLoaderService } from './field-data-loader.service';
import { FieldTestDataService } from './field-test-data.service';

@Injectable({
  providedIn: 'root'
})
export class FieldMappingFacade {

  constructor(
    private registry: FieldMappingRegistryService,
    private dataSource: FieldDataSourceService,
    private loader: FieldDataLoaderService,
    private testData: FieldTestDataService
  ) {}

  getMapping(fieldName: string): FieldMapping | undefined {
    return this.registry.getMapping(fieldName);
  }

  getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return this.dataSource.getDataSourceType(fieldName);
  }

  loadDataForField(fieldName: string, seccionId: string): Observable<any> {
    return this.loader.loadDataForField(fieldName, seccionId);
  }

  markFieldAsTestData(fieldName: string): void {
    this.testData.markFieldAsTestData(fieldName);
  }

  clearTestDataFields(): void {
    this.testData.clearTestDataFields();
  }

  isTestDataField(fieldName: string): boolean {
    return this.testData.isTestDataField(fieldName);
  }

  markFieldsAsTestData(fields: string[]): void {
    this.testData.markFieldsAsTestData(fields);
  }

  hasAnyTestDataForSection(seccionId: string): boolean {
    return this.testData.hasAnyTestDataForSection(seccionId);
  }

  getFieldsForSection(seccionId: string): string[] {
    return this.testData.getFieldsForSection(seccionId);
  }
}

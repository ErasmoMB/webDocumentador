import { Injectable } from '@angular/core';
import { FieldMappingRegistryService } from './field-mapping-registry.service';
import { FieldTestDataService } from './field-test-data.service';

@Injectable({
  providedIn: 'root'
})
export class FieldDataSourceService {

  constructor(
    private registry: FieldMappingRegistryService,
    private testData: FieldTestDataService
  ) {}

  getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    if (this.testData.isTestDataField(fieldName)) {
      return 'manual';
    }
    const mapping = this.registry.getMapping(fieldName);
    return mapping?.dataSource || 'manual';
  }

  isBackendField(fieldName: string): boolean {
    return this.getDataSourceType(fieldName) === 'backend';
  }

  isManualField(fieldName: string): boolean {
    return this.getDataSourceType(fieldName) === 'manual';
  }

  isSectionField(fieldName: string): boolean {
    return this.getDataSourceType(fieldName) === 'section';
  }
}

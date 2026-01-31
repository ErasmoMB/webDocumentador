import { Injectable } from '@angular/core';
import { FieldMapping } from './field-mapping.types';
import { createDefaultFieldMappings } from './default-field-mappings';

@Injectable({
  providedIn: 'root'
})
export class FieldMappingRegistryService {
  private fieldMappings: Map<string, FieldMapping> = new Map();

  constructor() {
    this.initializeMappings();
  }

  private initializeMappings(): void {
    this.fieldMappings = createDefaultFieldMappings();
  }

  getMapping(fieldName: string): FieldMapping | undefined {
    return this.fieldMappings.get(fieldName);
  }

  registerMapping(fieldName: string, mapping: FieldMapping): void {
    this.fieldMappings.set(fieldName, mapping);
  }

  hasMapping(fieldName: string): boolean {
    return this.fieldMappings.has(fieldName);
  }

  getAllMappings(): Map<string, FieldMapping> {
    return new Map(this.fieldMappings);
  }
}

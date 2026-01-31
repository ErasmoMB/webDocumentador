import { Injectable } from '@angular/core';
import { DEFAULT_SECTION_FIELDS } from './default-section-fields';

@Injectable({
  providedIn: 'root'
})
export class FieldTestDataService {
  private testDataFields: Set<string> = new Set();

  markFieldAsTestData(fieldName: string): void {
    this.testDataFields.add(fieldName);
  }

  clearTestDataFields(): void {
    this.testDataFields.clear();
  }

  isTestDataField(fieldName: string): boolean {
    return this.testDataFields.has(fieldName);
  }

  markFieldsAsTestData(fields: string[]): void {
    fields.forEach(field => this.testDataFields.add(field));
  }

  hasAnyTestDataForSection(seccionId: string): boolean {
    const fields = this.getFieldsForSection(seccionId);
    return fields.some(field => this.testDataFields.has(field));
  }

  getFieldsForSection(seccionId: string): string[] {
    const sectionFields = DEFAULT_SECTION_FIELDS;

    if (sectionFields[seccionId]) {
      return sectionFields[seccionId];
    }

    const baseSeccionId = seccionId.split('.').slice(0, 3).join('.');
    if (sectionFields[baseSeccionId]) {
      return sectionFields[baseSeccionId];
    }

    return [];
  }
}

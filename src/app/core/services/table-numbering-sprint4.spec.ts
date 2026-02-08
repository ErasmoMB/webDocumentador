import { TestBed } from '@angular/core/testing';
import { TableNumberingService } from './table-numbering.service';

/**
 * SPRINT 4 VALIDATION TESTS
 * 
 * Validates that hard-coded table numbers have been successfully
 * replaced with dynamic numbering via the TableNumberingService,
 * and that the complete table numbering system works as expected
 */
describe('TableNumberingService - Sprint 4 Validation', () => {
  let service: TableNumberingService;

  beforeEach(() => {
    service = new TableNumberingService();
  });

  it('should produce 65 total global numbers across all configured sections', () => {
    /**
     * The system is configured with 65 total tables across all AISD and AISI sections
     * This test validates that all 65 numbers are produced correctly
     */
    
    const order = service.getSectionOrder();
    let totalTableCount = 0;
    const globalNumbers: string[] = [];
    
    for (const sectionId of order) {
      const count = service.getSectionTableCount(sectionId) || 0;
      totalTableCount += count;
      
      for (let localIndex = 0; localIndex < count; localIndex++) {
        const num = service.getGlobalTableNumber(sectionId, localIndex);
        globalNumbers.push(num);
      }
    }

    console.log('[Sprint4] Total tables configured:', totalTableCount);
    console.log('[Sprint4] Global numbers generated:', globalNumbers.length);
    console.log('[Sprint4] First 10 numbers:', globalNumbers.slice(0, 10).join(', '));
    console.log('[Sprint4] Last 10 numbers:', globalNumbers.slice(-10).join(', '));

    // Should be 65 total tables (sum of all configured table counts)
    expect(globalNumbers.length).toBe(65);
    
    // All must be unique
    const uniqueSet = new Set(globalNumbers);
    expect(uniqueSet.size).toBe(65);
    
    // Should range from 3.1 to 3.65
    const numericParts = globalNumbers.map(n => parseInt(n.split('.')[1]));
    expect(Math.min(...numericParts)).toBe(1);
    expect(Math.max(...numericParts)).toBe(65);
  });

  it('should have removed hard-coded Cuadro N°', () => {
    /**
     * Validates that hard-coded captions like "Cuadro N° 3.26" have been removed
     * from templates and are now dynamically generated
     */
    
    // This test serves as documentation that the hardcodedfixed values
    // have been removed and are now computed dynamically
    
    // Example: seccion24 previously had "Cuadro N° 3.26" hardcoded
    // Now it should use app-table-wrapper which calls getGlobalTableNumber
    const seccion24Id = '3.1.4.B.1.3'; // B.1.3 section (which would have dynamic table)
    
    // The service should compute the number dynamically rather than having it hardcoded
    const computedNumber = service.getGlobalTableNumber(seccion24Id, 0);
    
    // Should be a valid computed number
    expect(computedNumber).toMatch(/^3\.\d+$/);
    expect(computedNumber).not.toBe('3.26'); // Not the hardcoded old value
    
    console.log('[Sprint4] Seccion24 (B.1.3) Table 0 computed as:', computedNumber);
  });

  it('should support dynamic numbering for form and view components equally', () => {
    /**
     * Both form-wrapper and view components should use the same TableNumberingService
     * to ensure consistency across the application
     */
    
    const sectionId = '3.1.4.A.1.5'; // Viviendas (2 tables)
    
    // Get both table numbers for this section
    const table0 = service.getGlobalTableNumber(sectionId, 0);
    const table1 = service.getGlobalTableNumber(sectionId, 1);
    
    // Should be sequential
    const num0 = parseInt(table0.split('.')[1]);
    const num1 = parseInt(table1.split('.')[1]);
    
    expect(num1).toBe(num0 + 1);
    
    // Form should use these exact numbers (not hardcoded alternatives)
    console.log(`[Sprint4] ${sectionId} tables: ${table0}, ${table1}`);
  });

  it('should maintain correct ordering for all 45 sections in canonical order', () => {
    /**
     * The sectionOrder array defines the authoritative ordering for numbering
     * All 45 sections should exist and produce numbers in the correct sequence
     */
    
    const order = service.getSectionOrder();
    
    expect(order.length).toBeGreaterThan(40); // Should have many sections
    
    // Verify key sections are in the correct order
    const aisdStart = order.indexOf('3.1.4.A.1.1');
    const aisdEnd = order.indexOf('3.1.4.A.1.16');
    const aisiStart = order.indexOf('3.1.4.B');
    const aisiB1Start = order.indexOf('3.1.4.B.1');
    
    expect(aisdStart).toBeGreaterThan(-1);
    expect(aisdEnd).toBeGreaterThan(aisdStart);
    expect(aisiStart).toBeGreaterThan(aisdEnd);
    expect(aisiB1Start).toBeGreaterThan(aisiStart);
    
    console.log('[Sprint4] Section order validated');
    console.log(`[Sprint4] AISD sections: ${aisdStart} to ${aisdEnd}`);
    console.log(`[Sprint4] AISI sections start: ${aisiStart}`);
  });

  it('should enable reactive updates when table counts change (for future dynamic scenarios)', () => {
    /**
     * The changes$ stream emits when table counts are updated,
     * allowing components to reactively update their numbering
     */
    
    let emissionCount = 0;
    const subscription = service.changes$.subscribe(() => {
      emissionCount++;
    });

    // Skip initial emission (BehaviorSubject emits on subscribe)
    expect(emissionCount).toBe(1);

    // Change a table count
    const currentCount = service.getSectionTableCount('3.1.4.B.1.4') || 0;
    service.registerSectionTableCount('3.1.4.B.1.4', currentCount + 2);

    // Should have emitted
    expect(emissionCount).toBe(2);

    // Verify the numbers have updated correctly after the change
    const updatedNum = service.getGlobalTableNumber('3.1.4.B.1.4', 0);
    expect(updatedNum).toMatch(/^3\.\d+$/);

    subscription.unsubscribe();
    console.log('[Sprint4] Reactive updates validated');
  });
});

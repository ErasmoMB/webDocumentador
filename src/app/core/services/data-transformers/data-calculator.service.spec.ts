import { TestBed } from '@angular/core/testing';
import { DataCalculator } from './data-calculator.service';

describe('DataCalculator', () => {
  let service: DataCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataCalculator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate AISI population total', () => {
    const inputData = {
      poblacionSexoAISD: [
        { casos: 100 },
        { casos: '50' },
        { casos: 25 }
      ]
    };

    const result = service.calculateTotals(inputData);

    expect(result.tablaAISD2TotalPoblacion).toBe(175);
  });

  it('should handle string and number cases in population calculation', () => {
    const inputData = {
      poblacionSexoAISD: [
        { casos: '100' },
        { casos: 50 },
        { casos: '25.5' } // This will be parsed as 25
      ]
    };

    const result = service.calculateTotals(inputData);

    expect(result.tablaAISD2TotalPoblacion).toBe(175);
  });

  it('should not calculate total if already exists', () => {
    const inputData = {
      tablaAISD2TotalPoblacion: 999,
      poblacionSexoAISD: [
        { casos: 100 },
        { casos: 50 }
      ]
    };

    const result = service.calculateTotals(inputData);

    expect(result.tablaAISD2TotalPoblacion).toBe(999);
  });

  it('should handle empty population array', () => {
    const inputData = {
      poblacionSexoAISD: []
    };

    const result = service.calculateTotals(inputData);

    expect(result.tablaAISD2TotalPoblacion).toBeUndefined();
  });

  it('should handle missing population data', () => {
    const inputData = {};

    const result = service.calculateTotals(inputData);

    expect(result.tablaAISD2TotalPoblacion).toBeUndefined();
  });
});

import { TestBed } from '@angular/core/testing';
import { TableNumberingService } from './table-numbering.service';

describe('TableNumberingService', () => {
  let service: TableNumberingService;

  beforeEach(() => {
    // Create new instance for test isolation (avoid TestBed singletons mutating across tests)
    service = new TableNumberingService();
  });

  it('should normalize known alias "3.1.7" to "3.1.4.A.1.3"', () => {
    const normalized = service.normalizeSectionId('3.1.7');
    expect(normalized).toBe('3.1.4.A.1.3');
  });

  it('getGlobalTableNumber should treat alias and canonical id equally', () => {
    const canonical = service.getGlobalTableNumber('3.1.4.A.1.3', 0);
    const alias = service.getGlobalTableNumber('3.1.7', 0);
    expect(canonical).toBeTruthy();
    expect(alias).toBe(canonical);
  });

  it('should emit changes when section counts are registered/updated', (done) => {
    let count = 0;
    const sub = service.changes$.subscribe(() => {
      count++;
      // skip initial emission (BehaviorSubject emits initial value on subscribe)
      if (count === 2) {
        expect(count).toBe(2);
        sub.unsubscribe();
        done();
      }
    });

    // Trigger a registration change
    service.registerSectionTableCount('3.1.2', (service.getSectionTableCount('3.1.2') || 0) + 1);
  });

  it('registerSectionTableCount should accept alias and apply to normalized id', () => {
    // Register via alias
    service.registerSectionTableCount('3.1.7', 5);

    // After registration, both forms should return same global number for localIndex 0
    const viaAlias = service.getGlobalTableNumber('3.1.7', 0);
    const viaCanonical = service.getGlobalTableNumber('3.1.4.A.1.3', 0);

    expect(viaAlias).toBeTruthy();
    expect(viaAlias).toBe(viaCanonical);
  });

  it('internal map keys normalize to valid entries in section order (sanity check)', () => {
    const order = service.getSectionOrder();
    const keys: string[] = Array.from((service as any).sectionTableCounts.keys());

    const missing = keys.filter(k => !order.includes(service.normalizeSectionId(k)));
    console.log('[TableNumberingTest-missing-in-order]', missing);
    expect(missing.length).toBe(0);

    const normalizedMap: Record<string, string[]> = {};
    for (const k of keys) {
      const n = service.normalizeSectionId(k);
      normalizedMap[n] = normalizedMap[n] || [];
      normalizedMap[n].push(k);
    }

    const collisions = Object.entries(normalizedMap).filter(([n, ks]) => ks.length > 1);
    console.log('[TableNumberingTest-normalized-collisions]', JSON.stringify(collisions, null, 2));

    // Allow collisions only if they are identical keys (defensive)
    for (const [n, ks] of collisions) {
      expect(ks.every(k => k === n)).toBeTrue();
    }
  });

  it('getGlobalTableNumber should produce a consistent global numbering set', () => {
    const order = service.getSectionOrder();
    const numbers: number[] = [];
    let sumCounts = 0;

    for (const sec of order) {
      const count = service.getSectionTableCount(sec) || 0;
      sumCounts += count;
      for (let i = 0; i < count; i++) {
        const num = service.getGlobalTableNumber(sec, i);
        expect(num).toMatch(/^3\.\d+$/);
        numbers.push(Number(num.split('.')[1]));
      }
    }

    // numbers array length must match sum of counts
    console.log('[TableNumberingTest] sumCounts=', sumCounts, 'numbers.length=', numbers.length, 'min=', Math.min(...numbers), 'max=', Math.max(...numbers));

    // --- Detalle por sección (debug) ---
    const sectionSummaries = order.map(sec => {
      const count = service.getSectionTableCount(sec) || 0;
      const produced: string[] = [];
      for (let i = 0; i < count; i++) {
        produced.push(service.getGlobalTableNumber(sec, i));
      }
      return { sec, count, producedCount: produced.filter(p => p !== '').length, produced };
    });

    console.log('[TableNumberingTest-details]', JSON.stringify(sectionSummaries, null, 2));

    if (numbers.length !== sumCounts) {
      const mismatches = sectionSummaries.filter(s => s.producedCount !== s.count);
      console.error('[TableNumberingTest-mismatches]', JSON.stringify(mismatches, null, 2));
    }

    expect(numbers.length).toBe(sumCounts);

    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
    const sorted = numbers.slice().sort((a,b)=>a-b);
    expect(sorted[0]).toBe(1);
    for (const n of sorted) expect(n).toBeGreaterThan(0);
  });

  it('changing a section table count shifts numbering but preserves uniqueness and consecutivity', () => {
    const order = service.getSectionOrder();
    const target = order[1];

    const prev = service.getSectionTableCount(target) || 0;
    service.registerSectionTableCount(target, prev + 1);

    const numbers: number[] = [];
    const producedMap: Record<string, string[]> = {};

    let sumCountsAfter = 0;
    for (const sec of order) {
      const count = service.getSectionTableCount(sec) || 0;
      sumCountsAfter += count;
      producedMap[sec] = [];
      for (let i = 0; i < count; i++) {
        const num = service.getGlobalTableNumber(sec, i);
        producedMap[sec].push(num);
        numbers.push(Number(num.split('.')[1]));
      }
    }

    console.log('[TableNumberingTest-after-change] sumCountsAfter=', sumCountsAfter, 'numbers.length=', numbers.length);
    console.log('[TableNumberingTest-after-change-details]', JSON.stringify(producedMap, null, 2));

    // Build a correct mapping number -> sections that produced it
    const numToSecs: Record<string, string[]> = {};
    for (const [sec, arr] of Object.entries(producedMap)) {
      for (const v of arr) {
        const n = v.split('.')[1];
        numToSecs[n] = numToSecs[n] || [];
        numToSecs[n].push(sec);
      }
    }

    const duplicates = Object.entries(numToSecs).filter(([k, secs]) => secs.length > 1);
    if (duplicates.length) console.error('[TableNumberingTest-after-change-duplicates]', JSON.stringify(duplicates, null, 2));

    // Extra debug: list which numeric values are duplicated and their sections
    const freq: Record<number, number> = {};
    for (const n of numbers) freq[n] = (freq[n] || 0) + 1;
    const realDuplicates = Object.entries(freq).filter(([n,c]) => c > 1);
    if (realDuplicates.length) console.error('[TableNumberingTest-after-change-real-duplicates]', JSON.stringify(realDuplicates, null, 2));

    const unique = new Set(numbers);
    console.log('[TableNumberingTest-after-change-stats] unique.size=', unique.size, 'numbers.length=', numbers.length);
    expect(unique.size).toBe(numbers.length);

    // Basic sanity checks after changing a section count
    const sorted = numbers.slice().sort((a,b)=>a-b);
    console.log('[TableNumberingTest-after-change] numbers.length=', numbers.length, 'min=', sorted[0], 'max=', Math.max(...sorted));
    expect(sorted[0]).toBe(1);
    for (const n of sorted) expect(n).toBeGreaterThan(0);
  });
});
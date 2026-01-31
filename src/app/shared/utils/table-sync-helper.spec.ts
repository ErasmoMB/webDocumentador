import { TableSyncHelper } from './table-sync-helper';

describe('TableSyncHelper', () => {
  let datos: any;
  let datosAnteriores: any;
  let onFieldChangeSpy: jasmine.Spy;

  beforeEach(() => {
    datos = {};
    datosAnteriores = {};
    onFieldChangeSpy = jasmine.createSpy('onFieldChange');
  });

  describe('sincronizarTablaDual', () => {
    it('should synchronize table without prefix', () => {
      const tabla = [
        { nombre: 'Item 1', valor: 10 },
        { nombre: 'Item 2', valor: 20 }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy
      );

      expect(datos['testTabla']).toBeDefined();
      expect(datos['testTabla'].length).toBe(2);
      expect(datos['testTabla'][0].nombre).toBe('Item 1');
      expect(onFieldChangeSpy).toHaveBeenCalledTimes(1);
      expect(onFieldChangeSpy).toHaveBeenCalledWith('testTabla', datos['testTabla']);
    });

    it('should synchronize table with prefix (dual sync)', () => {
      const tabla = [
        { nombre: 'Item 1', valor: 10 }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        '_CP1',
        tabla,
        onFieldChangeSpy
      );

      // Debe guardar versión con prefijo
      expect(datos['testTabla_CP1']).toBeDefined();
      expect(datos['testTabla_CP1'].length).toBe(1);
      expect(datos['testTabla_CP1'][0].nombre).toBe('Item 1');

      // Debe sincronizar versión sin prefijo
      expect(datos['testTabla']).toBeDefined();
      expect(datos['testTabla'].length).toBe(1);
      expect(datos['testTabla'][0].nombre).toBe('Item 1');

      // onFieldChange debe ser llamado 2 veces (con prefijo y sin prefijo)
      expect(onFieldChangeSpy).toHaveBeenCalledTimes(2);
      expect(onFieldChangeSpy).toHaveBeenCalledWith('testTabla_CP1', datos['testTabla_CP1']);
      expect(onFieldChangeSpy).toHaveBeenCalledWith('testTabla', datos['testTabla']);
    });

    it('should create deep copy to avoid mutations', () => {
      const tabla = [
        { nombre: 'Item 1', valor: 10 }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy
      );

      // Modificar tabla original no debe afectar la copia
      tabla[0].nombre = 'Modified';

      expect(datos['testTabla'][0].nombre).toBe('Item 1');
    });

    it('should update datosAnteriores when provided', () => {
      const tabla = [
        { nombre: 'Item 1', valor: 10 }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy,
        datosAnteriores
      );

      expect(datosAnteriores['testTabla']).toBeDefined();
      expect(datosAnteriores['testTabla'].length).toBe(1);
      expect(datosAnteriores['testTabla'][0].nombre).toBe('Item 1');
    });

    it('should handle empty table array', () => {
      const tabla: any[] = [];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy
      );

      expect(datos['testTabla']).toBeDefined();
      expect(datos['testTabla'].length).toBe(0);
      expect(onFieldChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle null table gracefully', () => {
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        null as any,
        onFieldChangeSpy
      );

      expect(datos['testTabla']).toBeUndefined();
      expect(onFieldChangeSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined table gracefully', () => {
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        undefined as any,
        onFieldChangeSpy
      );

      expect(datos['testTabla']).toBeUndefined();
      expect(onFieldChangeSpy).not.toHaveBeenCalled();
    });

    it('should handle non-array table gracefully', () => {
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        { invalid: 'data' } as any,
        onFieldChangeSpy
      );

      expect(datos['testTabla']).toBeUndefined();
      expect(onFieldChangeSpy).not.toHaveBeenCalled();
    });

    it('should preserve object structure in deep copy', () => {
      const tabla = [
        { 
          nombre: 'Item 1', 
          valor: 10,
          nested: { prop: 'value' },
          array: [1, 2, 3]
        }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy
      );

      expect(datos['testTabla'][0].nested).toBeDefined();
      expect(datos['testTabla'][0].nested.prop).toBe('value');
      expect(datos['testTabla'][0].array).toEqual([1, 2, 3]);
    });

    it('should work with different prefixes', () => {
      const tabla = [{ nombre: 'Test' }];

      // Prefijo _A1
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        '_A1',
        tabla,
        onFieldChangeSpy
      );

      expect(datos['testTabla_A1']).toBeDefined();
      expect(datos['testTabla']).toBeDefined();

      onFieldChangeSpy.calls.reset();

      // Prefijo _CP2
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        '_CP2',
        tabla,
        onFieldChangeSpy
      );

      expect(datos['testTabla_CP2']).toBeDefined();
      expect(datos['testTabla']).toBeDefined();
      expect(onFieldChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle large tables efficiently', () => {
      const largeTable = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        nombre: `Item ${i}`,
        valor: i * 10
      }));

      const startTime = performance.now();

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'largeTable',
        '_CP1',
        largeTable,
        onFieldChangeSpy
      );

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(datos['largeTable_CP1'].length).toBe(1000);
      expect(datos['largeTable'].length).toBe(1000);
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should not call onFieldChange when table is null', () => {
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        '_CP1',
        null as any,
        onFieldChangeSpy
      );

      expect(onFieldChangeSpy).not.toHaveBeenCalled();
    });

    it('should synchronize with datosAnteriores using structuredClone', () => {
      const tabla = [
        { 
          nombre: 'Item 1', 
          nested: { value: 10 }
        }
      ];

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'testTabla',
        null,
        tabla,
        onFieldChangeSpy,
        datosAnteriores
      );

      // Modificar datos no debe afectar datosAnteriores
      datos['testTabla'][0].nested.value = 999;

      expect(datosAnteriores['testTabla'][0].nested.value).toBe(10);
    });
  });

  describe('obtenerTablaKey', () => {
    it('should return tablaKey without prefix when prefix is null', () => {
      const result = TableSyncHelper.obtenerTablaKey('testTabla', null);
      expect(result).toBe('testTabla');
    });

    it('should return tablaKey with prefix when prefix is provided', () => {
      const result = TableSyncHelper.obtenerTablaKey('testTabla', '_CP1');
      expect(result).toBe('testTabla_CP1');
    });

    it('should handle empty string prefix', () => {
      const result = TableSyncHelper.obtenerTablaKey('testTabla', '');
      expect(result).toBe('testTabla');
    });

    it('should handle different prefix formats', () => {
      expect(TableSyncHelper.obtenerTablaKey('tabla', '_A1')).toBe('tabla_A1');
      expect(TableSyncHelper.obtenerTablaKey('tabla', '_CP2')).toBe('tabla_CP2');
      expect(TableSyncHelper.obtenerTablaKey('tabla', '_GS3')).toBe('tabla_GS3');
    });

    it('should concatenate prefix correctly', () => {
      const result = TableSyncHelper.obtenerTablaKey('tablaEntrevistados', '_CP1');
      expect(result).toBe('tablaEntrevistados_CP1');
    });
  });

  describe('Integration scenarios', () => {
    it('should simulate section switching between groups', () => {
      const tablaInicial = [
        { nombre: 'Item Grupo Principal', valor: 100 }
      ];

      // Usuario está en grupo principal (sin prefijo)
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'tablaEntrevistados',
        null,
        tablaInicial,
        onFieldChangeSpy
      );

      expect(datos['tablaEntrevistados'][0].valor).toBe(100);

      // Usuario cambia a grupo alternativo CP1
      const tablaCambiada = [
        { nombre: 'Item Grupo CP1', valor: 200 }
      ];

      onFieldChangeSpy.calls.reset();

      TableSyncHelper.sincronizarTablaDual(
        datos,
        'tablaEntrevistados',
        '_CP1',
        tablaCambiada,
        onFieldChangeSpy
      );

      // Versión con prefijo debe tener datos nuevos
      expect(datos['tablaEntrevistados_CP1'][0].valor).toBe(200);
      
      // Versión sin prefijo también se actualiza (para compatibilidad)
      expect(datos['tablaEntrevistados'][0].valor).toBe(200);

      // onFieldChange llamado 2 veces (dual sync)
      expect(onFieldChangeSpy).toHaveBeenCalledTimes(2);
    });

    it('should maintain data isolation between different groups', () => {
      const tablaCP1 = [{ nombre: 'CP1', valor: 100 }];
      const tablaCP2 = [{ nombre: 'CP2', valor: 200 }];

      // Guardar datos para grupo CP1
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'tablaTest',
        '_CP1',
        tablaCP1,
        onFieldChangeSpy
      );

      // Guardar datos para grupo CP2
      TableSyncHelper.sincronizarTablaDual(
        datos,
        'tablaTest',
        '_CP2',
        tablaCP2,
        onFieldChangeSpy
      );

      // Cada grupo debe mantener sus propios datos
      expect(datos['tablaTest_CP1'][0].valor).toBe(100);
      expect(datos['tablaTest_CP2'][0].valor).toBe(200);

      // Sin prefijo debe tener los últimos datos (CP2)
      expect(datos['tablaTest'][0].valor).toBe(200);
    });
  });
});

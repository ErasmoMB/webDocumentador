/**
 * TABLES REDUCER TESTS
 * 
 * Tests unitarios para el reducer de tablas.
 * Verifica: pureza, inmutabilidad, determinismo.
 */

import { 
  tablesReducer, 
  getTablesBySection, 
  getTable, 
  calculateColumnTotal,
  countTableRows 
} from './tables.reducer';
import { 
  INITIAL_TABLES_STATE, 
  TablesState, 
  generateTableKey 
} from '../project-state.model';
import { 
  SetTableDataCommand,
  AddTableRowCommand,
  UpdateTableRowCommand,
  RemoveTableRowCommand,
  ReorderTableRowsCommand,
  ClearTableCommand
} from '../commands.model';

describe('TablesReducer', () => {
  
  describe('Pureza y Determinismo', () => {
    it('no debe mutar el estado original', () => {
      const state = { ...INITIAL_TABLES_STATE };
      const originalByKey = { ...state.byKey };
      
      const command: SetTableDataCommand = {
        type: 'table/setData',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'poblacion',
          rows: [{ data: { categoria: 'Hombres', casos: 100 } }],
          config: { totalKey: 'total', campoTotal: 'casos' }
        }
      };

      tablesReducer(state, command);
      
      expect(state.byKey).toEqual(originalByKey);
    });
  });

  describe('SetTableData', () => {
    it('debe crear nueva tabla', () => {
      const state = { ...INITIAL_TABLES_STATE };
      const command: SetTableDataCommand = {
        type: 'table/setData',
        payload: {
          sectionId: 'section6',
          groupId: null,
          tableKey: 'poblacionSexo',
          rows: [
            { data: { categoria: 'Hombres', casos: 500, porcentaje: '50%' } },
            { data: { categoria: 'Mujeres', casos: 500, porcentaje: '50%' } }
          ],
          config: { totalKey: 'total', campoTotal: 'casos', campoPorcentaje: 'porcentaje' }
        }
      };

      const result = tablesReducer(state, command);
      const key = generateTableKey('section6', null, 'poblacionSexo');

      expect(result.byKey[key]).toBeDefined();
      expect(result.byKey[key].state.rows.length).toBe(2);
      expect(result.byKey[key].state.rows[0].data['categoria']).toBe('Hombres');
      expect(result.byKey[key].state.rows[0].orden).toBe(0);
      expect(result.byKey[key].state.rows[1].orden).toBe(1);
      expect(result.allKeys).toContain(key);
    });

    it('debe crear tabla con grupo', () => {
      const state = { ...INITIAL_TABLES_STATE };
      const command: SetTableDataCommand = {
        type: 'table/setData',
        payload: {
          sectionId: 'section6',
          groupId: 'A',
          tableKey: 'poblacionSexo',
          rows: [{ data: { categoria: 'Test', casos: 100 } }],
          config: { totalKey: 'total', campoTotal: 'casos' }
        }
      };

      const result = tablesReducer(state, command);
      const key = generateTableKey('section6', 'A', 'poblacionSexo');

      expect(result.byKey[key]).toBeDefined();
      expect(result.byKey[key].groupId).toBe('A');
    });

    it('debe asignar IDs únicos a las filas', () => {
      const state = { ...INITIAL_TABLES_STATE };
      const command: SetTableDataCommand = {
        type: 'table/setData',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          rows: [
            { data: { a: 1 } },
            { data: { a: 2 } }
          ],
          config: { totalKey: 'total', campoTotal: 'a' }
        }
      };

      const result = tablesReducer(state, command);
      const key = generateTableKey('section1', null, 'test');
      const rows = result.byKey[key].state.rows;

      expect(rows[0].id).toBeDefined();
      expect(rows[1].id).toBeDefined();
      expect(rows[0].id).not.toBe(rows[1].id);
    });
  });

  describe('AddTableRow', () => {
    it('debe agregar fila al final', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { value: 'first' } }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: AddTableRowCommand = {
        type: 'table/addRow',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          data: { value: 'second' }
        }
      };

      const result = tablesReducer(state, command);

      expect(result.byKey[key].state.rows.length).toBe(2);
      expect(result.byKey[key].state.rows[1].data['value']).toBe('second');
      expect(result.byKey[key].state.rows[1].orden).toBe(1);
    });

    it('debe insertar fila en posición específica', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { value: 'first' } },
                { id: 'row2', orden: 1, data: { value: 'third' } }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: AddTableRowCommand = {
        type: 'table/addRow',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          data: { value: 'second' },
          insertAt: 1
        }
      };

      const result = tablesReducer(state, command);

      expect(result.byKey[key].state.rows.length).toBe(3);
      expect(result.byKey[key].state.rows[1].data['value']).toBe('second');
      expect(result.byKey[key].state.rows[0].orden).toBe(0);
      expect(result.byKey[key].state.rows[1].orden).toBe(1);
      expect(result.byKey[key].state.rows[2].orden).toBe(2);
    });

    it('no debe cambiar si tabla no existe', () => {
      const state = { ...INITIAL_TABLES_STATE };
      const command: AddTableRowCommand = {
        type: 'table/addRow',
        payload: {
          sectionId: 'nonexistent',
          groupId: null,
          tableKey: 'test',
          data: { value: 'new' }
        }
      };

      const result = tablesReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('UpdateTableRow', () => {
    it('debe actualizar datos de fila', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { categoria: 'Original', casos: 100 } }
              ],
              totalKey: 'total',
              campoTotal: 'casos',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: UpdateTableRowCommand = {
        type: 'table/updateRow',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          rowId: 'row1',
          data: { casos: 200 }
        }
      };

      const result = tablesReducer(state, command);

      expect(result.byKey[key].state.rows[0].data['casos']).toBe(200);
      expect(result.byKey[key].state.rows[0].data['categoria']).toBe('Original');
    });

    it('no debe cambiar si fila no existe', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [{ id: 'row1', orden: 0, data: { value: 'test' } }],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: UpdateTableRowCommand = {
        type: 'table/updateRow',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          rowId: 'nonexistent',
          data: { value: 'updated' }
        }
      };

      const result = tablesReducer(state, command);

      expect(result).toBe(state);
    });
  });

  describe('RemoveTableRow', () => {
    it('debe eliminar fila y re-numerar', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { value: 'first' } },
                { id: 'row2', orden: 1, data: { value: 'second' } },
                { id: 'row3', orden: 2, data: { value: 'third' } }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: RemoveTableRowCommand = {
        type: 'table/removeRow',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          rowId: 'row2'
        }
      };

      const result = tablesReducer(state, command);

      expect(result.byKey[key].state.rows.length).toBe(2);
      expect(result.byKey[key].state.rows[0].data['value']).toBe('first');
      expect(result.byKey[key].state.rows[1].data['value']).toBe('third');
      expect(result.byKey[key].state.rows[0].orden).toBe(0);
      expect(result.byKey[key].state.rows[1].orden).toBe(1);
    });
  });

  describe('ReorderTableRows', () => {
    it('debe reordenar filas', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { value: 'A' } },
                { id: 'row2', orden: 1, data: { value: 'B' } },
                { id: 'row3', orden: 2, data: { value: 'C' } }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: ReorderTableRowsCommand = {
        type: 'table/reorderRows',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test',
          orderedRowIds: ['row3', 'row1', 'row2']
        }
      };

      const result = tablesReducer(state, command);
      const rows = result.byKey[key].state.rows;

      expect(rows[0].id).toBe('row3');
      expect(rows[1].id).toBe('row1');
      expect(rows[2].id).toBe('row2');
      expect(rows[0].orden).toBe(0);
      expect(rows[1].orden).toBe(1);
      expect(rows[2].orden).toBe(2);
    });
  });

  describe('ClearTable', () => {
    it('debe limpiar filas manteniendo configuración', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { value: 'A' } },
                { id: 'row2', orden: 1, data: { value: 'B' } }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: 'porcentaje',
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };
      
      const command: ClearTableCommand = {
        type: 'table/clear',
        payload: {
          sectionId: 'section1',
          groupId: null,
          tableKey: 'test'
        }
      };

      const result = tablesReducer(state, command);

      expect(result.byKey[key].state.rows.length).toBe(0);
      expect(result.byKey[key].state.totalKey).toBe('total');
      expect(result.byKey[key].state.campoTotal).toBe('value');
    });
  });

  describe('Helpers', () => {
    it('calculateColumnTotal debe sumar columna', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: { casos: 100 } },
                { id: 'row2', orden: 1, data: { casos: 200 } },
                { id: 'row3', orden: 2, data: { casos: 50 } }
              ],
              totalKey: 'total',
              campoTotal: 'casos',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };

      const total = calculateColumnTotal(state, 'section1', null, 'test', 'casos');

      expect(total).toBe(350);
    });

    it('countTableRows debe contar filas', () => {
      const key = generateTableKey('section1', null, 'test');
      const state: TablesState = {
        byKey: {
          [key]: {
            sectionId: 'section1',
            groupId: null,
            tableKey: 'test',
            state: {
              rows: [
                { id: 'row1', orden: 0, data: {} },
                { id: 'row2', orden: 1, data: {} }
              ],
              totalKey: 'total',
              campoTotal: 'value',
              campoPorcentaje: null,
              lastModified: 1000
            }
          }
        },
        allKeys: [key]
      };

      expect(countTableRows(state, 'section1', null, 'test')).toBe(2);
      expect(countTableRows(state, 'nonexistent', null, 'test')).toBe(0);
    });
  });
});

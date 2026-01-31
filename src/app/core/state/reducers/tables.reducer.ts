/**
 * TABLES REDUCER
 * 
 * Reducer puro para comandos de tablas.
 * Maneja: SetTableData, AddTableRow, UpdateTableRow, RemoveTableRow, ReorderTableRows, ClearTable.
 * 
 * REGLAS:
 * - Función pura: (state, command) => newState
 * - Sin efectos secundarios
 * - Siempre retorna nuevo objeto (inmutabilidad)
 * - IDs de filas generados automáticamente
 */

import { 
  TablesState, 
  TableEntry,
  TableState,
  TableRow,
  INITIAL_TABLES_STATE,
  generateTableKey 
} from '../project-state.model';
import { 
  TableCommand,
  SetTableDataCommand,
  AddTableRowCommand,
  UpdateTableRowCommand,
  RemoveTableRowCommand,
  ReorderTableRowsCommand,
  ClearTableCommand
} from '../commands.model';

/**
 * Genera un nuevo timestamp
 */
function now(): number {
  return Date.now();
}

/**
 * Genera un ID único para una fila
 */
function generateRowId(): string {
  return `row_${now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Crea un nuevo estado de tabla
 */
function createTableState(
  rows: readonly TableRow[],
  config: { totalKey: string; campoTotal: string; campoPorcentaje?: string }
): TableState {
  return {
    rows,
    totalKey: config.totalKey,
    campoTotal: config.campoTotal,
    campoPorcentaje: config.campoPorcentaje || null,
    lastModified: now()
  };
}

/**
 * Crea filas con IDs y orden asignados
 */
function createTableRows(
  rowsData: ReadonlyArray<Omit<TableRow, 'id' | 'orden'>>
): TableRow[] {
  return rowsData.map((rowData, index) => ({
    id: generateRowId(),
    orden: index,
    data: { ...rowData.data }
  }));
}

/**
 * Re-numera las filas manteniendo el orden
 */
function renumberRows(rows: readonly TableRow[]): TableRow[] {
  return rows.map((row, index) => ({
    ...row,
    orden: index
  }));
}

/**
 * Reducer para SetTableData
 */
function handleSetTableData(
  state: TablesState, 
  command: SetTableDataCommand
): TablesState {
  const { sectionId, groupId, tableKey, rows, config } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const tableRows = createTableRows(rows);
  const tableState = createTableState(tableRows, config);

  const newEntry: TableEntry = {
    sectionId,
    groupId,
    tableKey,
    state: tableState
  };

  const newAllKeys = state.allKeys.includes(key) 
    ? state.allKeys 
    : [...state.allKeys, key];

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: newEntry
    },
    allKeys: newAllKeys
  };
}

/**
 * Reducer para AddTableRow
 */
function handleAddTableRow(
  state: TablesState, 
  command: AddTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, data, insertAt } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Tabla no existe
  }

  const newRow: TableRow = {
    id: generateRowId(),
    orden: 0, // Se re-calculará
    data: { ...data }
  };

  let newRows: TableRow[];
  if (insertAt !== undefined && insertAt >= 0 && insertAt < existingEntry.state.rows.length) {
    // Insertar en posición específica
    newRows = [
      ...existingEntry.state.rows.slice(0, insertAt),
      newRow,
      ...existingEntry.state.rows.slice(insertAt)
    ];
  } else {
    // Agregar al final
    newRows = [...existingEntry.state.rows, newRow];
  }

  // Re-numerar
  newRows = renumberRows(newRows);

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          rows: newRows,
          lastModified: now()
        }
      }
    }
  };
}

/**
 * Reducer para UpdateTableRow
 */
function handleUpdateTableRow(
  state: TablesState, 
  command: UpdateTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, rowId, data } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Tabla no existe
  }

  const rowIndex = existingEntry.state.rows.findIndex(r => r.id === rowId);
  if (rowIndex === -1) {
    return state; // Fila no existe
  }

  const existingRow = existingEntry.state.rows[rowIndex];
  const updatedRow: TableRow = {
    ...existingRow,
    data: { ...existingRow.data, ...data }
  };

  const newRows = [
    ...existingEntry.state.rows.slice(0, rowIndex),
    updatedRow,
    ...existingEntry.state.rows.slice(rowIndex + 1)
  ];

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          rows: newRows,
          lastModified: now()
        }
      }
    }
  };
}

/**
 * Reducer para RemoveTableRow
 */
function handleRemoveTableRow(
  state: TablesState, 
  command: RemoveTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, rowId } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Tabla no existe
  }

  const rowIndex = existingEntry.state.rows.findIndex(r => r.id === rowId);
  if (rowIndex === -1) {
    return state; // Fila no existe
  }

  // Remover y re-numerar
  const newRows = renumberRows(
    existingEntry.state.rows.filter(r => r.id !== rowId)
  );

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          rows: newRows,
          lastModified: now()
        }
      }
    }
  };
}

/**
 * Reducer para ReorderTableRows
 */
function handleReorderTableRows(
  state: TablesState, 
  command: ReorderTableRowsCommand
): TablesState {
  const { sectionId, groupId, tableKey, orderedRowIds } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Tabla no existe
  }

  // Crear mapa de filas existentes
  const rowsById = new Map(existingEntry.state.rows.map(r => [r.id, r]));
  
  // Reordenar según los IDs proporcionados
  const reorderedRows: TableRow[] = [];
  for (const id of orderedRowIds) {
    const row = rowsById.get(id);
    if (row) {
      reorderedRows.push(row);
      rowsById.delete(id);
    }
  }
  
  // Agregar filas que no estaban en orderedRowIds al final
  for (const row of rowsById.values()) {
    reorderedRows.push(row);
  }

  // Re-numerar
  const numberedRows = renumberRows(reorderedRows);

  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          rows: numberedRows,
          lastModified: now()
        }
      }
    }
  };
}

/**
 * Reducer para ClearTable
 */
function handleClearTable(
  state: TablesState, 
  command: ClearTableCommand
): TablesState {
  const { sectionId, groupId, tableKey } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state; // Tabla no existe
  }

  // Limpiar filas pero mantener configuración
  return {
    ...state,
    byKey: {
      ...state.byKey,
      [key]: {
        ...existingEntry,
        state: {
          ...existingEntry.state,
          rows: [],
          lastModified: now()
        }
      }
    }
  };
}

/**
 * TABLES REDUCER PRINCIPAL
 * 
 * @param state - Estado actual de tablas
 * @param command - Comando a ejecutar
 * @returns Nuevo estado de tablas
 */
export function tablesReducer(
  state: TablesState = INITIAL_TABLES_STATE,
  command: TableCommand
): TablesState {
  switch (command.type) {
    case 'table/setData':
      return handleSetTableData(state, command);
    
    case 'table/addRow':
      return handleAddTableRow(state, command);
    
    case 'table/updateRow':
      return handleUpdateTableRow(state, command);
    
    case 'table/removeRow':
      return handleRemoveTableRow(state, command);
    
    case 'table/reorderRows':
      return handleReorderTableRows(state, command);
    
    case 'table/clear':
      return handleClearTable(state, command);
    
    default:
      return state;
  }
}

/**
 * Obtiene todas las tablas de una sección
 */
export function getTablesBySection(
  state: TablesState, 
  sectionId: string,
  groupId: string | null = null
): TableEntry[] {
  const prefix = groupId 
    ? `${sectionId}::${groupId}::` 
    : `${sectionId}::`;
  
  return state.allKeys
    .filter(key => key.startsWith(prefix))
    .map(key => state.byKey[key]);
}

/**
 * Obtiene una tabla específica
 */
export function getTable(
  state: TablesState,
  sectionId: string,
  groupId: string | null,
  tableKey: string
): TableEntry | undefined {
  const key = generateTableKey(sectionId, groupId, tableKey);
  return state.byKey[key];
}

/**
 * Calcula el total de una columna
 */
export function calculateColumnTotal(
  state: TablesState,
  sectionId: string,
  groupId: string | null,
  tableKey: string,
  columnName: string
): number {
  const entry = getTable(state, sectionId, groupId, tableKey);
  if (!entry) return 0;
  
  return entry.state.rows.reduce((sum, row) => {
    const value = row.data[columnName];
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return sum + numValue;
  }, 0);
}

/**
 * Cuenta filas en una tabla
 */
export function countTableRows(
  state: TablesState,
  sectionId: string,
  groupId: string | null,
  tableKey: string
): number {
  const entry = getTable(state, sectionId, groupId, tableKey);
  return entry?.state.rows.length ?? 0;
}

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

function now(): number {
  return Date.now();
}

function generateRowId(): string {
  return `row_${now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

function createTableRows(
  rowsData: ReadonlyArray<Omit<TableRow, 'id' | 'orden'>>
): TableRow[] {
  return rowsData.map((rowData, index) => ({
    id: generateRowId(),
    orden: index,
    data: { ...rowData.data }
  }));
}

function renumberRows(rows: readonly TableRow[]): TableRow[] {
  return rows.map((row, index) => ({
    ...row,
    orden: index
  }));
}

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

function handleAddTableRow(
  state: TablesState, 
  command: AddTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, data, insertAt } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state;
  }

  const newRow: TableRow = {
    id: generateRowId(),
    orden: 0,
    data: { ...data }
  };

  let newRows: TableRow[];
  if (insertAt !== undefined && insertAt >= 0 && insertAt < existingEntry.state.rows.length) {
    newRows = [
      ...existingEntry.state.rows.slice(0, insertAt),
      newRow,
      ...existingEntry.state.rows.slice(insertAt)
    ];
  } else {
    newRows = [...existingEntry.state.rows, newRow];
  }

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

function handleUpdateTableRow(
  state: TablesState, 
  command: UpdateTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, rowId, data } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state;
  }

  const rowIndex = existingEntry.state.rows.findIndex(r => r.id === rowId);
  if (rowIndex === -1) {
    return state;
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

function handleRemoveTableRow(
  state: TablesState, 
  command: RemoveTableRowCommand
): TablesState {
  const { sectionId, groupId, tableKey, rowId } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state;
  }

  const rowIndex = existingEntry.state.rows.findIndex(r => r.id === rowId);
  if (rowIndex === -1) {
    return state;
  }

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

function handleReorderTableRows(
  state: TablesState, 
  command: ReorderTableRowsCommand
): TablesState {
  const { sectionId, groupId, tableKey, orderedRowIds } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state;
  }

  const rowsById = new Map(existingEntry.state.rows.map(r => [r.id, r]));
  const reorderedRows: TableRow[] = [];
  for (const id of orderedRowIds) {
    const row = rowsById.get(id);
    if (row) {
      reorderedRows.push(row);
      rowsById.delete(id);
    }
  }
  for (const row of rowsById.values()) {
    reorderedRows.push(row);
  }

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

function handleClearTable(
  state: TablesState, 
  command: ClearTableCommand
): TablesState {
  const { sectionId, groupId, tableKey } = command.payload;
  const key = generateTableKey(sectionId, groupId, tableKey);
  
  const existingEntry = state.byKey[key];
  if (!existingEntry) {
    return state;
  }

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

export function getTable(
  state: TablesState,
  sectionId: string,
  groupId: string | null,
  tableKey: string
): TableEntry | undefined {
  const key = generateTableKey(sectionId, groupId, tableKey);
  return state.byKey[key];
}

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

export function countTableRows(
  state: TablesState,
  sectionId: string,
  groupId: string | null,
  tableKey: string
): number {
  const entry = getTable(state, sectionId, groupId, tableKey);
  return entry?.state.rows.length ?? 0;
}

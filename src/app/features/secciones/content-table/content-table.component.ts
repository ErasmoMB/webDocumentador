/**
 * CONTENT TABLE COMPONENT - FASE 3
 * 
 * Dumb Component para renderizar/editar tablas.
 * - View Mode: Tabla HTML renderizada
 * - Edit Mode: Editor de filas/columnas
 * 
 * Estructura de TableContent:
 * - titulo: string
 * - fuente: string
 * - columns: readonly string[]  (nombres de columnas)
 * - rows: readonly TableRowData[]  (cada row tiene id, orden, data)
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter,
  ChangeDetectionStrategy,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableContent, TableRowData } from '../../../core/state/section.model';

@Component({
  selector: 'app-content-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="content-table" [class.editing]="isEditing">
      
      <!-- TABLE TITLE -->
      @if (content.titulo) {
        <div class="table-title">
          <strong>Tabla:</strong> {{ content.titulo }}
        </div>
      }
      
      <!-- VIEW MODE -->
      @if (!isEditing) {
        <div class="table-view">
          <table class="data-table">
            <!-- Headers (columns) -->
            @if (content.columns?.length) {
              <thead>
                <tr>
                  @for (column of content.columns; track $index) {
                    <th>{{ column }}</th>
                  }
                </tr>
              </thead>
            }
            
            <!-- Body (rows) -->
            <tbody>
              @for (row of content.rows; track row.id) {
                <tr>
                  @for (col of content.columns; track $index) {
                    <td>{{ getRowValue(row, col) }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
          
          @if (!content.rows?.length) {
            <div class="empty-table">
              <span>📋 Tabla vacía</span>
            </div>
          }
          
          <!-- Fuente -->
          @if (content.fuente) {
            <div class="table-source">
              <em>Fuente: {{ content.fuente }}</em>
            </div>
          }
        </div>
      }
      
      <!-- EDIT MODE -->
      @if (isEditing) {
        <div class="table-edit">
          
          <!-- Title Edit -->
          <div class="edit-row">
            <label class="edit-label">
              <span class="label-text">Título de la tabla</span>
              <input
                type="text"
                class="edit-input"
                [value]="content.titulo || ''"
                (input)="onTitleInput($event)"
                placeholder="Título descriptivo...">
            </label>
          </div>
          
          <!-- Source Edit -->
          <div class="edit-row">
            <label class="edit-label">
              <span class="label-text">Fuente</span>
              <input
                type="text"
                class="edit-input"
                [value]="content.fuente || ''"
                (input)="onSourceInput($event)"
                placeholder="Fuente de los datos...">
            </label>
          </div>
          
          <!-- Table Editor -->
          <div class="table-editor">
            <table class="editable-table">
              <!-- Editable Columns -->
              @if (content.columns?.length) {
                <thead>
                  <tr>
                    @for (column of content.columns; track $index; let i = $index) {
                      <th>
                        <input
                          type="text"
                          class="cell-input header-input"
                          [value]="column"
                          (input)="onColumnChange(i, $event)"
                          placeholder="Columna">
                      </th>
                    }
                    <th class="action-col">
                      <button 
                        class="add-col-btn"
                        (click)="addColumn()"
                        title="Agregar columna">
                        +
                      </button>
                    </th>
                  </tr>
                </thead>
              }
              
              <!-- Editable Rows -->
              <tbody>
                @for (row of content.rows; track row.id; let rowIdx = $index) {
                  <tr>
                    @for (col of content.columns; track $index; let colIdx = $index) {
                      <td>
                        <input
                          type="text"
                          class="cell-input"
                          [value]="getRowValue(row, col)"
                          (input)="onCellChange(rowIdx, col, $event)"
                          placeholder="...">
                      </td>
                    }
                    <td class="action-col">
                      <button 
                        class="remove-row-btn"
                        (click)="removeRow(rowIdx)"
                        title="Eliminar fila">
                        ×
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <!-- Table Actions -->
          <div class="table-actions">
            <div class="add-actions">
              <button class="add-btn" (click)="addRow()">
                ➕ Agregar fila
              </button>
              @if (!content.columns?.length) {
                <button class="add-btn" (click)="initColumns()">
                  📋 Agregar columnas
                </button>
              }
            </div>
            
            <div class="meta-info">
              <span class="info-badge">
                {{ content.rows?.length || 0 }} filas × {{ columnCount() }} columnas
              </span>
            </div>
            
            <button 
              class="remove-btn"
              (click)="onRemove()"
              title="Eliminar tabla">
              🗑️ Eliminar tabla
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .content-table {
      width: 100%;
    }
    
    .table-title {
      font-size: 14px;
      color: #555;
      margin-bottom: 12px;
    }
    
    /* VIEW MODE TABLE */
    .table-view {
      overflow-x: auto;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    .data-table th,
    .data-table td {
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      text-align: left;
    }
    
    .data-table th {
      background: #f5f5f5;
      font-weight: 600;
      color: #333;
    }
    
    .data-table tbody tr:hover {
      background: #fafafa;
    }
    
    .empty-table {
      padding: 32px;
      text-align: center;
      color: #999;
      background: #fafafa;
      border-radius: 8px;
    }
    
    /* EDIT MODE */
    .table-edit {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .edit-row {
      display: flex;
      flex-direction: column;
    }
    
    .edit-label {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .label-text {
      font-size: 12px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }
    
    .edit-input {
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    
    .edit-input:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    /* TABLE EDITOR */
    .table-editor {
      overflow-x: auto;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
    }
    
    .editable-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .editable-table th,
    .editable-table td {
      padding: 4px;
      border: 1px solid #e8e8e8;
    }
    
    .editable-table th {
      background: #f0f7ff;
    }
    
    .cell-input {
      width: 100%;
      min-width: 80px;
      padding: 8px;
      border: 1px solid transparent;
      border-radius: 4px;
      font-size: 13px;
      transition: all 0.15s;
    }
    
    .cell-input:hover {
      border-color: #e0e0e0;
    }
    
    .cell-input:focus {
      outline: none;
      border-color: #1976d2;
      background: #fff;
    }
    
    .header-input {
      font-weight: 600;
    }
    
    .action-col {
      width: 32px;
      text-align: center;
      background: #fafafa !important;
    }
    
    .add-col-btn,
    .remove-row-btn {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }
    
    .add-col-btn {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .add-col-btn:hover {
      background: #bbdefb;
    }
    
    .remove-row-btn {
      background: #ffebee;
      color: #c62828;
    }
    
    .remove-row-btn:hover {
      background: #ffcdd2;
    }
    
    /* TABLE ACTIONS */
    .table-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }
    
    .add-actions {
      display: flex;
      gap: 8px;
    }
    
    .add-btn {
      padding: 8px 16px;
      background: #e3f2fd;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: #1565c0;
      transition: background 0.15s;
    }
    
    .add-btn:hover {
      background: #bbdefb;
    }
    
    .meta-info {
      flex: 1;
      text-align: center;
    }
    
    .info-badge {
      font-size: 12px;
      color: #888;
    }
    
    .remove-btn {
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #ffcdd2;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: #c62828;
      transition: all 0.15s;
    }
    
    .remove-btn:hover {
      background: #ffebee;
      border-color: #ef5350;
    }
  `]
})
export class ContentTableComponent {
  @Input({ required: true }) content!: TableContent;
  @Input() isEditing = false;
  
  @Output() contentChange = new EventEmitter<Partial<TableContent>>();
  @Output() remove = new EventEmitter<void>();
  
  columnCount = computed(() => {
    return this.content.columns?.length || 0;
  });
  
  /**
   * Obtiene el valor de una celda de una fila
   */
  getRowValue(row: TableRowData, columnKey: string): string {
    const value = row.data[columnKey];
    return value !== undefined && value !== null ? String(value) : '';
  }
  
  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contentChange.emit({ titulo: input.value });
  }
  
  onSourceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.contentChange.emit({ fuente: input.value });
  }
  
  onColumnChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const columns = [...this.content.columns];
    columns[index] = input.value;
    this.contentChange.emit({ columns });
  }
  
  onCellChange(rowIndex: number, columnKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rows: TableRowData[] = this.content.rows.map((row, i) => {
      if (i === rowIndex) {
        return {
          ...row,
          data: {
            ...row.data,
            [columnKey]: input.value
          }
        };
      }
      return row;
    });
    this.contentChange.emit({ rows });
  }
  
  addRow(): void {
    const newRow: TableRowData = {
      id: `row-${Date.now()}`,
      orden: this.content.rows.length,
      data: this.content.columns.reduce((acc, col) => {
        acc[col] = '';
        return acc;
      }, {} as Record<string, unknown>)
    };
    const rows: TableRowData[] = [...this.content.rows, newRow];
    this.contentChange.emit({ rows });
  }
  
  removeRow(index: number): void {
    const rows: TableRowData[] = this.content.rows
      .filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, orden: i }));
    this.contentChange.emit({ rows });
  }
  
  addColumn(): void {
    const newColName = `Columna ${this.content.columns.length + 1}`;
    const columns = [...this.content.columns, newColName];
    const rows: TableRowData[] = this.content.rows.map(row => ({
      ...row,
      data: {
        ...row.data,
        [newColName]: ''
      }
    }));
    this.contentChange.emit({ columns, rows });
  }
  
  initColumns(): void {
    const defaultCols = ['Columna 1', 'Columna 2', 'Columna 3'];
    const emptyRow: TableRowData = {
      id: `row-${Date.now()}`,
      orden: 0,
      data: defaultCols.reduce((acc, col) => {
        acc[col] = '';
        return acc;
      }, {} as Record<string, unknown>)
    };
    this.contentChange.emit({ 
      columns: defaultCols, 
      rows: [emptyRow] 
    });
  }
  
  onRemove(): void {
    this.remove.emit();
  }
}

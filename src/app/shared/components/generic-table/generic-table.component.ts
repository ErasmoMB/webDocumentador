import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface TableConfig {
  columns: TableColumn[];
  showHeader?: boolean;
  showFooter?: boolean;
  totalRow?: { [key: string]: any };
  borderless?: boolean;
  striped?: boolean;
  hover?: boolean;
}

@Component({
    selector: 'app-generic-table',
    imports: [CommonModule],
    template: `
    <div class="table-wrapper table--scrollable" [class.borderless]="config.borderless">
      <table class="table table--view" 
             [class.table--striped]="config.striped" 
             [attr.data-label-columns]="getColumnLabels()">
        <thead *ngIf="config.showHeader !== false">
          <tr>
            <th *ngFor="let col of config.columns" 
                [style.width]="col.width" 
                [style.text-align]="col.align || 'left'">
              {{ col.header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let i = index">
            <td *ngFor="let col of config.columns"
                [attr.data-label]="col.header"
                [style.text-align]="col.align || 'left'">
              <span [class.data-calculated]="getCellValue(row, col).isCalculated">
                {{ col.format ? col.format(getCellValue(row, col).value) : getCellValue(row, col).value }}
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot *ngIf="config.showFooter && config.totalRow" class="total-row">
          <tr>
            <td *ngFor="let col of config.columns"
                [attr.data-label]="col.header"
                [style.text-align]="col.align || 'left'">
              <span [class.data-calculated]="getTotalCellValue(col).isCalculated">
                {{ getTotalCellValue(col).value }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
    styles: [`
    .table-wrapper {
      overflow-x: auto;
      margin: 1rem 0;
    }

    .borderless table,
    .borderless th,
    .borderless td {
      border: none;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() config: TableConfig = {
    columns: [],
    showHeader: true,
    showFooter: false,
    striped: true,
    hover: true
  };

  ngOnInit() {
    // Si no hay columnas, no hay nada que renderizar.
    // Evitamos warnings para no ensuciar CI/logs.
  }

  getColumnLabels(): string {
    return this.config.columns.map(col => col.header).join(',');
  }

  getCellValue(row: any, col: TableColumn): { value: any; isCalculated: boolean } {
    const rawValue = row[col.key];
    if (rawValue && typeof rawValue === 'object' && 'value' in rawValue && 'isCalculated' in rawValue) {
      return { value: rawValue.value, isCalculated: rawValue.isCalculated };
    }
    // Si es un objeto pero no tiene la estructura esperada, asumimos que no es calculado
    if (typeof rawValue === 'object') {
      return { value: '[ERROR: Invalid calculated value]', isCalculated: false };
    }
    return { value: rawValue, isCalculated: false };
  }

  getTotalCellValue(col: TableColumn): { value: any; isCalculated: boolean } {
    if (!this.config.totalRow) return { value: '', isCalculated: false };
    const rawValue = this.config.totalRow[col.key];
    if (rawValue && typeof rawValue === 'object' && 'value' in rawValue && 'isCalculated' in rawValue) {
      return { value: rawValue.value, isCalculated: rawValue.isCalculated };
    }
    // Si es un objeto pero no tiene la estructura esperada, asumimos que no es calculado
    if (typeof rawValue === 'object') {
      return { value: '[ERROR: Invalid calculated value]', isCalculated: false };
    }
    return { value: rawValue, isCalculated: false };
  }
}

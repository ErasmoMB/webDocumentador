import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { FormularioService } from 'src/app/core/services/formulario.service';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date';
  placeholder?: string;
  readonly?: boolean;
}

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config!: TableConfig;
  @Input() datos: any = {};
  @Input() tablaKey: string = '';
  @Input() totalKey: string = 'Total';
  @Input() showAddButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() customFieldChangeHandler?: (index: number, field: string, value: any) => void;
  
  @Output() dataChange = new EventEmitter<any[]>();
  @Output() tableUpdated = new EventEmitter<void>();

  constructor(
    private tableService: TableManagementService,
    private formularioService: FormularioService,
    private cdRef: ChangeDetectorRef
  ) {}

  onFieldChange(index: number, field: string, value: any): void {
    if (!this.config) return;
    
    if (this.customFieldChangeHandler) {
      this.customFieldChangeHandler(index, field, value);
    } else {
      this.tableService.actualizarFila(
        this.datos,
        this.config,
        index,
        field,
        value
      );
    }
    
    this.formularioService.actualizarDato(this.config.tablaKey as any, this.datos[this.config.tablaKey]);
    this.dataChange.emit(this.datos[this.config.tablaKey]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  onAdd(): void {
    if (!this.config) return;
    
    this.tableService.agregarFila(this.datos, this.config);
    this.formularioService.actualizarDato(this.config.tablaKey as any, this.datos[this.config.tablaKey]);
    this.dataChange.emit(this.datos[this.config.tablaKey]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  onDelete(index: number): void {
    if (!this.config) return;
    
    const deleted = this.tableService.eliminarFila(this.datos, this.config, index);
    if (deleted) {
      this.formularioService.actualizarDato(this.config.tablaKey as any, this.datos[this.config.tablaKey]);
      this.dataChange.emit(this.datos[this.config.tablaKey]);
      this.tableUpdated.emit();
      this.cdRef.detectChanges();
    }
  }

  canDelete(index: number): boolean {
    if (!this.showDeleteButton) return false;
    if (!this.data || this.data.length <= 1) return false;
    
    const item = this.data[index];
    if (!item) return false;
    
    const totalValue = item[this.totalKey];
    return !totalValue || !totalValue.toString().toLowerCase().includes('total');
  }

  initializeTable(): void {
    if (!this.config) return;
    
    this.tableService.inicializarTabla(this.datos, this.config);
    this.formularioService.actualizarDato(this.config.tablaKey as any, this.datos[this.config.tablaKey]);
    this.dataChange.emit(this.datos[this.config.tablaKey]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  getTableData(): any[] {
    return this.datos[this.config?.tablaKey] || [];
  }
}

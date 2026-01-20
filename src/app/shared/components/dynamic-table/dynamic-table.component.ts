import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { FormularioService } from 'src/app/core/services/formulario.service';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date';
  placeholder?: string;
  readonly?: boolean;
  formatter?: (value: any) => string;
}

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, OnChanges {
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

  ngOnInit(): void {
    this.verificarEInicializarTabla();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] || changes['config'] || changes['tablaKey']) {
      this.verificarEInicializarTabla();
    }
  }

  private verificarEInicializarTabla(): void {
    if (!this.config || !this.datos) return;
    
    const tablaKeyActual = this.tablaKey || this.config.tablaKey;
    if (!tablaKeyActual) return;
    
    const datosTabla = this.datos[tablaKeyActual];
    
    if (!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0) {
      if (this.config.estructuraInicial && this.config.estructuraInicial.length > 0) {
        this.initializeTable();
      }
    } else {
      this.cdRef.detectChanges();
    }
  }

  onFieldChange(index: number, field: string, value: any): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.tablaKey || this.config.tablaKey;
    
    if (this.customFieldChangeHandler) {
      this.customFieldChangeHandler(index, field, value);
    } else {
      this.tableService.actualizarFila(
        this.datos,
        { ...this.config, tablaKey: tablaKeyActual },
        index,
        field,
        value
      );
    }
    
    this.formularioService.actualizarDato(tablaKeyActual as any, this.datos[tablaKeyActual]);
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  onAdd(): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.tablaKey || this.config.tablaKey;
    this.tableService.agregarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual });
    this.formularioService.actualizarDato(tablaKeyActual as any, this.datos[tablaKeyActual]);
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  onDelete(index: number): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.tablaKey || this.config.tablaKey;
    const deleted = this.tableService.eliminarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual }, index);
    if (deleted) {
      this.formularioService.actualizarDato(tablaKeyActual as any, this.datos[tablaKeyActual]);
      this.dataChange.emit(this.datos[tablaKeyActual]);
      this.tableUpdated.emit();
      this.cdRef.detectChanges();
    }
  }

  canDelete(index: number): boolean {
    if (!this.showDeleteButton) return false;
    const tableData = (this.data && this.data.length > 0) ? this.data : this.getTableData();
    if (!tableData || tableData.length === 0) return false;
    
    const item = tableData[index];
    if (!item) return false;
    
    const totalValue = item[this.totalKey];
    return !totalValue || !totalValue.toString().toLowerCase().includes('total');
  }

  initializeTable(): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.tablaKey || this.config.tablaKey;
    this.tableService.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
    this.formularioService.actualizarDato(tablaKeyActual as any, this.datos[tablaKeyActual]);
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  getTableData(): any[] {
    const tablaKeyActual = this.tablaKey || this.config?.tablaKey;
    return this.datos[tablaKeyActual] || [];
  }

  getFormattedValue(item: any, col: TableColumn): string {
    const value = item[col.field];
    if (col.formatter) {
      return col.formatter(value);
    }
    return value != null ? String(value) : '';
  }
}

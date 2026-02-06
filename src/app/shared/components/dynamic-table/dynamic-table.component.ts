import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, OnChanges, DoCheck, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { BackendDataMapperService } from 'src/app/core/services/backend-data-mapper.service';
import { TableMetadata } from 'src/app/core/models/table-metadata.model';
import { PrefixManager } from 'src/app/shared/utils/prefix-manager';
import { TableCalculationStrategyService } from 'src/app/core/services/tables/table-calculation-strategy.service';
import { TableMockMergeService } from 'src/app/core/services/tables/table-mock-merge.service';
import { ProjectStateFacade } from 'src/app/core/state/project-state.facade';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  readonly?: boolean;
  formatter?: (value: any) => string;
  dataType?: 'string' | 'number' | 'boolean' | 'percentage';
  allowedValues?: string[];
  errorMessage?: string;
}

@Component({
    selector: 'app-dynamic-table',
    imports: [CommonModule, FormsModule],
    templateUrl: './dynamic-table.component.html',
    styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, OnChanges, DoCheck {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config!: TableConfig;
  @Input() datos: any = {};
  @Input() tablaKey: string = '';
  @Input() sectionId: string = 'global';
  @Input() fieldName?: string;
  @Input() totalKey: string = 'Total';
  @Input() showAddButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() modoVista: boolean = false;
  @Input() customFieldChangeHandler?: (index: number, field: string, value: any) => void;
  // Opcional: encabezados agrupados para tablas con multi-fila de cabecera
  @Input() groupHeaders?: { label: string; colspan: number }[];
  
  @Output() dataChange = new EventEmitter<any[]>();
  @Output() tableUpdated = new EventEmitter<any[]>();

  private tableMetadata?: TableMetadata;
  private cachedTableData: any[] = [];
  private lastTablaKey: string = '';
  private isInitializing: boolean = false;
  private isCleaningLegacy: boolean = false;
  private calcDebounceMs = 200;
  private calcTimeouts = new Map<string, any>();
  private mockMergeApplied = new Set<string>(); // Evitar bucle de merge
  public tableData: any[] = [];

  // For deep change detection when `datos` object mutates in place
  private lastDatosArrayRef: any = null;
  private lastDatosArraySnapshot: string = '';

  constructor(
    private tableFacade: TableManagementFacade,
    private formChange: FormChangeService,
    private cdRef: ChangeDetectorRef,
    private projectFacade: ProjectStateFacade,
    private backendDataMapper?: BackendDataMapperService,
    private calculationStrategy?: TableCalculationStrategyService,
    private mockMergeService?: TableMockMergeService
  ) {}

  ngOnInit(): void {
    const tieneConfigValido = this.config?.campoTotal && this.config?.campoPorcentaje;
    if (!tieneConfigValido && this.fieldName) {
      this.autoConfigurarDesdeMetadata();
    }
    // Aplicar regla: si existe estructuraInicial, ocultar botones de agregar/eliminar
    this.applyNoAddDeleteForEstructuraInicial();
    setTimeout(() => {
      this.verificarEInicializarTabla();
      this.actualizarTableData();
      // Asegurar la regla después de inicialización
      this.applyNoAddDeleteForEstructuraInicial();
    }, 0);
  }

  private applyNoAddDeleteForEstructuraInicial(): void {
    try {
      if (this.config && Array.isArray((this.config as any).estructuraInicial) && (this.config as any).estructuraInicial.length > 0) {
        // If there is an initial structure, hide add/delete only when the table is empty
        // or not yet initialized. If the table already has rows (initialized or filled), allow add/delete
        // only if the inputs haven't explicitly disabled them (respect explicit `[showAddButton]="false"`).
        const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
        const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
        const datos = (tablaKeyActual && this.datos) ? (this.datos[tablaKeyActual] ?? (tablaKeyBase ? this.datos[tablaKeyBase] : undefined)) : undefined;
        if (!datos || !Array.isArray(datos) || datos.length === 0) {
          this.showAddButton = false;
          this.showDeleteButton = false;
        } else {
          // Allow add/delete once there is data but do not override an explicit false input
          if (this.showAddButton !== false) this.showAddButton = true;
          if (this.showDeleteButton !== false) this.showDeleteButton = true;
        }
      }
    } catch (e) { /* noop */ }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isCleaningLegacy || this.isInitializing) {
      return;
    }
    if (changes['config'] && changes['config'].currentValue) {
      const nuevoConfig = changes['config'].currentValue;
      if (nuevoConfig.campoTotal && nuevoConfig.campoPorcentaje) {
        this.config = nuevoConfig;
      }
    }
    if (changes['datos'] || changes['config'] || changes['tablaKey'] || changes['fieldName'] || changes['sectionId']) {
      const tieneConfigValido = this.config && this.config.campoTotal && this.config.campoPorcentaje;
      if ((changes['fieldName'] || changes['sectionId']) && !tieneConfigValido) {
        this.autoConfigurarDesdeMetadata();
      }
      // Aplicar regla de botones en cada cambio relevante
      this.applyNoAddDeleteForEstructuraInicial();
      this.verificarEInicializarTabla();
      this.actualizarTableData();
    }
  }

  private autoConfigurarDesdeMetadata(): void {
    const tieneConfigValido = this.config && this.config.campoTotal && this.config.campoPorcentaje;
    if (tieneConfigValido) {
      return;
    }
    if (!this.backendDataMapper || !this.sectionId || !this.fieldName) {
      return;
    }
    const sectionKey = this.obtenerSectionKeyDesdeSectionId(this.sectionId);
    if (!sectionKey) {
      return;
    }
    this.tableMetadata = this.backendDataMapper.getTableMetadata(sectionKey, this.fieldName);
    if (this.tableMetadata) {
      if ((!this.columns || this.columns.length === 0) && this.tableMetadata.columns) {
        this.columns = this.tableMetadata.columns.map(col => ({
          field: col.field,
          label: col.label,
          type: (col.type || 'text') as 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea',
          placeholder: col.placeholder || '',
          readonly: col.readonly || false
        }));
      }
      if (!this.config && this.tableMetadata.tableConfig) {
        this.config = {
          tablaKey: this.tableMetadata.tablaKey || this.tableMetadata.fieldName,
          totalKey: this.tableMetadata.tableConfig.totalKey,
          campoTotal: this.tableMetadata.tableConfig.campoTotal,
          campoPorcentaje: this.tableMetadata.tableConfig.campoPorcentaje,
          calcularPorcentajes: this.tableMetadata.tableConfig.calcularPorcentajes,
          estructuraInicial: this.tableMetadata.tableConfig.estructuraInicial,
          camposParaCalcular: this.tableMetadata.tableConfig.camposParaCalcular
        };
      }
      if (!this.tablaKey && this.tableMetadata.tablaKey) {
        this.tablaKey = this.tableMetadata.tablaKey;
      }
    }
  }

  private obtenerSectionKeyDesdeSectionId(sectionId: string): string | null {
    if (!sectionId) return null;
    const match = sectionId.match(/3\.1\.4\.([AB])\.(\d+)\.(\d+)/);
    if (!match) return null;
    const tipo = match[1] === 'A' ? 'aisd' : 'aisi';
    const seccionNum = parseInt(match[2]);
    let seccionReal: number;
    if (tipo === 'aisd') {
      seccionReal = seccionNum + 3;
    } else {
      seccionReal = seccionNum + 20;
    }
    return `seccion${seccionReal}_${tipo}`;
  }

  private verificarEInicializarTabla(): void {
    if (!this.config || !this.datos || this.isInitializing || this.isCleaningLegacy) {
      return;
    }
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      return;
    }
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    let datosTabla = this.datos[tablaKeyActual] ?? (tablaKeyBase ? this.datos[tablaKeyBase] : undefined);



    // Si no hubo datos locales, intentar cargar directamente desde ProjectState (table store)
    try {
      if ((!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0) && tablaKeyActual) {
        try {
          const fromStore = (this.projectFacade && typeof this.projectFacade.selectTableData === 'function') ? (this.projectFacade.selectTableData(this.sectionId, null, tablaKeyActual)() || (tablaKeyBase ? this.projectFacade.selectTableData(this.sectionId, null, tablaKeyBase)() : undefined)) : undefined;
          if (Array.isArray(fromStore) && fromStore.length > 0) {
            this.datos[tablaKeyActual] = structuredClone(fromStore);
            datosTabla = this.datos[tablaKeyActual];
            try { this.cdRef.detectChanges(); } catch (e) {}
            if (String(tablaKeyActual).toLowerCase().includes('puestosalud')) {
              console.info('[DynamicTable] cargar desde store ->', tablaKeyActual, 'len', fromStore.length);
            }
          }
        } catch (e) { /* noop */ }
      }
    } catch (e) { /* noop */ }

    // ✅ MERGE INTELIGENTE: Si hay datos del mock con casos pero sin porcentajes,
    // combinar con la estructura inicial manteniendo las categorías y calculando porcentajes
    // IMPORTANTE: Solo ejecutar una vez por tablaKey para evitar bucles infinitos
    const mergeKey = `${this.sectionId}_${tablaKeyActual}`;
    if (datosTabla && Array.isArray(datosTabla) && datosTabla.length > 0 && 
        this.config.estructuraInicial && this.mockMergeService && 
        !this.mockMergeApplied.has(mergeKey)) {
      const sonMock = this.mockMergeService.sonDatosDeMock(datosTabla, this.config);
      if (sonMock) {
        this.mockMergeApplied.add(mergeKey); // Marcar como procesado ANTES de ejecutar
        const datosCombinados = this.mockMergeService.combinarMockConEstructura(
          datosTabla,
          this.config.estructuraInicial,
          this.config
        );
        if (datosCombinados.length > 0) {
          this.datos[tablaKeyActual] = datosCombinados;
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
            this.datos[tablaKeyBase] = structuredClone(datosCombinados);
          }
          datosTabla = datosCombinados;
          // Calcular porcentajes después de merge
          this.ejecutarCalculosAutomaticosSiEsNecesario(true, false);
          // Persistir los datos combinados
          this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosCombinados });
          this.actualizarTableData();
          return; // Salir después de merge para evitar más procesamiento
        }
      }
    }

    if (datosTabla && Array.isArray(datosTabla) && this.esDatoLegacy(datosTabla)) {
      this.isCleaningLegacy = true;
      this.isInitializing = true;
      delete this.datos[tablaKeyActual];
      if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
        delete this.datos[tablaKeyBase];
      }
      this.cachedTableData = [];
      this.lastTablaKey = '';
      if (this.config.noInicializarDesdeEstructura) {
        this.actualizarTableData();
      } else if (this.config.estructuraInicial && this.config.estructuraInicial.length > 0) {
        this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
        if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
          const datosInicializados = this.datos[tablaKeyActual];
          if (datosInicializados && Array.isArray(datosInicializados)) {
            this.datos[tablaKeyBase] = structuredClone(datosInicializados);
          }
        }
        const datosParaPersistir = this.datos[tablaKeyActual];
        if (datosParaPersistir && Array.isArray(datosParaPersistir)) {
          this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosParaPersistir });
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
            this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyBase]: this.datos[tablaKeyBase] });
          }
        }
        this.actualizarTableData();
      }
      setTimeout(() => {
        this.isCleaningLegacy = false;
        this.isInitializing = false;
        this.cdRef.detectChanges();
      }, 100);
      return;
    }
    const necesitaInicializacion = this.verificarSiNecesitaReinicializacion(datosTabla);
    if (!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0 || necesitaInicializacion) {
      if (this.config.noInicializarDesdeEstructura) {
        this.actualizarTableData();
        return;
      }
      if (this.config.estructuraInicial && this.config.estructuraInicial.length > 0) {
        this.isInitializing = true;
        this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
        if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
          const datosInicializados = this.datos[tablaKeyActual];
          if (datosInicializados && Array.isArray(datosInicializados)) {
            this.datos[tablaKeyBase] = structuredClone(datosInicializados);
          }
        }
        const datosParaPersistir = this.datos[tablaKeyActual];
        if (datosParaPersistir && Array.isArray(datosParaPersistir)) {
          this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosParaPersistir });
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
            this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyBase]: this.datos[tablaKeyBase] });
          }
        }
        this.actualizarTableData();
        this.cachedTableData = [];
        this.lastTablaKey = '';
        setTimeout(() => {
          this.isInitializing = false;
          this.cdRef.detectChanges();
        }, 100);
      }
    } else {

      this.actualizarTableData();
      this.cdRef.detectChanges();
    }
  }

  private esDatoLegacy(datosTabla: any[]): boolean {
    if (!Array.isArray(datosTabla) || datosTabla.length === 0) {
      return false;
    }
    if (datosTabla.length === 1) {
      const row = datosTabla[0];
      if (!row || typeof row !== 'object') return true;
      const totalKey = this.config?.totalKey || 'categoria';
      const categoria = row[totalKey] || row.categoria || row.sexo || '';
      const casos = row.casos || row.hombres || row.mujeres || 0;
      const porcentaje = row.porcentaje || row.porcentajeHombres || row.porcentajeMujeres || '';
      const categoriaVacia = !categoria || categoria.toString().trim() === '';
      const casosCero = casos === 0 || casos === '0' || casos === '' || casos === null || casos === undefined;
      const porcentajeCero = !porcentaje || 
                            porcentaje.toString().trim() === '' ||
                            porcentaje.toString().includes('0%') ||
                            porcentaje.toString().includes('0,00 %') ||
                            porcentaje.toString().includes('0.00 %');
      return categoriaVacia && casosCero && porcentajeCero;
    }
    return false;
  }

  private verificarSiNecesitaReinicializacion(datosTabla: any[]): boolean {
    if (!this.config.estructuraInicial || this.config.estructuraInicial.length === 0) {
      return false;
    }
    if (!datosTabla || !Array.isArray(datosTabla)) {
      return true;
    }
    if (datosTabla.length < this.config.estructuraInicial.length) {
      return true;
    }
    const totalKey = this.config.totalKey || 'categoria';
    const estructuraLength = this.config.estructuraInicial?.length ?? 0;
    const todasVacias = datosTabla.every((fila: any) => {
      if (!fila || typeof fila !== 'object') return true;
      const claveVacia = !fila[totalKey] || fila[totalKey].toString().trim() === '';
      const valoresVacios = Object.values(fila).every(val =>
        val === '' ||
        val === 0 ||
        val === '0' ||
        val === '0%' ||
        val === '0,00 %' ||
        val === '0.00 %' ||
        val === null ||
        val === undefined
      );
      return claveVacia || valoresVacios;
    });
    if (todasVacias && datosTabla.length <= estructuraLength) {
      return true;
    }
    const categoriasEsperadas = this.config.estructuraInicial.map(item => {
      const key = item[totalKey] || item.categoria || item.sexo || '';
      return key.toString().toLowerCase().trim();
    });
    const categoriasActuales = datosTabla
      .map(item => {
        const key = item[totalKey] || item.categoria || item.sexo || '';
        return key.toString().toLowerCase().trim();
      })
      .filter(cat => cat !== '' && !cat.includes('total'));
    const tieneCategoriasValidas = categoriasActuales.some(catActual => 
      categoriasEsperadas.some(catEsperada => catActual.includes(catEsperada) || catEsperada.includes(catActual))
    );
    if (categoriasActuales.length > 0 && !tieneCategoriasValidas) {
      return true;
    }
    return false;
  }

  private obtenerTablaKeyConPrefijo(): string {
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    if (!tablaKeyBase) {
      return '';
    }
    if (this.lastTablaKey && this.datos[this.lastTablaKey] && Array.isArray(this.datos[this.lastTablaKey])) {
      return this.lastTablaKey;
    }
    const tablaKeyConPrefijo = PrefixManager.getFieldKey(this.sectionId, tablaKeyBase);
    const datosConPrefijo = this.datos[tablaKeyConPrefijo];
    if (datosConPrefijo && this.tieneContenidoRealTabla(datosConPrefijo)) {
      return tablaKeyConPrefijo;
    }
    const datosBase = this.datos[tablaKeyBase];
    if (datosBase && this.tieneContenidoRealTabla(datosBase)) {
      return tablaKeyBase;
    }
    return tablaKeyConPrefijo;
  }

  private tieneContenidoRealTabla(tabla: any): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some((item: any) => {
      if (!item || typeof item !== 'object') return false;
      return Object.keys(item).some(key => {
        const valor = item[key];
        if (valor === null || valor === undefined) return false;
        if (typeof valor === 'string') return valor.trim() !== '' && valor !== '0%' && valor !== '0,00 %';
        if (typeof valor === 'number') return valor !== 0;
        return true;
      });
    });
  }

  private ejecutarCalculosAutomaticosSiEsNecesario(
    esDatosMock: boolean = false,
    esEdicionUsuario: boolean = false
  ): void {
    if (esDatosMock && !esEdicionUsuario) {
      return;
    }
    if (!this.config) {
      return;
    }
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      return;
    }

    // Special handling for Hombres/Mujeres tables (based on base config tablaKey)
    if (this.config && (this.config.tablaKey === 'peaDistritoSexoTabla' || this.config.tablaKey === 'peaOcupadaDesocupadaTabla')) {
      const configConTablaKey = { ...this.config, tablaKey: tablaKeyActual };
      this.tableFacade.calcularPorcentajesPorSexo(this.datos, configConTablaKey);
      return;
    }

    if (this.calculationStrategy) {
      const tipoCalculo = this.calculationStrategy.obtenerTipoCalculo(this.config);
      const configConTablaKey = { ...this.config, tablaKey: tablaKeyActual };
      switch (tipoCalculo) {
        case 'ambos':
          this.tableFacade.calcularTotalesYPorcentajes(this.datos, configConTablaKey);
          break;
        case 'porcentajes':
          this.tableFacade.calcularPorcentajes(this.datos, configConTablaKey);
          break;
        case 'totales':
          this.tableFacade.calcularYActualizarTotales(this.datos, configConTablaKey);
          break;
        case 'ninguno':
          break;
      }
    } else {
      const debeCalcularPorcentajes = this.config.campoPorcentaje && 
                                      (this.config.calcularPorcentajes !== false);
      const debeCalcularTotales = !!this.config.campoTotal;
      const configConTablaKey = { ...this.config, tablaKey: tablaKeyActual };

      if (debeCalcularPorcentajes && debeCalcularTotales) {
        this.tableFacade.calcularTotalesYPorcentajes(this.datos, configConTablaKey);
      } else if (debeCalcularPorcentajes) {
        this.tableFacade.calcularPorcentajes(this.datos, configConTablaKey);
      } else if (debeCalcularTotales) {
        this.tableFacade.calcularYActualizarTotales(this.datos, configConTablaKey);
      }
    }
  }

  onFieldChange(index: number, field: string, value: any): void {
    if (!this.config) return;
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;

    if (this.config.noInicializarDesdeEstructura && (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) && this.config.estructuraInicial?.length) {
      this.datos[tablaKeyActual] = structuredClone(this.config.estructuraInicial);
    }

    const columna = this.columns.find(col => col.field === field);
    const valorValidado = this.validarYNormalizarValor(columna, value);



    this.cachedTableData = [];
    this.lastTablaKey = '';

    // Immediate local assignment so UI shows edits even if external sync overwrites later
    try {
      if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) this.datos[tablaKeyActual] = [];
      if (!this.datos[tablaKeyActual][index]) this.datos[tablaKeyActual][index] = {};
      this.datos[tablaKeyActual][index][field] = valorValidado;
      try { this.cdRef.detectChanges(); } catch (e) {}
    } catch (e) { console.warn('[DynamicTable] error during local assignment', e); }

    if (this.customFieldChangeHandler) {
      try { this.customFieldChangeHandler(index, field, valorValidado); } catch (e) { console.warn('[DynamicTable] customFieldChangeHandler error', e); }
    } else {
      try {
        this.tableFacade.actualizarFila(
          this.datos,
          { ...this.config, tablaKey: tablaKeyActual },
          index,
          field,
          valorValidado,
          false
        );
      } catch (e) { console.warn('[DynamicTable] actualizarFila error', e); }
    }

    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }

    const tablaCopia = this.datos[tablaKeyActual].map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    this.persistirTablaConLog(tablaKeyActual, tablaCopia);
    const debounceKey = tablaKeyActual;
    if (this.calcTimeouts.has(debounceKey)) {
      clearTimeout(this.calcTimeouts.get(debounceKey));
    }
    this.calcTimeouts.set(debounceKey, setTimeout(() => {
      try { this.ejecutarCalculosAutomaticosSiEsNecesario(false, true); } catch (e) { console.warn('[DynamicTable] calcular error', e); }
      const tablaCopia2 = (this.datos[tablaKeyActual] || []).map((item: any) => 
        typeof item === 'object' && item !== null ? { ...item } : item
      );
      this.persistirTablaConLog(tablaKeyActual, tablaCopia2);
      this.calcTimeouts.delete(debounceKey);
    }, this.calcDebounceMs));
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit(tablaCopia);
    try { this.cdRef.detectChanges(); } catch (e) {}
    try { this.cdRef.markForCheck(); } catch (e) {}
  }

  private persistirTablaConLog(tablaKey: string, tablaCopia: any[]): void {
    // Normalizar cualquier campo que venga en formato { value: X, isCalculated: boolean }
    const tablaNormalizada = tablaCopia.map((row: any) => {
      const r: any = {};
      for (const k of Object.keys(row)) {
        const v = row[k];
        r[k] = (v && typeof v === 'object' && v.value !== undefined) ? v.value : v;
      }
      return r;
    });

    // Persistiendo tabla (normalizada) y actualizando ProjectState para notificación inmediata.
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    const payload: Record<string, any> = { [tablaKey]: tablaNormalizada };
    if (tablaKeyBase && tablaKeyBase !== tablaKey) payload[tablaKeyBase] = tablaNormalizada;



    // Actualizar ProjectState localmente para disponibilidad inmediata
    try {
      if ((this as any).projectFacade && typeof (this as any).projectFacade.setTableData === 'function') {
        try { (this as any).projectFacade.setTableData(this.sectionId, null, tablaKey, tablaNormalizada); } catch (e) { console.warn('[DynamicTable] setTableData error', e); }
        if (tablaKeyBase && tablaKeyBase !== tablaKey) {
          try { (this as any).projectFacade.setTableData(this.sectionId, null, tablaKeyBase, tablaNormalizada); } catch (e) { console.warn('[DynamicTable] setTableData base error', e); }
        }
        // También establecer la clave BASE como field para que selectField(...) la lea inmediatamente
        try {
          if (tablaKeyBase) {
            try { (this as any).projectFacade.setField(this.sectionId, null, tablaKeyBase, tablaNormalizada); } catch (e) { console.warn('[DynamicTable] setField base error', e); }
            // Actualizar this.datos para evitar inconsistencias en este componente
            try { this.datos[tablaKeyBase] = tablaNormalizada; } catch (e) { console.warn('[DynamicTable] update datos error', e); }
          }
        } catch (e) { console.warn('[DynamicTable] setField wrapper error', e); }
      }
    } catch (e) { console.warn('[DynamicTable] projectFacade update error', e); }

    // Persistir y notificar (notifySync) para que SectionSync/Reactive adapters actualicen la vista
    try {
      this.formChange.persistFields(this.sectionId, 'table', payload, { notifySync: true });
    } catch (e) {
      try { this.formChange.persistFields(this.sectionId, 'table', payload); } catch (err) { console.warn('[DynamicTable] persistFields error', err); }
    }

    // Force an extra sync: set fields explicitly and notify ViewChildHelper to update components
    try {
      const ViewChildHelper = require('src/app/shared/utils/view-child-helper').ViewChildHelper;
      try { ViewChildHelper.updateAllComponents('actualizarDatos'); } catch (e) { /* noop */ }
    } catch (e) { /* noop */ }

    try {
      const sectionSync = (this as any).injector?.get?.(require('src/app/core/services/state/section-sync.service').SectionSyncService, null);
      if (sectionSync) {
        const notifyPayload: Record<string, any> = { [tablaKey]: tablaNormalizada };
        if (tablaKeyBase && tablaKeyBase !== tablaKey) notifyPayload[tablaKeyBase] = tablaNormalizada;
        try {
          const prefixed = require('src/app/shared/utils/prefix-manager').PrefixManager.getFieldKey(this.sectionId, tablaKey);
          notifyPayload[prefixed] = tablaNormalizada;
          if (tablaKeyBase && tablaKeyBase !== prefixed) notifyPayload[tablaKeyBase] = tablaNormalizada;
        } catch {}
        // Notify SectionSyncService without logging here
        sectionSync.notifyChanges(this.sectionId, notifyPayload);
      }
    } catch (e) { console.error('[DynamicTable] persistirTablaConLog error', e); }
  }

  private shouldLogTabla(tablaKey: string): boolean {
    if (!tablaKey) return false;
    // Sólo habilitar logs para el primer cuadro (PET)
    return tablaKey.toString().includes('petGruposEdadAISI');
  }

  private validarYNormalizarValor(columna: TableColumn | undefined, value: any): any {
    if (!columna) return value;
    // Prefer explicit dataType, fallback to column.type used in templates
    const dataType = columna.dataType || (columna as any).type || 'string';
    switch (dataType) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          return 0;
        }
        return num;
      case 'percentage':
        const perc = parseFloat(value);
        if (isNaN(perc)) {
          return 0;
        }
        return Math.max(0, Math.min(100, perc));
      case 'boolean':
        if (typeof value === 'boolean') return value;
        const str = String(value).toLowerCase().trim();
        return str === 'true' || str === 'si' || str === 'sí' || str === '1' || str === 'yes';
      case 'string':
      default:
        if (columna.allowedValues && columna.allowedValues.length > 0) {
          const valorNormalizado = String(value).trim().toUpperCase();
          const permitido = columna.allowedValues.some(v => 
            String(v).trim().toUpperCase() === valorNormalizado
          );
          if (!permitido && valorNormalizado !== '') {
          }
        }
        return typeof value === 'string' ? value.trim() : String(value || '').trim();
    }
  }

  onAdd(): void {
    if (!this.config) return;
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;
    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }
    // Add a row via facade
    this.tableFacade.agregarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual });

    // Ensure immediate UI reflects the new row even if values are empty (default row)
    try {
      this.tableData = this.datos[tablaKeyActual] || [];
      this.lastTablaKey = tablaKeyActual;
      this.cdRef.detectChanges();
    } catch (e) {}

    this.ejecutarCalculosAutomaticosSiEsNecesario(false, true);
    this.cachedTableData = [];
    const tablaCopia = (this.datos[tablaKeyActual] || []).map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    this.persistirTablaConLog(tablaKeyActual, tablaCopia);
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit(tablaCopia);
    this.actualizarTableData();
    // Extra detectChanges in next tick to handle OnPush parents
    setTimeout(() => this.cdRef.detectChanges(), 0);
  }

  onDelete(index: number): void {
    if (!this.config) return;
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;
    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }
    const deleted = this.tableFacade.eliminarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual }, index);
    if (deleted) {
      this.ejecutarCalculosAutomaticosSiEsNecesario(false, true);
      this.cachedTableData = [];
      this.lastTablaKey = '';
      const tablaCopia = this.datos[tablaKeyActual].map((item: any) => 
        typeof item === 'object' && item !== null ? { ...item } : item
      );
      this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
      this.dataChange.emit(this.datos[tablaKeyActual]);
      this.tableUpdated.emit(tablaCopia);
      this.actualizarTableData();
      this.cdRef.detectChanges();
    }
  }

  canDelete(index: number): boolean {
    if (!this.showDeleteButton) return false;
    const tableData = (this.data && this.data.length > 0) ? this.data : this.getTableData();
    if (!tableData || tableData.length === 0) return false;
    const item = tableData[index];
    if (!item) return false;
    const totalKeyToUse = this.config?.totalKey || this.totalKey;
    const totalValue = item[totalKeyToUse];
    const canDeleteResult = !totalValue || !totalValue.toString().toLowerCase().includes('total');
    return canDeleteResult;
  }

  initializeTable(): void {
    if (!this.config || this.isInitializing) return;
    this.isInitializing = true;
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      this.isInitializing = false;
      return;
    }
    if (this.tableFacade) {
      this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
    }
    this.cachedTableData = [];
    this.lastTablaKey = '';
    this.actualizarTableData();
    const tablaCopia = (this.datos[tablaKeyActual] || []).map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit(this.datos[tablaKeyActual]);
    setTimeout(() => {
      this.isInitializing = false;
      this.cdRef.detectChanges();
    }, 100);
  }

  private actualizarTableData(): void {
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      this.tableData = [];
      return;
    }
    const datosConPrefijo = this.datos[tablaKeyActual];
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    const fallback = tablaKeyBase ? this.datos[tablaKeyBase] : undefined;
    const estructura = this.config?.estructuraInicial;
    const noInit = this.config?.noInicializarDesdeEstructura;
    let datosFinales: any[] = [];

    if (noInit && estructura && estructura.length > 0) {
      const datosExistentes = datosConPrefijo ?? (tablaKeyBase ? this.datos[tablaKeyBase] : undefined);
      if (datosExistentes && Array.isArray(datosExistentes) && datosExistentes.length === estructura.length) {
        const totalKey = this.config.totalKey || 'categoria';
        const mismaEstructura = estructura.every((row: any, i: number) => {
          const existente = datosExistentes[i];
          return existente && String(existente[totalKey] || '').trim() === String(row[totalKey] || '').trim();
        });
        const campoValor = this.config.campoPorcentaje || 'descripcion';
        const todasLasFilasConContenido = mismaEstructura && datosExistentes.every((fila: any) => {
          const v = fila[campoValor];
          return v != null && String(v).trim() !== '';
        });
        if (todasLasFilasConContenido) {
          datosFinales = datosExistentes;
          this.datos[tablaKeyActual] = datosFinales;
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) this.datos[tablaKeyBase] = datosFinales;
          this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosFinales });
          this.projectFacade.setField(this.sectionId, null, tablaKeyActual, datosFinales);
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) this.projectFacade.setField(this.sectionId, null, tablaKeyBase, datosFinales);
        } else {
          datosFinales = datosExistentes;
        }
      } else {
        const existente = datosConPrefijo ?? (tablaKeyBase ? this.datos[tablaKeyBase] : undefined);
        datosFinales = (existente && Array.isArray(existente) && existente.length > 0)
          ? existente
          : structuredClone(estructura);
      }
    } else if (datosConPrefijo && Array.isArray(datosConPrefijo) && datosConPrefijo.length > 0) {
      datosFinales = datosConPrefijo;
    } else if (fallback && Array.isArray(fallback) && fallback.length > 0) {
      datosFinales = structuredClone(fallback);
      this.datos[tablaKeyActual] = datosFinales;
    } else if (estructura && estructura.length > 0) {
      datosFinales = structuredClone(estructura);
      if (!noInit) this.datos[tablaKeyActual] = datosFinales;
    } else {
      datosFinales = [];
    }
    this.tableData = datosFinales;
    this.lastTablaKey = '';
  }

  getTableData(): any[] {
    return this.tableData || [];
  }

  // Force load payload directly into the table and avoid initialization heuristics
  public forceLoadTableData(tablaKey: string, payload: any[]): void {
    try {
      if (!Array.isArray(payload)) return;
      
      // ✅ CRÍTICO: Crear NUEVA referencia a this.datos para forzar OnPush detection
      const datosActualizados = { ...this.datos };
      datosActualizados[tablaKey] = structuredClone(payload);
      const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
      if (tablaKeyBase && tablaKeyBase !== tablaKey) {
        datosActualizados[tablaKeyBase] = structuredClone(payload);
      }
      this.datos = datosActualizados;
      
      this.tableData = payload.map((r: any) => (typeof r === 'object' && r !== null) ? { ...r } : r);
      this.cachedTableData = [];
      this.lastTablaKey = '';
      try { this.formChange.persistFields(this.sectionId, 'table', { [tablaKey]: payload }, { notifySync: true }); } catch (e) {}
      try { this.cdRef.detectChanges(); } catch (e) {}
    } catch (e) {
    }
  }

  getFormattedValue(item: any, col: TableColumn): string {
    let value = item[col.field];

    // Support objects returned by helpers: { value: '12,34 %', isCalculated: true }
    if (value && typeof value === 'object') {
      if (value.value !== undefined) {
        value = value.value;
      } else {
        // Fallback to string representation
        try { value = String(value); } catch { value = ''; }
      }
    }

    if (col.formatter) {
      return col.formatter(value);
    }

    // Ocultar ceros y valores placeholder como '0%' para mostrar celdas vacías
    if (value === 0) return '';
    if (typeof value === 'string') {
      const v = value.trim();
      if (v === '0' || v === '0%' || v === '0,00 %' || v === '0.00 %') return '';
      return v;
    }
    return value != null ? String(value) : '';
  }

  isFieldReadonly(col: TableColumn, rowIndex?: number): boolean {
    if (col.readonly) return true;
    if (this.config?.camposNoEditables && this.config.camposNoEditables.includes(col.field)) {
      return true;
    }
    // Si la tabla tiene estructura inicial fija, solo la columna identificadora (totalKey) es no editable en esas filas
    try {
      if (typeof rowIndex === 'number' && Array.isArray(this.config?.estructuraInicial) && this.config.estructuraInicial.length > 0) {
        const estructuraLen = this.config.estructuraInicial.length;
        const totalKey = this.config?.totalKey || this.totalKey;
        if (rowIndex < estructuraLen && col.field === totalKey) return true;
      }
    } catch (e) { /* noop */ }
    return false;
  }

  getEditableRows(): any[] {
    if (!this.tableData || this.tableData.length === 0) return [];
    const totalKeyToUse = this.config?.totalKey || this.totalKey;
    const lastRow = this.tableData[this.tableData.length - 1];
    if (lastRow && lastRow[totalKeyToUse] && lastRow[totalKeyToUse].toString().toLowerCase().includes('total')) {
      return this.tableData.slice(0, -1);
    }
    return this.tableData;
  }

  trackByIndexAndValue(index: number, item: any): any {
    if (item && typeof item === 'object') {
      if (item.id) return `${index}-${item.id}`;
      if (item._id) return `${index}-${item._id}`;
      const keys = Object.keys(item).sort();
      const valores = keys.map(k => `${k}:${item[k]}`).join('|');
      return `${index}-${valores}`;
    }
    return index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  getTotalRow(): any {
    if (!this.tableData || this.tableData.length === 0) return null;
    const totalKeyToUse = this.config?.totalKey || this.totalKey;
    const lastRow = this.tableData[this.tableData.length - 1];
    if (lastRow && lastRow[totalKeyToUse] && lastRow[totalKeyToUse].toString().toLowerCase().includes('total')) {
      return lastRow;
    }
    return null;
  }
  ngDoCheck(): void {
    try {
      const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
      const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
      const currentArray = (tablaKeyActual && Array.isArray(this.datos[tablaKeyActual])) ? this.datos[tablaKeyActual]
        : (tablaKeyBase && Array.isArray(this.datos[tablaKeyBase])) ? this.datos[tablaKeyBase]
        : null;

      if (currentArray !== this.lastDatosArrayRef) {
        // Reference changed -> update
        this.lastDatosArrayRef = currentArray;
        this.lastDatosArraySnapshot = JSON.stringify(currentArray ? currentArray.slice(-1)[0] || {} : {});
        this.verificarEInicializarTabla();
        this.cdRef.detectChanges();
        return;
      }

      // If reference is same, compare length and last item snapshot
      if (Array.isArray(currentArray)) {
        const lastItem = currentArray.length > 0 ? currentArray[currentArray.length - 1] : {};
        const snapshot = JSON.stringify(lastItem || {});
        if (snapshot !== this.lastDatosArraySnapshot) {
          this.lastDatosArraySnapshot = snapshot;
          this.verificarEInicializarTabla();
          this.cdRef.detectChanges();
        }
      }
    } catch (e) {
      // noop
    }
  }  // Método público que permite forzar la actualización de la tabla cuando el store cambió
  actualizarDatos(): void {
    try {
      this.verificarEInicializarTabla();
      this.actualizarTableData();
      this.cdRef.detectChanges();
    } catch (e) {
      // noop
    }
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, OnChanges, DoCheck, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { BackendDataMapperService } from 'src/app/core/services/backend/backend-data-mapper.service';
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
    // Aplicar permisos desde la configuración
    this.applyPermissionsFromConfig();
    setTimeout(() => {
      this.verificarEInicializarTabla();
      this.actualizarTableData();
      // Asegurar la regla después de inicialización
      this.applyNoAddDeleteForEstructuraInicial();
      this.applyPermissionsFromConfig();
    }, 0);
  }

  private applyNoAddDeleteForEstructuraInicial(): void {
    try {
      // En modo formulario (modoVista=false) no ocultar botones automáticamente.
      // Si el padre pasó explícitamente false, se respeta; caso contrario se mantienen visibles.
      if (!this.modoVista) {
        if (this.showAddButton !== false) this.showAddButton = true;
        if (this.showDeleteButton !== false) this.showDeleteButton = true;
        return;
      }

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

  private applyPermissionsFromConfig(): void {
    if (this.config) {
      if (this.config.permiteAgregarFilas === false) {
        this.showAddButton = false;
      }
      if (this.config.permiteEliminarFilas === false) {
        this.showDeleteButton = false;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ DEBUG: Log de cambios recibidos
    if (changes['datos']) {
      console.log('[DynamicTable] 🔵 ngOnChanges - datos recibidos:', this.datos);
      const tablaKey = this.obtenerTablaKeyConPrefijo();
      console.log('[DynamicTable] 🔵 tablaKey:', tablaKey, '| datos[tablaKey]:', this.datos?.[tablaKey]);
    }
    
    if (this.isCleaningLegacy || this.isInitializing) {
      return;
    }
    if (changes['config'] && changes['config'].currentValue) {
      const nuevoConfig = changes['config'].currentValue;
      if (nuevoConfig.campoTotal && nuevoConfig.campoPorcentaje) {
        this.config = nuevoConfig;
      }
      // Aplicar permisos desde la nueva configuración
      this.applyPermissionsFromConfig();
    }
    if (changes['datos'] || changes['config'] || changes['tablaKey'] || changes['fieldName'] || changes['sectionId']) {
      const tieneConfigValido = this.config && this.config.campoTotal && this.config.campoPorcentaje;
      if ((changes['fieldName'] || changes['sectionId']) && !tieneConfigValido) {
        this.autoConfigurarDesdeMetadata();
      }
      // Aplicar regla de botones en cada cambio relevante
      this.applyNoAddDeleteForEstructuraInicial();
      
      // ✅ CORREGIDO: Usar la clave con prefijo para verificar datos existentes
      const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
      const datosTabla = tablaKeyActual ? (this.datos?.[tablaKeyActual] ?? (this.tablaKey ? this.datos?.[this.tablaKey] : undefined)) : undefined;
      
      // Solo inicializar la tabla si no hay datos existentes
      if (!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0) {
        this.verificarEInicializarTabla();
      }
      
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
    // ✅ No cargar si noInicializarDesdeEstructura está activo
    try {
      if ((!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0) && tablaKeyActual && !this.config.noInicializarDesdeEstructura) {
        try {
          const fromStore = (this.projectFacade && typeof this.projectFacade.selectTableData === 'function') ? (this.projectFacade.selectTableData(this.sectionId, null, tablaKeyActual)() || (tablaKeyBase ? this.projectFacade.selectTableData(this.sectionId, null, tablaKeyBase)() : undefined)) : undefined;
          if (Array.isArray(fromStore) && fromStore.length > 0) {
            this.datos[tablaKeyActual] = structuredClone(fromStore);
            datosTabla = this.datos[tablaKeyActual];
            try { this.cdRef.detectChanges(); } catch (e) {}
            if (String(tablaKeyActual).toLowerCase().includes('puestosalud')) {
              console.info('[DynamicTable] cargar desde store ->', tablaKeyActual, 'len', fromStore.length);
            }
          } else {
            // Si no hay datos en el store, intentar cargar desde el campo directo
            const fromField = (this.projectFacade && typeof this.projectFacade.selectField === 'function') ? (this.projectFacade.selectField(this.sectionId, null, tablaKeyActual)() || (tablaKeyBase ? this.projectFacade.selectField(this.sectionId, null, tablaKeyBase)() : undefined)) : undefined;
            if (Array.isArray(fromField) && fromField.length > 0) {
              this.datos[tablaKeyActual] = structuredClone(fromField);
              datosTabla = this.datos[tablaKeyActual];
              try { this.cdRef.detectChanges(); } catch (e) {}
            }
          }
        } catch (e) { console.error('Error cargando datos desde store:', e); }
      }
    } catch (e) { console.error('Error general en carga de datos:', e); }

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
      // ✅ EMITIR tableUpdated DESPUÉS de cálculos para que el padre reciba datos con porcentajes
      this.dataChange.emit(this.datos[tablaKeyActual]);
      this.tableUpdated.emit(tablaCopia2);
      this.calcTimeouts.delete(debounceKey);
    }, this.calcDebounceMs));
    
    // ✅ ACTUALIZAR tableData inmediatamente para reflejar cambios en el UI
    this.tableData = this.datos[tablaKeyActual];
    
    // ✅ FORZAR actualización del UI inmediatamente
    this.cdRef.detectChanges();
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
    this.cdRef.markForCheck();
  }

  private persistirTablaConLog(tablaKey: string, tablaCopia: any[]): void {
    // ✅ PASO 1: Normalizar datos (eliminar metadatos de cálculos)
    const tablaNormalizada = tablaCopia.map((row: any) => {
      const r: any = {};
      for (const k of Object.keys(row)) {
        const v = row[k];
        r[k] = (v && typeof v === 'object' && v.value !== undefined) ? v.value : v;
      }
      return r;
    });

    // ✅ PASO 2: Determinar todas las claves que necesitan sincronización
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    const keysToSync: Set<string> = new Set([tablaKey]);
    if (tablaKeyBase && tablaKeyBase !== tablaKey) {
      keysToSync.add(tablaKeyBase);
    }

    // ✅ PASO 3: Crear payload único con todas las claves
    const payload: Record<string, any> = {};
    keysToSync.forEach(key => {
      payload[key] = tablaNormalizada;
      // También actualizar this.datos para consistencia local
      this.datos[key] = tablaNormalizada;
    });

    // ✅ PASO 4: Una sola persistencia = evita conflictos de sincronización
    try {
      this.formChange.persistFields(this.sectionId, 'table', payload, { notifySync: true });
    } catch (e) {
      console.error('[DynamicTable] persistFields error:', e);
    }

    // ✅ PASO 5: Actualizar ProjectState para disponibilidad inmediata
    try {
      // ✅ CORREGIDO: Usar this.projectFacade directamente (ya está inyectado en el constructor)
      if (this.projectFacade && typeof this.projectFacade.setTableData === 'function') {
        keysToSync.forEach(key => {
          try {
            this.projectFacade.setTableData(this.sectionId, null, key, tablaNormalizada);
            this.projectFacade.setField(this.sectionId, null, key, tablaNormalizada);
          } catch (e) {
            console.warn(`[DynamicTable] setTableData/setField error for ${key}:`, e);
          }
        });
      }
    } catch (e) {
      console.warn('[DynamicTable] ProjectState update error:', e);
    }
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

    // ✅ NUEVO: Si noInicializarDesdeEstructura es true Y estructuraInicial está vacío,
    // usar directamente los datos existentes sin intentar inicializar ni comparar estructuras
    if (noInit && (!estructura || estructura.length === 0)) {
      // Primero buscar en datosConPrefijo
      if (datosConPrefijo && Array.isArray(datosConPrefijo) && datosConPrefijo.length > 0) {
        datosFinales = datosConPrefijo;
      } 
      // Luego buscar en fallback
      else if (fallback && Array.isArray(fallback) && fallback.length > 0) {
        datosFinales = structuredClone(fallback);
        this.datos[tablaKeyActual] = datosFinales;
      }
      // Finalmente buscar en el input data
      else if (this.data && Array.isArray(this.data) && this.data.length > 0) {
        datosFinales = this.data;
        this.datos[tablaKeyActual] = datosFinales;
        if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
          this.datos[tablaKeyBase] = datosFinales;
        }
      }
      
      this.tableData = datosFinales;
      this.lastTablaKey = '';
      return;
    }

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

    // Para campos de tipo texto, mostrar cadena vacía cuando el valor es 0
    // Esto evita que se muestre '0' en campos de texto como 'medio' o 'descripcion'
    if (col.type === 'text' || col.type === 'textarea') {
      if (value === 0 || value === '0') return '';
    }
    
    // Mostrar ceros y porcentajes '0,00 %' como en la vista (solo para campos numéricos)
    if (value === 0) return '0';
    if (typeof value === 'string') {
      const v = value.trim();
      // Mostrar todos los valores, incluso '0', '0%' y '0,00 %'
      return v;
    }
    return value != null ? String(value) : '';
  }

  isFieldReadonly(col: TableColumn, rowIndex?: number): boolean {
    // En modo formulario (modoVista=false) todas las celdas deben ser editables.
    // Esto evita inputs readonly/disabled dentro de tablas del formulario.
    if (!this.modoVista) {
      return false;
    }

    // Fallback conservador en modo vista (aunque en modoVista normalmente no se usan inputs)
    if (col.readonly) return true;
    if (this.config?.camposNoEditables && this.config.camposNoEditables.includes(col.field)) {
      return true;
    }
    return false;
  }

  getEditableRows(): any[] {
    // ✅ DEBUG: Log de tableData
    console.log('[DynamicTable] 📋 getEditableRows - tableData:', JSON.stringify(this.tableData), '| length:', this.tableData?.length);
    
    if (!this.tableData || this.tableData.length === 0) return [];
    
    // ✅ Para sección 8: Si totalKey es vacío, devolver TODO sin procesar
    const configTotalKey = this.config?.totalKey;
    if (configTotalKey === '' || configTotalKey === null || configTotalKey === undefined) {
      return this.tableData; // Devolver TODOS los datos exactamente como vienen
    }
    
    // Lógica original para tablas con totalKey configurado
    const totalKeyToUse = configTotalKey || this.totalKey;
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
    // ✅ Para sección 8: Si totalKey es explícitamente vacío, NO mostrar fila especial
    const configTotalKey = this.config?.totalKey;
    if (configTotalKey === '' || configTotalKey === null || configTotalKey === undefined) {
      return null; // NO mostrar ninguna fila especial
    }
    
    // Lógica original para tablas con totalKey configurado
    if (!this.tableData || this.tableData.length === 0) return null;
    const totalKeyToUse = configTotalKey || this.totalKey;
    const lastRow = this.tableData[this.tableData.length - 1];
    if (lastRow && lastRow[totalKeyToUse] && lastRow[totalKeyToUse].toString().toLowerCase().includes('total')) {
      return lastRow;
    }
    return null;
  }

  // ✅ MÉTODOS PARA ROWSPAN EN TABLAS AGRUPADAS
  
  /**
   * Calcula el rowspan para la primera columna (categoría) en tablas agrupadas
   */
  getRowspan(rowIndex: number, field: string): number {
    if (field !== 'categoria') return 1;
    
    const rows = this.getEditableRows();
    if (!rows || rowIndex >= rows.length) return 1;
    
    const currentRow = rows[rowIndex];
    
    // Si es encabezado de grupo, contar todas las filas hasta el siguiente encabezado
    if (currentRow?.esEncabezadoGrupo) {
      let count = 1;
      for (let i = rowIndex + 1; i < rows.length; i++) {
        const nextRow = rows[i];
        // Parar si encontramos otro encabezado de grupo
        if (nextRow?.esEncabezadoGrupo) break;
        count++;
      }
      return count;
    }
    
    return 1;
  }

  /**
   * Determina si mostrar la celda de categoría (solo para encabezados de grupo)
   */
  shouldShowCategoriaCell(rowIndex: number, field: string): boolean {
    if (field !== 'categoria') return true;
    
    const rows = this.getEditableRows();
    if (!rows || rowIndex >= rows.length) return true;
    
    const currentRow = rows[rowIndex];
    
    // Solo mostrar celda para encabezados de grupo
    return !!currentRow?.esEncabezadoGrupo;
  }

  /**
   * Obtiene las clases CSS para filas agrupadas
   */
  getRowClasses(item: any): string {
    const classes: string[] = [];
    
    if (item?.esEncabezadoGrupo) {
      classes.push('fila-encabezado-grupo');
    }
    
    if (item?.esSubcategoria) {
      classes.push('fila-subcategoria');
    }
    
    if (item?.esTotalGrupo) {
      classes.push('fila-total');
    }
    
    return classes.join(' ');
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

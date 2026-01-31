import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { BackendDataMapperService } from 'src/app/core/services/backend-data-mapper.service';
import { TableMetadata } from 'src/app/core/models/table-metadata.model';
import { PrefixManager } from 'src/app/shared/utils/prefix-manager';
import { TableCalculationStrategyService } from 'src/app/core/services/tables/table-calculation-strategy.service';

export interface TableColumn {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  placeholder?: string;
  readonly?: boolean;
  formatter?: (value: any) => string;
  /**
   * Tipo de dato esperado para validación
   * - 'string': Texto (default)
   * - 'number': Número entero o decimal
   * - 'boolean': Booleano (true/false)
   * - 'percentage': Porcentaje (0-100)
   */
  dataType?: 'string' | 'number' | 'boolean' | 'percentage';
  /**
   * Valores permitidos (para campos restringidos como SI/NO)
   */
  allowedValues?: string[];
  /**
   * Mensaje de error personalizado
   */
  errorMessage?: string;
}

@Component({
    selector: 'app-dynamic-table',
    imports: [CommonModule, FormsModule],
    templateUrl: './dynamic-table.component.html',
    styleUrls: ['./dynamic-table.component.css']
})
export class DynamicTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config!: TableConfig;
  @Input() datos: any = {};
  @Input() tablaKey: string = '';
  @Input() sectionId: string = 'global';
  @Input() fieldName?: string;  // Nuevo: nombre del campo para auto-configuración
  @Input() totalKey: string = 'Total';
  @Input() showAddButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() modoVista: boolean = false; // Nuevo: modo vista (solo lectura)
  @Input() customFieldChangeHandler?: (index: number, field: string, value: any) => void;
  
  @Output() dataChange = new EventEmitter<any[]>();
  @Output() tableUpdated = new EventEmitter<void>();

  private tableMetadata?: TableMetadata;
  
  // Caché para evitar llamadas infinitas
  private cachedTableData: any[] = [];
  private lastTablaKey: string = '';
  private isInitializing: boolean = false; // Guard para prevenir bucles infinitos
  private isCleaningLegacy: boolean = false; // Guard para prevenir bucle al limpiar legacy
  
  // ✅ Propiedad pública para el template (evita llamar getTableData() repetidamente)
  public tableData: any[] = [];

  constructor(
    private tableFacade: TableManagementFacade,
    private formChange: FormChangeService,
    private cdRef: ChangeDetectorRef,
    private backendDataMapper?: BackendDataMapperService,
    private calculationStrategy?: TableCalculationStrategyService
  ) {}

  ngOnInit(): void {
    // ✅ CRÍTICO: NO auto-configurar en ngOnInit si hay config explícito
    // El binding de [config] aún no se ha completado, así que esperamos a ngOnChanges
    // Solo auto-configurar si NO hay config explícito Y hay fieldName
    const tieneConfigValido = this.config?.campoTotal && this.config?.campoPorcentaje;
    
    if (!tieneConfigValido && this.fieldName) {
      this.autoConfigurarDesdeMetadata();
    } else if (tieneConfigValido) {
    } else {
    }
    
    // ✅ CRÍTICO: Forzar verificación después de que Angular complete el binding
    // Esto asegura que config y datos estén disponibles antes de verificar
    setTimeout(() => {
      
      this.verificarEInicializarTabla();
      // Inicializar tableData después de verificar
      this.actualizarTableData();
      
      // ✅ FASE 1: NO calcular porcentajes automáticamente cuando se cargan datos mock
      // Los porcentajes se calcularán dinámicamente cuando el usuario edite los datos
      // this.calcularPorcentajesSiEsNecesario();
    }, 0);
  }

  /**
   * ✅ SOLID - ELIMINADO: Este método duplicaba la lógica de TableCalculationStrategyService
   * La verificación de si se necesitan cálculos ya la hace la estrategia.
   * Si necesitas verificar antes de calcular, usa directamente la estrategia:
   * this.calculationStrategy?.obtenerTipoCalculo(this.config) !== 'ninguno'
   */

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ CRÍTICO: No ejecutar si estamos limpiando o inicializando para evitar bucles
    if (this.isCleaningLegacy || this.isInitializing) {
      return;
    }
    
    // ✅ CRÍTICO: Si cambió config explícito, NO sobrescribir con metadata
    if (changes['config'] && changes['config'].currentValue) {
      const nuevoConfig = changes['config'].currentValue;
      
      // Si hay config explícito con campoTotal y campoPorcentaje, NO buscar metadata
      if (nuevoConfig.campoTotal && nuevoConfig.campoPorcentaje) {
        // Actualizar this.config con el nuevo valor
        this.config = nuevoConfig;
      }
    }
    
    if (changes['datos'] || changes['config'] || changes['tablaKey'] || changes['fieldName'] || changes['sectionId']) {
      // Re-auto-configurar SOLO si cambió fieldName o sectionId Y NO hay config explícito válido
      const tieneConfigValido = this.config && this.config.campoTotal && this.config.campoPorcentaje;
      
      if ((changes['fieldName'] || changes['sectionId']) && !tieneConfigValido) {
        this.autoConfigurarDesdeMetadata();
      } else if (tieneConfigValido) {
      }
      
      this.verificarEInicializarTabla();
      // ✅ Actualizar tableData cuando cambian los datos de entrada
      this.actualizarTableData();
    }
  }

  /**
   * Auto-configura el componente desde metadata del registry
   * ✅ SOLID - OCP: Solo auto-configura si no hay config explícito válido
   */
  private autoConfigurarDesdeMetadata(): void {
    // ✅ CRÍTICO: Si ya hay config explícito con campoTotal y campoPorcentaje, NO sobrescribir
    const tieneConfigValido = this.config && this.config.campoTotal && this.config.campoPorcentaje;
    
    if (tieneConfigValido) {
      return;
    }
    
    if (!this.backendDataMapper || !this.sectionId || !this.fieldName) {
      return;
    }

    // Extraer sectionKey del sectionId (ej: '3.1.4.A.1.2' -> 'seccion6_aisd')
    const sectionKey = this.obtenerSectionKeyDesdeSectionId(this.sectionId);
    
    if (!sectionKey) {
      return;
    }

    this.tableMetadata = this.backendDataMapper.getTableMetadata(sectionKey, this.fieldName);
    
    if (this.tableMetadata) {
      
      // Auto-configurar columns si no están definidas
      if ((!this.columns || this.columns.length === 0) && this.tableMetadata.columns) {
        this.columns = this.tableMetadata.columns.map(col => ({
          field: col.field,
          label: col.label,
          type: (col.type || 'text') as 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea',
          placeholder: col.placeholder || '',
          readonly: col.readonly || false
        }));
      }

      // Auto-configurar config SOLO si no está definido explícitamente
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
      } else if (this.config) {
      }

      // Auto-configurar tablaKey si no está definido
      if (!this.tablaKey && this.tableMetadata.tablaKey) {
        this.tablaKey = this.tableMetadata.tablaKey;
      }
    } else {
    }
  }

  /**
   * Extrae sectionKey desde sectionId
   * Ej: '3.1.4.A.1.2' -> 'seccion6_aisd'
   */
  private obtenerSectionKeyDesdeSectionId(sectionId: string): string | null {
    if (!sectionId) return null;

    // Extraer número de sección y tipo (AISD/AISI)
    const match = sectionId.match(/3\.1\.4\.([AB])\.(\d+)\.(\d+)/);
    if (!match) return null;

    const tipo = match[1] === 'A' ? 'aisd' : 'aisi';
    const seccionNum = parseInt(match[2]);
    
    // Mapear número de sección a sección real
    // A.1 -> seccion4, A.2 -> seccion5, A.3 -> seccion6, etc.
    // B.1 -> seccion21, B.2 -> seccion22, etc.
    let seccionReal: number;
    if (tipo === 'aisd') {
      seccionReal = seccionNum + 3; // A.1 -> 4, A.2 -> 5, A.3 -> 6
    } else {
      seccionReal = seccionNum + 20; // B.1 -> 21, B.2 -> 22
    }

    return `seccion${seccionReal}_${tipo}`;
  }

  private verificarEInicializarTabla(): void {
    if (!this.config || !this.datos || this.isInitializing || this.isCleaningLegacy) return;
    
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;
    
    // ✅ Mantenible: compatibilidad con tablas legacy sin prefijo
    // Si por cualquier razón la data está guardada en la key base (sin prefijo),
    // la consideramos para decidir reinicialización y evitar que el formulario
    // muestre solo placeholders/filas incompletas.
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    let datosTabla = this.datos[tablaKeyActual] ?? (tablaKeyBase ? this.datos[tablaKeyBase] : undefined);
    
    // ✅ CRÍTICO: Si detectamos datos legacy, limpiarlos de memoria ANTES de verificar
    // Esto asegura que después de limpiar localStorage, el componente también limpie memoria
    if (datosTabla && Array.isArray(datosTabla) && this.esDatoLegacy(datosTabla)) {
      // Activar guard para evitar bucle
      this.isCleaningLegacy = true;
      this.isInitializing = true;
      
      // 🧹 [Dynamic Table] Limpiando datos legacy en memoria: tablaKeyActual
      delete this.datos[tablaKeyActual];
      if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
        delete this.datos[tablaKeyBase];
      }
      
      // Invalidar caché inmediatamente
      this.cachedTableData = [];
      this.lastTablaKey = '';
      
        // Si hay estructura inicial, inicializar inmediatamente
        if (this.config.estructuraInicial && this.config.estructuraInicial.length > 0) {
          this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
          
          // ✅ SOLID - DRY: Usar método centralizado
          // ⚠️ Inicialización: NO calcular automáticamente (podrían ser datos mock)
          // Los cálculos se ejecutarán cuando el usuario edite los datos
          // this.ejecutarCalculosAutomaticosSiEsNecesario(true, false); // esDatosMock=true
          
          // ✅ SINCRONIZACIÓN: Guardar también en key base (sin prefijo) para compatibilidad
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
            const datosInicializados = this.datos[tablaKeyActual];
            if (datosInicializados && Array.isArray(datosInicializados)) {
              this.datos[tablaKeyBase] = structuredClone(datosInicializados);
            }
          }
          
          // ✅ PERSISTIR: Guardar en StateService para sincronización vista/formulario
          const datosParaPersistir = this.datos[tablaKeyActual];
          if (datosParaPersistir && Array.isArray(datosParaPersistir)) {
            this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosParaPersistir });
            if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
              this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyBase]: this.datos[tablaKeyBase] });
            }
          }
          
          // Actualizar propiedad tableData para el template
          this.actualizarTableData();
        }
      
      // Desactivar guards después de completar (usar setTimeout para evitar bucle)
      setTimeout(() => {
        this.isCleaningLegacy = false;
        this.isInitializing = false;
        this.cdRef.detectChanges();
      }, 100);
      
      // ✅ CRÍTICO: Retornar inmediatamente para evitar que continúe el flujo
      return;
    }
    
    const necesitaInicializacion = this.verificarSiNecesitaReinicializacion(datosTabla);
    
    if (!datosTabla || !Array.isArray(datosTabla) || datosTabla.length === 0 || necesitaInicializacion) {
      if (this.config.estructuraInicial && this.config.estructuraInicial.length > 0) {
        // ✅ CRÍTICO SENIOR: Inicializar inmediatamente y persistir
        // Esto asegura que la estructura inicial se guarde en this.datos
        // y esté disponible tanto para vista como formulario
        this.isInitializing = true;
        this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
        
        // ✅ SOLID - DRY: Usar método centralizado
        // ⚠️ Inicialización: NO calcular automáticamente (podrían ser datos mock)
        // Los cálculos se ejecutarán cuando el usuario edite los datos
        // this.ejecutarCalculosAutomaticosSiEsNecesario(true, false); // esDatosMock=true
        
        // ✅ SINCRONIZACIÓN: Guardar también en key base (sin prefijo) para compatibilidad
        if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
          const datosInicializados = this.datos[tablaKeyActual];
          if (datosInicializados && Array.isArray(datosInicializados)) {
            this.datos[tablaKeyBase] = structuredClone(datosInicializados);
          }
        }
        
        // ✅ PERSISTIR: Guardar en StateService para sincronización vista/formulario
        const datosParaPersistir = this.datos[tablaKeyActual];
        if (datosParaPersistir && Array.isArray(datosParaPersistir)) {
          this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: datosParaPersistir });
          if (tablaKeyBase && tablaKeyBase !== tablaKeyActual) {
            this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyBase]: this.datos[tablaKeyBase] });
          }
        }
        
        // Actualizar propiedad tableData para el template
        this.actualizarTableData();
        
        // Invalidar caché para forzar re-lectura
        this.cachedTableData = [];
        this.lastTablaKey = '';
        
        // Desactivar guard después de un ciclo
        setTimeout(() => {
          this.isInitializing = false;
          this.cdRef.detectChanges();
        }, 100);
      }
    } else {
      // Actualizar tableData incluso si no necesita inicialización
      this.actualizarTableData();
      
      // ✅ FASE 1: NO calcular porcentajes automáticamente cuando se cargan datos mock
      // Los porcentajes se calcularán dinámicamente cuando el usuario edite los datos
      // Si hay datos existentes y hay configuración para calcular porcentajes/totales, NO calcularlos automáticamente
      // const tabla = this.datos[tablaKeyActual];
      // if (tabla && Array.isArray(tabla) && tabla.length > 0) {
      //   // ✅ SOLID - DRY: Usar método centralizado
      //   this.ejecutarCalculosAutomaticosSiEsNecesario();
      // }
      
      this.cdRef.detectChanges();
    }
  }

  /**
   * Detecta si un array de datos es legacy (1 fila placeholder vacía)
   * ✅ Lógica consistente con DataCleanupService
   */
  private esDatoLegacy(datosTabla: any[]): boolean {
    if (!Array.isArray(datosTabla) || datosTabla.length === 0) {
      return false;
    }

    // Caso más común: 1 fila placeholder vacía
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

  /**
   * Verifica si la tabla necesita reinicialización con estructura predefinida
   * Retorna true si:
   * - La tabla tiene solo filas vacías (sin datos reales)
   * - La estructura actual NO coincide con la estructura inicial esperada
   * ✅ LÓGICA SENIOR: Detecta placeholders y estructuras incompletas correctamente
   */
  private verificarSiNecesitaReinicializacion(datosTabla: any[]): boolean {
    if (!this.config.estructuraInicial || this.config.estructuraInicial.length === 0) {
      return false;
    }
    
    if (!datosTabla || !Array.isArray(datosTabla)) {
      return true;
    }

    // ✅ CRÍTICO: Si hay menos filas que la estructura esperada, SIEMPRE reinicializar
    // Esto cubre el caso de 1 fila placeholder cuando debería haber 4
    if (datosTabla.length < this.config.estructuraInicial.length) {
      return true;
    }
    
    // ✅ Detectar si todas las filas son placeholders vacíos
    // Verificar específicamente el campo de categoría (que es el que define la estructura)
    const totalKey = this.config.totalKey || 'categoria';
    const estructuraLength = this.config.estructuraInicial?.length ?? 0;
    const todasVacias = datosTabla.every((fila: any) => {
      if (!fila || typeof fila !== 'object') return true;
      
      // Si el campo clave (categoria) está vacío, es placeholder
      const claveVacia = !fila[totalKey] || fila[totalKey].toString().trim() === '';
      
      // Verificar si todos los valores son vacíos/cero
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
    
    // ✅ Verificar si las categorías NO coinciden con la estructura inicial esperada
    // Esto detecta casos donde hay datos pero con categorías incorrectas
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
    
    // Si no hay ninguna categoría que coincida con las esperadas, reinicializar
    const tieneCategoriasValidas = categoriasActuales.some(catActual => 
      categoriasEsperadas.some(catEsperada => catActual.includes(catEsperada) || catEsperada.includes(catActual))
    );
    
    if (categoriasActuales.length > 0 && !tieneCategoriasValidas) {
      return true;
    }
    
    return false;
  }

  /**
   * Obtiene la tablaKey con prefijo usando PrefixManager centralizado
   * ✅ Previene duplicación de prefijos mediante caché
   * ✅ Verifica si los datos tienen contenido real antes de usar clave con prefijo
   */
  private obtenerTablaKeyConPrefijo(): string {
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    
    if (!tablaKeyBase) {
      return '';
    }
    
    const tablaKeyConPrefijo = PrefixManager.getFieldKey(this.sectionId, tablaKeyBase);
    
    // ✅ PRIMERO: Preferir la clave con prefijo si existe Y tiene contenido real
    const datosConPrefijo = this.datos[tablaKeyConPrefijo];
    if (datosConPrefijo && this.tieneContenidoRealTabla(datosConPrefijo)) {
      return tablaKeyConPrefijo;
    }
    
    // FALLBACK: usar clave base si existe Y tiene contenido real
    const datosBase = this.datos[tablaKeyBase];
    if (datosBase && this.tieneContenidoRealTabla(datosBase)) {
      return tablaKeyBase;
    }
    
    // Si ninguna tiene contenido real, devolver clave con prefijo (default)
    return tablaKeyConPrefijo;
  }

  /**
   * Verifica si una tabla tiene contenido real (no solo estructura vacía)
   */
  private tieneContenidoRealTabla(tabla: any): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    
    return tabla.some((item: any) => {
      if (!item || typeof item !== 'object') return false;
      
      // Verificar si algún campo tiene un valor no vacío
      return Object.keys(item).some(key => {
        const valor = item[key];
        if (valor === null || valor === undefined) return false;
        if (typeof valor === 'string') return valor.trim() !== '' && valor !== '0%' && valor !== '0,00 %';
        if (typeof valor === 'number') return valor !== 0;
        return true;
      });
    });
  }

  /**
   * ✅ SOLID - SRP: Método con responsabilidad única de ejecutar cálculos automáticos
   * ✅ SOLID - DRY: Centraliza la lógica duplicada en múltiples lugares
   * ✅ SOLID - DIP: Usa la estrategia inyectada en lugar de lógica hardcodeada
   * ✅ SOLID - OCP: Controla cuándo ejecutar cálculos basado en contexto
   * 
   * @param esDatosMock - Si es true, NO ejecuta cálculos automáticos (para datos mock)
   * @param esEdicionUsuario - Si es true, ejecuta cálculos automáticos (usuario editó datos)
   */
  private ejecutarCalculosAutomaticosSiEsNecesario(
    esDatosMock: boolean = false,
    esEdicionUsuario: boolean = false
  ): void {
    
    // ✅ FASE 1: NO calcular automáticamente cuando se cargan datos mock
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

    // ✅ SOLID - DIP: Usar estrategia para decidir qué calcular
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
      // Fallback para compatibilidad si la estrategia no está disponible
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
    
    // Validar y normalizar valor según tipo de columna
    const columna = this.columns.find(col => col.field === field);
    const valorValidado = this.validarYNormalizarValor(columna, value);
    
    // Invalidar caché cuando hay cambios
    this.cachedTableData = [];
    this.lastTablaKey = '';
    
    if (this.customFieldChangeHandler) {
      this.customFieldChangeHandler(index, field, valorValidado);
    } else {
      this.tableFacade.actualizarFila(
        this.datos,
        { ...this.config, tablaKey: tablaKeyActual },
        index,
        field,
        valorValidado
      );
    }
    
    // Asegurar que la tabla existe y es un array
    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }
    
    // Hacer copia profunda del array para forzar detección de cambios
    const tablaCopia = this.datos[tablaKeyActual].map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    
    // ✅ REFACTOR FASE 1: Solo persistir versión con prefijo (eliminar doble persistencia)
    this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
    
    // ✅ SOLID: Asegurar que los cálculos se ejecuten cuando el usuario edita un campo
    // ✅ FASE 1: Solo calcular cuando es edición de usuario (no datos mock)
    setTimeout(() => {
      this.ejecutarCalculosAutomaticosSiEsNecesario(false, true); // esDatosMock=false, esEdicionUsuario=true
    }, 0);
    
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    this.cdRef.detectChanges();
  }

  /**
   * Valida y normaliza valores según el tipo de dato de la columna
   * @param columna - Configuración de la columna
   * @param value - Valor a validar
   * @returns Valor validado y normalizado
   */
  private validarYNormalizarValor(columna: TableColumn | undefined, value: any): any {
    if (!columna) return value;

    const dataType = columna.dataType || 'string';

    switch (dataType) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          console.warn(`⚠️ Valor no numérico en ${columna.field}:`, value);
          return 0;
        }
        return num;

      case 'percentage':
        const perc = parseFloat(value);
        if (isNaN(perc)) {
          return 0;
        }
        // Asegurar que esté entre 0 y 100
        return Math.max(0, Math.min(100, perc));

      case 'boolean':
        if (typeof value === 'boolean') return value;
        const str = String(value).toLowerCase().trim();
        return str === 'true' || str === 'si' || str === 'sí' || str === '1' || str === 'yes';

      case 'string':
      default:
        // Validar valores permitidos si existen
        if (columna.allowedValues && columna.allowedValues.length > 0) {
          const valorNormalizado = String(value).trim().toUpperCase();
          const permitido = columna.allowedValues.some(v => 
            String(v).trim().toUpperCase() === valorNormalizado
          );
          if (!permitido && valorNormalizado !== '') {
            console.warn(`⚠️ Valor no permitido en ${columna.field}:`, value, 
              `(Permitidos: ${columna.allowedValues.join(', ')})`);
          }
        }
        return typeof value === 'string' ? value.trim() : String(value || '').trim();
    }
  }

  onAdd(): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;
    
    // Asegurar que la tabla existe
    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }
    
    this.tableFacade.agregarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual });
    
    // ✅ SOLID - DRY: Usar método centralizado
    // ✅ Usuario agregó fila - calcular automáticamente
    this.ejecutarCalculosAutomaticosSiEsNecesario(false, true); // esDatosMock=false, esEdicionUsuario=true
    
    // Invalidar caché para forzar re-lectura
    this.cachedTableData = [];
    this.lastTablaKey = '';
    
    // Hacer copia profunda del array para forzar detección de cambios
    const tablaCopia = this.datos[tablaKeyActual].map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    
    // ✅ REFACTOR FASE 1: Solo persistir versión con prefijo (eliminar doble persistencia)
    this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    
    // ✅ CRÍTICO: Actualizar tableData inmediatamente después de agregar
    this.actualizarTableData();
    this.cdRef.detectChanges();
  }

  onDelete(index: number): void {
    if (!this.config) return;
    
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) return;
    
    // Asegurar que la tabla existe
    if (!this.datos[tablaKeyActual] || !Array.isArray(this.datos[tablaKeyActual])) {
      this.datos[tablaKeyActual] = [];
    }
    
    const deleted = this.tableFacade.eliminarFila(this.datos, { ...this.config, tablaKey: tablaKeyActual }, index);
    
    if (deleted) {
      // ✅ SOLID - DRY: Usar método centralizado
      // ✅ Usuario eliminó fila - calcular automáticamente
      this.ejecutarCalculosAutomaticosSiEsNecesario(false, true); // esDatosMock=false, esEdicionUsuario=true
      
      // Invalidar caché para forzar re-lectura
      this.cachedTableData = [];
      this.lastTablaKey = '';
      
      // Hacer copia profunda del array para forzar detección de cambios
      const tablaCopia = this.datos[tablaKeyActual].map((item: any) => 
        typeof item === 'object' && item !== null ? { ...item } : item
      );
      
      // ✅ REFACTOR FASE 1: Solo persistir versión con prefijo (eliminar doble persistencia)
      this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
      this.dataChange.emit(this.datos[tablaKeyActual]);
      this.tableUpdated.emit();
      
      // ✅ CRÍTICO: Actualizar tableData inmediatamente después de eliminar
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
    
    // Usar config.totalKey si existe, sino usar this.totalKey
    const totalKeyToUse = this.config?.totalKey || this.totalKey;
    const totalValue = item[totalKeyToUse];
    const canDeleteResult = !totalValue || !totalValue.toString().toLowerCase().includes('total');
    
    return canDeleteResult;
  }

  initializeTable(): void {
    if (!this.config || this.isInitializing) return;
    
    this.isInitializing = true; // Activar guard
    
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      this.isInitializing = false;
      return;
    }
    
    if (this.tableFacade) {
      this.tableFacade.inicializarTabla(this.datos, { ...this.config, tablaKey: tablaKeyActual });
      
      // ✅ SOLID - DRY: Usar método centralizado
      // ⚠️ Inicialización: NO calcular automáticamente (podrían ser datos mock)
      // Los cálculos se ejecutarán cuando el usuario edite los datos
      // this.ejecutarCalculosAutomaticosSiEsNecesario(true, false); // esDatosMock=true
    }
    
    // Invalidar caché para forzar re-lectura
    this.cachedTableData = [];
    this.lastTablaKey = '';

    // ✅ Actualizar tableData inmediatamente para reflejar la nueva fila
    this.actualizarTableData();
    
    // Hacer copia profunda del array para forzar detección de cambios
    const tablaCopia = (this.datos[tablaKeyActual] || []).map((item: any) => 
      typeof item === 'object' && item !== null ? { ...item } : item
    );
    
    // ✅ REFACTOR FASE 1: Solo persistir versión con prefijo (eliminar doble persistencia)
    this.formChange.persistFields(this.sectionId, 'table', { [tablaKeyActual]: tablaCopia });
    this.dataChange.emit(this.datos[tablaKeyActual]);
    this.tableUpdated.emit();
    
    // Desactivar guard después de un ciclo
    setTimeout(() => {
      this.isInitializing = false;
      this.cdRef.detectChanges();
    }, 100);
  }

  /**
   * Actualiza la propiedad tableData desde los datos actuales
   * Se llama después de limpiar legacy o inicializar
   */
  private actualizarTableData(): void {
    const tablaKeyActual = this.obtenerTablaKeyConPrefijo();
    if (!tablaKeyActual) {
      this.tableData = [];
      return;
    }
    
    const datosConPrefijo = this.datos[tablaKeyActual];
    const tablaKeyBase = this.tablaKey || this.config?.tablaKey;
    const fallback = tablaKeyBase ? this.datos[tablaKeyBase] : undefined;
    
    // Determinar qué datos usar
    let datosFinales: any[] = [];
    
    if (datosConPrefijo && Array.isArray(datosConPrefijo) && datosConPrefijo.length > 0) {
      datosFinales = datosConPrefijo;
    } else if (fallback && Array.isArray(fallback) && fallback.length > 0) {
      // ✅ SINCRONIZACIÓN: Si usamos fallback, copiar a la clave con prefijo
      datosFinales = structuredClone(fallback);
      this.datos[tablaKeyActual] = datosFinales;
      // 🔄 Sincronizando datos desde fallback a tablaKeyActual
    } else if (this.config?.estructuraInicial && this.config.estructuraInicial.length > 0) {
      // ✅ SINCRONIZACIÓN: Si usamos estructura inicial, copiar a la clave con prefijo
      datosFinales = structuredClone(this.config.estructuraInicial);
      this.datos[tablaKeyActual] = datosFinales;
      // 🔄 Sincronizando datos desde estructura inicial a tablaKeyActual
    } else {
      datosFinales = [];
    }
    
    this.tableData = datosFinales;
    
    // ✅ SOLID - DRY: Usar método centralizado si hay datos reales
    if (datosFinales.length > 0 && this.config) {
      const tieneDatosReales = datosFinales.some((item: any) => {
        if (this.config.campoTotal) {
          const valor = item[this.config.campoTotal];
          return valor !== undefined && valor !== null && valor !== '' && valor !== 0;
        }
        return false;
      });
      
      // ⚠️ Verificación de datos: NO calcular automáticamente (podrían ser datos mock)
      // Los cálculos se ejecutarán cuando el usuario edite los datos
      // if (tieneDatosReales) {
      //   this.ejecutarCalculosAutomaticosSiEsNecesario(true, false); // esDatosMock=true
      // }
    }
  }

  /**
   * ✅ REFACTOR: getTableData() ahora solo retorna tableData (propiedad cached)
   * NO limpia legacy - esa lógica está en verificarEInicializarTabla()
   * Esto evita bucles infinitos porque getTableData() se llama desde el template
   */
  getTableData(): any[] {
    // Retornar propiedad cached directamente (evita llamadas repetidas)
    return this.tableData || [];
  }

  getFormattedValue(item: any, col: TableColumn): string {
    const value = item[col.field];
    if (col.formatter) {
      return col.formatter(value);
    }
    return value != null ? String(value) : '';
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}

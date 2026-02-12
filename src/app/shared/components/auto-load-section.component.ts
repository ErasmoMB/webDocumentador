import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Directive, OnDestroy, Injector } from '@angular/core';
import { AutoBackendDataLoaderService } from 'src/app/core/services/backend/auto-backend-data-loader.service';
import { BackendDataMapperService } from 'src/app/core/services/backend/backend-data-mapper.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/tables/table-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { Subscription, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BaseSectionComponent } from './base-section.component';

@Directive()
export abstract class AutoLoadSectionComponent extends BaseSectionComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
  protected autoLoadSubscriptions: Subscription[] = [];
  private isLoadingData = false;
  private lastLoadedSectionKey: string | null = null;
  private loadDebounceSubscription: Subscription | null = null;

  protected constructor(
    cdRef: ChangeDetectorRef,
    protected autoLoader: AutoBackendDataLoaderService,
    injector: Injector,
    protected backendDataMapper?: BackendDataMapperService,
    protected tableFacade?: TableManagementFacade
  ) {
    super(cdRef, injector);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Solo cargar datos automáticamente si estamos en modo formulario
    // En modo vista (plantilla), los datos ya están cargados desde formularioService
    if (this.modoFormulario !== false) {
      this.loadAutoSectionData();
    }
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    // Solo cargar datos automáticamente si estamos en modo formulario
    if (changes['seccionId'] && !this.isLoadingData && this.modoFormulario !== false) {
      this.debouncedLoadAutoSectionData();
    }
  }

  override ngOnDestroy(): void {
    if (this.loadDebounceSubscription) {
      this.loadDebounceSubscription.unsubscribe();
    }
    this.autoLoadSubscriptions.forEach(sub => sub.unsubscribe());
    super.ngOnDestroy();
  }

  protected override loadSectionData(): void {
    // La carga automática reemplaza la carga manual de BaseSectionComponent
  }

  private debouncedLoadAutoSectionData(forceRefresh: boolean = false): void {
    if (this.loadDebounceSubscription) {
      this.loadDebounceSubscription.unsubscribe();
    }

    const sectionKey = this.getSectionKey();
    const parameters = this.getLoadParameters();
    
    if (!sectionKey || !parameters) {
      return;
    }

    const ubigeoList = Array.isArray(parameters) ? parameters : [parameters];
    const requestKey = `${sectionKey}_${JSON.stringify(ubigeoList)}`;

    if (this.isLoadingData && this.lastLoadedSectionKey === requestKey && !forceRefresh) {
      return;
    }

    this.loadDebounceSubscription = of({ sectionKey, ubigeoList, forceRefresh })
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.loadAutoSectionData(forceRefresh);
      });
  }

  protected loadAutoSectionData(forceRefresh: boolean = false): void {
    // ⚠️ BACKEND DESACTIVADO TEMPORALMENTE - Solo flujo frontend
    // DESCOMENTAR cuando el backend esté listo:
    // console.warn('⚠️ Carga automática de backend DESACTIVADA');
    return;
    
    /* CÓDIGO COMENTADO - REACTIVAR CON BACKEND
    // No cargar datos automáticamente en modo vista (plantilla)
    // Los datos ya están disponibles desde formularioService
    if (this.modoFormulario === false) {
      return;
    }
    
    const sectionKey = this.getSectionKey();
    const parameters = this.getLoadParameters();
    
    if (!sectionKey || !parameters) {
      return;
    }

    const ubigeoList = Array.isArray(parameters) ? parameters : [parameters];
    const requestKey = `${sectionKey}_${JSON.stringify(ubigeoList)}`;

    if (this.isLoadingData && this.lastLoadedSectionKey === requestKey && !forceRefresh) {
      return;
    }

    this.isLoadingData = true;
    this.lastLoadedSectionKey = requestKey;
    
    const subscription = this.autoLoader.loadSectionData(sectionKey, ubigeoList, forceRefresh)
      .subscribe({
        next: (loadedData) => {
          this.applyLoadedData(loadedData);
          this.isLoadingData = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.isLoadingData = false;
        }
      });

    this.autoLoadSubscriptions.push(subscription);
    */
  }

  protected applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const sectionKey = this.getSectionKey();

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;

      // Obtener metadata de la tabla si está disponible (nuevo sistema)
      const tableMetadata = this.backendDataMapper?.getTableMetadata(sectionKey, fieldName);
      
      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;
      const tablaKey = tableMetadata?.tablaKey || fieldName;
      const tablaKeyConPrefijo = prefijo ? `${tablaKey}${prefijo}` : tablaKey;
      
      const datosActuales = this.datos[tablaKeyConPrefijo];
      const existeDato = datosActuales !== undefined && datosActuales !== null;

      const sonArrays = Array.isArray(data) && Array.isArray(datosActuales);

      // Para tablas (arrays), verificar si es placeholder antes de actualizar
      const esTabla = Array.isArray(data);
      const actualEsPlaceholder = esTabla && this.esTablaPlaceholder(datosActuales);

      // Reemplaza si no existe, o si el contenido cambió, o si viene tabla válida y actual es placeholder
      const debeActualizar = !existeDato ||
        (sonArrays && JSON.stringify(data) !== JSON.stringify(datosActuales)) ||
        (!sonArrays && JSON.stringify(data) !== JSON.stringify(datosActuales)) ||
        (esTabla && data.length > 0 && actualEsPlaceholder);

      if (debeActualizar) {
        // ✅ FASE 1: Eliminar porcentajes existentes antes de guardar datos mock
        let datosLimpios = Array.isArray(data) ? [...data] : data;
        const campoPorcentaje = tableMetadata?.tableConfig?.campoPorcentaje;
        if (Array.isArray(datosLimpios) && campoPorcentaje) {
          datosLimpios = datosLimpios.map((item: any) => {
            const itemLimpio = { ...item };
            // Eliminar porcentaje si existe (se calculará dinámicamente cuando el usuario edite)
            delete itemLimpio[campoPorcentaje];
            return itemLimpio;
          });
        }
        
        // Guardar con prefijo usando tablaKey
        this.datos[tablaKeyConPrefijo] = datosLimpios;
        
        // ✅ FASE 1: NO calcular porcentajes automáticamente cuando se cargan datos mock
        // Los porcentajes se calcularán dinámicamente cuando el usuario edite los datos
        // Solo calcular porcentajes si es explícitamente necesario (datos del backend real)
        // if (tableMetadata?.tableConfig.calcularPorcentajes && Array.isArray(datosLimpios) && this.tableFacade) {
        //   const tableConfig: TableConfig = {
        //     tablaKey: tablaKeyConPrefijo,
        //     totalKey: tableMetadata.tableConfig.totalKey,
        //     campoTotal: tableMetadata.tableConfig.campoTotal,
        //     campoPorcentaje: tableMetadata.tableConfig.campoPorcentaje,
        //     calcularPorcentajes: tableMetadata.tableConfig.calcularPorcentajes,
        //     estructuraInicial: tableMetadata.tableConfig.estructuraInicial,
        //     camposParaCalcular: tableMetadata.tableConfig.camposParaCalcular
        //   };
        //   this.calcularPorcentajesTabla(tablaKeyConPrefijo, tableConfig);
        // }
        
        // Persistir
        this.onFieldChange(tablaKeyConPrefijo as any, this.datos[tablaKeyConPrefijo]);
        
        // También actualizar sin prefijo para compatibilidad
        if (prefijo) {
          this.datos[tablaKey] = Array.isArray(this.datos[tablaKeyConPrefijo]) 
            ? [...this.datos[tablaKeyConPrefijo]] 
            : this.datos[tablaKeyConPrefijo];
        }
        
        // Invalidar cachés específicos cuando cambian tablas calculadas
        if (fieldName === 'peaOcupacionesTabla' && typeof (this as any).invalidarCachePEA === 'function') {
          (this as any).invalidarCachePEA();
        }
      }
    }

    // IMPORTANTE: Recalcular porcentajes DESPUÉS de actualizar todos los datos
    this.recalcularPorcentajesDelBackend(loadedData);
    this.actualizarDatos();
  }

  /**
   * Calcula porcentajes para una tabla usando su configuración de metadata
   */
  protected calcularPorcentajesTabla(tablaKey: string, tableConfig: TableConfig): void {
    if (!this.tableFacade) return;
    
    const tabla = this.datos[tablaKey];
    if (!Array.isArray(tabla) || tabla.length === 0) return;
    
    this.tableFacade.calcularPorcentajes(this.datos, {
      tablaKey: tablaKey,
      totalKey: tableConfig.totalKey,
      campoTotal: tableConfig.campoTotal,
      campoPorcentaje: tableConfig.campoPorcentaje,
      calcularPorcentajes: tableConfig.calcularPorcentajes
    });
  }

  /**
   * Verifica si una tabla es un placeholder (vacía o con solo valores por defecto)
   * Puede ser sobrescrito en componentes específicos para lógica personalizada
   */
  protected esTablaPlaceholder(valor: any): boolean {
    if (!Array.isArray(valor) || valor.length === 0) {
      return true;
    }

    // Verificar si todas las filas tienen valores vacíos o cero
    return valor.every((row: any) => {
      if (!row) return true;
      
      // Verificar campos numéricos
      const tieneCasos = row.casos !== undefined;
      const casos = tieneCasos ? (typeof row.casos === 'number' ? row.casos : parseInt(row.casos) || 0) : null;
      
      // Verificar campos de texto
      const tieneCategoria = row.categoria !== undefined;
      const categoriaVacia = tieneCategoria ? (row.categoria?.toString().trim() || '') === '' : true;
      
      const tieneSexo = row.sexo !== undefined;
      const sexoVacio = tieneSexo ? (row.sexo?.toString().trim() || '') === '' : true;
      
      const tieneIndicador = row.indicador !== undefined;
      const indicadorVacio = tieneIndicador ? (row.indicador?.toString().trim() || '') === '' : true;
      
      const claveVacia = categoriaVacia && sexoVacio && indicadorVacio;
      
      // Es placeholder si la clave está vacía y los casos son 0 o null
      return claveVacia && (casos === null || casos === 0);
    });
  }

  /**
   * Recalcula porcentajes para tablas que vinieron del backend
   * Esto asegura que los porcentajes se calculen dinámicamente basados en los casos
   */
  protected recalcularPorcentajesDelBackend(loadedData: { [fieldName: string]: any }): void {
    // Este método puede ser sobrescrito en componentes específicos si necesitan lógica especial
    // Por defecto, hace nada - cada componente decide qué tablas recalcular
  }

  protected abstract getSectionKey(): string;

  protected abstract getLoadParameters(): string | string[] | null;
}

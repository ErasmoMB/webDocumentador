import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { Seccion6DataService } from 'src/app/core/services/domain/seccion6-data.service';
import { Seccion6TextGeneratorService } from 'src/app/core/services/domain/seccion6-text-generator.service';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { debugLog } from 'src/app/shared/utils/debug';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CoreSharedModule
  ],
  selector: 'app-seccion6-form',
  templateUrl: './seccion6-form.component.html'
})
export class Seccion6FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';

  override watchedFields: string[] = [
    'grupoAISD',
    'poblacionSexoAISD',
    'poblacionEtarioAISD',
    'textoPoblacionSexoAISD',
    'textoPoblacionEtarioAISD',
    'tituloPoblacionSexoAISD',
    'tituloPoblacionEtarioAISD',
    'fuentePoblacionSexoAISD',
    'fuentePoblacionEtarioAISD'
  ];

  poblacionSexoConfig!: TableConfig;
  poblacionEtarioConfig!: TableConfig;

  private stateSubscription?: Subscription;
  private isProcessingPipeline = false;

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion6TableConfigService,
    private dataSrv: Seccion6DataService,
    private textGenSrv: Seccion6TextGeneratorService,
    private stateAdapter: ReactiveStateAdapter,
    private tableFacade: TableManagementFacade
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Demografía' }
    ];
    this.poblacionSexoConfig = this.tableCfg.getTablaPoblacionSexoConfig();
    this.poblacionEtarioConfig = this.tableCfg.getTablaPoblacionEtarioConfig();
    
    // ✅ DEBUG: Verificar que la configuración se creó correctamente
    debugLog('[PORCENTAJES] 🔧 Seccion6FormComponent - Config creada:', {
      poblacionSexoConfig: this.poblacionSexoConfig,
      tieneCampoTotal: !!this.poblacionSexoConfig.campoTotal,
      tieneCampoPorcentaje: !!this.poblacionSexoConfig.campoPorcentaje,
      calcularPorcentajes: this.poblacionSexoConfig.calcularPorcentajes
    });
  }

  protected override onInitCustom(): void {
    this.initDataPipeline();
    this.subscribeToStateChanges();
  }

  private initDataPipeline(): void {
    if (this.isProcessingPipeline) return;
    this.isProcessingPipeline = true;
    try {
      this.cargarTodosLosGrupos();
      // ✅ Calcular porcentajes DESPUÉS de cargar los datos
      this.calcularPorcentajesIniciales();
    } finally {
      this.isProcessingPipeline = false;
    }
  }

  /**
   * ✅ SOLID - SRP: Calcula porcentajes iniciales usando el facade
   * El cálculo automático ya está manejado por dynamic-table, pero
   * necesitamos calcular cuando se cargan datos desde el backend
   */
  private calcularPorcentajesIniciales(): void {
    debugLog('[PORCENTAJES] 🚀 calcularPorcentajesIniciales() iniciado');
    
    // Usar setTimeout para asegurar que los datos estén completamente cargados
    setTimeout(() => {
      // ✅ SOLID - DIP: Usar facade en lugar de lógica manual
      const prefijo = this.obtenerPrefijoGrupo();
      const tablaSexoKey = prefijo ? `poblacionSexoAISD${prefijo}` : 'poblacionSexoAISD';
      const tablaEtarioKey = prefijo ? `poblacionEtarioAISD${prefijo}` : 'poblacionEtarioAISD';
      
      debugLog('[PORCENTAJES] 🔑 Claves de tabla:', { prefijo, tablaSexoKey, tablaEtarioKey });
      
      // Calcular para población por sexo
      if (this.datos[tablaSexoKey]?.length > 0 || this.datos['poblacionSexoAISD']?.length > 0) {
        const datosTabla = this.datos[tablaSexoKey] || this.datos['poblacionSexoAISD'];
        debugLog('[PORCENTAJES] 📊 Datos tabla sexo:', datosTabla);
        
        if (datosTabla && Array.isArray(datosTabla) && datosTabla.length > 0) {
          // Verificar si ya tiene porcentajes calculados
          const tienePorcentajes = datosTabla.some((item: any) => 
            item.porcentaje && 
            item.porcentaje !== '—' && 
            item.porcentaje !== '' && 
            item.porcentaje !== null &&
            !item.sexo?.toString().toLowerCase().includes('total')
          );
          
          debugLog('[PORCENTAJES] 🔍 Tabla sexo tiene porcentajes?', tienePorcentajes);
          
          if (!tienePorcentajes) {
            debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla sexo...');
            this.tableFacade.calcularTotalesYPorcentajes(
              this.datos,
              { ...this.poblacionSexoConfig, tablaKey: tablaSexoKey }
            );
            debugLog('[PORCENTAJES] ✅ Porcentajes calculados. Datos actualizado:', this.datos[tablaSexoKey] || this.datos['poblacionSexoAISD']);
            this.cdRef.detectChanges();
          }
        }
      }
      
      // Calcular para población por grupo etario
      if (this.datos[tablaEtarioKey]?.length > 0 || this.datos['poblacionEtarioAISD']?.length > 0) {
        const datosTabla = this.datos[tablaEtarioKey] || this.datos['poblacionEtarioAISD'];
        if (datosTabla && Array.isArray(datosTabla) && datosTabla.length > 0) {
          // Verificar si ya tiene porcentajes calculados
          const tienePorcentajes = datosTabla.some((item: any) => 
            item.porcentaje && 
            item.porcentaje !== '—' && 
            item.porcentaje !== '' && 
            item.porcentaje !== null &&
            !item.categoria?.toString().toLowerCase().includes('total')
          );
          
          if (!tienePorcentajes) {
            this.tableFacade.calcularTotalesYPorcentajes(
              this.datos,
              { ...this.poblacionEtarioConfig, tablaKey: tablaEtarioKey }
            );
            this.cdRef.detectChanges();
          }
        }
      }
    }, 100);
  }

  private subscribeToStateChanges(): void {
    // ✅ Formularios NO deben suscribirse a cambios del store
    // Son la fuente de los cambios, no consumidores
  }

  override ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    if (!this.projectFacade) return false;
    const actual = JSON.stringify(this.projectFacade.obtenerDatos());
    const anterior = JSON.stringify(this.datosAnteriores);
    if (actual !== anterior) {
      this.datosAnteriores = JSON.parse(actual);
      return true;
    }
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    // Lógica específica de actualización si es necesaria
  }

  override obtenerNombreComunidadActual(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  override obtenerValorConPrefijo(campo: string): any {
    return this.dataSrv.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  obtenerTextoPoblacionSexo(): string {
    return this.textGenSrv.obtenerTextoPoblacionSexo(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoPoblacionEtario(): string {
    return this.textGenSrv.obtenerTextoPoblacionEtario(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  getPoblacionSexoSinTotal(): any[] {
    return this.dataSrv.getPoblacionSexoSinTotal(this.datos);
  }

  getPoblacionEtarioSinTotal(): any[] {
    return this.dataSrv.getPoblacionEtarioSinTotal(this.datos);
  }

  getTotalPoblacionSexo(): number {
    return this.dataSrv.getTotalPoblacionSexo(this.datos);
  }

  getTotalPoblacionEtario(): number {
    return this.dataSrv.getTotalPoblacionEtario(this.datos);
  }

  /**
   * Calcula dinámicamente el porcentaje del total de población por sexo
   * Siempre será 100,00 % pero se calcula dinámicamente para mantener consistencia
   */
  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    if (total === 0) {
      return '0,00 %';
    }
    // El total siempre representa el 100% de los casos
    return '100,00 %';
  }

  /**
   * Calcula dinámicamente el porcentaje del total de población por grupo etario
   * Siempre será 100,00 % pero se calcula dinámicamente para mantener consistencia
   */
  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    if (total === 0) {
      return '0,00 %';
    }
    // El total siempre representa el 100% de los casos
    return '100,00 %';
  }

  /**
   * ✅ SOLID - SRP: El cálculo automático ya está manejado por dynamic-table
   * Este método solo actualiza la vista cuando la tabla cambia
   */
  onTablaSexoActualizada(): void {
    // El cálculo automático ya fue ejecutado por dynamic-table usando la estrategia SOLID
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  /**
   * ✅ SOLID - SRP: El cálculo automático ya está manejado por dynamic-table
   * Este método solo actualiza la vista cuando la tabla cambia
   */
  onTablaEtarioActualizada(): void {
    // El cálculo automático ya fue ejecutado por dynamic-table usando la estrategia SOLID
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  /**
   * ✅ SOLID - ELIMINADO: Método manual duplicado
   * 
   * Este método fue eliminado porque violaba:
   * - SRP: El componente estaba haciendo cálculos en lugar de delegar
   * - DRY: Duplicaba lógica ya existente en TableCalculationService
   * - DIP: Dependía de implementación concreta en lugar de abstracción
   * 
   * El cálculo automático ahora se maneja completamente por:
   * 1. TableCalculationStrategyService (determina cuándo calcular)
   * 2. TableCalculationService (ejecuta los cálculos)
   * 3. DynamicTableComponent (dispara cálculos automáticamente)
   * 
   * Los cálculos se ejecutan automáticamente cuando:
   * - Se cambia un valor en la tabla (onFieldChange)
   * - Se agrega una fila (onAdd)
   * - Se elimina una fila (onDelete)
   * - Se inicializa la tabla (verificarEInicializarTabla)
   */

  protected override onFieldChange(fieldName: string, value: any, options?: { refresh?: boolean }): void {
    super.onFieldChange(fieldName, value, { refresh: options?.refresh ?? false });
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(event: any): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }
}


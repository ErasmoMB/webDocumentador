import { Component, Input, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { debugLog } from 'src/app/shared/utils/debug';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { FotoItem } from '../image-upload/image-upload.component';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { Seccion6DataService } from 'src/app/core/services/domain/seccion6-data.service';
import { Seccion6TextGeneratorService } from 'src/app/core/services/domain/seccion6-text-generator.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule
  ],
  selector: 'app-seccion6-view-internal',
  templateUrl: './seccion6-view.component.html'
})
export class Seccion6ViewInternalComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  
  fotografiasVista: FotoItem[] = [];
  private stateSubscription?: Subscription;

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

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion6TableConfigService,
    private dataSrv: Seccion6DataService,
    private textGenSrv: Seccion6TextGeneratorService,
    private sanitizer: DomSanitizer,
    private stateAdapter: ReactiveStateAdapter
  ) {
    super(cdRef, injector);
    this.poblacionSexoConfig = this.tableCfg.getTablaPoblacionSexoConfig();
    this.poblacionEtarioConfig = this.tableCfg.getTablaPoblacionEtarioConfig();
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    
    // Suscribirse a cambios de datos para actualizar fotografías en tiempo real
    this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
      this.cargarFotografias();
      this.cdRef.detectChanges();
    });
    
    this.logGrupoActual();
  }

  override ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasVista = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.cdRef.markForCheck();
  }

  override obtenerNombreComunidadActual(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.datos, this.seccionId);
  }

  override obtenerValorConPrefijo(campo: string): any {
    return this.dataSrv.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  obtenerTextoPoblacionSexoConResaltado(): SafeHtml {
    return this.textGenSrv.obtenerTextoPoblacionSexoConResaltado(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  obtenerTextoPoblacionEtarioConResaltado(): SafeHtml {
    return this.textGenSrv.obtenerTextoPoblacionEtarioConResaltado(
      this.datos,
      this.obtenerNombreComunidadActual()
    );
  }

  getPoblacionSexoConPorcentajes(): any[] {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return [];
    }

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaSexo.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      debugLog('⚠️ Total casos en tabla <= 0, retornando porcentajes 0,00%');
      return tablaSexo.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = tablaSexo.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje ${item.sexo || item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    // Agregar fila de total si no existe
    const filaTotal = {
      sexo: 'Total',
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);

    // Log específico para la tabla Cuadro 3.5
    debugLog('📊 Cuadro N° 3.5 - Población por sexo:', tablaConPorcentajes);
    
    return tablaConPorcentajes;
  }

  private calcularPorcentajesTabla(tabla: any[]): any[] {
    if (!Array.isArray(tabla) || tabla.length === 0) {
      return tabla;
    }

    // Usar el total de población de la comunidad, no el total de la tabla
    const total = this.getTotalPoblacionComunidad();

    if (total <= 0) {
      debugLog('⚠️ Total población <= 0, retornando porcentajes 0,00%');
      return tabla.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    return tabla.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje ${item.sexo || item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });
  }

  private getTotalPoblacionComunidad(): number {
    const totalPoblacionKey = this.obtenerPrefijoGrupo() ? `tablaAISD2TotalPoblacion${this.obtenerPrefijoGrupo()}` : 'tablaAISD2TotalPoblacion';
    const total = parseInt(this.datos[totalPoblacionKey] || this.datos['tablaAISD2TotalPoblacion'] || '0') || 0;
    debugLog('🔍 Total población comunidad:', { totalPoblacionKey, valor: this.datos[totalPoblacionKey], total });
    return total;
  }

  private getTablaSexo(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // 1. Buscar con prefijo AISD
    const tablaConPrefijo = prefijo ? this.datos[`poblacionSexoAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    // 2. Buscar sin prefijo AISD
    if (this.datos.poblacionSexoAISD && this.tieneContenidoRealDemografia(this.datos.poblacionSexoAISD)) {
      return this.datos.poblacionSexoAISD;
    }
    
    // 3. Fallback a clave del mock data (poblacionSexoTabla)
    if (this.datos.poblacionSexoTabla && this.tieneContenidoRealDemografia(this.datos.poblacionSexoTabla)) {
      return this.datos.poblacionSexoTabla;
    }
    
    return [];
  }

  private tieneContenidoRealDemografia(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(item => {
      const sexo = item.sexo?.toString().trim() || '';
      const categoria = item.categoria?.toString().trim() || '';
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sexo !== '' || categoria !== '' || casos > 0;
    });
  }

  getPoblacionEtarioConPorcentajes(): any[] {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return [];
    }

    // Calcular total dinámicamente como suma de casos en la tabla
    const total = tablaEtario.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      debugLog('⚠️ Total casos en tabla etario <= 0, retornando porcentajes 0,00%');
      return tablaEtario.map((item: any) => ({ ...item, porcentaje: '0,00 %' }));
    }

    // Calcular porcentajes basados en el total de la tabla
    const tablaConPorcentajes = tablaEtario.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const porcentajeFormateado = porcentaje
        .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace('.', ',') + ' %';

      debugLog(`📊 Cálculo porcentaje etario ${item.categoria}: ${casos} / ${total} = ${porcentaje.toFixed(2)}%`);

      return {
        ...item,
        casos,
        porcentaje: porcentajeFormateado
      };
    });

    // Agregar fila de total si no existe
    const filaTotal = {
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    };
    tablaConPorcentajes.push(filaTotal);

    // Log específico para la tabla Cuadro 3.6
    debugLog('📊 Cuadro N° 3.6 - Población por grandes grupos de edad:', tablaConPorcentajes);
    
    return tablaConPorcentajes;
  }

  private getTablaEtario(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // 1. Buscar con prefijo AISD
    const tablaConPrefijo = prefijo ? this.datos[`poblacionEtarioAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealDemografia(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    // 2. Buscar sin prefijo AISD
    if (this.datos.poblacionEtarioAISD && this.tieneContenidoRealDemografia(this.datos.poblacionEtarioAISD)) {
      return this.datos.poblacionEtarioAISD;
    }
    
    // 3. Fallback a clave del mock data (poblacionEtarioTabla)
    if (this.datos.poblacionEtarioTabla && this.tieneContenidoRealDemografia(this.datos.poblacionEtarioTabla)) {
      return this.datos.poblacionEtarioTabla;
    }
    
    return [];
  }

  getTotalPoblacionSexo(): number {
    const tablaSexo = this.getTablaSexo();
    if (!tablaSexo || !Array.isArray(tablaSexo) || tablaSexo.length === 0) {
      return 0;
    }
    
    return tablaSexo.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
  }

  getTotalPoblacionEtario(): number {
    const tablaEtario = this.getTablaEtario();
    if (!tablaEtario || !Array.isArray(tablaEtario) || tablaEtario.length === 0) {
      return 0;
    }
    
    return tablaEtario.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
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

  getInstituciones(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    
    // 1. Buscar con prefijo AISD
    const tablaConPrefijo = prefijo ? this.datos[`institucionesAISD${prefijo}`] : null;
    if (tablaConPrefijo && this.tieneContenidoRealInstituciones(tablaConPrefijo)) {
      return tablaConPrefijo;
    }
    
    // 2. Buscar sin prefijo AISD
    if (this.datos.institucionesAISD && this.tieneContenidoRealInstituciones(this.datos.institucionesAISD)) {
      return this.datos.institucionesAISD;
    }
    
    // 3. Fallback a clave del mock data (institucionesTabla)
    if (this.datos.institucionesTabla && this.tieneContenidoRealInstituciones(this.datos.institucionesTabla)) {
      return this.datos.institucionesTabla;
    }
    
    return [];
  }

  private tieneContenidoRealInstituciones(tabla: any[]): boolean {
    if (!tabla || !Array.isArray(tabla) || tabla.length === 0) return false;
    return tabla.some(item => {
      const institucion = item.institucion?.toString().trim() || '';
      const disponibilidad = item.disponibilidad?.toString().trim() || '';
      const ubicacion = item.ubicacion?.toString().trim() || '';
      return institucion !== '' || disponibilidad !== '' || ubicacion !== '';
    });
  }

  protected override detectarCambios(): boolean {
    // Implementación básica para Seccion6ViewInternalComponent
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    // Implementación básica para Seccion6ViewInternalComponent
    // No se requieren actualizaciones específicas para vista interna
  }
}

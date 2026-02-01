import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { Seccion6TableConfigService } from 'src/app/core/services/domain/seccion6-table-config.service';
import { Seccion6DataService } from 'src/app/core/services/domain/seccion6-data.service';
import { Seccion6TextGeneratorService } from 'src/app/core/services/domain/seccion6-text-generator.service';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { FotoItem } from '../image-upload/image-upload.component';
import { debugLog } from 'src/app/shared/utils/debug';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CoreSharedModule
  ],
  selector: 'app-seccion6-form',
  templateUrl: './seccion6-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion6FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.2';
  
  override readonly PHOTO_PREFIX = 'fotografiaDemografia';
  override useReactiveSync: boolean = true;

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
  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ SIGNALS PUROS
  readonly sectionDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly poblacionSexoSignal: Signal<any[]> = computed(() => {
    const data = this.sectionDataSignal();
    return data['poblacionSexoAISD'] || [];
  });

  readonly poblacionEtarioSignal: Signal<any[]> = computed(() => {
    const data = this.sectionDataSignal();
    return data['poblacionEtarioAISD'] || [];
  });

  readonly textoPoblacionSexoSignal: Signal<string> = computed(() => {
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe
    const manual = data['textoPoblacionSexoAISD'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
    return this.textGenSrv.obtenerTextoPoblacionSexo(data, nombreComunidad);
  });

  readonly textoPoblacionEtarioSignal: Signal<string> = computed(() => {
    const data = this.sectionDataSignal();
    
    // ✅ Prioridad: leer valor manual si existe
    const manual = data['textoPoblacionEtarioAISD'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    
    // Fallback: generar texto automático
    const nombreComunidad = this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
    return this.textGenSrv.obtenerTextoPoblacionEtario(data, nombreComunidad);
  });

  readonly totalPoblacionSexoSignal: Signal<number> = computed(() => {
    return this.dataSrv.getTotalPoblacionSexo(this.sectionDataSignal());
  });

  readonly totalPoblacionEtarioSignal: Signal<number> = computed(() => {
    return this.dataSrv.getTotalPoblacionEtario(this.sectionDataSignal());
  });

  // ✅ SIGNAL PARA INFORMACIÓN DE GRUPOS AISD (Sección 6 pertenece a un grupo)
  readonly aisdGroupsSignal: Signal<readonly any[]> = computed(() => {
    return this.projectFacade.groupsByType('AISD')();
  });

  // ✅ PATRÓN MODO IDEAL: photoFieldsHash Signal para monitorear cambios de imágenes
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
      const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion6TableConfigService,
    private dataSrv: Seccion6DataService,
    private textGenSrv: Seccion6TextGeneratorService,
    private tableFacade: TableManagementFacade
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Demografía' }
    ];
    this.poblacionSexoConfig = this.tableCfg.getTablaPoblacionSexoConfig();
    this.poblacionEtarioConfig = this.tableCfg.getTablaPoblacionEtarioConfig();
    
    debugLog('[PORCENTAJES] 🔧 Seccion6FormComponent - Config creada:', {
      poblacionSexoConfig: this.poblacionSexoConfig,
      tieneCampoTotal: !!this.poblacionSexoConfig.campoTotal,
      tieneCampoPorcentaje: !!this.poblacionSexoConfig.campoPorcentaje,
      calcularPorcentajes: this.poblacionSexoConfig.calcularPorcentajes
    });

    // ✅ EFFECT 1: Auto-sync datos reactivamente
    effect(() => {
      const sectionData = this.sectionDataSignal();
      this.datos = { ...sectionData };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    // Este efecto replica el patrón de Sección 5 (MODO IDEAL)
    // allowSignalWrites: true permite escribir a fotografiasFormMulti después de cargarFotografias()
    effect(() => {
      this.photoFieldsHash();  // Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasFormMulti
      // Esto asegura que el template se renderice con las nuevas imágenes
      this.fotografiasFormMulti = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });

    // ✅ EFFECT 3: Calcular porcentajes cuando los datos de población cambien
    effect(() => {
      const sexoData = this.poblacionSexoSignal();
      const etarioData = this.poblacionEtarioSignal();
      
      // Verificar si necesita cálculo de porcentajes
      if (sexoData.length > 0 && !this.tienePorcentajesCalculados(sexoData)) {
        debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla sexo...');
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...this.poblacionSexoConfig, tablaKey: 'poblacionSexoAISD' }
        );
      }

      if (etarioData.length > 0 && !this.tienePorcentajesCalculados(etarioData)) {
        debugLog('[PORCENTAJES] ⚡ Calculando porcentajes para tabla etario...');
        this.tableFacade.calcularTotalesYPorcentajes(
          this.sectionDataSignal(),
          { ...this.poblacionEtarioConfig, tablaKey: 'poblacionEtarioAISD' }
        );
      }

      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 4: Log automático del grupo AISD de esta sección
    effect(() => {
      const gruposAISD = this.aisdGroupsSignal();
      
      // Log solo si hay grupos cargados
      if (gruposAISD.length > 0) {
        console.log('%c=== INFORMACIÓN DE GRUPO AISD - SECCIÓN 6 ===', 'color: #1f2937; background: #f3f4f6; font-weight: bold; padding: 4px 8px; border-radius: 3px');
        
        gruposAISD.forEach((grupo, index) => {
          this.logGrupoAISDParaConsola(index + 1, grupo);
        });
      }
    });
  }

  /**
   * Log interno para mostrar información del grupo AISD en consola
   */
  private logGrupoAISDParaConsola(numeroGrupo: number, grupo: any): void {
    console.log(`%c🏘️ GRUPO AISD: A.${numeroGrupo} - ${grupo.nombre || 'Sin nombre'}`, 'color: #2563eb; font-weight: bold; font-size: 13px');
    console.log(`%cCentros Poblados (CCPP):`, 'color: #7c3aed; font-weight: bold');
    
    const centrosPobladosSeleccionados = grupo.ccppIds || [];
    console.log(`[DEBUG] centrosPobladosSeleccionados (${centrosPobladosSeleccionados.length}):`, centrosPobladosSeleccionados);
    
    if (centrosPobladosSeleccionados.length === 0) {
      console.log('  (Sin centros poblados asignados)');
      return;
    }
    
    const jsonCompleto = this.projectFacade.obtenerDatos()['jsonCompleto'] || {};
    const centrosDetalles: any[] = [];
    
    centrosPobladosSeleccionados.forEach((codigo: any) => {
      Object.keys(jsonCompleto).forEach((grupoKey: string) => {
        const grupoData = jsonCompleto[grupoKey];
        if (Array.isArray(grupoData)) {
          const centro = grupoData.find((c: any) => {
            const codigoCentro = String(c.CODIGO || '').trim();
            const codigoBuscado = String(codigo).trim();
            return codigoCentro === codigoBuscado;
          });
          if (centro && !centrosDetalles.find(c => c.CODIGO === centro.CODIGO)) {
            centrosDetalles.push(centro);
          }
        }
      });
    });
    
    if (centrosDetalles.length > 0) {
      centrosDetalles.forEach((cp: any, index: number) => {
        const nombre = cp.CCPP || cp.nombre || `CCPP ${index + 1}`;
        console.log(`  ${index + 1}. ${nombre} (Código: ${cp.CODIGO})`);
      });
    }
  }

  protected override onInitCustom(): void {
    this.cargarTodosLosGrupos();
    this.cargarFotografias();
    // ✅ Sincronizar fotografiasFormMulti con fotografiasCache después de cargar
    this.fotografiasFormMulti = [...this.fotografiasCache];
  }

  /**
   * ✅ Verifica si una tabla ya tiene porcentajes calculados
   */
  private tienePorcentajesCalculados(datos: any[]): boolean {
    return datos.some((item: any) => 
      item.porcentaje && 
      item.porcentaje !== '—' && 
      item.porcentaje !== '' && 
      item.porcentaje !== null &&
      !item.sexo?.toString().toLowerCase().includes('total') &&
      !item.categoria?.toString().toLowerCase().includes('total')
    );
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override obtenerNombreComunidadActual(): string {
    return this.dataSrv.obtenerNombreComunidadActual(this.sectionDataSignal(), this.seccionId);
  }

  override obtenerValorConPrefijo(campo: string): any {
    return this.dataSrv.obtenerValorConPrefijo(this.sectionDataSignal(), campo, this.seccionId);
  }

  obtenerTextoPoblacionSexo(): string {
    return this.textoPoblacionSexoSignal();
  }

  obtenerTextoPoblacionEtario(): string {
    return this.textoPoblacionEtarioSignal();
  }

  getPoblacionSexoSinTotal(): any[] {
    return this.dataSrv.getPoblacionSexoSinTotal(this.sectionDataSignal());
  }

  getPoblacionEtarioSinTotal(): any[] {
    return this.dataSrv.getPoblacionEtarioSinTotal(this.sectionDataSignal());
  }

  getTotalPoblacionSexo(): number {
    return this.totalPoblacionSexoSignal();
  }

  getTotalPoblacionEtario(): number {
    return this.totalPoblacionEtarioSignal();
  }

  getPorcentajeTotalPoblacionSexo(): string {
    const total = this.getTotalPoblacionSexo();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  getPorcentajeTotalPoblacionEtario(): string {
    const total = this.getTotalPoblacionEtario();
    return total === 0 ? '0,00 %' : '100,00 %';
  }

  onTablaSexoActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTablaEtarioActualizada(): void {
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  // ✅ Override: PhotoCoordinator maneja TODO la persistencia de imágenes
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    // 🔧 PATRÓN CORRECTO: Solo llamar a super() que usa PhotoCoordinator
    // PhotoCoordinator se encarga de:
    // - Guardar todas las imágenes via ImageManagementFacade
    // - Actualizar fotografiasFormMulti y fotografiasCache
    super.onFotografiasChange(fotografias, customPrefix);
    
    // ✅ Actualizar referencias locales (para templates que usan fotografiasFormMulti)
    this.fotografiasFormMulti = fotografias;
    
    // ✅ Marcar para detección de cambios
    this.cdRef.markForCheck();
  }

  protected override onFieldChange(fieldName: string, value: any, options?: { refresh?: boolean }): void {
    super.onFieldChange(fieldName, value, { refresh: options?.refresh ?? false });
    this.cdRef.markForCheck();
  }

  // ✅ OVERRIDE CRÍTICO: cargarFotografias() DEBE LEER DEL SIGNAL REACTIVO (sectionDataSignal)
  // NO de imageFacade.loadImages() que lee localStorage desactualizado
  // Esto asegura que los cambios de titulo/fuente se reflejen inmediatamente
  override cargarFotografias(): void {
    const formData = this.sectionDataSignal();  // ✅ LEER DEL SIGNAL REACTIVO
    const fotos: FotoItem[] = [];
    
    // ✅ Reconstruir array de fotografías leyendo directamente del state reactivo
    for (let i = 1; i <= 10; i++) {
      const imagenKey = `${this.PHOTO_PREFIX}${i}Imagen`;
      const imagen = formData[imagenKey];
      
      // Si hay imagen, agregar a array
      if (imagen) {
        const tituloKey = `${this.PHOTO_PREFIX}${i}Titulo`;
        const fuenteKey = `${this.PHOTO_PREFIX}${i}Fuente`;
        const numeroKey = `${this.PHOTO_PREFIX}${i}Numero`;
        
        fotos.push({
          imagen: imagen,
          titulo: formData[tituloKey] || '',
          fuente: formData[fuenteKey] || '',
          numero: formData[numeroKey] || i
        });
      }
    }
    
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.fotografiasFormMulti = [...this.fotografiasCache];
    this.cdRef.markForCheck();
  }

  override ngOnDestroy(): void {
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
  }
}


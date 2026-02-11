import { Component, Input, ChangeDetectorRef, OnDestroy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseSectionComponent } from '../base-section.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { Seccion5TableConfigService } from 'src/app/core/services/domain/seccion5-table-config.service';
import { Seccion5DataService } from 'src/app/core/services/domain/seccion5-data.service';
import { Seccion5TextGeneratorService } from 'src/app/core/services/domain/seccion5-text-generator.service';

@Component({
    imports: [
        CommonModule,
        CoreSharedModule
    ],
    selector: 'app-seccion5-view-internal',
    templateUrl: './seccion5-view.component.html'
})
export class Seccion5ViewInternalComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaInstitucionalidad';
  override useReactiveSync: boolean = true;

  fotografiasVista: FotoItem[] = [];

  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'grupoAISD',
    'tituloInstituciones',
    'fuenteInstituciones',
    'tablepagina6',
    'parrafoSeccion5_institucionalidad_A1',
    'parrafoSeccion5_institucionalidad_A2',
    'tablepagina6_A1',
    'tablepagina6_A2',
    'grupoAISD_A1',
    'grupoAISD_A2'
  ];

  // ✅ SIGNALS: Datos reactivos puros
  readonly vistDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly vistParrafoSignal: Signal<string> = computed(() => {
    const data = this.vistDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Intentar leer con prefijo primero, luego sin prefijo
    const fieldKey = `parrafoSeccion5_institucionalidad${prefijo}`;
    const fieldKeyNoPrefix = 'parrafoSeccion5_institucionalidad';
    
    const manual = data[fieldKey] || data[fieldKeyNoPrefix];
    if (manual && manual.trim().length > 0) return manual;
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.textGenerator.obtenerTextoInstitucionalidad(data, nombreComunidad, this.seccionId);
  });

  readonly vistInstitucionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = `institucionesSeccion5${prefijo}`;
    const data = this.vistDataSignal();
    const instituciones = data[tablaKey];
    return Array.isArray(instituciones) ? instituciones : [];
  });

  readonly vistFuenteInstitucionesSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const data = this.vistDataSignal();
    const fieldKey = `fuenteInstituciones${prefijo}`;
    const fieldKeyNoPrefix = 'fuenteInstituciones';
    return data[fieldKey] || data[fieldKeyNoPrefix] || '';
  });

  // ✅ PATRÓN MODO IDEAL: photoFieldsHash Signal para monitorear cambios de imágenes
  // Este Signal dispara un effect() que sincroniza cargarFotografias() reactivamente
  // Siguiendo el patrón de Sección 4 (referencia)
  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijoGrupo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    for (let i = 1; i <= 10; i++) {
      const tituloKey = `${prefix}${i}Titulo`;
      const fuenteKey = `${prefix}${i}Fuente`;
      const imagenKey = `${prefix}${i}Imagen`;
      
      const titulo = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, fuenteKey)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, imagenKey)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly viewModel: Signal<any> = computed(() => {
    return {
      data: this.vistDataSignal(),
      parrafo: this.vistParrafoSignal(),
      instituciones: this.vistInstitucionesSignal()
    };
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public tableCfg: Seccion5TableConfigService,
    private dataSrv: Seccion5DataService,
    private textGenerator: Seccion5TextGeneratorService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Auto-sync view data changes
    effect(() => {
      const data = this.vistDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    // Este efecto replica el patrón de Sección 4 (MODO IDEAL)
    effect(() => {
      this.photoFieldsHash();  // Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasVista
      // Esto asegura que el template se renderice con las nuevas imágenes
      this.fotografiasVista = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    // ✅ Sincronizar fotografiasVista con fotografiasCache después de cargar
    this.fotografiasVista = [...this.fotografiasCache];
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  obtenerParrafoInstitucionalidad(): string {
    return this.vistParrafoSignal();
  }

  obtenerSubseccionId(): string {
    return this.seccionId.split('.').pop() || '1';
  }

  get institucionesConfig() {
    return this.tableCfg.getTablaInstitucionesConfig();
  }

  get columnasInstituciones() {
    return this.tableCfg.getColumnasInstituciones();
  }

  // ✅ Obtiene nombre de comunidad actual (con fallback)
  override obtenerNombreComunidadActual(): string {
    const data = this.vistDataSignal();
    return this.dataSrv.obtenerNombreComunidadActual(data, this.seccionId);
  }

  // ✅ Override: Simple - dejar que PhotoCoordinator persista las imágenes
  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasVista = fotografias;
    this.cdRef.markForCheck();
  }

  // ✅ Métodos obligatorios de BaseSectionComponent
  protected override detectarCambios(): boolean {
    return false;  // Cambios detectados automáticamente por Signals
  }

  protected override actualizarValoresConPrefijo(): void {
    // No necesario: Los Signals ya están sincronizados
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }
}

// ✅ Alias para compatibilidad backward (deprecated, usar Seccion5ViewInternalComponent)
export class Seccion5ViewComponent extends Seccion5ViewInternalComponent {}

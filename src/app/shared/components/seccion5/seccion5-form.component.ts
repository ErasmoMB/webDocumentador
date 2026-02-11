import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { Seccion5TableConfigService } from 'src/app/core/services/domain/seccion5-table-config.service';
import { Seccion5DataService } from 'src/app/core/services/domain/seccion5-data.service';
import { Seccion5TextGeneratorService } from 'src/app/core/services/domain/seccion5-text-generator.service';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule,
        ParagraphEditorComponent,
        DynamicTableComponent
    ],
    selector: 'app-seccion5-form',
    templateUrl: './seccion5-form.component.html'
})
export class Seccion5FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaInstitucionalidad';
  override useReactiveSync: boolean = true;

  override watchedFields: string[] = [
    'parrafoSeccion5_institucionalidad',
    'tablepagina6',
    'tituloInstituciones',
    'fuenteInstituciones',
    'grupoAISD',
    'parrafoSeccion5_institucionalidad_A1',
    'parrafoSeccion5_institucionalidad_A2',
    'tablepagina6_A1',
    'tablepagina6_A2',
    'grupoAISD_A1',
    'grupoAISD_A2'
  ];

  // ✅ SIGNALS: Datos reactivos puros
  readonly prefijoGrupoSignal: Signal<string> = computed(() => this.obtenerPrefijoGrupo());

  readonly photoPrefixSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
  });

  readonly formularioDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly parrafoSignal: Signal<string> = computed(() => {
    const formData = this.formularioDataSignal();
    const prefijo = this.obtenerPrefijoGrupo();
    
    // Intentar leer con prefijo primero, luego sin prefijo
    const fieldKey = `parrafoSeccion5_institucionalidad${prefijo}`;
    const fieldKeyNoPrefix = 'parrafoSeccion5_institucionalidad';
    
    const manual = formData[fieldKey] || formData[fieldKeyNoPrefix];
    if (manual && manual.trim().length > 0) return manual;
    
    const nombreComunidad = this.obtenerNombreComunidadActual();
    return this.textGenerator.obtenerTextoInstitucionalidad(formData, nombreComunidad, this.seccionId);
  });

  readonly institucionesTableSignal: Signal<any[]> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    const tablaKey = prefijo ? `institucionesSeccion5${prefijo}` : 'institucionesSeccion5';
    return this.projectFacade.selectTableData(this.seccionId, null, tablaKey)() ?? 
           this.obtenerValorConPrefijo('institucionesSeccion5') ?? [];
  });

  readonly tablaKeyInstitucionesSignal: Signal<string> = computed(() => {
    const prefijo = this.prefijoGrupoSignal();
    return prefijo ? `institucionesSeccion5${prefijo}` : 'institucionesSeccion5';
  });

  readonly tituloInstitucionesSignal: Signal<string> = computed(() => {
    return this.obtenerValorConPrefijo('tituloInstituciones') || '';
  });

  readonly fuenteInstitucionesSignal: Signal<string> = computed(() => {
    return this.obtenerValorConPrefijo('fuenteInstituciones') || '';
  });

  // ✅ PATRÓN MODO IDEAL: photoFieldsHash Signal para monitorear cambios de imágenes
  // Este Signal dispara un effect() que sincroniza cargarFotografias() reactivamente
  // Siguiendo el patrón de Sección 4 (referencia)
  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefix = this.photoPrefixSignal();
    let hash = '';
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
      formulario: this.formularioDataSignal(),
      parrafo: this.parrafoSignal(),
      instituciones: this.institucionesTableSignal()
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
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: 'Institucionalidad' }
    ];

    // ✅ EFFECT 1: Auto-sync form data changes
    effect(() => {
      const formData = this.formularioDataSignal();
      this.datos = { ...formData };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios de fotografías y sincronizar
    // Este efecto replica el patrón de Sección 4 (MODO IDEAL)
    effect(() => {
      this.photoFieldsHash();  // Monitorea cambios en CUALQUIER campo de fotografía
      this.cargarFotografias();  // Recarga fotografías reactivamente
      
      // ✅ CRÍTICO: Después de cargarFotografias(), actualizar fotografiasFormMulti
      // Esto asegura que el template se renderice con las nuevas imágenes
      this.fotografiasFormMulti = [...this.fotografiasCache];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    // ✅ Sincronizar fotografiasFormMulti con fotografiasCache después de cargar
    this.fotografiasFormMulti = [...this.fotografiasCache];
  }

  override ngOnDestroy(): void {
    this.guardarTodosLosGrupos();
    super.ngOnDestroy();
  }

  // ✅ Configuración dinámica de tabla
  get institucionesConfig() {
    return this.tableCfg.getTablaInstitucionesConfig();
  }

  get columnasInstituciones() {
    return this.tableCfg.getColumnasInstituciones();
  }

  // ✅ Sincronizar tabla cuando se actualiza (agregar/eliminar filas)
  onTablaActualizada(): void {
    const institucionesActuales = this.institucionesTableSignal();
    const prefijo = this.prefijoGrupoSignal();
    const fieldKey = prefijo ? `institucionesSeccion5${prefijo}` : 'institucionesSeccion5';
    this.onFieldChange(fieldKey, institucionesActuales, { refresh: false });
    this.cdRef.markForCheck();
  }

  // ✅ Obtiene nombre de comunidad actual (con fallback)
  override obtenerNombreComunidadActual(): string {
    const formData = this.formularioDataSignal();
    return this.dataSrv.obtenerNombreComunidadActual(formData, this.seccionId);
  }

  // ✅ Override: PhotoCoordinator maneja TODO la persistencia
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

  obtenerParrafoInstitucionalidad(): string {
    return this.parrafoSignal();
  }

  obtenerSubseccionId(): string {
    return this.seccionId.split('.').pop() || '1';
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

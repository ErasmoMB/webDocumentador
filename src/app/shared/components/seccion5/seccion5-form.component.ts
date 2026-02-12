import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy, Injector, Signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { ImageUploadComponent, FotoItem } from '../image-upload/image-upload.component';
import { SECCION5_WATCHED_FIELDS, SECCION5_PHOTO_PREFIX, SECCION5_TABLA_INSTITUCIONES_CONFIG, SECCION5_COLUMNAS_INSTITUCIONES, SECCION5_TEMPLATES, SECCION5_CONFIG } from './seccion5-constants';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, CoreSharedModule, ImageUploadComponent],
    selector: 'app-seccion5-form',
    templateUrl: './seccion5-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion5FormComponent extends BaseSectionComponent implements OnInit, OnDestroy {
  @Input() override seccionId: string = SECCION5_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = true;

  // ✅ Hacer TEMPLATES accesible en template
  readonly SECCION5_TEMPLATES = SECCION5_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION5_PHOTO_PREFIX.INSTITUCIONALIDAD;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION5_WATCHED_FIELDS;

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
    return this.obtenerTextoInstitucionalidad(formData, nombreComunidad);
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
    injector: Injector
  ) {
    super(cdRef, injector);
    this.photoGroupsConfig = [
      { prefix: this.PHOTO_PREFIX, label: SECCION5_TEMPLATES.labelFotografias }
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

  // ✅ Configuración de tabla como constantes
  get institucionesConfig() {
    return SECCION5_TABLA_INSTITUCIONES_CONFIG;
  }

  get columnasInstituciones() {
    return SECCION5_COLUMNAS_INSTITUCIONES;
  }

  // ✅ Sincronizar tabla cuando se actualiza (agregar/eliminar filas)
  onTablaActualizada(): void {
    const institucionesActuales = this.institucionesTableSignal();
    const prefijo = this.prefijoGrupoSignal();
    const fieldKey = prefijo ? `institucionesSeccion5${prefijo}` : 'institucionesSeccion5';
    
    // ✅ Guardar directamente sin onFieldChange
    this.projectFacade.setField(this.seccionId, null, fieldKey, institucionesActuales);
    this.cdRef.markForCheck();
  }

  // ✅ Obtiene nombre de comunidad actual (con fallback)
  override obtenerNombreComunidadActual(): string {
    const datos = this.formularioDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(datos, 'grupoAISD', this.seccionId);
    
    if (grupoAISD && grupoAISD.trim() !== '') {
      return grupoAISD;
    }
    
    const grupoConSufijo = prefijo ? datos[`grupoAISD${prefijo}`] : null;
    if (grupoConSufijo && grupoConSufijo.trim() !== '') {
      return grupoConSufijo;
    }
    
    if (datos['comunidadesCampesinas'] && Array.isArray(datos['comunidadesCampesinas']) && datos['comunidadesCampesinas'].length > 0) {
      const primerCC = datos['comunidadesCampesinas'][0];
      if (primerCC && primerCC['nombre'] && primerCC['nombre'].trim() !== '') {
        return primerCC['nombre'];
      }
    }
    
    return '____';
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

  // ✅ MÉTODO INLINE DE TEXTO (sin servicio)
  private obtenerCampoConPrefijo(datos: any, campo: string): string {
    return PrefijoHelper.obtenerValorConPrefijo(datos, campo, this.seccionId) || datos[campo] || '';
  }

  obtenerTextoInstitucionalidad(datos: any, nombreComunidad: string): string {
    const textoPersonalizado = this.obtenerCampoConPrefijo(datos, 'parrafoSeccion5_institucionalidad');
    
    const textoPorDefecto = SECCION5_TEMPLATES.institucionalidadDefault
      .replace('{{nombreComunidad}}', nombreComunidad || '____');
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado.replace(/CC\s*___/g, `CC ${nombreComunidad}`);
    }
    
    return textoPorDefecto;
  }
}


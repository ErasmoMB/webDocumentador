import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { FormChangeService } from 'src/app/core/services/state/form-change.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule,
        ParagraphEditorComponent
    ],
    selector: 'app-seccion19-form',
    templateUrl: './seccion19-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class Seccion19FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.15';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';
  override useReactiveSync: boolean = true;

  override fotografiasFormMulti: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ OVERRIDE: onFieldChange CON PREFIJO AUTOMÁTICO
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    const prefijo = this.obtenerPrefijo();
    const campoConPrefijo = prefijo ? `${fieldId}${prefijo}` : fieldId;
    super.onFieldChange(campoConPrefijo, value, options);
  }

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly grupoAISDSignal: Signal<string> = computed(() => {
    const grupos = this.projectFacade.groupsByType('AISD')();
    return grupos.length > 0 ? grupos[0].nombre : '____';
  });

  readonly comunerosCalificadosSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'comunerosCalificados')() || '65';
  });

  readonly textoOrganizacionSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const fieldId = prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
    const manual = this.projectFacade.selectField(this.seccionId, null, fieldId)();
    
    if (manual && manual.trim().length > 0) return manual;
    
    const grupoAISD = this.grupoAISDSignal();
    const comunerosCalificados = this.comunerosCalificadosSignal();
    
    return this.generarTextoOrganizacionDefault(grupoAISD, comunerosCalificados);
  });

  readonly autoridadesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijoGrupo();
    const tablaKey = prefijo ? `autoridades${prefijo}` : 'autoridades';
    
    const fromField = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    const fromTable = this.projectFacade.selectTableData(this.seccionId, null, tablaKey)();
    
    const tabla = fromField ?? fromTable ?? [];
    
    // Validar que tenga contenido real
    if (Array.isArray(tabla) && tabla.length > 0) {
      return tabla;
    }
    
    return [{ organizacion: '', cargo: '', nombre: '' }];
  });

  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    // Depender de los campos de la sección para que el computed se re-evalúe cuando cambien
    this.projectFacade.selectSectionFields(this.seccionId, null)();
    const groupPrefix = this.imageFacade.getGroupPrefix(this.seccionId);
    return this.imageFacade.loadImages(this.seccionId, this.PHOTO_PREFIX, groupPrefix);
  });

  // Signal de prefijo de foto para aislamiento AISD
  readonly photoPrefixSignal: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    return prefijo ? `${this.PHOTO_PREFIX}${prefijo}` : this.PHOTO_PREFIX;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    let hash = '';
    const prefijo = this.obtenerPrefijo();
    const prefix = `${this.PHOTO_PREFIX}${prefijo}`;
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${prefix}${i}Imagen`)();
      
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  // ✅ VIEWMODEL: AGRUPA TODOS LOS DATOS
  readonly viewModel: Signal<{
    grupoAISD: string;
    comunerosCalificados: string;
    textoOrganizacion: string;
    autoridades: any[];
    fotos: FotoItem[];
  }> = computed(() => ({
    grupoAISD: this.grupoAISDSignal(),
    comunerosCalificados: this.comunerosCalificadosSignal(),
    textoOrganizacion: this.textoOrganizacionSignal(),
    autoridades: this.autoridadesSignal(),
    fotos: this.fotosCacheSignal(),
  }));

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private formChange: FormChangeService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT 1: Sincronizar this.datos con formDataSignal (solo completar campos faltantes)
    effect(() => {
      const data = this.formDataSignal();
      // No re-asignar this.datos por completo: actualizamos solo campos faltantes o vacíos.
      try {
        Object.keys(data || {}).forEach((key) => {
          const incoming = (data as any)[key];
          const current = (this.datos as any)[key];

          // Si el campo actual es undefined/null => asignar
          if (current === undefined || current === null) {
            (this.datos as any)[key] = Array.isArray(incoming) ? structuredClone(incoming) : (typeof incoming === 'object' && incoming !== null ? { ...incoming } : incoming);
            return;
          }

          // Para strings: NO sobrescribir si el valor local ya tiene contenido (evita borrar mientras se escribe)
          if (typeof incoming === 'string') {
            if (typeof current !== 'string' || (typeof current === 'string' && (current === '' || current === undefined))) {
              (this.datos as any)[key] = incoming;
            }
            return;
          }

          // Para arrays: asignar si local está vacío o no es array
          if (Array.isArray(incoming)) {
            if (!Array.isArray(current) || (Array.isArray(current) && current.length === 0)) {
              (this.datos as any)[key] = structuredClone(incoming);
            }
            return;
          }

          // Para objetos: asignar si local es vacío o no objeto
          if (typeof incoming === 'object' && incoming !== null) {
            if (typeof current !== 'object' || current === null) {
              (this.datos as any)[key] = { ...incoming };
            }
            return;
          }

          // Valores primitivos (number, boolean): asignar si undefined
          // (ya cubierto por el check inicial)
        });
      } catch (e) {
        // En caso de error, no bloquear la UI
      }
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT 2: Monitorear cambios en fotos
    effect(() => {
      this.photoFieldsHash();
      this.fotosCacheSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    // ✅ Inicializar campos de título y fuente si no existen
    const tituloAutoridadesField = this.getTituloAutoridadesField();
    if (!this.datos[tituloAutoridadesField]) {
      const titulo = this.obtenerTituloAutoridades();
      this.datos[tituloAutoridadesField] = titulo;
      this.onFieldChange(tituloAutoridadesField, titulo, { refresh: false });
    }
    
    const fuenteAutoridadesField = this.getFuenteAutoridadesField();
    if (!this.datos[fuenteAutoridadesField]) {
      const fuente = this.obtenerFuenteAutoridades();
      this.datos[fuenteAutoridadesField] = fuente;
      this.onFieldChange(fuenteAutoridadesField, fuente, { refresh: false });
    }
    
    // ✅ Inicializar tabla de autoridades si no existe
    const tablaKey = this.getTablaKeyAutoridades();
    if (!this.datos[tablaKey] || (Array.isArray(this.datos[tablaKey]) && this.datos[tablaKey].length === 0)) {
      const autoridadesInicial = [{ organizacion: '', cargo: '', nombre: '' }];
      this.datos[tablaKey] = autoridadesInicial;
      this.onFieldChange(tablaKey, autoridadesInicial, { refresh: false });

      // Persistir la tabla con FormChangeService para que DynamicTable la detecte correctamente
      try {
        this.formChange.persistFields(this.seccionId, 'table', { [tablaKey]: autoridadesInicial });
      } catch {}

      // Forzar actualización de preview/otros componentes
      try {
        const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
        ViewChildHelper.updateAllComponents('actualizarDatos');
      } catch {}

      // Asegurar que el formulario reciba la detección de cambios para habilitar inputs
      this.cdRef.markForCheck();
    }
    
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean { return false; }
  protected override actualizarValoresConPrefijo(): void { }

  getFieldIdTextoOrganizacion(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoOrganizacionSocial${prefijo}` : 'textoOrganizacionSocial';
  }

  obtenerTextoOrganizacion(): string {
    const fieldId = this.getFieldIdTextoOrganizacion();
    const textoPersonalizado = (this.datos as any)[fieldId];
    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }
    return this.generarTextoOrganizacionDefault(this.datos.grupoAISD || '____', this.datos.comunerosCalificados || '65');
  }

  private generarTextoOrganizacionDefault(grupoAISD: string, comunerosCalificados: string): string {
    return `La organización social más importante y con mayor poder es la CC ${grupoAISD}. Esta comunidad cuenta con una estructura organizativa que incluye una junta directiva, encargada de la gestión y representación legal de la comunidad. Por otra parte, la toma de decisiones clave se realiza en la asamblea general, en la cual participan y votan todos los comuneros activos que están debidamente inscritos en el padrón comunal. Esta asamblea es el máximo órgano de deliberación, donde se discuten temas de interés comunitario, como el uso de la tierra, los proyectos de desarrollo y la organización de actividades económicas y sociales.\n\nAl momento del trabajo de campo, según los entrevistados, se cuenta con ${comunerosCalificados} comuneros calificados dentro de la CC ${grupoAISD}. Estos se encuentran inscritos en el padrón, el cual es actualizado cada dos años antes de cada elección para una nueva junta directiva. Asimismo, cabe mencionar que esta última puede reelegirse por un período adicional, con la posibilidad de que una misma junta pueda gestionar por cuatro años como máximo.\n\nRespecto al rol de la mujer, es posible que estas puedan ser inscritas como comuneras calificadas dentro del padrón comunal. No obstante, solo se permite la inscripción si estas mujeres son viudas o madres solteras. De lo contrario, es el varón quien asume la responsabilidad. Por otra parte, dentro de la estructura interna de la comunidad campesina se cuenta con instancias especializadas como la JASS, la Asociación de Vicuñas y la Junta de Usuarios de Riego. Cada una de ellas cuenta con funciones específicas y sus representantes también son electos democráticamente.\n\nTambién se hallan autoridades locales como el teniente gobernador, quien es el representante del gobierno central a nivel local. El teniente gobernador tiene la función de coordinar y mediar entre las instituciones del Estado y la comunidad, así como de velar por el orden público. Asimismo, el agente municipal es responsable de la supervisión y cumplimiento de las normativas municipales, así como de brindar apoyo en la organización de actividades locales.`;
  }

  // ✅ CRUD: Tabla de autoridades actualizada
  getTablaKeyAutoridades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `autoridades${prefijo}` : 'autoridades';
  }

  onAutoridadesTableUpdated(tablaData: any[]): void {
    const tablaKey = this.getTablaKeyAutoridades();
    this.onFieldChange(tablaKey, tablaData, { refresh: false });
    this.cdRef.markForCheck();
  }

  // ✅ Métodos para obtener campos de título y fuente (igual que seccion18)
  getTituloAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tituloAutoridades${prefijo}` : 'tituloAutoridades';
  }

  getFuenteAutoridadesField(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `fuenteAutoridades${prefijo}` : 'fuenteAutoridades';
  }

  obtenerTituloAutoridades(): string {
    const fieldId = this.getTituloAutoridadesField();
    const titulo = (this.datos as any)[fieldId];
    if (titulo && String(titulo).trim() !== '') return titulo;
    const grupoAISD = (this.datos as any).grupoAISD || '____';
    return `Autoridades y líderes sociales – CC ${grupoAISD}`;
  }

  obtenerFuenteAutoridades(): string {
    const fieldId = this.getFuenteAutoridadesField();
    const fuente = (this.datos as any)[fieldId];
    if (fuente && String(fuente).trim() !== '') return fuente;
    return 'GEADES (2024)';
  }

  // ✅ Handlers para cambios en título y fuente con persistencia
  onTituloAutoridadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getTituloAutoridadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange('tituloAutoridades', valor, { refresh: false });
    // Forzar actualización en preview y otros componentes
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      ViewChildHelper.updateAllComponents('actualizarDatos');
    } catch {}
    this.cdRef.markForCheck();
  }

  // Flags para evitar que actualizaciones externas sobrescriban edición en curso
  private editingTitulo: boolean = false;
  private editingFuente: boolean = false;

  onTituloAutoridadesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getTituloAutoridadesField();
    const valor = input.value;

  }

  onTituloAutoridadesFocus(): void {
    const fieldId = this.getTituloAutoridadesField();
    this.editingTitulo = true;
    this.editingTitulo = true;
  }

  onTituloAutoridadesBlur(): void {
    const fieldId = this.getTituloAutoridadesField();
    this.editingTitulo = false;
    this.editingTitulo = false;
    // Persistir el valor al salir del input
    const valor = this.datos[fieldId];
    this.onFieldChange('tituloAutoridades', valor, { refresh: false });
  }

  onFuenteAutoridadesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteAutoridadesField();
    const valor = input.value;
    this.datos[fieldId] = valor;
    this.onFieldChange('fuenteAutoridades', valor, { refresh: false });
    // Forzar actualización en preview y otros componentes
    try {
      const { ViewChildHelper } = require('src/app/shared/utils/view-child-helper');
      ViewChildHelper.updateAllComponents('actualizarDatos');
    } catch {}
    this.cdRef.markForCheck();
  }

  onFuenteAutoridadesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fieldId = this.getFuenteAutoridadesField();
    const valor = input.value;

  }

  onFuenteAutoridadesFocus(): void {
    const fieldId = this.getFuenteAutoridadesField();
    this.editingFuente = true;
    this.editingFuente = true;
  }

  onFuenteAutoridadesBlur(): void {
    const fieldId = this.getFuenteAutoridadesField();
    this.editingFuente = false;
    // Persistir el valor al salir del input
    const valor = this.datos[fieldId];
    this.onFieldChange(fieldId, valor, { refresh: false });
  }

  // API para SectionReactiveSyncCoordinator: indicar si un campo está en edición activa
  isFieldBeingEdited(fieldName: string): boolean {
    if (!fieldName) return false;
    if (fieldName.includes('tituloAutoridades') && this.editingTitulo) return true;
    if (fieldName.includes('fuenteAutoridades') && this.editingFuente) return true;
    return false;
  }

  // ✅ Fotografías
  override onFotografiasChange(fotografias: FotoItem[]): void {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  protected override cargarFotografias(): void {
    super.cargarFotografias();
    this.fotografiasFormMulti = this.modoFormulario ? this.fotografiasFormMulti : this.fotografiasCache;
  }

  // ✅ TRACKBY
  trackByIndex(index: number): number { return index; }
}

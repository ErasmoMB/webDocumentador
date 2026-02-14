import { Component, Input, OnDestroy, ChangeDetectorRef, Injector, ChangeDetectionStrategy, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../directives/data-highlight.service';
import { FormChangeService } from '../../../core/services/state/form-change.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { SECCION3_WATCHED_FIELDS, SECCION3_CONFIG, SECCION3_TEMPLATES } from './seccion3-constants';
import { TableConfig } from '../../../core/services/tables/table-management.service';

@Component({
  selector: 'app-seccion3-form',
  templateUrl: './seccion3-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion3FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION3_CONFIG.sectionId;
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION3_TEMPLATES = SECCION3_TEMPLATES;

  override readonly PHOTO_PREFIX = SECCION3_CONFIG.photoPrefix;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION3_WATCHED_FIELDS;

  fotografiasSeccion3: FotoItem[] = [];
  imageUploadKey: number = 0;

  // ✅ SEÑALES REACTIVAS CON createAutoSyncField (NUEVA ARQUITECTURA)
  readonly parrafoMetodologia = this.createAutoSyncField<string>('parrafoSeccion3_metodologia', '');
  readonly parrafoFuentesPrimarias = this.createAutoSyncField<string>('parrafoSeccion3_fuentes_primarias', '');
  readonly parrafoFuentesSecundarias = this.createAutoSyncField<string>('parrafoSeccion3_fuentes_secundarias', '');
  readonly cantidadEntrevistas = this.createAutoSyncField<string>('cantidadEntrevistas', '');
  readonly fechaTrabajoCampo = this.createAutoSyncField<string>('fechaTrabajoCampo', '');
  readonly consultora = this.createAutoSyncField<string>('consultora', '');
  readonly cuadroTituloEntrevistados = this.createAutoSyncField<string>('cuadroTituloEntrevistados', '');
  readonly cuadroFuenteEntrevistados = this.createAutoSyncField<string>('cuadroFuenteEntrevistados', '');
  readonly entrevistados = this.createAutoSyncField<any[]>('entrevistados', []);
  readonly fuentesSecundariasLista = this.createAutoSyncField<string[]>('fuentesSecundariasLista', []);

  // ✅ Configuración de tabla desde constants
  readonly entrevistadosConfig: TableConfig = {
    tablaKey: 'entrevistados',
    totalKey: 'nombre',
    estructuraInicial: []
  };

  // ✅ Columns con texts desde TEMPLATES
  readonly columnasEntrevistados: any[] = [
    { 
      field: 'nombre', 
      label: SECCION3_TEMPLATES.labelColumnaNombre, 
      type: 'text', 
      placeholder: SECCION3_TEMPLATES.placeholderColumnaNombre, 
      readonly: false 
    },
    { 
      field: 'cargo', 
      label: SECCION3_TEMPLATES.labelColumnaCargo, 
      type: 'text', 
      placeholder: SECCION3_TEMPLATES.placeholderColumnaCargo, 
      readonly: false 
    },
    { 
      field: 'organizacion', 
      label: SECCION3_TEMPLATES.labelColumnaOrganizacion, 
      type: 'text', 
      placeholder: SECCION3_TEMPLATES.placeholderColumnaOrganizacion, 
      readonly: false 
    }
  ];

  // ✅ SIGNALS COMPUTED PARA DATOS DERIVADOS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly fuentesSecundariasListaSignal: Signal<string[]> = computed(() => {
    return this.fuentesSecundariasLista.value();
  });

  readonly entrevistadosSignal: Signal<any[]> = computed(() => {
    return this.entrevistados.value();
  });

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

  readonly textoMetodologiaFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoMetodologia();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoFuentesPrimariasFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoFuentesPrimarias();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoFuentesSecundariasFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoFuentesSecundarias();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // ✅ Propiedades getter para compatibilidad con template
  get formData(): Record<string, any> {
    return this.formDataSignal();
  }

  get fotografias(): FotoItem[] {
    return this.fotografiasCache;
  }

  get photoPrefix(): string {
    return this.PHOTO_PREFIX;
  }

  private readonly formChangeService = this.injector.get(FormChangeService);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    effect(() => {
      const formData = this.formDataSignal();
      const fuentesSecundariasLista = this.fuentesSecundariasListaSignal();
      const entrevistados = this.entrevistadosSignal();
      this.cdRef.markForCheck();
    });
  }

  /**
   * ✅ Inicializa campos desde el store O usa valores por defecto
   */
  private inicializarCamposDesdeStore(): void {
    // Metodología
    const metodologia = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion3_metodologia')() 
      || SECCION3_TEMPLATES.metodologiaDefaultFallback;
    this.parrafoMetodologia.update(metodologia);

    // Fuentes primarias
    const fuentesPrim = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion3_fuentes_primarias')() 
      || SECCION3_TEMPLATES.fuentesPrimariasDefaultFallback;
    this.parrafoFuentesPrimarias.update(fuentesPrim);

    // Fuentes secundarias
    const fuentesSec = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion3_fuentes_secundarias')() 
      || SECCION3_TEMPLATES.fuentesSecundariasDefaultFallback;
    this.parrafoFuentesSecundarias.update(fuentesSec);

    // Cantidad entrevistas
    const cantidad = this.projectFacade.selectField(this.seccionId, null, 'cantidadEntrevistas')();
    if (cantidad) this.cantidadEntrevistas.update(cantidad);

    // Fecha trabajo campo
    const fecha = this.projectFacade.selectField(this.seccionId, null, 'fechaTrabajoCampo')();
    if (fecha) this.fechaTrabajoCampo.update(fecha);

    // Consultora
    const consult = this.projectFacade.selectField(this.seccionId, null, 'consultora')();
    if (consult) this.consultora.update(consult);

    // Cuadro título
    const titCuadro = this.projectFacade.selectField(this.seccionId, null, 'cuadroTituloEntrevistados')() 
      || SECCION3_TEMPLATES.cuadroTituloEntrevistadosDefault;
    this.cuadroTituloEntrevistados.update(titCuadro);

    // Cuadro fuente
    const fuenCuadro = this.projectFacade.selectField(this.seccionId, null, 'cuadroFuenteEntrevistados')() 
      || SECCION3_TEMPLATES.cuadroFuenteEntrevistadosDefault;
    this.cuadroFuenteEntrevistados.update(fuenCuadro);

    // Listas
    const ent = this.projectFacade.selectField(this.seccionId, null, 'entrevistados')();
    if (ent && ent.length > 0) this.entrevistados.update(ent);

    const fuenSec = this.projectFacade.selectField(this.seccionId, null, 'fuentesSecundariasLista')();
    if (fuenSec && fuenSec.length > 0) this.fuentesSecundariasLista.update(fuenSec);
  }

  protected override onInitCustom(): void {
    this.inicializarCamposDesdeStore();
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return true;
  }

  protected override actualizarValoresConPrefijo(): void {
    // S3 no tiene prefijos dinámicos
  }

  // ✅ Override onFieldChange para usar markForCheck (no interfiere con onTablaUpdated)
  override onFieldChange(fieldId: string, value: any, options?: { refresh?: boolean }): void {
    this.projectFacade.setField(this.seccionId, null, fieldId, value);
    this.formChangeService.persistFields(this.seccionId, 'form', { [fieldId]: value });
    this.cdRef.markForCheck();  // ← Solo marca, no forza detección
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  // ✅ METODOS DE TEXTO USANDO TEMPLATES
  obtenerTextoMetodologia(): string {
    if (this.parrafoMetodologia.value()) {
      return this.parrafoMetodologia.value();
    }
    return SECCION3_TEMPLATES.metodologiaDefaultFallback;
  }

  obtenerTextoFuentesPrimarias(): string {
    const parrafoPersonalizado = this.parrafoFuentesPrimarias.value();
    const cantidad = this.cantidadEntrevistas.value() || '____';
    const fecha = this.fechaTrabajoCampo.value() || '____';
    
    if (parrafoPersonalizado) {
      // Procesar placeholders en el texto personalizado
      return parrafoPersonalizado
        .replaceAll('{{cantidadEntrevistas}}', cantidad)
        .replace(/{{fechaTrabajoCampo}}/g, fecha);
    }
    
    // Usar template con ambos placeholders
    return SECCION3_TEMPLATES.fuentesPrimariasDefaultFallback
      .replaceAll('{{cantidadEntrevistas}}', cantidad)
      .replace(/{{fechaTrabajoCampo}}/g, fecha);
  }

  obtenerTextoFuentesSecundarias(): string {
    if (this.parrafoFuentesSecundarias.value()) {
      return this.parrafoFuentesSecundarias.value();
    }
    return SECCION3_TEMPLATES.fuentesSecundariasDefaultFallback;
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesSecundariasLista.value();
  }

  // ✅ CRUD PARA FUENTES SECUNDARIAS USANDO SEÑALES
  actualizarFuenteSecundaria(index: number, valor: string): void {
    const listaActual = [...this.fuentesSecundariasLista.value()];
    if (listaActual[index] !== valor) {
      listaActual[index] = valor;
      this.fuentesSecundariasLista.update(listaActual);
      this.onFieldChange('fuentesSecundariasLista', listaActual, { refresh: false });
      this.cdRef.markForCheck();
    }
  }

  eliminarFuenteSecundaria(index: number): void {
    const listaActual = [...this.fuentesSecundariasLista.value()];
    listaActual.splice(index, 1);
    this.fuentesSecundariasLista.update(listaActual);
    this.onFieldChange('fuentesSecundariasLista', listaActual, { refresh: false });
    this.cdRef.markForCheck();
  }

  agregarFuenteSecundaria(): void {
    const listaActual = [...this.fuentesSecundariasLista.value()];
    listaActual.push('');
    this.fuentesSecundariasLista.update(listaActual);
    this.onFieldChange('fuentesSecundariasLista', listaActual, { refresh: false });
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByFuente(index: number, fuente: string): string {
    return fuente || `empty-${index}`;
  }

  obtenerTablaEntrevistados(): any[] {
    return this.entrevistados.value();
  }

  // ✅ ACTUALIZAR TABLA USANDO PATRÓN DE 3 PASOS
  onTablaUpdated(tabla: any[]): void {
    const tablaKey = 'entrevistados';
    
    // PASO 1️⃣: CREAR NUEVA REFERENCIA
    this.datos[tablaKey] = [...tabla];
    
    // PASO 2️⃣: PERSISTIR sin refresh para evitar sobrescrituras
    this.onFieldChange(tablaKey, this.datos[tablaKey], { refresh: false });
    
    // PASO 3️⃣: FORZAR CHANGE DETECTION explícitamente
    this.cdRef.detectChanges();
  }

  override onFotografiasChange(fotografias: FotoItem[]): void {
    super.onFotografiasChange(fotografias);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}

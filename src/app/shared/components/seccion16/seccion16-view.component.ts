import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, ChangeDetectorRef, Signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { 
  SECCION16_PHOTO_PREFIX_RESERVORIO, 
  SECCION16_PHOTO_PREFIX_USO_SUELOS,
  SECCION16_SECTION_ID,
  SECCION16_TEMPLATES 
} from './seccion16-constants';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion16-view',
    templateUrl: './seccion16-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion16ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = SECCION16_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES para el HTML
  readonly SECCION16_TEMPLATES = SECCION16_TEMPLATES;
  
  readonly PHOTO_PREFIX_RESERVORIO = SECCION16_PHOTO_PREFIX_RESERVORIO;
  readonly PHOTO_PREFIX_USO_SUELOS = SECCION16_PHOTO_PREFIX_USO_SUELOS;
  override useReactiveSync: boolean = true;

  fotografiasReservorio: FotoItem[] = [];
  fotografiasUsoSuelos: FotoItem[] = [];
  private readonly regexCache = new Map<string, RegExp>();

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ SIGNAL REACTIVO PARA DATOS (Punto 1: formDataSignal)
  readonly formDataSignal: Signal<Record<string, any>> = computed(() =>
    this.projectFacade.selectSectionFields(this.seccionId, null)()
  );

  // ✅ PHOTO FIELDS HASH CON PREFIJOS
  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    let hash = '';

    // Reservorio photos
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_RESERVORIO}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }

    // UsoSuelos photos
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX_USO_SUELOS}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }

    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    // ✅ Punto 4: Effect para sincronización
    effect(() => {
      this.formDataSignal();  // Depende del signal
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();  // ← CRÍTICO: fuerza re-render
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
    this.fotografiasReservorio = this.getFotografiasVista(this.PHOTO_PREFIX_RESERVORIO);
    this.fotografiasUsoSuelos = this.getFotografiasVista(this.PHOTO_PREFIX_USO_SUELOS);
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void { }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.fotografiasReservorio = this.getFotografiasVista(this.PHOTO_PREFIX_RESERVORIO);
    this.fotografiasUsoSuelos = this.getFotografiasVista(this.PHOTO_PREFIX_USO_SUELOS);
  }

  getFotografiasReservorioVista(): FotoItem[] {
    return this.fotografiasReservorio;
  }

  getFotografiasUsoSuelosVista(): FotoItem[] {
    return this.fotografiasUsoSuelos;
  }

  obtenerTextoAguaCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const datos = this.formDataSignal();
    const fieldIdConPrefijo = `parrafoSeccion16_agua_completo${prefijo}`;
    const textoConPrefijo = datos[fieldIdConPrefijo];
    const textoSinPrefijo = datos['parrafoSeccion16_agua_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    // Obtener valores dinámicos (con fallback a constantes)
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = datos['ojosAgua1'] || SECCION16_TEMPLATES.ojosAgua1Default;
    const ojosAgua2 = datos['ojosAgua2'] || SECCION16_TEMPLATES.ojosAgua2Default;
    const rioAgricola = datos['rioAgricola'] || SECCION16_TEMPLATES.rioAgricolaDefault;
    const quebradaAgricola = datos['quebradaAgricola'] || SECCION16_TEMPLATES.quebradaAgricolaDefault;

    // Usar template de constantes con sustitución dinámica
    const textoPorDefecto = SECCION16_TEMPLATES.textoPorDefectoAguaCompleto
      .replace(/{{grupoAISD}}/g, grupoAISD)
      .replace(/{{ojosAgua1}}/g, ojosAgua1)
      .replace(/{{ojosAgua2}}/g, ojosAgua2)
      .replace(/{{rioAgricola}}/g, rioAgricola)
      .replace(/{{quebradaAgricola}}/g, quebradaAgricola);

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }

  obtenerTextoRecursosNaturalesCompleto(): string {
    const prefijo = this.obtenerPrefijo();
    const datos = this.formDataSignal();
    const fieldIdConPrefijo = `parrafoSeccion16_recursos_naturales_completo${prefijo}`;
    const textoConPrefijo = datos[fieldIdConPrefijo];
    const textoSinPrefijo = datos['parrafoSeccion16_recursos_naturales_completo'];
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;

    const grupoAISD = this.obtenerNombreComunidadActual();

    // Usar template de constantes con sustitución dinámica
    const textoPorDefecto = SECCION16_TEMPLATES.textoPorDefectoRecursosNaturalesCompleto
      .replace(/{{grupoAISD}}/g, grupoAISD);

    if (textoPersonalizado && textoPersonalizado !== '____' && String(textoPersonalizado).trim() !== '') {
      return textoPersonalizado;
    }

    return textoPorDefecto;
  }

  obtenerTextoAguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoAguaCompleto();
    const datos = this.formDataSignal();  // ✅ Punto 2: Usa formDataSignal()
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = datos['ojosAgua1'] || 'Quinsa Rumi';
    const ojosAgua2 = datos['ojosAgua2'] || 'Pallalli';
    const rioAgricola = datos['rioAgricola'] || 'Yuracyacu';
    const quebradaAgricola = datos['quebradaAgricola'] || 'Pucaccocha';

    let html = this.escapeHtml(texto);

    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (ojosAgua1 !== 'Quinsa Rumi') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua1)), `<span class="data-manual">${this.escapeHtml(ojosAgua1)}</span>`);
    }
    if (ojosAgua2 !== 'Pallalli') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua2)), `<span class="data-manual">${this.escapeHtml(ojosAgua2)}</span>`);
    }
    if (rioAgricola !== 'Yuracyacu') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(rioAgricola)), `<span class="data-manual">${this.escapeHtml(rioAgricola)}</span>`);
    }
    if (quebradaAgricola !== 'Pucaccocha') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(quebradaAgricola)), `<span class="data-manual">${this.escapeHtml(quebradaAgricola)}</span>`);
    }

    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoRecursosNaturalesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoRecursosNaturalesCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();

    let html = this.escapeHtml(texto);

    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }

    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }
}

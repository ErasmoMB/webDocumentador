import { Component, ChangeDetectorRef, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../directives/data-highlight.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { SECCION3_TEMPLATES } from './seccion3-constants';

@Component({
  selector: 'app-seccion3-view',
  templateUrl: './seccion3-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion3ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.3';
  @Input() override modoFormulario: boolean = false;

  // ✅ Hacer TEMPLATES accesible en el template
  readonly SECCION3_TEMPLATES = SECCION3_TEMPLATES;

  override readonly PHOTO_PREFIX = 'fotografiaSeccion3';
  override useReactiveSync: boolean = false;

  fotografiasSeccion3: FotoItem[] = [];

  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly fuentesSecundariasListaSignal: Signal<string[]> = computed(() => {
    const value = this.projectFacade.selectField(this.seccionId, null, 'fuentesSecundariasLista')();
    return Array.isArray(value) ? value : [];
  });

  readonly entrevistadosSignal: Signal<any[]> = computed(() => {
    const value = this.projectFacade.selectField(this.seccionId, null, 'entrevistados')();
    return Array.isArray(value) ? value : [];
  });

  // ✅ SEÑALES PARA PLACEHOLDERS DE FUENTES PRIMARIAS
  readonly cantidadEntrevistasSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'cantidadEntrevistas')() || '____';
  });

  readonly fechaTrabajoCampoSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'fechaTrabajoCampo')() || '____';
  });

  readonly parrafoFuentesPrimariasSignal: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion3_fuentes_primarias')() || '';
  });

  // ✅ COMPUTED PARA TEXTO DERIVADO - INCLUYE DEPENDENCIA DEL PARRAFO PERSONALIZADO
  readonly textoFuentesPrimariasCompleto: Signal<SafeHtml> = computed(() => {
    // Escuchar el parrafo personalizado primero
    const parrafoPersonalizado = this.parrafoFuentesPrimariasSignal();
    
    if (parrafoPersonalizado) {
      // Si hay personalizado, procesar placeholders y formatear
      const cantidad = this.cantidadEntrevistasSignal();
      const fecha = this.fechaTrabajoCampoSignal();
      const textoConPlaceholders = this.generarTextoFuentesPrimarias(parrafoPersonalizado, cantidad, fecha);
      const html = this.formatearParrafo(textoConPlaceholders);
      return this.sanitizer.bypassSecurityTrustHtml(html);
    }
    
    // Si no hay personalizado, usar template con placeholders
    const cantidad = this.cantidadEntrevistasSignal();
    const fecha = this.fechaTrabajoCampoSignal();
    const textoGenerado = this.generarTextoFuentesPrimarias(null, cantidad, fecha);
    const html = this.formatearParrafo(textoGenerado);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoMetodologiaFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoMetodologia();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // ✅ Eliminado: textoFuentesPrimariasFormateado anterior (reemplazado por textoFuentesPrimariasCompleto)

  readonly textoFuentesSecundariasFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoFuentesSecundarias();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
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

  private readonly dataHighlightService = this.injector.get(DataHighlightService);
  private readonly sanitizer = this.injector.get(DomSanitizer);

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector
  ) {
    super(cdRef, injector);

    // ✅ EFFECT CON TODAS LAS DEPENDENCIAS
    effect(() => {
      this.cantidadEntrevistasSignal();
      this.fechaTrabajoCampoSignal();
      this.parrafoFuentesPrimariasSignal();
      this.textoFuentesPrimariasCompleto();
      this.cdRef.markForCheck();
    });

    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override actualizarDatosCustom(): void {
    this.cdRef.markForCheck();
  }

  protected override detectarCambios(): boolean {
    return true;
  }

  protected override actualizarValoresConPrefijo(): void {
    // S3 no tiene prefijos dinámicos
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerTextoMetodologia(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion3_metodologia']) {
      return formData['parrafoSeccion3_metodologia'];
    }
    return SECCION3_TEMPLATES.metodologiaDefaultFallback;
  }

  obtenerTextoFuentesPrimarias(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion3_fuentes_primarias']) {
      return formData['parrafoSeccion3_fuentes_primarias'];
    }
    // ✅ Usar computed signals
    const cantidad = this.cantidadEntrevistasSignal();
    const fecha = this.fechaTrabajoCampoSignal();
    return this.generarTextoFuentesPrimarias(null, cantidad, fecha);
  }

  // ✅ FUNCIÓN GENERADORA CON replaceAll - SOPORTA PARRAFO PERSONALIZADO
  generarTextoFuentesPrimarias(parrafoPersonalizado: string | null, cantidad: string, fecha: string): string {
    let TEMPLATE: string;
    
    if (parrafoPersonalizado) {
      // Usar el texto personalizado del usuario
      TEMPLATE = parrafoPersonalizado;
    } else {
      // Usar el template por defecto
      TEMPLATE = SECCION3_TEMPLATES.fuentesPrimariasDefaultFallback;
    }
    
    return TEMPLATE.replaceAll('{{cantidadEntrevistas}}', cantidad)
                   .replace(/{{fechaTrabajoCampo}}/g, fecha);
  }

  obtenerTextoFuentesSecundarias(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion3_fuentes_secundarias']) {
      return formData['parrafoSeccion3_fuentes_secundarias'];
    }
    return SECCION3_TEMPLATES.fuentesSecundariasDefaultFallback;
  }

  obtenerListaFuentesSecundarias(): string[] {
    return this.fuentesSecundariasListaSignal();
  }

  obtenerTablaEntrevistados(): any[] {
    return this.entrevistadosSignal();
  }

  override cargarFotografias(): void {
    const fotos: FotoItem[] = [];
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen`)();
      if (imagen) {
        fotos.push({ titulo, fuente, imagen });
      }
    }
    this.fotografiasSeccion3 = fotos;
  }

  get key(): number {
    return Date.now();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}

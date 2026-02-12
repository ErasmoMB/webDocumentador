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
    return 'Para la descripción del aspecto socioeconómico se ha utilizado una combinación de métodos y técnicas cualitativas de investigación social, entre ellas se ha seleccionado las técnicas de entrevistas semiestructuradas con autoridades locales y/o informantes calificados, así como de encuestas de carácter socioeconómico. Además de ello, se ha recurrido a la recopilación de documentos que luego son contrastados y completados con la consulta de diversas fuentes de información oficiales actualizadas respecto al área de influencia social tales como el Censo Nacional INEI (2017), Escale – MINEDU, la base de datos de la Oficina General de Estadística e Informática del Ministerio de Salud, entre otros.';
  }

  obtenerTextoFuentesPrimarias(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion3_fuentes_primarias']) {
      return formData['parrafoSeccion3_fuentes_primarias'];
    }
    const cantidadEntrevistas = formData['cantidadEntrevistas'] || '____';
    return `Dentro de las fuentes primarias se consideran a las autoridades comunales y locales, así como pobladores que fueron entrevistados y proporcionaron información cualitativa y cuantitativa. Esta información de primera mano muestra datos fidedignos que proporcionan un alcance más cercano de la realidad en la que se desarrollan las poblaciones del área de influencia social. Para la obtención de información cualitativa, se realizaron un total de ${cantidadEntrevistas} entrevistas en profundidad a informantes calificados y autoridades locales.`;
  }

  obtenerTextoFuentesSecundarias(): string {
    const formData = this.formDataSignal();
    if (formData['parrafoSeccion3_fuentes_secundarias']) {
      return formData['parrafoSeccion3_fuentes_secundarias'];
    }
    return 'En la elaboración de la LBS se utilizó información cuantitativa de fuentes secundarias provenientes de fuentes oficiales, entre las que se encuentran las siguientes:';
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

import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TablePercentageHelper } from '../../../shared/utils/table-percentage-helper';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion15-view',
    templateUrl: './seccion15-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion15ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.11';
  @Input() override modoFormulario: boolean = false;

  override readonly PHOTO_PREFIX = 'fotografiaIglesia';
  override useReactiveSync: boolean = true;

  fotografiasIglesia: FotoItem[] = [];

  readonly lenguasMaternasSignal: Signal<any[]> = computed(() => {
    const fromStore = this.projectFacade.selectField(this.seccionId, null, 'lenguasMaternasTabla')();
    return Array.isArray(fromStore) ? fromStore : [];
  });

  readonly religionesSignal: Signal<any[]> = computed(() => {
    const fromStore = this.projectFacade.selectField(this.seccionId, null, 'religionesTabla')();
    return Array.isArray(fromStore) ? fromStore : [];
  });

  readonly lenguasMaternasConPorcentajes: Signal<any[]> = computed(() => {
    const tabla = this.lenguasMaternasSignal();
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.30');
  });

  readonly religionesConPorcentajes: Signal<any[]> = computed(() => {
    const tabla = this.religionesSignal();
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.31');
  });

  readonly lenguasMaternasTitulo: Signal<string> = computed(() => {
    const raw = this.projectFacade.selectField(this.seccionId, null, 'lenguasMaternasTitulo')();
    const defaultTemplate = 'Lenguas maternas en población de 3 años a más – CC ____ (2017)';
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly lenguasMaternasFuente: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'lenguasMaternasFuente')() || 'Plataforma Nacional de Datos Georreferenciados – Geo Perú';
  });

  readonly religionesTitulo: Signal<string> = computed(() => {
    const raw = this.projectFacade.selectField(this.seccionId, null, 'religionesTitulo')();
    const defaultTemplate = 'Religión – CC ____ (2017)';
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly religionesFuente: Signal<string> = computed(() => {
    return this.projectFacade.selectField(this.seccionId, null, 'religionesFuente')() || 'Plataforma Nacional de Datos Georreferenciados – Geo Perú';
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.cdRef.markForCheck();
    });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
  }

  override getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
    return 'manual';
  }

  private formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  obtenerTextoAspectosCulturales(): SafeHtml {
    const texto = this.projectFacade.selectField(this.seccionId, null, 'textoAspectosCulturales')();
    const fallback = 'Los aspectos culturales juegan un papel significativo en la vida social y cultural de una comunidad, influyendo en sus valores, costumbres y prácticas cotidianas. En esta sección, se caracterizan y describen la diversidad religiosa en la CC ____, explorando las principales creencias.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoIdioma(): SafeHtml {
    const texto = this.projectFacade.selectField(this.seccionId, null, 'textoIdioma')();
    const fallback = 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de los Censos Nacionales 2017, se aprecia que el castellano es la categoría mayoritaria, pues representa la mayor parte de la población de 3 años a más. En segundo lugar se halla el quechua como primer idioma.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoReligion(): SafeHtml {
    const texto = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion15_religion_completo')();
    const fallback = 'En la actualidad, la confesión predominante dentro de la CC ____ es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz ____, y a la inexistencia de templos evangélicos o de otras confesiones.\n\nEsta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar se halla al sur del anexo ____.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
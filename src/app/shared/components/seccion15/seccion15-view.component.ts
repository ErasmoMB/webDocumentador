import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TablePercentageHelper } from '../../../shared/utils/table-percentage-helper';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';

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

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  readonly lenguasMaternasSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `lenguasMaternasTabla${prefijo}` : 'lenguasMaternasTabla';
    const fromStore = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    return Array.isArray(fromStore) ? fromStore : [];
  });

  readonly religionesSignal: Signal<any[]> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tablaKey = prefijo ? `religionesTabla${prefijo}` : 'religionesTabla';
    const fromStore = this.projectFacade.selectField(this.seccionId, null, tablaKey)();
    return Array.isArray(fromStore) ? fromStore : [];
  });

  readonly lenguasMaternasConPorcentajes: Signal<any[]> = computed(() => {
    const tabla = this.lenguasMaternasSignal();
    const cuadro = this.tableNumberingService.getGlobalTableNumber(this.seccionId, 0);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly religionesConPorcentajes: Signal<any[]> = computed(() => {
    const tabla = this.religionesSignal();
    const cuadro = this.tableNumberingService.getGlobalTableNumber(this.seccionId, 1);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly lenguasMaternasTitulo: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = `lenguasMaternasTitulo${prefijo}`;
    const raw = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const defaultTemplate = 'Lenguas maternas en población de 3 años a más – CC ____ (2017)';
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly lenguasMaternasFuente: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = `lenguasMaternasFuente${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fuenteKey)() || 'Plataforma Nacional de Datos Georreferenciados – Geo Perú';
  });

  readonly religionesTitulo: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = `religionesTitulo${prefijo}`;
    const raw = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const defaultTemplate = 'Religión – CC ____ (2017)';
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly religionesFuente: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = `religionesFuente${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fuenteKey)() || 'Plataforma Nacional de Datos Georreferenciados – Geo Perú';
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public sanitizer: DomSanitizer,
    private tableNumberingService: TableNumberingService
  ) {
    super(cdRef, injector);

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.photoFieldsHash();
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
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoAspectosCulturales${prefijo}`;
    const texto = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    const fallback = 'Los aspectos culturales juegan un papel significativo en la vida social y cultural de una comunidad, influyendo en sus valores, costumbres y prácticas cotidianas. En esta sección, se caracterizan y describen la diversidad religiosa en la CC ____, explorando las principales creencias.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoIdioma(): SafeHtml {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoIdioma${prefijo}`;
    const texto = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    const fallback = 'La lengua materna es la primera lengua o idioma que aprende una persona. De la data obtenida de los Censos Nacionales 2017, se aprecia que el castellano es la categoría mayoritaria, pues representa la mayor parte de la población de 3 años a más. En segundo lugar se halla el quechua como primer idioma.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoReligion(): SafeHtml {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `parrafoSeccion15_religion_completo${prefijo}`;
    const texto = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    const fallback = 'En la actualidad, la confesión predominante dentro de la CC ____ es la católica. Según las entrevistas aplicadas, la permanencia del catolicismo como la religión mayoritaria se debe a la presencia de la iglesia, denominada Iglesia Matriz ____, y a la inexistencia de templos evangélicos o de otras confesiones.\n\nEsta iglesia es el principal punto de reunión religiosa de la comunidad y juega un rol importante en la vida espiritual de sus habitantes. Otro espacio con gran valor espiritual es el cementerio, en donde los comuneros entierran y visitan a sus difuntos. Este lugar se halla al sur del anexo ____.';
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

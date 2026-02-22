import { Component, OnDestroy, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { BaseSectionComponent } from '../base-section.component';
import { TablePercentageHelper } from '../../../shared/utils/table-percentage-helper';
import { GlobalNumberingService } from 'src/app/core/services/numbering/global-numbering.service';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { SECCION15_SECTION_ID, SECCION15_PHOTO_PREFIX, SECCION15_DEFAULT_TEXTS, SECCION15_TEMPLATES, SECCION15_WATCHED_FIELDS } from './seccion15-constants';

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
  @Input() override seccionId: string = SECCION15_SECTION_ID;
  @Input() override modoFormulario: boolean = false;

  // ✅ Exportar TEMPLATES e importados
  readonly SECCION15_TEMPLATES = SECCION15_TEMPLATES;
  readonly SECCION15_DEFAULT_TEXTS = SECCION15_DEFAULT_TEXTS;

  override readonly PHOTO_PREFIX = SECCION15_PHOTO_PREFIX;
  override useReactiveSync: boolean = true;
  override watchedFields: string[] = SECCION15_WATCHED_FIELDS;

  fotografiasIglesia: FotoItem[] = [];

  // ✅ HELPER PARA OBTENER PREFIJO
  private obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId) || '';
  }

  // ✅ PATRÓN UNICA_VERDAD: fotosCacheSignal Signal para monitorear cambios de imágenes
  readonly fotosCacheSignal: Signal<FotoItem[]> = computed(() => {
    const fotos: FotoItem[] = [];
    const prefijo = this.obtenerPrefijo();
    
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      
      if (imagen) {
        fotos.push({
          titulo: titulo || `Fotografía ${i}`,
          fuente: fuente || 'GEADES, 2024',
          imagen: imagen
        } as FotoItem);
      }
    }
    return fotos;
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
    const cuadro = this.globalNumbering.getGlobalTableNumber(this.seccionId, 0);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly religionesConPorcentajes: Signal<any[]> = computed(() => {
    const tabla = this.religionesSignal();
    const cuadro = this.globalNumbering.getGlobalTableNumber(this.seccionId, 1);
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, cuadro);
  });

  readonly lenguasMaternasTitulo: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = `lenguasMaternasTitulo${prefijo}`;
    const raw = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const defaultTemplate = SECCION15_TEMPLATES.lenguasMaternasTituloDefault;
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly lenguasMaternasFuente: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = `lenguasMaternasFuente${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fuenteKey)() || SECCION15_TEMPLATES.fuenteDefault;
  });

  readonly religionesTitulo: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const tituloKey = `religionesTitulo${prefijo}`;
    const raw = this.projectFacade.selectField(this.seccionId, null, tituloKey)();
    const defaultTemplate = SECCION15_TEMPLATES.religionesTituloDefault;
    const titulo = raw && String(raw).trim().length > 0 ? raw : defaultTemplate;
    const comunidad = this.obtenerNombreComunidadActual();
    const nombreNorm = comunidad.replace(/^CC\s+/i, '').trim();
    return titulo.replace(/____/g, nombreNorm);
  });

  readonly religionesFuente: Signal<string> = computed(() => {
    const prefijo = this.obtenerPrefijo();
    const fuenteKey = `religionesFuente${prefijo}`;
    return this.projectFacade.selectField(this.seccionId, null, fuenteKey)() || SECCION15_TEMPLATES.fuenteDefault;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    public sanitizer: DomSanitizer,
    private globalNumbering: GlobalNumberingService
  ) {
    super(cdRef, injector);

    effect(() => {
      this.lenguasMaternasSignal();
      this.religionesSignal();
      this.fotosCacheSignal();
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
    const comunidad = this.obtenerNombreComunidadActual();
    const fallback = SECCION15_DEFAULT_TEXTS.textoAspectosCulturalesDefault(comunidad);
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoIdioma(): SafeHtml {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `textoIdioma${prefijo}`;
    const texto = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    const fallback = SECCION15_DEFAULT_TEXTS.textoIdiomaDefault;
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoReligion(): SafeHtml {
    const prefijo = this.obtenerPrefijo();
    const campoKey = `parrafoSeccion15_religion_completo${prefijo}`;
    const texto = this.projectFacade.selectField(this.seccionId, null, campoKey)();
    const comunidad = this.obtenerNombreComunidadActual();
    const fallback = SECCION15_DEFAULT_TEXTS.textoReligionDefault(comunidad);
    const html = this.formatearParrafo(texto && String(texto).trim().length > 0 ? texto : fallback);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

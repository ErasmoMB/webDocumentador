import { Component, ChangeDetectorRef, Injector, ChangeDetectionStrategy, Signal, computed, effect, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DataHighlightService } from '../../directives/data-highlight.service';
import { ProjectStateFacade } from '../../../core/state/project-state.facade';
import { BaseSectionComponent } from '../base-section.component';
import { GroupDefinition, CCPPEntry } from '../../../core/state/project-state.model';
import { SECCION2_TEMPLATES } from './seccion2-constants';

@Component({
  selector: 'app-seccion2-view',
  templateUrl: './seccion2-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ImageUploadComponent,
    CoreSharedModule
  ],
  standalone: true
})
export class Seccion2ViewComponent extends BaseSectionComponent {
  @Input() override seccionId: string = '3.1.2';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaSeccion2';
  override useReactiveSync: boolean = false;

  readonly SECCION2_TEMPLATES = SECCION2_TEMPLATES;

  fotografiasSeccion2: FotoItem[] = [];

  // ✅ Signal derivado para fotografías
  override readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');

  readonly comunidadesNombres: Signal<string[]> = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  readonly textoAISDFormateado: Signal<SafeHtml> = computed(() => {
    // ✅ CRÍTICO: Leer explícitamente signals para registrar dependencias
    this.aisdGroups();
    const nombres = this.comunidadesNombres();
    const texto = this.obtenerTextoSeccion2AISDCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoAISIFormateado: Signal<SafeHtml> = computed(() => {
    // ✅ CRÍTICO: Leer explícitamente signals para registrar dependencias
    this.aisiGroups();
    const texto = this.obtenerTextoSeccion2AISICompleto();
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
    
    // ✅ CRÍTICO: Effect para sincronización de AISD/AISI CON textos formateados
    effect(() => {
      this.aisdGroups();
      this.aisiGroups();
      this.textoAISDFormateado();
      this.textoAISIFormateado();
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

  obtenerTextoComunidades(): string {
    const nombres = this.comunidadesNombres();
    if (nombres.length === 0) return '____';
    if (nombres.length === 1) return nombres[0];
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
    return nombres.slice(0, -1).join(', ') + ' y ' + nombres[nombres.length - 1];
  }

  generarTextoAISDCompleto(params: { 
    comunidades: string; 
    distrito: string; 
    componente1?: string; 
    componente2?: string; 
    departamento?: string 
  }): string {
    const comunidades = params.comunidades || '____';
    const distrito = params.distrito || '____';
    const componente1 = params.componente1 || '____';
    const componente2 = params.componente2 || '____';
    const departamento = params.departamento || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();
    const manualClass = this.dataHighlightService.getManualClass();
    
    const comunidadesClass = comunidades !== '____' 
      ? `${manualClass} has-data` 
      : highlightClass;

    // ✅ USAR TEMPLATE EN LUGAR DE HARDCODING
    const textoBase = SECCION2_TEMPLATES.textoAISDTemplate
      .replace('{{comunidades}}', `<span class="${comunidadesClass}">${comunidades}</span>`)
      .replace(/{{distrito}}/g, `<span class="${highlightClass}">${distrito}</span>`)
      .replace(/{{componente1}}/g, `<span class="${manualClass}">${componente1}</span>`)
      .replace(/{{componente2}}/g, `<span class="${manualClass}">${componente2}</span>`)
      .replace(/{{departamento}}/g, `<span class="${highlightClass}">${departamento}</span>`);

    return textoBase;
  }

  obtenerTextoSeccion2Introduccion(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_introduccion')();
    if (manual && manual.trim().length > 0) return manual;

    return SECCION2_TEMPLATES.introduccionDefault;
  }

  obtenerTextoSeccion2AISDCompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisd_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const comunidades = this.obtenerTextoComunidades();
    const geoInfo = this.projectFacade.selectField('3.1.1', null, 'geoInfo')() || {};
    const distrito = geoInfo.DIST || '____';
    const departamento = geoInfo.DPTO || '____';
    const componente1 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente1')() || '____';
    const componente2 = this.projectFacade.selectField(this.seccionId, null, 'aisdComponente2')() || '____';

    return this.generarTextoAISDCompleto({ 
      comunidades, 
      distrito, 
      componente1, 
      componente2, 
      departamento 
    });
  }

  obtenerTextoSeccion2AISICompleto(): string {
    const manual = this.projectFacade.selectField(this.seccionId, null, 'parrafoSeccion2_aisi_completo')();
    if (manual && manual.trim().length > 0) return manual;

    const gruposAISI = this.aisiGroups();
    const distritosNombres = gruposAISI
      .map(g => g.nombre?.trim())
      .filter(nombre => nombre && nombre !== '' && nombre !== 'Distrito');

    const geoInfo = this.projectFacade.selectField('3.1.1', null, 'geoInfo')() || {};
    const provincia = geoInfo.PROV || '____';
    const departamento = geoInfo.DPTO || '____';

    const highlightClass = this.dataHighlightService.getInheritedClass();
    const manualClass = this.dataHighlightService.getManualClass();

    let textoDistritos = '____';
    if (distritosNombres.length === 1) {
      textoDistritos = distritosNombres[0];
    } else if (distritosNombres.length === 2) {
      textoDistritos = `${distritosNombres[0]} y ${distritosNombres[1]}`;
    } else if (distritosNombres.length > 2) {
      const ultimo = distritosNombres[distritosNombres.length - 1];
      const anteriores = distritosNombres.slice(0, -1).join(', ');
      textoDistritos = `${anteriores} y ${ultimo}`;
    }

    const distritosClass = distritosNombres.length > 0 
      ? `${manualClass} has-data`
      : highlightClass;

    // ✅ USAR TEMPLATES DESDE CONSTANTS
    if (distritosNombres.length >= 1) {
      // Usar template para 1 o más distritos
      const template = distritosNombres.length === 1 
        ? SECCION2_TEMPLATES.textoAISITemplate
        : SECCION2_TEMPLATES.textoAISIMultiplesTemplate;
      
      return template
        .replace(/{{distritos}}/g, `<span class="${distritosClass}">${textoDistritos}</span>`)
        .replace(/{{provincia}}/g, `<span class="${highlightClass}">${provincia}</span>`)
        .replace(/{{departamento}}/g, `<span class="${highlightClass}">${departamento}</span>`);
    }

    // Fallback: usar template con placeholder
    return SECCION2_TEMPLATES.textoAISIFallbackTemplate
      .replace(/{{placeholderDistrito}}/g, `<span class="${highlightClass}">____</span>`)
      .replace(/{{provincia}}/g, `<span class="${highlightClass}">${provincia}</span>`)
      .replace(/{{departamento}}/g, `<span class="${highlightClass}">${departamento}</span>`);
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  trackByComunidadId(index: number, comunidad: GroupDefinition): string {
    return comunidad.id;
  }
}

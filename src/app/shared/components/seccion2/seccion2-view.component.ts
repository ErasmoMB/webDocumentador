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

  fotografiasSeccion2: FotoItem[] = [];

  // ✅ Signal derivado para fotografías
  override readonly aisiGroups: Signal<readonly GroupDefinition[]> = this.projectFacade.groupsByType('AISI');

  readonly comunidadesNombres: Signal<string[]> = computed(() => 
    this.aisdGroups().map(g => g.nombre)
  );

  readonly textoAISDFormateado: Signal<SafeHtml> = computed(() => {
    const texto = this.obtenerTextoSeccion2AISDCompleto();
    const html = this.formatearParrafo(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  readonly textoAISIFormateado: Signal<SafeHtml> = computed(() => {
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
    
    effect(() => {
      this.aisdGroups();
      this.aisiGroups();
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

    return `El Área de influencia social directa (AISD) se delimita en torno a la comunidad campesina (CC) <span class="${comunidadesClass}">${comunidades}</span>, cuya área comunal se encuentra predominantemente en el distrito de <span class="${highlightClass}">${distrito}</span> y en menor proporción en los distritos de <span class="${manualClass}">${componente1}</span> y de <span class="${manualClass}">${componente2}</span>, pertenecientes al departamento de <span class="${highlightClass}">${departamento}</span>. La delimitación del AISD se fundamenta principalmente en la propiedad de los terrenos superficiales. Esta comunidad posee y gestiona las tierras donde se llevará a cabo la exploración minera, lo que implica una relación directa y significativa con el Proyecto. La titularidad de estas tierras establece un vínculo crucial con los pobladores locales, ya que cualquier actividad realizada en el área puede influir directamente sus derechos, usos y costumbres asociados a la tierra. Además, la gestión y administración de estos terrenos por parte de esta comunidad requiere una consideración detallada en la planificación y ejecución del Proyecto, asegurando que las operaciones se lleven a cabo con respeto a la estructura organizativa y normativa de la comunidad. Los impactos directos en la CC <span class="${comunidadesClass}">${comunidades}</span>, derivados del proyecto de exploración minera, incluyen la contratación de mano de obra local, la interacción con las costumbres y autoridades, y otros efectos socioeconómicos y culturales. La generación de empleo local no solo proporcionará oportunidades económicas inmediatas, sino que también fomentará el desarrollo de habilidades y capacidades en la población. La interacción constante con las autoridades y la comunidad promoverá un diálogo y una cooperación que son esenciales para el éxito del Proyecto, respetando y adaptándose a las prácticas y tradiciones locales. La consideración de estos factores en la delimitación del AISD garantiza que el Proyecto avance de manera inclusiva y sostenible, alineado con las expectativas y necesidades de la CC <span class="${comunidadesClass}">${comunidades}</span>.`;
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
    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
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

    const geoInfo = this.projectFacade.selectField(this.seccionId, null, 'geoInfo')() || {};
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

    if (distritosNombres.length === 1) {
      return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${distritosClass}">${textoDistritos}</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
    } else if (distritosNombres.length > 1) {
      return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por los distritos de <span class="${distritosClass}">${textoDistritos}</span>, capitales distritales de sus respectivas jurisdicciones, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que estas localidades son los centros políticos de las jurisdicciones donde se ubica el Proyecto, así como al hecho de que mantienen una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, son las localidades de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
    }

    return `En cuanto al área de influencia social indirecta (AISI), se ha determinado que esta se encuentra conformada por el <span class="${highlightClass}">____</span>, capital distrital de la jurisdicción homónima, en la provincia de <span class="${highlightClass}">${provincia}</span>, en el departamento de <span class="${highlightClass}">${departamento}</span>. Esta delimitación se debe a que esta localidad es el centro político de la jurisdicción donde se ubica el Proyecto, así como al hecho de que mantiene una interrelación continua con el área delimitada como AISD y que ha sido caracterizada previamente. Además de ello, es la localidad de donde se obtendrán bienes y servicios complementarios de forma esporádica, así como que se interactuará con sus respectivas autoridades políticas.`;
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

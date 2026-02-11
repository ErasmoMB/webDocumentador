import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { TableNumberingService } from 'src/app/core/services/table-numbering.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    CoreSharedModule,
    ImageUploadComponent
  ],
  selector: 'app-seccion9-view',
  templateUrl: './seccion9-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .data-manual.has-data,
    :host ::ng-deep .data-section.has-data {
      background-color: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      font-weight: normal !important;
      color: inherit !important;
    }
  `]
})
export class Seccion9ViewComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.5';
  @Input() override modoFormulario: boolean = false;
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';
  
  override fotografiasCache: FotoItem[] = [];

  override watchedFields: string[] = [
    'grupoAISD', 'textoViviendas', 'textoEstructura', 
    'condicionOcupacionTabla', 'tiposMaterialesTabla'
  ];

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly condicionOcupacionConPorcentajesSignal: Signal<any[]> = computed(() => {
    let datos = this.getCondicionOcupacion() || [];
    
    // ✅ Si no hay datos, retornar array vacío (el backend llenará datos)
    // Eliminado: estructura inicial

    const total = datos.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);

    if (total <= 0) {
      return datos.map((item: any) => ({ ...item, porcentaje: '____' }));
    }

    const tablaConPorcentajes = datos.map((item: any) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      const porcentaje = (casos / total) * 100;
      const formateado = porcentaje.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',') + ' %';
      return { ...item, casos, porcentaje: formateado };
    });

    tablaConPorcentajes.push({
      categoria: 'Total',
      casos: total,
      porcentaje: '100,00 %'
    });

    return tablaConPorcentajes;
  });

  readonly tiposMaterialesAgrupados: Signal<{ [key: string]: any[] }> = computed(() => {
    const datos = this.getTiposMateriales() || [];
    const agrupados: { [key: string]: any[] } = {};

    datos.forEach((item: any) => {
      const categoria = item.categoria || '____';
      if (!agrupados[categoria]) {
        agrupados[categoria] = [];
      }
      agrupados[categoria].push(item);
    });

    return agrupados;
  });

  readonly photoFieldsHash: Signal<string> = computed(() => {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    let hash = '';
    for (let i = 1; i <= 10; i++) {
      const titulo = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Titulo${prefijo}`)();
      const fuente = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Fuente${prefijo}`)();
      const imagen = this.projectFacade.selectField(this.seccionId, null, `${this.PHOTO_PREFIX}${i}Imagen${prefijo}`)();
      hash += `${titulo || ''}|${fuente || ''}|${imagen ? '1' : '0'}|`;
    }
    return hash;
  });

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private sanitizer: DomSanitizer,
    private tableNumberingService: TableNumberingService
  ) {
    super(cdRef, injector);

    // ✅ EFFECT: Auto-sync datos
    effect(() => {
      const data = this.formDataSignal();
      this.datos = { ...data };
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear fotos
    effect(() => {
      this.photoFieldsHash();
      this.cargarFotografias();
      this.cdRef.markForCheck();
    });

    // ✅ EFFECT: Monitorear señales de tabla
    effect(() => {
      this.condicionOcupacionConPorcentajesSignal();
      this.tiposMaterialesAgrupados();
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

  override obtenerNombreComunidadActual(): string {
    return this.formDataSignal()['grupoAISD'] || '____';
  }

  getCondicionOcupacion(): any[] {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  }

  getTiposMateriales(): any[] {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  }

  getCategoriasMateriales(): string[] {
    const agrupados = this.tiposMaterialesAgrupados();
    return Object.keys(agrupados).filter(cat => cat !== '____');
  }

  getItemsPorCategoria(categoria: string): any[] {
    const agrupados = this.tiposMaterialesAgrupados();
    return agrupados[categoria] || [];
  }

  calcularTotalPorCategoria(categoria: string): number {
    const items = this.getItemsPorCategoria(categoria);
    return items.reduce((sum, item) => {
      const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
      return sum + casos;
    }, 0);
  }

  obtenerTextoViviendas(): string {
    const data = this.formDataSignal();
    const manual = data['textoViviendas'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    // Retornar plantilla con placeholders dinámicos vacíos
    return this.generarPlantillaTextoViviendas();
  }

  obtenerTextoEstructura(): string {
    const data = this.formDataSignal();
    const manual = data['textoEstructura'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    // Retornar plantilla con placeholders dinámicos vacíos
    return this.generarPlantillaTextoEstructura();
  }

  /**
   * Genera la plantilla de texto para Viviendas con placeholders dinámicos
   */
  private generarPlantillaTextoViviendas(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    return `Según la plataforma REDINFORMA del MIDIS, en los poblados que conforman la CC ${comunidad} se hallaron un total de ____ viviendas empadronadas. De estas, solamente ____ se encuentran ocupadas, representando un ____%. Cabe mencionar que, para poder describir el aspecto de estructura de las viviendas de esta comunidad, así como la sección de los servicios básicos, se toma como conjunto total a las viviendas ocupadas.`;
  }

  /**
   * Genera la plantilla de texto para Estructura con placeholders dinámicos
   */
  private generarPlantillaTextoEstructura(): string {
    const comunidad = this.obtenerNombreComunidadActual();
    return `Según la información recabada de los Censos Nacionales 2017, dentro de la CC ${comunidad}, el material más empleado para la construcción de las paredes de las viviendas es el ____, pues representa el ____%. A ello le complementa el material de ____ (____%). Respecto a los techos, destacan principalmente las planchas de calamina, fibra de cemento o similares con un ____%. El porcentaje restante consiste en ____ (____%) y en tejas (____%). Finalmente, en cuanto a los pisos, la mayoría están hechos de tierra (____%). Por otra parte, el porcentaje restante (____%) consiste en cemento.`;
  }

  // ✅ TÍTULOS Y FUENTES DE TABLAS
  obtenerTituloCondicionOcupacion(): string {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloCondicionOcupacion${prefijo}` : 'tituloCondicionOcupacion';
    const titulo = data[tituloKey];
    const comunidad = this.obtenerNombreComunidadActual();
    
    return titulo && titulo.trim().length > 0 
      ? titulo 
      : `Condición de ocupación de las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteCondicionOcupacion(): string {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteCondicionOcupacion${prefijo}` : 'fuenteCondicionOcupacion';
    const fuente = data[fuenteKey];
    if (fuente && fuente.trim().length > 0) {
      return fuente;
    }
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  obtenerTituloTiposMateriales(): string {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloTiposMateriales${prefijo}` : 'tituloTiposMateriales';
    const titulo = data[tituloKey];
    const comunidad = this.obtenerNombreComunidadActual();
    
    return titulo && titulo.trim().length > 0 
      ? titulo 
      : `Tipos de materiales de las viviendas – CC ${comunidad} (2017)`;
  }

  obtenerFuenteTiposMateriales(): string {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteTiposMateriales${prefijo}` : 'fuenteTiposMateriales';
    const fuente = data[fuenteKey];
    if (fuente && fuente.trim().length > 0) {
      return fuente;
    }
    return 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  override getFotografiasVista(): FotoItem[] {
    return this.fotografiasCache;
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByCategoria(_: number, cat: string): string {
    return cat;
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}

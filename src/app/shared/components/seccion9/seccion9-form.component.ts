import { Component, ChangeDetectorRef, Input, ChangeDetectionStrategy, Injector, Signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BaseSectionComponent } from '../base-section.component';
import { PrefijoHelper } from '../../utils/prefijo-helper';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableNumberingService } from 'src/app/core/services/numbering/table-numbering.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CoreSharedModule,
    ImageUploadComponent,
    DynamicTableComponent,
    ParagraphEditorComponent
  ],
  selector: 'app-seccion9-form',
  templateUrl: './seccion9-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion9FormComponent extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.A.1.5';
  @Input() override modoFormulario: boolean = true;
  
  override readonly PHOTO_PREFIX = 'fotografiaEstructura';
  override useReactiveSync: boolean = true;

  fotografiasSeccion9: FotoItem[] = [];

  override watchedFields: string[] = [
    'grupoAISD', 'textoViviendas', 'textoEstructura', 
    'condicionOcupacionTabla', 'tiposMaterialesTabla'
  ];

  // ✅ SIGNALS PUROS
  readonly formDataSignal: Signal<Record<string, any>> = computed(() => {
    return this.projectFacade.selectSectionFields(this.seccionId, null)();
  });

  readonly textoViviendasSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    return data['textoViviendas'] || '';
  });

  readonly textoEstructuraSignal: Signal<string> = computed(() => {
    const data = this.formDataSignal();
    return data['textoEstructura'] || '';
  });

  readonly condicionOcupacionSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
  });

  readonly tiposMaterialesSignal: Signal<any[]> = computed(() => {
    const data = this.formDataSignal();
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tablaKey = prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
    return Array.isArray(data[tablaKey]) ? data[tablaKey] : [];
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
      this.fotografiasSeccion9 = [...this.fotografiasFormMulti];
      this.cdRef.markForCheck();
    }, { allowSignalWrites: true });
  }

  protected override onInitCustom(): void {
    this.cargarFotografias();
  }

  protected override detectarCambios(): boolean {
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  override onFotografiasChange(fotografias: FotoItem[], customPrefix?: string): void {
    super.onFotografiasChange(fotografias, customPrefix);
    this.fotografiasSeccion9 = fotografias;
    this.cdRef.markForCheck();
  }

  override obtenerNombreComunidadActual(): string {
    return this.projectFacade.selectField(this.seccionId, null, 'grupoAISD')() || '____';
  }

  obtenerTextoViviendas(): string {
    const manual = this.datos['textoViviendas'];
    if (manual && manual.trim().length > 0) {
      return manual;
    }
    // Retornar plantilla con placeholders dinámicos vacíos
    return this.generarPlantillaTextoViviendas();
  }

  obtenerTextoEstructura(): string {
    const manual = this.datos['textoEstructura'];
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

  // ✅ TABLA 1: Condición de Ocupación
  get condicionOcupacionConfig(): any {
    return {
      tablaKey: this.getTablaKeyCondicionOcupacion(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      noInicializarDesdeEstructura: true,  // ✅ Sin estructura inicial - el backend llenará datos
      calcularPorcentajes: true
    };
  }

  getTablaKeyCondicionOcupacion(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
  }

  onCondicionOcupacionTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyCondicionOcupacion();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges();
  }

  // ✅ TABLA 2: Tipos de Materiales
  get tiposMaterialesConfig(): any {
    return {
      tablaKey: this.getTablaKeyTiposMateriales(),
      totalKey: 'tipoMaterial',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [],
      calcularPorcentajes: true
    };
  }

  getTablaKeyTiposMateriales(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    return prefijo ? `tiposMaterialesTabla${prefijo}` : 'tiposMaterialesTabla';
  }

  onTiposMaterialesTableUpdated(updatedData?: any[]): void {
    const tablaKey = this.getTablaKeyTiposMateriales();
    const datos = updatedData || this.datos[tablaKey] || [];
    this.onFieldChange(tablaKey, datos, { refresh: true });
    this.cdRef.detectChanges();
  }

  // ✅ NÚMEROS DE CUADROS DINÁMICOS
  obtenerNumeroCuadroCondicionOcupacion(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 0);
  }

  obtenerNumeroCuadroTiposMateriales(): string {
    return this.tableNumberingService.getGlobalTableNumber(this.seccionId, 1);
  }

  // ✅ TÍTULOS Y FUENTES DE TABLAS
  obtenerTituloCondicionOcupacion(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloCondicionOcupacion${prefijo}` : 'tituloCondicionOcupacion';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) {
      return titulo;
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Condición de ocupación de las viviendas – CC ${comunidad} (2017)`;
  }

  onTituloCondicionOcupacionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloCondicionOcupacion${prefijo}` : 'tituloCondicionOcupacion';
    this.onFieldChange(tituloKey, valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerFuenteCondicionOcupacion(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteCondicionOcupacion${prefijo}` : 'fuenteCondicionOcupacion';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) {
      return fuente;
    }
    return 'Reporte de Indicadores de Desarrollo e Inclusión Social de Centro Poblado – REDINFORMA (MIDIS)';
  }

  onFuenteCondicionOcupacionChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteCondicionOcupacion${prefijo}` : 'fuenteCondicionOcupacion';
    this.onFieldChange(fuenteKey, valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerTituloTiposMateriales(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloTiposMateriales${prefijo}` : 'tituloTiposMateriales';
    const titulo = this.datos[tituloKey];
    if (titulo && titulo.trim().length > 0) {
      return titulo;
    }
    const comunidad = this.obtenerNombreComunidadActual();
    return `Tipos de materiales de las viviendas – CC ${comunidad} (2017)`;
  }

  onTituloTiposMaterialesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const tituloKey = prefijo ? `tituloTiposMateriales${prefijo}` : 'tituloTiposMateriales';
    this.onFieldChange(tituloKey, valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  obtenerFuenteTiposMateriales(): string {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteTiposMateriales${prefijo}` : 'fuenteTiposMateriales';
    const fuente = this.datos[fuenteKey];
    if (fuente && fuente.trim().length > 0) {
      return fuente;
    }
    return 'Censos Nacionales 2017: XII de Población, VII de Vivienda y III de Comunidades Indígenas';
  }

  onFuenteTiposMaterialesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
    const fuenteKey = prefijo ? `fuenteTiposMateriales${prefijo}` : 'fuenteTiposMateriales';
    this.onFieldChange(fuenteKey, valor, { refresh: false });
    this.cdRef.markForCheck();
  }

  trackByIndex(index: number): number {
    return index;
  }

  /**
   * ✅ Helper para templates - retorna prefijo de grupo para uso en HTML
   */
  obtenerPrefijo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }
}

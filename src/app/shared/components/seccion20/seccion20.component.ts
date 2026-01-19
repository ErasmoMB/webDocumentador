import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion20',
  templateUrl: './seccion20.component.html',
  styleUrls: ['./seccion20.component.css']
})
export class Seccion20Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['grupoAISD', 'sitioArqueologico', 'festividades', 'textoFestividades'];
  
  override readonly PHOTO_PREFIX = 'fotografiaFestividades';

  festividadesConfig: TableConfig = {
    tablaKey: 'festividades',
    totalKey: 'festividad',
    campoTotal: 'festividad',
    estructuraInicial: [{ festividad: '', fecha: '' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    if (this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  getTablaKeyFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `festividades${prefijo}` : 'festividades';
  }

  getTablaFestividades(): any[] {
    const tablaKey = this.getTablaKeyFestividades();
    const tabla = this.datos[tablaKey] || this.datos.festividades || [];
    return Array.isArray(tabla) ? tabla : [];
  }

  getFieldIdTextoFestividades(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoFestividades${prefijo}` : 'textoFestividades';
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
      }
    }
    
    if (grupoAISDActual !== grupoAISDAnterior || grupoAISDActual !== grupoAISDEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasFestividadesVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return this.fotografiasCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoFestividades(): string {
    const fieldId = this.getFieldIdTextoFestividades();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoFestividades;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const sitioArqueologico = this.datos.sitioArqueologico || 'Incahuasi';
    
    const textoPorDefecto = `En la CC ${grupoAISD}, las festividades son momentos de gran importancia cultural y social que refuerzan los lazos comunitarios y mantienen vivas las tradiciones locales. Entre las celebraciones más destacadas se encuentran los carnavales, que tienen lugar en el mes de febrero. Esta festividad está marcada por el entusiasmo de la población, quienes participan en juegos con agua y desfiles.\n\nOtra celebración significativa es la dedicada a la Virgen de Chapi, que se lleva a cabo cada 1° de mayo. En esta fecha, los devotos organizan misas solemnes, procesiones en honor a la Virgen y actividades sociales que congregan a familias locales y visitantes. Del 3 al 5 de mayo, se celebra la Fiesta de las Cruces, en la que se realizan ceremonias religiosas, procesiones y actividades tradicionales, como la tauromaquia, acompañadas por grupos musicales que animan el ambiente.\n\nEn junio, el calendario festivo incluye dos importantes celebraciones: la festividad de San Vicente Ferrer (que es la fiesta patronal principal de la comunidad), que se realiza del 21 al 23 de junio, y el aniversario de la comunidad, celebrado el 24 de junio con actos protocolares, actividades culturales y sociales. Ambas fechas están caracterizadas por su componente religioso, con misas y procesiones, además de eventos que integran a toda la comunidad.\n\nUna festividad de gran relevancia ambiental y cultural es el Chaku, o esquila de vicuñas, una actividad tradicional vinculada al aprovechamiento sostenible de esta especie emblemática de los Andes. Aunque las fechas de esta celebración suelen variar, se tiene la propuesta de realizarla cada 15 de noviembre, coincidiendo con el Día de la Vicuña. Durante el Chaku, además de la esquila, se realizan actividades culturales, ceremonias andinas y eventos de integración comunitaria.\n\nEn cuanto al potencial turístico, la CC ${grupoAISD} destaca no solo por sus festividades tradicionales, sino también por las ruinas arqueológicas de ${sitioArqueologico}, un sitio de valor histórico y cultural. Este lugar, que guarda vestigios del pasado incaico, representa una oportunidad para atraer visitantes interesados en la historia, la arqueología y el turismo vivencial. La promoción de este recurso puede complementar las festividades y posicionar a la comunidad como un destino atractivo para el turismo sostenible, generando beneficios económicos y culturales para sus habitantes.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/CC\s*____/g, `CC ${grupoAISD}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoFestividadesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoFestividades();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const sitioArqueologico = this.datos.sitioArqueologico || 'Incahuasi';
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (sitioArqueologico !== 'Incahuasi') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(sitioArqueologico)), `<span class="data-manual">${this.escapeHtml(sitioArqueologico)}</span>`);
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

  onFestividadesTableUpdated(): void {
    const tablaKey = this.getTablaKeyFestividades();
    const tabla = this.getTablaFestividades();
    this.datos[tablaKey] = [...tabla];
    this.formularioService.actualizarDato(tablaKey as any, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
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

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual == null || anterior == null) return actual === anterior;
    if (typeof actual !== typeof anterior) return false;
    if (typeof actual !== 'object') return actual === anterior;
    if (Array.isArray(actual) !== Array.isArray(anterior)) return false;
    if (Array.isArray(actual)) {
      if (actual.length !== anterior.length) return false;
      for (let i = 0; i < actual.length; i++) {
        if (!this.compararValores(actual[i], anterior[i])) return false;
      }
      return true;
    }
    const keysActual = Object.keys(actual);
    const keysAnterior = Object.keys(anterior);
    if (keysActual.length !== keysAnterior.length) return false;
    for (const key of keysActual) {
      if (!keysAnterior.includes(key)) return false;
      if (!this.compararValores(actual[key], anterior[key])) return false;
    }
    return true;
  }

  private clonarValor(valor: any): any {
    if (valor == null || typeof valor !== 'object') return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    const clon: any = {};
    for (const key in valor) {
      if (valor.hasOwnProperty(key)) {
        clon[key] = this.clonarValor(valor[key]);
      }
    }
    return clon;
  }
}


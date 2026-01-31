import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { FotoItem, ImageUploadComponent } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { DynamicTableComponent } from '../dynamic-table/dynamic-table.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { TableWrapperComponent } from '../table-wrapper/table-wrapper.component';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion11',
    templateUrl: './seccion11.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion11Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'provinciaSeleccionada', 'parrafoSeccion11_transporte_completo', 'parrafoSeccion11_telecomunicaciones_completo', 'costoTransporteMinimo', 'costoTransporteMaximo', 'telecomunicacionesTabla'];
  
  readonly PHOTO_PREFIX_TRANSPORTE = 'fotografiaTransporte';
  readonly PHOTO_PREFIX_TELECOMUNICACIONES = 'fotografiaTelecomunicaciones';
  
  fotografiasTransporteFormMulti: FotoItem[] = [];
  fotografiasTelecomunicacionesFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';
  override fotografiasCache: FotoItem[] = [];
  fotografiasTransporteCache: FotoItem[] = [];
  fotografiasTelecomunicacionesCache: FotoItem[] = [];
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();

  get telecomunicacionesConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTelecomunicaciones(),
      totalKey: 'medio',
      campoTotal: 'medio',
      campoPorcentaje: 'descripcion',
      estructuraInicial: [
        { medio: 'Emisoras de radio', descripcion: '--' },
        { medio: 'Señales de televisión', descripcion: 'América TV, DIRECTV' },
        { medio: 'Señales de telefonía móvil', descripcion: 'Movistar, Entel' },
        { medio: 'Señal de Internet', descripcion: 'Movistar' }
      ]
    };
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
  }

  protected getSectionKey(): string {
    return 'seccion11_aisd';
  }

  protected getLoadParameters(): string[] | null {
    return null;
  }


  protected override detectarCambios(): boolean {
    const groupId = this.obtenerPrefijoGrupo() || null;
    const datosActuales = this.projectFacade.getSectionFields(this.seccionId, groupId);
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (campo === 'telecomunicacionesTabla') {
        valorActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, campo, this.seccionId) || null;
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      const sonIguales = this.compararValores(valorActual, valorAnterior);
      if (!sonIguales) {
        hayCambios = true;
        if (campo === 'telecomunicacionesTabla') {
          const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
          this.datosAnteriores[campoConPrefijo] = this.clonarValor(valorActual);
        } else {
          this.datosAnteriores[campo] = this.clonarValor(valorActual);
        }
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

  protected override tieneFotografias(): boolean {
    return false;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  private getTablaTelecomunicaciones(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'telecomunicacionesTabla', this.seccionId) || this.datos.telecomunicacionesTabla || [];
    return tabla;
  }

  getTablaKeyTelecomunicaciones(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `telecomunicacionesTabla${prefijo}` : 'telecomunicacionesTabla';
  }

  getTelecomunicacionesTabla(): any[] {
    return this.getTablaTelecomunicaciones();
  }

  getFotografiasTransporteVista(): FotoItem[] {
    if (this.fotografiasTransporteCache && this.fotografiasTransporteCache.length > 0) {
      return [...this.fotografiasTransporteCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTransporteCache;
  }

  getFotografiasTelecomunicacionesVista(): FotoItem[] {
    if (this.fotografiasTelecomunicacionesCache && this.fotografiasTelecomunicacionesCache.length > 0) {
      return [...this.fotografiasTelecomunicacionesCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasTelecomunicacionesCache;
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasTransporteFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const fotosTransporte = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TRANSPORTE,
      groupPrefix
    );
    this.fotografiasTransporteCache = fotosTransporte && fotosTransporte.length > 0 ? [...fotosTransporte] : [];
    
    const fotosTelecomunicaciones = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_TELECOMUNICACIONES,
      groupPrefix
    );
    this.fotografiasTelecomunicacionesCache = fotosTelecomunicaciones && fotosTelecomunicaciones.length > 0 ? [...fotosTelecomunicaciones] : [];
    
    this.cdRef.markForCheck();
  }

  onFotografiasTransporteChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TRANSPORTE, fotografias);
    this.fotografiasTransporteFormMulti = [...fotografias];
    this.fotografiasTransporteCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasTelecomunicacionesChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_TELECOMUNICACIONES, fotografias);
    this.fotografiasTelecomunicacionesFormMulti = [...fotografias];
    this.fotografiasTelecomunicacionesCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion11TransporteCompleto(): string {
    if (this.datos.parrafoSeccion11_transporte_completo) {
      return this.datos.parrafoSeccion11_transporte_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    const distrito = this.datos.distritoSeleccionado || '____';
    const costoMin = this.datos.costoTransporteMinimo || '____';
    const costoMax = this.datos.costoTransporteMaximo || '____';
    
    return `En la CC ${grupoAISD}, la infraestructura de transporte es limitada. Dentro de la comunidad solo se encuentran trochas carrozables que permiten llegar al anexo ${grupoAISD}. Estas vías facilitan el acceso en vehículos, pero son de tierra y no están pavimentadas, lo que dificulta el tránsito en épocas de lluvias o durante el invierno. Los demás puntos poblados dentro de la comunidad también son accesibles mediante trochas carrozables, aunque en condiciones más precarias que las principales que permiten el acceso al anexo o centro administrativo comunal.\n\nPor otro lado, no existen empresas de transporte formalmente establecidas dentro de la comunidad. Sin embargo, existe un servicio de transporte frecuente que es provisto por una combi todos los días lunes. El único destino de esta movilidad es la ciudad de ${provincia}, a la cual parte cerca de las 10:30 am desde la capital distrital de ${distrito}. El costo por este servicio varía entre S/. ${costoMin} y S/. ${costoMax} por trayecto, dependiendo de la demanda y las condiciones del viaje. Es así que esta es la única opción que tienen los comuneros para desplazarse a ciudades más grandes.`;
  }

  obtenerTextoSeccion11TransporteCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion11TransporteCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const provincia = this.datos.provinciaSeleccionada || '____';
    const distrito = this.datos.distritoSeleccionado || '____';
    const costoMin = this.datos.costoTransporteMinimo || '____';
    const costoMax = this.datos.costoTransporteMaximo || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(provincia)), `<span class="data-section">${this.escapeHtml(provincia)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(distrito)), `<span class="data-section">${this.escapeHtml(distrito)}</span>`)
      .replace(this.obtenerRegExp(`S/\\.\\s*${this.escapeRegex(costoMin)}(?=\\s|\\s|$)`), `S/. <span class="data-manual">${this.escapeHtml(costoMin)}</span>`)
      .replace(this.obtenerRegExp(`S/\\.\\s*${this.escapeRegex(costoMax)}(?=\\s|\\s|$)`), `S/. <span class="data-manual">${this.escapeHtml(costoMax)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoSeccion11TelecomunicacionesCompleto(): string {
    if (this.datos.parrafoSeccion11_telecomunicaciones_completo) {
      return this.datos.parrafoSeccion11_telecomunicaciones_completo;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, la infraestructura en telecomunicaciones presenta algunas limitaciones, aunque existen servicios disponibles para la población. En cuanto a radiodifusión, no es posible captar señal de emisoras provinciales o nacionales. Respecto a la señal de televisión, la comunidad cuenta con acceso a América TV (canal 4) a través de señal abierta, gracias a una antena de la municipalidad que retransmite este canal, lo que garantiza una opción de entretenimiento y noticias. Adicionalmente, algunas familias tienen contratado el servicio de DIRECTV, el cual brinda acceso a televisión satelital.\n\nEn lo que respecta a la telefonía móvil, la cobertura es restringida y solo las operadoras de Movistar y Entel logran captar señal en la comunidad, lo cual limita las opciones de comunicación para los habitantes. Por otro lado, el acceso a internet depende únicamente de Movistar, ya que los comuneros solo pueden conectarse a través de los datos móviles proporcionados por esta empresa. Además, cabe mencionar que, si bien existe acceso a internet, la calidad y estabilidad de la conexión pueden ser deficientes, especialmente en las zonas más alejadas dentro de la comunidad.`;
  }

  obtenerTextoSeccion11TelecomunicacionesCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion11TelecomunicacionesCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  private compararValores(actual: any, anterior: any): boolean {
    if (actual === anterior) return true;
    if (actual === null || anterior === null) return actual === anterior;
    if (actual === undefined || anterior === undefined) return actual === anterior;
    if (Array.isArray(actual) && Array.isArray(anterior)) {
      if (actual.length !== anterior.length) return false;
      return actual.every((item, index) => this.compararValores(item, anterior[index]));
    }
    if (typeof actual === 'object' && typeof anterior === 'object') {
      const keysActual = Object.keys(actual);
      const keysAnterior = Object.keys(anterior);
      if (keysActual.length !== keysAnterior.length) return false;
      return keysActual.every(key => this.compararValores(actual[key], anterior[key]));
    }
    return actual === anterior;
  }

  private clonarValor(valor: any): any {
    if (valor === null || valor === undefined) return valor;
    if (Array.isArray(valor)) {
      return valor.map(item => this.clonarValor(item));
    }
    if (typeof valor === 'object') {
      const clon: any = {};
      for (const key in valor) {
        if (valor.hasOwnProperty(key)) {
          clon[key] = this.clonarValor(valor[key]);
        }
      }
      return clon;
    }
    return valor;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private obtenerRegExp(pattern: string): RegExp {
    if (!this.regexCache.has(pattern)) {
      this.regexCache.set(pattern, new RegExp(pattern, 'g'));
    }
    return this.regexCache.get(pattern)!;
  }

  private escapeRegex(text: any): string {
    const str = typeof text === 'string' ? text : String(text || '');
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}


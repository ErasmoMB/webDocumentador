import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenericImageComponent } from '../generic-image/generic-image.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { CoreSharedModule } from '../../modules/core-shared.module';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { CentrosPobladosActivosService } from 'src/app/core/services/centros-poblados-activos.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion16',
    templateUrl: './seccion16.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion16Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion16_agua_completo', 'parrafoSeccion16_recursos_naturales_completo', 'ojosAgua1', 'ojosAgua2', 'rioAgricola', 'quebradaAgricola'];
  
  readonly PHOTO_PREFIX_RESERVORIO = 'fotografiaReservorio';
  readonly PHOTO_PREFIX_USO_SUELOS = 'fotografiaUsoSuelos';
  
  fotografiasReservorioFormMulti: FotoItem[] = [];
  fotografiasUsoSuelosFormMulti: FotoItem[] = [];
  fotografiasReservorioCache: FotoItem[] = [];
  fotografiasUsoSuelosCache: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override autoLoader: AutoBackendDataLoaderService,
    private stateAdapter: ReactiveStateAdapter,
    private groupConfig: GroupConfigService,
    private centrosPobladosActivos: CentrosPobladosActivosService,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, autoLoader, injector, undefined, undefined);
  }

  protected getSectionKey(): string {
    return 'seccion16_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const prefijo = this.obtenerPrefijoGrupo();
    const ccppDesdeGrupo = prefijo
      ? this.centrosPobladosActivos.obtenerCodigosActivosPorPrefijo(prefijo)
      : this.groupConfig.getAISDCCPPActivos();
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      return ccppDesdeGrupo;
    }
    return null;
  }

  protected override detectarCambios(): boolean {
    const groupId = this.obtenerPrefijoGrupo() || null;
    const datosActuales = this.projectFacade.getSectionFields(this.seccionId, groupId);
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

  getFotografiasReservorioVista(): FotoItem[] {
    if (this.fotografiasReservorioCache && this.fotografiasReservorioCache.length > 0) {
      return this.fotografiasReservorioCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      groupPrefix
    );
  }

  getFotografiasUsoSuelosVista(): FotoItem[] {
    if (this.fotografiasUsoSuelosCache && this.fotografiasUsoSuelosCache.length > 0) {
      return this.fotografiasUsoSuelosCache;
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasReservorioFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_RESERVORIO, groupPrefix);
    this.fotografiasUsoSuelosFormMulti = this.imageService.loadImages(this.seccionId, this.PHOTO_PREFIX_USO_SUELOS, groupPrefix);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe((nuevosDatos) => {
        if (!nuevosDatos) return;
        this.datos = { ...this.datos, ...nuevosDatos };
        this.cargarFotografias();
        this.cdRef.markForCheck();
      });
    }
    this.logGrupoActual();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasReservorioCache = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      groupPrefix
    );
    this.fotografiasUsoSuelosCache = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      groupPrefix
    );
    this.cdRef.markForCheck();
  }

  onFotografiasReservorioChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_RESERVORIO,
      fotografias,
      groupPrefix
    );
    this.fotografiasReservorioFormMulti = [...fotografias];
    this.fotografiasReservorioCache = [...fotografias];
    this.cdRef.markForCheck();
  }

  onFotografiasUsoSuelosChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX_USO_SUELOS,
      fotografias,
      groupPrefix
    );
    this.fotografiasUsoSuelosFormMulti = [...fotografias];
    this.fotografiasUsoSuelosCache = [...fotografias];
    this.cdRef.markForCheck();
  }

  getFieldIdAguaCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion16_agua_completo${prefijo}` : 'parrafoSeccion16_agua_completo';
  }

  getFieldIdRecursosNaturalesCompleto(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion16_recursos_naturales_completo${prefijo}` : 'parrafoSeccion16_recursos_naturales_completo';
  }

  obtenerTextoSeccion16AguaCompleto(): string {
    const fieldId = this.getFieldIdAguaCompleto();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.parrafoSeccion16_agua_completo;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = this.datos.ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = this.datos.ojosAgua2 || 'Pallalli';
    const rioAgricola = this.datos.rioAgricola || 'Yuracyacu';
    const quebradaAgricola = this.datos.quebradaAgricola || 'Pucaccocha';
    
    const textoPorDefecto = `Las fuentes de agua en la CC ${grupoAISD} son diversas, dependiendo del uso que se les dé. Para el consumo humano, el agua se obtiene principalmente de los ojos de agua de ${ojosAgua1} y ${ojosAgua2}. En el caso del anexo ${grupoAISD}, esta agua es almacenada en un reservorio, desde donde se distribuye a las viviendas locales a través de una red básica de distribución. Aunque el abastecimiento cubre las necesidades esenciales de la población, existen desafíos relacionados con la calidad del agua y el mantenimiento de la infraestructura.\n\nEn cuanto al uso agrícola, el agua proviene del río ${rioAgricola} y la quebrada ${quebradaAgricola}, que sirven como una fuente importante de riego. Finalmente, para el uso ganadero, la comunidad se abastece de las diferentes quebradas que se hallan dentro del área de la CC ${grupoAISD}, las cuales proporcionan agua para el sustento del ganado local, principalmente vacunos y ovinos.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion16AguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion16AguaCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const ojosAgua1 = this.datos.ojosAgua1 || 'Quinsa Rumi';
    const ojosAgua2 = this.datos.ojosAgua2 || 'Pallalli';
    const rioAgricola = this.datos.rioAgricola || 'Yuracyacu';
    const quebradaAgricola = this.datos.quebradaAgricola || 'Pucaccocha';
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    }
    if (ojosAgua1 !== 'Quinsa Rumi') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua1)), `<span class="data-manual">${this.escapeHtml(ojosAgua1)}</span>`);
    }
    if (ojosAgua2 !== 'Pallalli') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(ojosAgua2)), `<span class="data-manual">${this.escapeHtml(ojosAgua2)}</span>`);
    }
    if (rioAgricola !== 'Yuracyacu') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(rioAgricola)), `<span class="data-manual">${this.escapeHtml(rioAgricola)}</span>`);
    }
    if (quebradaAgricola !== 'Pucaccocha') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(quebradaAgricola)), `<span class="data-manual">${this.escapeHtml(quebradaAgricola)}</span>`);
    }
    
    html = html.replace(/\n\n/g, '</p><p class="text-justify">');
    html = `<p class="text-justify">${html}</p>`;
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  obtenerTextoSeccion16RecursosNaturalesCompleto(): string {
    const fieldId = this.getFieldIdRecursosNaturalesCompleto();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.parrafoSeccion16_recursos_naturales_completo;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    const textoPorDefecto = `En la CC ${grupoAISD}, la tenencia de la tierra es comunal, lo que significa que la comunidad en su conjunto es la propietaria de los terrenos superficiales. Los comuneros no son propietarios individuales de la tierra, sino que la comunidad les cede los terrenos en calidad de posesión para que puedan vivir y trabajar en ellos. Este sistema de tenencia comunal busca asegurar el acceso equitativo a los recursos entre los miembros de la comunidad, aunque limita la posibilidad de transacciones privadas de terrenos.\n\nEn cuanto a los usos del suelo, la mayor parte del territorio está destinado a las actividades agrícolas y ganaderas, las cuales son el principal sustento económico de la población. La tierra es aprovechada para el cultivo de papa, haba y cebada, y para el pastoreo de vacunos y ovinos. Entre los recursos naturales que se aprovechan destacan la queñua, eucalipto, lloque y tola, que son utilizados como leña para la cocción de alimentos o en la construcción.\n\nAdemás, según algunos comuneros, dentro del territorio de la comunidad existen diversas hierbas medicinales con efectos positivos para la salud. Entre ellas destacan la huamanripa, llantén, muña y salvia. Estas son utilizadas en un primer nivel de atención antes de acudir al establecimiento de salud local.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion16RecursosNaturalesConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion16RecursosNaturalesCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let html = this.escapeHtml(texto);
    
    if (grupoAISD !== '____') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
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


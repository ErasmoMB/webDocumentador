import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenericImageComponent } from '../generic-image/generic-image.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion17',
    templateUrl: './seccion17.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion17Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['distritoSeleccionado', 'indiceDesarrolloHumanoTabla', 'textoIndiceDesarrolloHumano', 'tablaAISD2TotalPoblacion'];
  
  override readonly PHOTO_PREFIX = 'fotografiaIDH';

  indiceDesarrolloHumanoConfig: TableConfig = {
    tablaKey: 'indiceDesarrolloHumanoTabla',
    totalKey: 'poblacion',
    campoTotal: 'poblacion',
    campoPorcentaje: 'idh',
    estructuraInicial: [{ poblacion: 0, rankIdh1: 0, idh: '0.000', rankEsperanza: 0, esperanzaVida: '0.0', rankEducacion1: 0, educacion: '0.0%', rankEducacion2: 0, anosEducacion: '0.0', rankAnios: 0, ingreso: '0.0', rankIngreso: 0 }]
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    private tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer
  ) {
    super(cdRef, injector);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    this.inicializarPoblacionAutomatica();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.inicializarPoblacionAutomatica();
        this.cdRef.detectChanges();
      });
    }
  }

  getTotalPoblacion(): number {
    const prefijo = this.obtenerPrefijoGrupo();
    const poblacionKey = prefijo ? `tablaAISD2TotalPoblacion${prefijo}` : 'tablaAISD2TotalPoblacion';
    const totalPoblacion = parseInt(this.datos[poblacionKey] || this.datos.tablaAISD2TotalPoblacion || '0') || 0;
    return totalPoblacion;
  }

  inicializarPoblacionAutomatica(): void {
    const tablaKey = this.getTablaKeyIDH();
    const tabla = this.datos[tablaKey] || this.datos.indiceDesarrolloHumanoTabla || [];
    
    if (tabla.length === 0) {
      const totalPoblacion = this.getTotalPoblacion();
      if (totalPoblacion > 0) {
        const nuevaFila = {
          poblacion: totalPoblacion,
          rankIdh1: 0,
          idh: '0.000',
          rankEsperanza: 0,
          esperanzaVida: '0.0',
          rankEducacion1: 0,
          educacion: '0.0%',
          rankEducacion2: 0,
          anosEducacion: '0.0',
          rankAnios: 0,
          ingreso: '0.0',
          rankIngreso: 0
        };
        this.datos[tablaKey] = [nuevaFila];
        this.onFieldChange(tablaKey as any, [nuevaFila], { refresh: false });
      }
    } else if (tabla.length > 0 && (!tabla[0].poblacion || tabla[0].poblacion === 0)) {
      const totalPoblacion = this.getTotalPoblacion();
      if (totalPoblacion > 0) {
        tabla[0].poblacion = totalPoblacion;
        this.datos[tablaKey] = [...tabla];
        this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      }
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
      }
    }
    
    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
    const grupoAISD = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'grupoAISD', this.seccionId);
    this.datos.grupoAISD = grupoAISD || null;
    this.datosAnteriores.grupoAISD = grupoAISD || null;
    this.inicializarPoblacionAutomatica();
  }

  getIDH(): string {
    const tabla = this.getIndiceDesarrolloHumanoTabla();
    if (!tabla || tabla.length === 0) {
      return '____';
    }
    const item = tabla[0];
    const idh = item?.idh;
    if (!idh || idh === '0.000' || idh === '0,000' || idh === '____') {
      return '____';
    }
    return idh;
  }

  getRankIDH(): string {
    const tabla = this.getIndiceDesarrolloHumanoTabla();
    if (!tabla || tabla.length === 0) {
      return '____';
    }
    const item = tabla[0];
    const rankIdh = item?.rankIdh1 || item?.rankEsperanza;
    if (!rankIdh || rankIdh === 0 || rankIdh === '____') {
      return '____';
    }
    return rankIdh.toString();
  }

  getFotografiasIDHVista(): FotoItem[] {
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

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = [...fotos];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyIDH(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `indiceDesarrolloHumanoTabla${prefijo}` : 'indiceDesarrolloHumanoTabla';
  }

  getIndiceDesarrolloHumanoTabla(): any[] {
    const tablaKey = this.getTablaKeyIDH();
    return this.datos[tablaKey] || this.datos.indiceDesarrolloHumanoTabla || [];
  }

  getFieldIdTextoIDH(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoIndiceDesarrolloHumano${prefijo}` : 'textoIndiceDesarrolloHumano';
  }

  obtenerTextoIndiceDesarrolloHumano(): string {
    const fieldId = this.getFieldIdTextoIDH();
    const textoConPrefijo = this.datos[fieldId];
    const textoSinPrefijo = this.datos.textoIndiceDesarrolloHumano;
    const textoPersonalizado = textoConPrefijo || textoSinPrefijo;
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const idh = this.getIDH();
    const rankIdh = this.getRankIDH();
    
    const idhValor = (idh !== '____' && idh !== '0.000' && idh !== '0,000') ? idh : '____';
    const rankValor = (rankIdh !== '____' && rankIdh !== '0') ? rankIdh : '____';
    
    const textoPorDefecto = `El Índice de Desarrollo Humano (IDH) mide el logro medio de un país (en nuestro país se mide también a niveles departamentales, provinciales y distritales) tratándose de un índice compuesto. El IDH contiene tres variables: la esperanza de vida al nacer, el logro educacional (alfabetización de adultos y la tasa bruta de matriculación primaria, secundaria y terciaria combinada) y el PIB real per cápita (PPA en dólares). El ingreso se considera en el IDH en representación de un nivel decente de vida y en reemplazo de todas las opciones humanas que no se reflejan en las otras dos dimensiones.\n\nSegún el informe del PNUD para el año 2019, el Índice de Desarrollo Humano del distrito de ${distrito} es de ${idhValor}. Es así que ocupa el puesto N°${rankValor} en el país, siendo una de las divisiones políticas de nivel subnacional con uno de los IDH más bajos.`;
    
    if (textoPersonalizado && textoPersonalizado !== '____' && textoPersonalizado.trim() !== '') {
      let textoFinal = textoPersonalizado;
      if (idhValor !== '____') {
        textoFinal = textoFinal.replace(/0\.000|0,000|____/g, idhValor);
      }
      if (rankValor !== '____') {
        textoFinal = textoFinal.replace(/N°\s*____/g, `N°${rankValor}`);
        textoFinal = textoFinal.replace(/puesto N°\s*____/g, `puesto N°${rankValor}`);
      }
      return textoFinal;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoIDHConResaltado(): SafeHtml {
    const texto = this.obtenerTextoIndiceDesarrolloHumano();
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const idh = this.getIDH();
    const rankIdh = this.getRankIDH();
    
    let html = this.escapeHtml(texto);
    
    if (distrito !== 'Cahuacho') {
      html = html.replace(this.obtenerRegExp(this.escapeRegex(distrito)), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    }
    
    if (idh !== '____' && idh !== '0.000' && idh !== '0,000') {
      const idhEscapado = this.escapeHtml(idh);
      html = html.replace(this.obtenerRegExp(this.escapeRegex(idh)), `<span class="data-manual">${idhEscapado}</span>`);
    }
    
    if (rankIdh !== '____' && rankIdh !== '0') {
      const rankEscapado = this.escapeHtml(rankIdh);
      html = html.replace(this.obtenerRegExp(`N°${this.escapeRegex(rankIdh)}`), `N°<span class="data-manual">${rankEscapado}</span>`);
      html = html.replace(this.obtenerRegExp(`puesto N°${this.escapeRegex(rankIdh)}`), `puesto N°<span class="data-manual">${rankEscapado}</span>`);
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



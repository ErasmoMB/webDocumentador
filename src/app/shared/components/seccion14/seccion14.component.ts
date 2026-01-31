import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenericImageComponent } from '../generic-image/generic-image.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { debugLog } from 'src/app/shared/utils/debug';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';

@Component({
    imports: [
        CommonModule,
        FormsModule,
        CoreSharedModule
    ],
    selector: 'app-seccion14',
    templateUrl: './seccion14.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion14Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'parrafoSeccion14_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla', 'textoNivelEducativo', 'textoTasaAnalfabetismo'];
  
  override readonly PHOTO_PREFIX = 'fotografiaEducacionIndicadores';
  override fotografiasCache: FotoItem[] = [];
  override fotografiasFormMulti: FotoItem[] = [];
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();

  get nivelEducativoConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyNivelEducativo(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [
        { categoria: 'Sin nivel o Inicial', casos: 0, porcentaje: '0%' },
        { categoria: 'Primaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Secundaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior no Universitaria', casos: 0, porcentaje: '0%' },
        { categoria: 'Superior Universitaria', casos: 0, porcentaje: '0%' }
      ],
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get tasaAnalfabetismoConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTasaAnalfabetismo(),
      totalKey: 'indicador',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [
        { indicador: 'Sabe leer y escribir', casos: 0, porcentaje: '0%' },
        { indicador: 'No sabe leer ni escribir', casos: 0, porcentaje: '0%' }
      ],
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer,
    protected override autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
  }

  override getSectionKey(): string {
    return 'seccion14_aisd';
  }

  protected override getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      // Limpiar '0' al inicio de cada CCPP
      const ccppLimpios = ccppDesdeGrupo.map((cpp: string) => {
        const cleaned = cpp.toString().replace(/^0+/, '') || '0';
        return cleaned;
      });
      return ccppLimpios;
    }
    return null;
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablasConPrefijo = ['nivelEducativoTabla', 'tasaAnalfabetismoTabla'];
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (tablasConPrefijo.includes(campo)) {
        const campoConPrefijo = prefijo ? `${campo}${prefijo}` : campo;
        valorActual = (datosActuales as any)[campoConPrefijo] || (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campoConPrefijo] || this.datosAnteriores[campo] || null;
      } else {
        valorActual = (datosActuales as any)[campo] || null;
        valorAnterior = this.datosAnteriores[campo] || null;
      }
      
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        if (tablasConPrefijo.includes(campo) && prefijo) {
          this.datosAnteriores[`${campo}${prefijo}`] = JSON.parse(JSON.stringify(valorActual));
        } else {
          this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
  }

  getTablaNivelEducativo(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'nivelEducativoTabla', this.seccionId);
    return pref || this.datos.nivelEducativoTabla || [];
  }

  getTablaKeyTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
  }

  getTablaTasaAnalfabetismo(): any[] {
    const pref = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tasaAnalfabetismoTabla', this.seccionId);
    return pref || this.datos.tasaAnalfabetismoTabla || [];
  }

  override cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  override onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  getPorcentajePrimaria(): string {
    const tabla = this.getTablaNivelEducativo();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('primaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSecundaria(): string {
    const tabla = this.getTablaNivelEducativo();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('secundaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getPorcentajeSuperiorNoUniversitaria(): string {
    const tabla = this.getTablaNivelEducativo();
    const item = tabla.find((i: any) => i.categoria?.toLowerCase().includes('superior no universitaria'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getTasaAnalfabetismo(): string {
    const tabla = this.getTablaTasaAnalfabetismo();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.porcentaje ? String(item.porcentaje) : '____';
  }

  getCasosAnalfabetismo(): string {
    const tabla = this.getTablaTasaAnalfabetismo();
    const item = tabla.find((i: any) => i.indicador?.toLowerCase().includes('no sabe'));
    return item?.casos ? String(item.casos) : '____';
  }

  getFotografiasEducacionIndicadoresVista(): FotoItem[] {
    if (this.fotografiasCache && this.fotografiasCache.length > 0) {
      return [...this.fotografiasCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasCache;
  }

  protected override actualizarFotografiasFormMulti(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    this.eliminarFilasTotal();
    this.calcularPorcentajesNivelEducativo();
    this.calcularPorcentajesTasaAnalfabetismo();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateAdapter.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    const tablaKeyNivel = this.getTablaKeyNivelEducativo();
    const tablaNivel = this.getTablaNivelEducativo();
    
    if (tablaNivel && Array.isArray(tablaNivel)) {
      const longitudOriginal = tablaNivel.length;
      const datosFiltrados = tablaNivel.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.onFieldChange(tablaKeyNivel, datosFiltrados, { refresh: false });
      }
    }

    const tablaKeyTasa = this.getTablaKeyTasaAnalfabetismo();
    const tablaTasa = this.getTablaTasaAnalfabetismo();
    
    if (tablaTasa && Array.isArray(tablaTasa)) {
      const longitudOriginal = tablaTasa.length;
      const datosFiltrados = tablaTasa.filter((item: any) => {
        const indicador = item.indicador?.toString().toLowerCase() || '';
        return !indicador.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.onFieldChange(tablaKeyTasa, datosFiltrados, { refresh: false });
      }
    }
  }

  calcularPorcentajesNivelEducativo(): void {
    const tablaKey = this.getTablaKeyNivelEducativo();
    const tabla = this.getTablaNivelEducativo();
    if (!tabla || tabla.length === 0) return;
    
    const total = tabla.reduce((sum: number, item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      if (categoria.includes('total')) return sum;
      const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total > 0) {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        }
      });
    } else {
      tabla.forEach((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        if (!categoria.includes('total')) {
          item.porcentaje = '0,00 %';
        }
      });
    }
    
    this.datos[tablaKey] = tabla;
    this.onFieldChange(tablaKey, tabla, { refresh: false });
  }

  calcularPorcentajesTasaAnalfabetismo(): void {
    const tablaKey = this.getTablaKeyTasaAnalfabetismo();
    const tabla = this.getTablaTasaAnalfabetismo();
    if (!tabla || tabla.length === 0) return;
    
    const total = tabla.reduce((sum: number, item: any) => {
      const indicador = item.indicador?.toString().toLowerCase() || '';
      if (indicador.includes('total')) return sum;
      const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total > 0) {
      tabla.forEach((item: any) => {
        const indicador = item.indicador?.toString().toLowerCase() || '';
        if (!indicador.includes('total')) {
          const casos = typeof item.casos === 'number' ? item.casos : parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2).replace('.', ',');
          item.porcentaje = porcentaje + ' %';
        }
      });
    } else {
      tabla.forEach((item: any) => {
        const indicador = item.indicador?.toString().toLowerCase() || '';
        if (!indicador.includes('total')) {
          item.porcentaje = '0,00 %';
        }
      });
    }
    
    this.datos[tablaKey] = tabla;
    this.onFieldChange(tablaKey, tabla, { refresh: false });
  }

  onNivelEducativoFieldChange(rowIndex: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyNivelEducativo();
    const tabla = this.getTablaNivelEducativo();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      
      if (field === 'casos') {
        this.calcularPorcentajesNivelEducativo();
      } else {
        this.onFieldChange(tablaKey, tabla, { refresh: false });
      }
      
      this.datos[tablaKey] = [...tabla];
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onNivelEducativoTableUpdated(): void {
    const tablaKey = this.getTablaKeyNivelEducativo();
    const tabla = this.getTablaNivelEducativo();
    this.calcularPorcentajesNivelEducativo();
    this.datos[tablaKey] = [...tabla];
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTasaAnalfabetismoFieldChange(rowIndex: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyTasaAnalfabetismo();
    const tabla = this.getTablaTasaAnalfabetismo();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      
      if (field === 'casos') {
        this.calcularPorcentajesTasaAnalfabetismo();
      } else {
        this.onFieldChange(tablaKey, tabla, { refresh: false });
      }
      
      this.datos[tablaKey] = [...tabla];
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onTasaAnalfabetismoTableUpdated(): void {
    const tablaKey = this.getTablaKeyTasaAnalfabetismo();
    const tabla = this.getTablaTasaAnalfabetismo();
    this.calcularPorcentajesTasaAnalfabetismo();
    this.datos[tablaKey] = [...tabla];
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  getNivelEducativoSinTotal(): any[] {
    const tabla = this.getTablaNivelEducativo();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalNivelEducativo(): string {
    const filtered = this.getNivelEducativoSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  /**
   * Obtiene la tabla Nivel Educativo con porcentajes calculados dinámicamente
   * Cuadro 3.28
   */
  getNivelEducativoConPorcentajes(): any[] {
    const tabla = this.getTablaNivelEducativo();
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.28');
  }

  getTasaAnalfabetismoSinTotal(): any[] {
    const tabla = this.getTablaTasaAnalfabetismo();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const indicador = item.indicador?.toString().toLowerCase() || '';
      return !indicador.includes('total');
    });
  }

  getTotalTasaAnalfabetismo(): string {
    const filtered = this.getTasaAnalfabetismoSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  /**
   * Obtiene la tabla Tasa de Analfabetismo con porcentajes calculados dinámicamente
   * Cuadro 3.29
   * Nota: Esta tabla usa 'indicador' en lugar de 'categoria' como campo de identificación
   */
  getTasaAnalfabetismoConPorcentajes(): any[] {
    const tabla = this.getTablaTasaAnalfabetismo();
    return TablePercentageHelper.calcularPorcentajesAnalfabetismo(tabla, '3.29');
  }
  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  getFieldIdIndicadoresEducacionIntro(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `parrafoSeccion14_indicadores_educacion_intro${prefijo}` : 'parrafoSeccion14_indicadores_educacion_intro';
  }

  obtenerTextoSeccion14IndicadoresEducacionIntro(): string {
    const fieldId = this.getFieldIdIndicadoresEducacionIntro();
    const textoPersonalizado = this.datos[fieldId] || this.datos.parrafoSeccion14_indicadores_educacion_intro;
    
    const textoPorDefecto = `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado;
    }
    
    return textoPorDefecto;
  }

  obtenerTextoSeccion14IndicadoresEducacionIntroConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion14IndicadoresEducacionIntro();
    let html = this.escapeHtml(texto);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getFieldIdNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoNivelEducativo${prefijo}` : 'textoNivelEducativo';
  }

  obtenerTextoNivelEducativo(): string {
    const fieldId = this.getFieldIdNivelEducativo();
    const textoPersonalizado = this.datos[fieldId] || this.datos.textoNivelEducativo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePrimaria = this.getPorcentajePrimaria() || '____';
    const porcentajeSecundaria = this.getPorcentajeSecundaria() || '____';
    const porcentajeSuperiorNoUniversitaria = this.getPorcentajeSuperiorNoUniversitaria() || '____';
    
    const textoPorDefecto = `En la CC ${grupoAISD}, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la secundaria, pues representan el ${porcentajePrimaria}. En segundo lugar, se hallan aquellos que cuentan con primaria (${porcentajeSecundaria}). Por otro lado, la categoría minoritaria corresponde a aquellos sin nivel educativo o que solo alcanzaron el inicial, con un ${porcentajeSuperiorNoUniversitaria}.`;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/el\s*___\s*\./g, `el ${porcentajePrimaria}.`)
        .replace(/\(\s*___\s*\)/g, `(${porcentajeSecundaria})`)
        .replace(/un\s*___\s*\./g, `un ${porcentajeSuperiorNoUniversitaria}.`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoNivelEducativoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoNivelEducativo();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajePrimaria = this.getPorcentajePrimaria() || '____';
    const porcentajeSecundaria = this.getPorcentajeSecundaria() || '____';
    const porcentajeSuperiorNoUniversitaria = this.getPorcentajeSuperiorNoUniversitaria() || '____';

    let html = this.escapeHtml(texto);
    if (grupoAISD !== '____') {
      html = html.replace(
        this.obtenerRegExp(this.escapeRegex(grupoAISD)), 
        `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
      );
    }
    if (porcentajePrimaria !== '____') {
      html = html.replace(
        this.obtenerRegExp(this.escapeRegex(porcentajePrimaria)), 
        `<span class="data-calculated">${this.escapeHtml(porcentajePrimaria)}</span>`
      );
    }
    if (porcentajeSecundaria !== '____') {
      html = html.replace(
        this.obtenerRegExp(this.escapeRegex(porcentajeSecundaria)), 
        `<span class="data-calculated">${this.escapeHtml(porcentajeSecundaria)}</span>`
      );
    }
    if (porcentajeSuperiorNoUniversitaria !== '____') {
      html = html.replace(
        this.obtenerRegExp(this.escapeRegex(porcentajeSuperiorNoUniversitaria)), 
        `<span class="data-calculated">${this.escapeHtml(porcentajeSuperiorNoUniversitaria)}</span>`
      );
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getFieldIdTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `textoTasaAnalfabetismo${prefijo}` : 'textoTasaAnalfabetismo';
  }

  obtenerTextoTasaAnalfabetismo(): string {
    const fieldId = this.getFieldIdTasaAnalfabetismo();
    const textoPersonalizado = this.datos[fieldId] || this.datos.textoTasaAnalfabetismo;
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const casosAnalfabetismo = this.getCasosAnalfabetismo() || '____';
    const tasaAnalfabetismo = this.getTasaAnalfabetismo() || '____';
    
    const textoPorDefecto = `En la CC ${grupoAISD}, se observa que la cantidad de personas de 15 años a más que no saben leer ni escribir llegan a la cantidad de ${casosAnalfabetismo}. Esto representa una tasa de analfabetismo del ${tasaAnalfabetismo} en la comunidad.`;
    
    if (textoPersonalizado && textoPersonalizado.trim() !== '' && textoPersonalizado !== '____') {
      return textoPersonalizado
        .replace(/CC\s*___/g, `CC ${grupoAISD}`)
        .replace(/a la cantidad de\s*___/g, `a la cantidad de ${casosAnalfabetismo}`)
        .replace(/del\s*___/g, `del ${tasaAnalfabetismo}`);
    }
    
    return textoPorDefecto;
  }

  obtenerTextoTasaAnalfabetismoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoTasaAnalfabetismo();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const casosAnalfabetismo = this.getCasosAnalfabetismo() || '____';
    const tasaAnalfabetismo = this.getTasaAnalfabetismo() || '____';

    let html = this.escapeHtml(texto);
    if (grupoAISD !== '____') {
      html = html.replace(
        this.obtenerRegExp(this.escapeRegex(grupoAISD)), 
        `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`
      );
    }
    if (casosAnalfabetismo !== '____') {
      const regexPattern = `(a la cantidad de\\s+)${this.escapeRegex(casosAnalfabetismo)}`;
      const regex = this.obtenerRegExp(regexPattern);
      html = html.replace(
        regex, 
        `$1<span class="data-manual">${this.escapeHtml(casosAnalfabetismo)}</span>`
      );
    }
    if (tasaAnalfabetismo !== '____') {
      html = html.replace(
        this.obtenerRegExp(`(del\\s+)${this.escapeRegex(tasaAnalfabetismo)}`), 
        `$1<span class="data-calculated">${this.escapeHtml(tasaAnalfabetismo)}</span>`
      );
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
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

  private escapeRegex(str: string): string {
    const strValue = String(str || '');
    return strValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

}



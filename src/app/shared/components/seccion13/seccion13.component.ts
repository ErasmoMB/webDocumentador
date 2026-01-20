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
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { FotoItem } from '../image-upload/image-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion13',
  templateUrl: './seccion13.component.html',
  styleUrls: ['./seccion13.component.css']
})
export class Seccion13Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion13_natalidad_mortalidad_completo', 'parrafoSeccion13_morbilidad_completo', 'natalidadMortalidadTabla', 'morbilidadTabla', 'porcentajeSIS', 'porcentajeESSALUD', 'porcentajeSinSeguro', 'afiliacionSaludTabla', 'textoAfiliacionSalud'];
  
  override readonly PHOTO_PREFIX = 'fotografiaSaludIndicadores';
  override fotografiasCache: FotoItem[] = [];
  override fotografiasFormMulti: FotoItem[] = [];
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();

  get natalidadMortalidadConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyNatalidadMortalidad(),
      totalKey: 'anio',
      campoTotal: 'natalidad',
      campoPorcentaje: 'mortalidad',
      estructuraInicial: [
        { anio: '2023', natalidad: 0, mortalidad: 0 },
        { anio: '2024 (hasta 13/11)', natalidad: 0, mortalidad: 0 }
      ]
    };
  }

  get morbilidadConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyMorbilidad(),
      totalKey: 'grupo',
      campoTotal: 'casos',
      campoPorcentaje: 'casos',
      estructuraInicial: [
        { grupo: 'Infecciones agudas de las vías respiratorias superiores', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 },
        { grupo: 'Obesidad y otros de hiperalimentación', rango0_11: 0, rango12_17: 0, rango18_29: 0, rango30_59: 0, rango60: 0, casos: 0 }
      ]
    };
  }

  get afiliacionSaludConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyAfiliacionSalud(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      estructuraInicial: [
        { categoria: 'SIS', casos: 0, porcentaje: 0 },
        { categoria: 'ESSALUD', casos: 0, porcentaje: 0 },
        { categoria: 'Sin seguro', casos: 0, porcentaje: 0 }
      ],
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    protected override autoLoader: AutoBackendDataLoaderService,
    private tableService: TableManagementService,
    private stateService: StateService,
    private groupConfig: GroupConfigService,
    private sanitizer: DomSanitizer
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected getSectionKey(): string {
    return 'seccion13_aisd';
  }

  protected getLoadParameters(): string[] | null {
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
    const datosActuales = this.formularioService.obtenerDatos();
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablasConPrefijo = ['natalidadMortalidadTabla', 'morbilidadTabla', 'afiliacionSaludTabla'];
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (tablasConPrefijo.includes(campo)) {
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
        if (tablasConPrefijo.includes(campo)) {
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

  private getTablaNatalidadMortalidad(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'natalidadMortalidadTabla', this.seccionId) || this.datos.natalidadMortalidadTabla || [];
    return tabla;
  }

  getTablaKeyNatalidadMortalidad(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `natalidadMortalidadTabla${prefijo}` : 'natalidadMortalidadTabla';
  }

  getNatalidadMortalidadTabla(): any[] {
    return this.getTablaNatalidadMortalidad();
  }

  private getTablaMorbilidad(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'morbilidadTabla', this.seccionId) || this.datos.morbilidadTabla || this.datos.morbiliadTabla || [];
    return tabla;
  }

  getTablaKeyMorbilidad(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `morbilidadTabla${prefijo}` : 'morbilidadTabla';
  }

  getMorbilidadTabla(): any[] {
    return this.getTablaMorbilidad();
  }

  private getTablaAfiliacionSalud(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'afiliacionSaludTabla', this.seccionId) || this.datos.afiliacionSaludTabla || [];
    return tabla;
  }

  getTablaKeyAfiliacionSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
  }

  getAfiliacionSaludTabla(): any[] {
    return this.getTablaAfiliacionSalud();
  }

  getFotografiasSaludIndicadoresVista(): FotoItem[] {
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

  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    const prefijo = PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);

    for (const [fieldName, data] of Object.entries(loadedData)) {
      if (data === null || data === undefined) continue;
      const fieldKey = prefijo ? `${fieldName}${prefijo}` : fieldName;

      const actual = this.datos[fieldKey];
      const existeDato = actual !== undefined && actual !== null;
      const sonArrays = Array.isArray(data) && Array.isArray(actual);

      // Reemplaza si no existe, o si el contenido cambió (comparar JSON)
      const debeActualizar = !existeDato ||
        (sonArrays && JSON.stringify(data) !== JSON.stringify(actual)) ||
        (!sonArrays && JSON.stringify(data) !== JSON.stringify(actual));

      if (debeActualizar) {
        this.formularioService.actualizarDato(fieldKey as any, data);
        this.datos[fieldKey] = data;

        // Calcular porcentajes para tabla de afiliación de salud cuando se carga
        if (fieldName === 'afiliacionSaludTabla' && Array.isArray(data) && data.length > 0) {
          // Esperar a que los datos se actualicen antes de calcular
          Promise.resolve().then(() => {
            this.calcularPorcentajesAfiliacionSalud();
          });
        }
      }
    }

    this.actualizarDatos();
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasFormMulti();
    this.cargarFotografias();
    this.eliminarFilasTotal();
    this.calcularPorcentajesAfiliacionSalud();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private eliminarFilasTotal(): void {
    const tablaKey = this.getTablaKeyAfiliacionSalud();
    const tabla = this.getTablaAfiliacionSalud();
    
    if (tabla && Array.isArray(tabla)) {
      const longitudOriginal = tabla.length;
      const datosFiltrados = tabla.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total') && !categoria.includes('referencial');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKey, datosFiltrados);
      }
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
    this.fotografiasCache = fotos && fotos.length > 0 ? [...fotos] : [];
    this.cdRef.markForCheck();
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion13NatalidadMortalidadCompleto(): string {
    if (this.datos.parrafoSeccion13_natalidad_mortalidad_completo) {
      return this.datos.parrafoSeccion13_natalidad_mortalidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    return `El presente ítem proporciona una visión crucial sobre las dinámicas demográficas, reflejando las tendencias en el crecimiento poblacional. De los datos obtenidos en el Puesto de Salud ${grupoAISD} durante el trabajo de campo, se obtiene que en el año 2023 solo ocurrió un nacimiento, mientras que para el 2024 (hasta el 13 de noviembre) se dieron un total de tres (03) nacimientos.\n\nRespecto a la mortalidad, según la misma fuente, se obtiene que en el año 2023 se registró un fallecimiento, por suicidio; mientras que para el 2024 no ocurrieron decesos dentro de la CC ${grupoAISD}, hasta la fecha indicada.`;
  }

  obtenerTextoSeccion13NatalidadMortalidadCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion13NatalidadMortalidadCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoSeccion13MorbilidadCompleto(): string {
    if (this.datos.parrafoSeccion13_morbilidad_completo) {
      return this.datos.parrafoSeccion13_morbilidad_completo;
    }
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    return `De acuerdo con las entrevistas aplicadas durante el trabajo de campo, las autoridades locales y los informantes calificados reportaron que las enfermedades más recurrentes dentro de la CC ${grupoAISD} son las infecciones respiratorias agudas (IRAS) y las enfermedades diarreicas agudas (EDAS). Asimismo, se mencionan casos de hipertensión y diabetes, que son más frecuentes en adultos mayores.\n\nEn cuanto a los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca a los poblados de la CC ${grupoAISD}) para el año 2023, se destaca que las condiciones más frecuentes son las infecciones agudas de las vías respiratorias superiores (1012 casos) y la obesidad y otros de hiperalimentación (191 casos). Para la primera, se reportó un mayor número de casos en el bloque etario de 0-11 años, mientras que para la segunda, el rango de 30-59 años mostró más casos. A continuación, se presenta el cuadro con la cantidad de casos por grupo de morbilidad y bloques etarios dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoSeccion13MorbilidadCompletoConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion13MorbilidadCompleto();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const distrito = this.datos.distritoSeleccionado || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(distrito)), `<span class="data-section">${this.escapeHtml(distrito)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoAfiliacionSalud(): string {
    if (this.datos.textoAfiliacionSalud && this.datos.textoAfiliacionSalud !== '____') {
      return this.datos.textoAfiliacionSalud;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeSIS = this.getPorcentajeSIS() || '____';
    const porcentajeESSALUD = this.getPorcentajeESSALUD() || '____';
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro() || '____';
    
    return `Dentro de la CC ${grupoAISD}, la mayoría de habitantes se encuentran afiliados a algún tipo de seguro de salud. Es así que el Seguro Integral de Salud (SIS) se halla en primer lugar, al abarcar el ${porcentajeSIS} % de la población. A ello le sigue ESSALUD, con un ${porcentajeESSALUD} %. Por otro lado, el ${porcentajeSinSeguro} % de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  obtenerTextoAfiliacionSaludConResaltado(): SafeHtml {
    let texto = this.obtenerTextoAfiliacionSalud();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const tabla = this.getAfiliacionSaludSinTotal();
    
    // Obtener porcentajes
    const porcentajeSIS = this.getPorcentajeSIS();
    const porcentajeESSALUD = this.getPorcentajeESSALUD();
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro();
    
    // Primero, llenar todos los ____ con los valores correspondientes
    // Buscar patrones como "____ %" o simplemente "____"
    let textoConValores = texto;
    
    // Reemplazar "el ____ %" con el porcentaje sin seguro
    if (porcentajeSinSeguro !== '____') {
      textoConValores = textoConValores.replace(
        /el ____ %/g,
        `el ${porcentajeSinSeguro} %`
      );
    }
    
    // Ahora aplicar resaltados: nombre de comunidad
    let textoConResaltado = textoConValores
      .replace(new RegExp(this.escapeRegex(grupoAISD), 'g'), 
        `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    // Aplicar resaltados a los porcentajes (verde)
    if (porcentajeSIS !== '____') {
      textoConResaltado = textoConResaltado.replace(
        this.obtenerRegExp(`${this.escapeRegex(porcentajeSIS)}\\s*%`),
        `<span class="data-calculated">${this.escapeHtml(porcentajeSIS)} %</span>`
      );
    }
    if (porcentajeESSALUD !== '____') {
      textoConResaltado = textoConResaltado.replace(
        new RegExp(`${this.escapeRegex(porcentajeESSALUD)}\\s*%`, 'g'),
        `<span class="data-calculated">${this.escapeHtml(porcentajeESSALUD)} %</span>`
      );
    }
    if (porcentajeSinSeguro !== '____') {
      textoConResaltado = textoConResaltado.replace(
        this.obtenerRegExp(`${this.escapeRegex(porcentajeSinSeguro)}\\s*%`),
        `<span class="data-calculated">${this.escapeHtml(porcentajeSinSeguro)} %</span>`
      );
    }
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  getPorcentajeSIS(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemSIS = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('sis'));
    return itemSIS ? (itemSIS.porcentaje ? String(itemSIS.porcentaje) : '____') : '____';
  }

  getPorcentajeESSALUD(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemESSALUD = tabla.find((item: any) => item.categoria && item.categoria.toString().toLowerCase().includes('essalud'));
    return itemESSALUD ? (itemESSALUD.porcentaje ? String(itemESSALUD.porcentaje) : '____') : '____';
  }

  getPorcentajeSinSeguro(): string {
    const tabla = this.getAfiliacionSaludSinTotal();
    const itemSinSeguro = tabla.find((item: any) => item.categoria && (item.categoria.toString().toLowerCase().includes('sin seguro') || item.categoria.toString().toLowerCase().includes('sin seg') || item.categoria.toString().toLowerCase().includes('ningún')));
    return itemSinSeguro ? (itemSinSeguro.porcentaje ? String(itemSinSeguro.porcentaje) : '____') : '____';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

  onMorbilidadFieldChange(rowIndex: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyMorbilidad();
    const tabla = this.getTablaMorbilidad();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      if (field !== 'casos' && field !== 'grupo') {
        this.calcularTotalesMorbilidad();
      }
      this.formularioService.actualizarDato(tablaKey, tabla);
    }
  }

  onMorbilidadTableUpdated() {
    this.calcularTotalesMorbilidad();
    const tablaKey = this.getTablaKeyMorbilidad();
    const tabla = this.getTablaMorbilidad();
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.cdRef.detectChanges();
  }

  calcularTotalesMorbilidad() {
    const tabla = this.getTablaMorbilidad();
    if (!tabla || tabla.length === 0) {
      return;
    }
    tabla.forEach((item: any) => {
      const rango0_11 = parseFloat(item.rango0_11) || 0;
      const rango12_17 = parseFloat(item.rango12_17) || 0;
      const rango18_29 = parseFloat(item.rango18_29) || 0;
      const rango30_59 = parseFloat(item.rango30_59) || 0;
      const rango60 = parseFloat(item.rango60) || 0;
      const total = rango0_11 + rango12_17 + rango18_29 + rango30_59 + rango60;
      item.casos = total;
    });
    const tablaKey = this.getTablaKeyMorbilidad();
    this.formularioService.actualizarDato(tablaKey, tabla);
  }

  getAfiliacionSaludSinTotal(): any[] {
    const tabla = this.getTablaAfiliacionSalud();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total') && !categoria.includes('referencial');
    });
  }

  getTotalAfiliacionSalud(): string {
    const filtered = this.getAfiliacionSaludSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getPorcentajeNumerico(porcentaje: any): number {
    if (typeof porcentaje === 'number') {
      return porcentaje;
    }
    if (typeof porcentaje === 'string') {
      return parseFloat(porcentaje.replace('%', '').trim().replace(',', '.')) || 0;
    }
    return 0;
  }

  getMorbilidadSinTotal(): any[] {
    const tabla = this.getTablaMorbilidad();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const grupo = item.grupo?.toString().toLowerCase() || '';
      return !grupo.includes('total');
    });
  }

  getTotalMorbilidad(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango0_11(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango0_11 === 'number' ? item.rango0_11 : parseInt(item.rango0_11) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango12_17(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango12_17 === 'number' ? item.rango12_17 : parseInt(item.rango12_17) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango18_29(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango18_29 === 'number' ? item.rango18_29 : parseInt(item.rango18_29) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango30_59(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango30_59 === 'number' ? item.rango30_59 : parseInt(item.rango30_59) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  getTotalMorbilidadRango60(): string {
    const filtered = this.getMorbilidadSinTotal();
    const total = filtered.reduce((sum: number, item: any) => {
      const rango = typeof item.rango60 === 'number' ? item.rango60 : parseInt(item.rango60) || 0;
      return sum + rango;
    }, 0);
    return total.toString();
  }

  onNatalidadMortalidadTableUpdated(): void {
    const tablaKey = this.getTablaKeyNatalidadMortalidad();
    const tabla = this.getTablaNatalidadMortalidad();
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.cdRef.detectChanges();
  }

  onAfiliacionSaludFieldChange(rowIndex: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyAfiliacionSalud();
    const tabla = this.getTablaAfiliacionSalud();
    if (tabla && tabla[rowIndex]) {
      tabla[rowIndex][field] = value;
      
      if (field === 'casos') {
        this.calcularPorcentajesAfiliacionSalud();
      }
      
      this.datos[tablaKey] = [...tabla];
      this.formularioService.actualizarDato(tablaKey, tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onAfiliacionSaludTableUpdated(): void {
    const tablaKey = this.getTablaKeyAfiliacionSalud();
    const tabla = this.getTablaAfiliacionSalud();
    this.calcularPorcentajesAfiliacionSalud();
    this.datos[tablaKey] = [...tabla];
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  private calcularPorcentajesAfiliacionSalud(): void {
    const tabla = this.getTablaAfiliacionSalud();
    if (!tabla || tabla.length === 0) return;

    const datosSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total') && !categoria.includes('referencial');
    });

    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);

    if (total > 0) {
      datosSinTotal.forEach((item: any) => {
        const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
        const porcentajeNumerico = (casos / total) * 100;
        item.porcentaje = porcentajeNumerico;
      });
      
      const tablaKey = this.getTablaKeyAfiliacionSalud();
      this.formularioService.actualizarDato(tablaKey, tabla);
    }
  }
}



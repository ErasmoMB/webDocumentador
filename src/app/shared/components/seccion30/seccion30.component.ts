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
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { EducacionService } from 'src/app/core/services/educacion.service';

@Component({
  selector: 'app-seccion30',
  templateUrl: './seccion30.component.html',
  styleUrls: ['./seccion30.component.css']
})
export class Seccion30Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.9';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  private cargandoDatos = false;
  private datosYaCargados = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'parrafoSeccion30_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla', 'textoNivelEducativo', 'textoTasaAnalfabetismo'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';
  
  fotografiasInstitucionalidadCache: any[] = [];

  nivelEducativoConfig: TableConfig = {
    tablaKey: 'nivelEducativoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tasaAnalfabetismoConfig: TableConfig = {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: 'indicador',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
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
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private educacionService: EducacionService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef, autoLoader);
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasCache();
    
    if (this.modoFormulario) {
      if (this.seccionId) {
        setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0);
      }
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      setTimeout(() => {
        this.cargarDatosEducacion();
      }, 100);
    }
  }

  override ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion30_aisi';
  }

  private cargarDatosEducacion(): void {
    console.log('[S30] cargarDatosEducacion llamado', {
      cargandoDatos: this.cargandoDatos,
      datosYaCargados: this.datosYaCargados,
      stack: new Error().stack
    });

    if (this.cargandoDatos || this.datosYaCargados) {
      console.log('[S30] Bloqueado: ya cargando o ya cargado');
      return;
    }

    const codigos = this.groupConfig.getAISICCPPActivos();
    if (!codigos || codigos.length === 0) {
      console.log('[S30] Bloqueado: no hay códigos');
      return;
    }

    console.log('[S30] Iniciando carga de datos educación');
    this.cargandoDatos = true;
    this.datosYaCargados = true;

    this.educacionService.obtenerEducacionPorCodigos(codigos).subscribe(
      (response: any) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          const nivelEducativoData = response.data.map((item: any) => ({
            categoria: item.nivel_educativo || '',
            casos: Number(item.casos) || 0,
            porcentaje: '0,00 %'
          }));

          this.datos.nivelEducativoTabla = nivelEducativoData;
          this.tableService.calcularPorcentajes(this.datos, this.nivelEducativoConfig);
          this.cdRef.detectChanges();
        }
        this.cargandoDatos = false;
      },
      (error: any) => {
        console.error('[S30] Error cargando datos educación:', error);
        this.cargandoDatos = false;
      }
    );

    this.educacionService.obtenerAnalfabetismoPorCodigos(codigos).subscribe(
      (response: any) => {
        if (response.success) {
          this.datos.tasaAnalfabetismo = response.tasa_analfabetismo || 0;
          this.datos.totalPoblacion15Mas = response.total_poblacion_15_mas || 0;
          this.cdRef.detectChanges();
        }
      },
      (error: any) => {
        console.error('[S30] Error cargando datos analfabetismo:', error);
      }
    );
  }


  /**
   * Calcula el nivel educativo mayoritario
   */
  getNivelMayoritario(): any {
    if (!this.datos.nivelEducativoTabla || this.datos.nivelEducativoTabla.length === 0) {
      return null;
    }
    
    return this.datos.nivelEducativoTabla.reduce((prev: any, current: any) => 
      (prev && prev.casos > current.casos) ? prev : current
    );
  }

  /**
   * Calcula el total de casos en la tabla de nivel educativo
   */
  calcularTotalNivelEducativo(): number {
    if (!this.datos.nivelEducativoTabla || this.datos.nivelEducativoTabla.length === 0) {
      return 0;
    }
    
    return this.datos.nivelEducativoTabla.reduce(
      (sum: number, item: any) => sum + (item.casos || 0),
      0
    );
  }

  protected getLoadParameters(): string[] | null {
    return null;
  }

  protected override loadAutoSectionData(forceRefresh: boolean = false): void {
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.actualizarFotografiasCache();
  }

  protected override detectarCambios(): boolean {
    if (this.cargandoDatos) {
      return false;
    }

    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (!this.compararValores(valorActual, valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = this.clonarValor(valorActual);
      }
    }
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos || hayCambios) {
      console.log('[S30] detectarCambios detectó cambios pero NO cargaremos datos automáticamente mientras cargan datos');
      return true;
    }
    
    return false;
  }

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getTablaKeyNivelEducativo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `nivelEducativoTabla${prefijo}` : 'nivelEducativoTabla';
  }

  getTablaKeyTasaAnalfabetismo(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tasaAnalfabetismoTabla${prefijo}` : 'tasaAnalfabetismoTabla';
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  // Métodos para nivelEducativoTabla
  getNivelEducativoSinTotal() {
    if (!this.datos.nivelEducativoTabla || !Array.isArray(this.datos.nivelEducativoTabla)) {
      return [];
    }
    return this.datos.nivelEducativoTabla.filter((item: any) => 
      !item.categoria || item.categoria.toString().toLowerCase() !== 'total'
    );
  }

  getTotalNivelEducativo() {
    const sinTotal = this.getNivelEducativoSinTotal();
    const totalCasos = sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.casos) || 0), 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: '100,00 %'
    };
  }

  // Métodos para tasaAnalfabetismoTabla
  getTasaAnalfabetismoSinTotal() {
    if (!this.datos.tasaAnalfabetismoTabla || !Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      return [];
    }
    return this.datos.tasaAnalfabetismoTabla.filter((item: any) => 
      !item.indicador || item.indicador.toString().toLowerCase() !== 'total'
    );
  }

  getTotalTasaAnalfabetismo() {
    const sinTotal = this.getTasaAnalfabetismoSinTotal();
    const totalCasos = sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.casos) || 0), 0);
    return {
      indicador: 'Total',
      casos: totalCasos,
      porcentaje: '100,00 %'
    };
  }

  eliminarFilasTotal() {
    if (this.datos.nivelEducativoTabla && Array.isArray(this.datos.nivelEducativoTabla)) {
      this.datos.nivelEducativoTabla = this.datos.nivelEducativoTabla.filter((item: any) => 
        !item.categoria || item.categoria.toString().toLowerCase() !== 'total'
      );
    }
    if (this.datos.tasaAnalfabetismoTabla && Array.isArray(this.datos.tasaAnalfabetismoTabla)) {
      this.datos.tasaAnalfabetismoTabla = this.datos.tasaAnalfabetismoTabla.filter((item: any) => 
        !item.indicador || item.indicador.toString().toLowerCase() !== 'total'
      );
    }
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getPorcentajeSecundaria(): string {
    return this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'secundaria',
      'porcentaje'
    );
  }

  getPorcentajePrimaria(): string {
    return this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'primaria',
      'porcentaje'
    );
  }

  getPorcentajeSinNivel(): string {
    const sinNivel = this.tableService.obtenerValorDeTablaPorCategoria(
      this.datos,
      'nivelEducativoTabla',
      'sin nivel',
      'porcentaje'
    );
    if (sinNivel === '____') {
      return this.tableService.obtenerValorDeTablaPorCategoria(
        this.datos,
        'nivelEducativoTabla',
        'inicial',
        'porcentaje'
      );
    }
    return sinNivel;
  }

  getCasosAnalfabetismo(): string {
    return this.tableService.obtenerValorDeTablaPorIndicador(
      this.datos,
      'tasaAnalfabetismoTabla',
      'no sabe',
      'casos'
    );
  }

  getPorcentajeAnalfabetismo(): string {
    return this.tableService.obtenerValorDeTablaPorIndicador(
      this.datos,
      'tasaAnalfabetismoTabla',
      'no sabe',
      'porcentaje'
    );
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  override getFotografiasVista(): FotoItem[] {
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

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
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
  }

  inicializarNivelEducativoTabla() {
    this.tableService.inicializarTabla(this.datos, this.nivelEducativoConfig);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.cdRef.detectChanges();
  }

  agregarNivelEducativoTabla() {
    this.tableService.agregarFila(this.datos, this.nivelEducativoConfig);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNivelEducativoTabla(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.nivelEducativoConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarNivelEducativoTabla(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.nivelEducativoConfig, index, field, value);
    this.formularioService.actualizarDato('nivelEducativoTabla', this.datos['nivelEducativoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesNivelEducativoTabla() {
    this.tableService.calcularPorcentajes(this.datos, this.nivelEducativoConfig);
  }

  inicializarTasaAnalfabetismoTabla() {
    this.tableService.inicializarTabla(this.datos, this.tasaAnalfabetismoConfig);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.cdRef.detectChanges();
  }

  agregarTasaAnalfabetismoTabla() {
    this.tableService.agregarFila(this.datos, this.tasaAnalfabetismoConfig);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTasaAnalfabetismoTabla(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.tasaAnalfabetismoConfig, index);
    if (deleted) {
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarTasaAnalfabetismoTabla(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.tasaAnalfabetismoConfig, index, field, value);
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', this.datos['tasaAnalfabetismoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesTasaAnalfabetismoTabla() {
    this.tableService.calcularPorcentajes(this.datos, this.tasaAnalfabetismoConfig);
  }

  obtenerTextoNivelEducativo(): string {
    if (this.datos.textoNivelEducativo && this.datos.textoNivelEducativo !== '____') {
      return this.datos.textoNivelEducativo;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajeSecundaria = this.getPorcentajeSecundaria();
    const porcentajePrimaria = this.getPorcentajePrimaria();
    const porcentajeSinNivel = this.getPorcentajeSinNivel();
    
    return `En el CP ${centroPoblado}, el nivel educativo alcanzado por la mayor parte de la población de 15 años a más es la secundaria, pues representan el ${porcentajeSecundaria}. En segundo lugar, se hallan aquellos que cuentan con primaria (${porcentajePrimaria}). Por otro lado, la categoría minoritaria corresponde a aquellos con sin nivel o inicial, pues representan solamente un ${porcentajeSinNivel}.`;
  }

  obtenerTextoTasaAnalfabetismo(): string {
    if (this.datos.textoTasaAnalfabetismo && this.datos.textoTasaAnalfabetismo !== '____') {
      return this.datos.textoTasaAnalfabetismo;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const casosAnalfabetismo = this.getCasosAnalfabetismo();
    const porcentajeAnalfabetismo = this.getPorcentajeAnalfabetismo();
    
    return `En el CP ${centroPoblado}, tomando en cuenta a la población de 15 años a más, las personas que no saben leer ni escribir llegan a la cantidad de ${casosAnalfabetismo}. Esto representa una tasa de analfabetismo del ${porcentajeAnalfabetismo} en esta localidad.`;
  }

  obtenerTextoSeccion30IndicadoresEducacionIntro(): string {
    if (this.datos.parrafoSeccion30_indicadores_educacion_intro && this.datos.parrafoSeccion30_indicadores_educacion_intro !== '____') {
      return this.datos.parrafoSeccion30_indicadores_educacion_intro;
    }
    return `La educación es un pilar fundamental para el desarrollo social y económico de una comunidad. En ese sentido, los indicadores de educación juegan un papel crucial al proporcionar una visión clara del estado actual del sistema educativo y su impacto en la población. Este apartado se centra en dos indicadores clave: el nivel educativo de la población y la tasa de analfabetismo. El análisis de estos indicadores permite comprender mejor las fortalezas y desafíos del sistema educativo local, así como diseñar estrategias efectivas para mejorar la calidad educativa y reducir las desigualdades en el acceso a la educación.`;
  }

  onNivelEducativoFieldChange(index: number, field: string, value: any): void {
    const tabla = this.datos.nivelEducativoTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const categoria = item.categoria?.toString().toLowerCase() || '';
          if (categoria.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const categoria = item.categoria?.toString().toLowerCase() || '';
            if (!categoria.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
        
        const fieldIdParrafo = 'textoNivelEducativo';
        if (this.datos[fieldIdParrafo]) {
          delete this.datos[fieldIdParrafo];
          this.formularioService.actualizarDato(fieldIdParrafo as any, null);
        }
      }
      
      this.datos.nivelEducativoTabla = [...tabla];
      this.formularioService.actualizarDato('nivelEducativoTabla', tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onNivelEducativoTableUpdated(): void {
    const tabla = this.datos.nivelEducativoTabla || [];
    this.datos.nivelEducativoTabla = [...tabla];
    this.formularioService.actualizarDato('nivelEducativoTabla', tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTasaAnalfabetismoFieldChange(index: number, field: string, value: any): void {
    const tabla = this.datos.tasaAnalfabetismoTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      
      if (field === 'casos') {
        const total = tabla.reduce((sum: number, item: any) => {
          const indicador = item.indicador?.toString().toLowerCase() || '';
          if (indicador.includes('total')) return sum;
          const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
          return sum + casos;
        }, 0);
        
        if (total > 0) {
          tabla.forEach((item: any) => {
            const indicador = item.indicador?.toString().toLowerCase() || '';
            if (!indicador.includes('total')) {
              const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
              const porcentaje = ((casos / total) * 100)
                .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                .replace('.', ',') + ' %';
              item.porcentaje = porcentaje;
            }
          });
        }
      }
      
      this.datos.tasaAnalfabetismoTabla = [...tabla];
      this.formularioService.actualizarDato('tasaAnalfabetismoTabla', tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onTasaAnalfabetismoTableUpdated(): void {
    const tabla = this.datos.tasaAnalfabetismoTabla || [];
    this.datos.tasaAnalfabetismoTabla = [...tabla];
    this.formularioService.actualizarDato('tasaAnalfabetismoTabla', tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
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


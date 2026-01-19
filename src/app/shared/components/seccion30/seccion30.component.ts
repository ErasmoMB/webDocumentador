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
  private cppAnterior: string | null = null;
  private nivelEducativoBatch: { [cpp: string]: any[] } = {};
  private analfabetismoBatch: { [cpp: string]: any } = {};
  private distritoToCppMap: { [distrito: string]: string } = {};
  
  override watchedFields: string[] = ['centroPobladoAISI', 'parrafoSeccion30_indicadores_educacion_intro', 'nivelEducativoTabla', 'tasaAnalfabetismoTabla', 'textoNivelEducativo', 'textoTasaAnalfabetismo'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB19';
  
  fotografiasInstitucionalidadCache: any[] = [];

  nivelEducativoConfig: TableConfig = {
    tablaKey: 'nivelEducativoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  tasaAnalfabetismoConfig: TableConfig = {
    tablaKey: 'tasaAnalfabetismoTabla',
    totalKey: 'indicador',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { indicador: '', casos: 0, porcentaje: '0,00 %' }
    ],
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
      // Cargar datos batch de todos los CPPs del grupo al iniciar
      const cppsDelGrupo = this.getLoadParameters();
      if (cppsDelGrupo && cppsDelGrupo.length > 0) {
        console.log('🟢 Cargando datos batch para', cppsDelGrupo.length, 'CPPs');
        // Crear mapeo de distritoi -> CPP (i comienza en 1)
        cppsDelGrupo.forEach((cpp, index) => {
          const distritoLabel = `distrito${index + 1}`;
          this.distritoToCppMap[distritoLabel] = cpp;
          console.log(`  Mapeo: ${distritoLabel} → ${cpp}`);
        });
        this.cargarNivelEducativoBatch(cppsDelGrupo);
        this.cargarAnalfabetismoBatch(cppsDelGrupo);
      }
      
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        // Cargar datos educativos solo cuando el CPP cambia
        const distritoLabel = this.datos.centroPobladoAISI;
        console.log('🔵 Sección 30 - Distrito detectado:', distritoLabel, 'Anterior:', this.cppAnterior);
        if (distritoLabel && distritoLabel !== this.cppAnterior) {
          this.cppAnterior = distritoLabel;
          // Convertir nombre de distrito a CPP real
          const cppActual = this.distritoToCppMap[distritoLabel];
          console.log('🟡 Distrito cambió a:', distritoLabel, '-> CPP:', cppActual);
          if (cppActual) {
            this.actualizarDatosParaCpp(cppActual);
          }
        }
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

  protected getSectionKey(): string {
    return 'seccion30_aisi';
  }

  /**
   * Carga datos de nivel educativo desde el backend (Cuadro 3.58)
   */
  cargarNivelEducativo(): void {
    const cpp = this.datos.centroPobladoAISI;
    if (!cpp) {
      return; // No hay CPP
    }

    this.educacionService.obtenerNivelEducativoPorCpp(cpp)
      .subscribe({
        next: (response: any) => {
          console.log('✓ Respuesta cargarNivelEducativo:', response);
          if (response?.success && response?.data && Array.isArray(response.data)) {
            // Mapear datos del backend al formato esperado por la tabla
            const nivelEducativoTabla = response.data.map((item: any) => ({
              categoria: item.nivel || item.nombre || '',
              casos: item.cantidad || 0,
              porcentaje: `${(item.porcentaje || 0).toFixed(2).replace('.', ',')} %`
            }));
            
            console.log('✓ nivelEducativoTabla mapeada:', nivelEducativoTabla);
            this.datos.nivelEducativoTabla = nivelEducativoTabla;
            this.cdRef.detectChanges();
          }
        },
        error: (error: any) => {
          console.error('Error cargando nivel educativo para CPP:', cpp, error);
        }
      });
  }

  /**
   * Carga datos de tasa de analfabetismo desde el backend (Cuadro 3.59)
   */
  cargarAnalfabetismo(): void {
    const cpp = this.datos.centroPobladoAISI;
    if (!cpp) {
      return; // No hay CPP
    }

    this.educacionService.obtenerAnalfabetismoPorCpp(cpp)
      .subscribe({
        next: (response: any) => {
          console.log('✓ Respuesta cargarAnalfabetismo:', response);
          if (response?.success && response?.data) {
            const data = response.data;
            // Almacenar la tasa de analfabetismo para referencia
            this.datos.tasaAnalfabetismo = data.tasa_analfabetismo || data.tasaAnalfabetismo || 0;
            this.datos.totalPoblacion15Mas = data.total_poblacion_15_y_mas || data.totalPoblacion15yMas || 0;
            
            console.log('✓ tasaAnalfabetismo:', this.datos.tasaAnalfabetismo);
            console.log('✓ totalPoblacion15Mas:', this.datos.totalPoblacion15Mas);
            this.cdRef.detectChanges();
          }
        },
        error: (error: any) => {
          console.error('Error cargando analfabetismo para CPP:', cpp, error);
        }
      });
  }

  /**
   * Carga datos de nivel educativo para múltiples CPPs (batch)
   */
  cargarNivelEducativoBatch(cpps: string[]): void {
    if (!cpps || cpps.length === 0) {
      return;
    }

    this.educacionService.obtenerNivelEducativoMultiples(cpps)
      .subscribe({
        next: (response: any) => {
          console.log('✓ Respuesta cargarNivelEducativoBatch:', response);
          if (response?.success && response?.data) {
            this.nivelEducativoBatch = response.data;
            console.log('✓ nivelEducativoBatch cargado para', Object.keys(this.nivelEducativoBatch).length, 'CPPs');
            
            // Actualizar tablas con pequeño delay para que centroPobladoAISI esté disponible
            setTimeout(() => {
              this.actualizarTablasConDatosActuales();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando nivel educativo batch:', error);
        }
      });
  }

  /**
   * Carga datos de analfabetismo para múltiples CPPs (batch)
   */
  cargarAnalfabetismoBatch(cpps: string[]): void {
    if (!cpps || cpps.length === 0) {
      return;
    }

    this.educacionService.obtenerAnalfabetismoMultiples(cpps)
      .subscribe({
        next: (response: any) => {
          console.log('✓ Respuesta cargarAnalfabetismoBatch:', response);
          if (response?.success && response?.data) {
            this.analfabetismoBatch = response.data;
            console.log('✓ analfabetismoBatch cargado para', Object.keys(this.analfabetismoBatch).length, 'CPPs');
            
            // Actualizar tablas con pequeño delay para que centroPobladoAISI esté disponible
            setTimeout(() => {
              this.actualizarTablasConDatosActuales();
            }, 100);
          }
        },
        error: (error: any) => {
          console.error('Error cargando analfabetismo batch:', error);
        }
      });
  }

  /**
   * Actualiza las tablas con los datos del CPP actual usando datos batch ya cargados
   */
  actualizarTablasConDatosActuales(): void {
    const distritoLabel = this.datos.centroPobladoAISI;
    console.log('🟡 actualizarTablasConDatosActuales - Distrito actual:', distritoLabel);
    
    if (distritoLabel) {
      const cppActual = this.distritoToCppMap[distritoLabel];
      console.log('🟡 Convertido a CPP:', cppActual);
      if (cppActual) {
        this.actualizarDatosParaCpp(cppActual);
      }
    }
  }

  /**
   * Actualiza las tablas de datos para un CPP específico usando datos ya cargados en batch
   */
  actualizarDatosParaCpp(cpp: string): void {
    // Actualizar tabla de nivel educativo
    if (this.nivelEducativoBatch[cpp]) {
      const nivelEducativoTabla = this.nivelEducativoBatch[cpp].map((item: any) => ({
        categoria: item.nivel || item.nombre || '',
        casos: item.cantidad || 0,
        porcentaje: `${(item.porcentaje || 0).toFixed(2).replace('.', ',')} %`
      }));
      
      this.datos.nivelEducativoTabla = nivelEducativoTabla;
      console.log('✓ nivelEducativoTabla actualizada para', cpp, ':', nivelEducativoTabla.length, 'niveles');
    }
    
    // Actualizar tasa de analfabetismo
    if (this.analfabetismoBatch[cpp]) {
      const data = this.analfabetismoBatch[cpp];
      this.datos.tasaAnalfabetismo = data.tasa_analfabetismo || 0;
      this.datos.totalPoblacion15Mas = data.total_poblacion_15_y_mas || 0;
      console.log('✓ tasaAnalfabetismo actualizada para', cpp, ':', this.datos.tasaAnalfabetismo + '%');
    }
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
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.formularioService.obtenerDatos();
    const centroPobladoAISIActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'centroPobladoAISI', this.seccionId);
    const centroPobladoAISIAnterior = this.datosAnteriores.centroPobladoAISI || null;
    const centroPobladoAISIEnDatos = this.datos.centroPobladoAISI || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    if (centroPobladoAISIActual !== centroPobladoAISIAnterior || centroPobladoAISIActual !== centroPobladoAISIEnDatos || hayCambios) {
      return true;
    }
    
    return false;
  }

  protected override actualizarDatosCustom(): void {
    this.cargarFotografias();
    this.actualizarFotografiasCache();
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
}


import { Component, ChangeDetectorRef, Input, OnDestroy, ChangeDetectionStrategy, Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementFacade } from 'src/app/core/services/tables/table-management.facade';
import { TableConfig } from 'src/app/core/services/table-management.service';
import { ReactiveStateAdapter } from 'src/app/core/services/state-adapters/reactive-state-adapter.service';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';
import { ParagraphEditorComponent } from '../paragraph-editor/paragraph-editor.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableHandlerFactoryService } from 'src/app/core/services/table-handler-factory.service';
import { ServiciosBasicosService } from 'src/app/core/services/servicios-basicos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreSharedModule } from 'src/app/shared/modules/core-shared.module';
import { debugLog } from 'src/app/shared/utils/debug';
import { TablePercentageHelper } from 'src/app/shared/utils/table-percentage-helper';
// Clean Architecture imports
import { LoadSeccion26UseCase, UpdateSeccion26DataUseCase, Seccion26ViewModel } from 'src/app/core/application/use-cases';
import { Seccion26Data } from 'src/app/core/domain/entities';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GenericTableComponent,
        ParagraphEditorComponent,
        CoreSharedModule
    ],
    selector: 'app-seccion26',
    templateUrl: './seccion26.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Seccion26Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.5';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;  private timeouts: number[] = [];  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['centroPobladoAISI', 'condicionOcupacionAISI', 'materialesViviendaAISI', 'abastecimientoAguaCpTabla', 'saneamientoCpTabla', 'coberturaElectricaCpTabla', 'combustiblesCocinarCpTabla', 'textoIntroServiciosBasicosAISI', 'textoServiciosAguaAISI', 'textoDesagueCP', 'textoDesechosSolidosCP', 'textoElectricidadCP', 'textoEnergiaCocinarCP'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB15';
  
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidosAISI';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidadAISI';
  readonly PHOTO_PREFIX_COCINAR = 'fotografiaEnergiaCocinarAISI';
  
  fotografiasInstitucionalidadCache: any[] = [];
  fotografiasDesechosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  fotografiasCocinarFormMulti: FotoItem[] = [];

  // Clean Architecture ViewModel
  seccion26ViewModel$ = this.loadSeccion26UseCase.execute();
  seccion26ViewModel?: Seccion26ViewModel;

  abastecimientoAguaConfig: TableConfig = {
    tablaKey: 'abastecimientoAguaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  saneamientoConfig: TableConfig = {
    tablaKey: 'saneamientoCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  coberturaElectricaConfig: TableConfig = {
    tablaKey: 'coberturaElectricaCpTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  combustiblesCocinarConfig: TableConfig = {
    tablaKey: 'combustiblesCocinarCpTabla',
    totalKey: 'nombre',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  constructor(
    cdRef: ChangeDetectorRef,
    injector: Injector,
    protected override tableFacade: TableManagementFacade,
    private stateAdapter: ReactiveStateAdapter,
    private sanitizer: DomSanitizer,
    autoLoader: AutoBackendDataLoaderService,
    private groupConfig: GroupConfigService,
    private serviciosBasicosService: ServiciosBasicosService,
    // Clean Architecture dependencies
    private loadSeccion26UseCase: LoadSeccion26UseCase,
    private updateSeccion26DataUseCase: UpdateSeccion26DataUseCase
  ) {
    super(cdRef, autoLoader, injector, undefined, tableFacade);
    
    // Subscribe to ViewModel for Clean Architecture
    this.seccion26ViewModel$.subscribe(viewModel => {
      this.seccion26ViewModel = viewModel;
      this.cdRef.markForCheck();
    });
  }

  // Clean Architecture methods
  updateSeccion26Data(updates: Partial<Seccion26Data>): void {
    if (this.seccion26ViewModel) {
      const currentData = this.seccion26ViewModel.data;
      const updatedData = { ...currentData, ...updates };
      this.updateSeccion26DataUseCase.execute(updatedData).subscribe(updatedViewModel => {
        this.seccion26ViewModel = updatedViewModel;
        this.cdRef.markForCheck();
      });
    }
  }

  // Backward compatibility methods - delegate to Clean Architecture
  obtenerTextoIntroServiciosBasicos(): string {
    return this.seccion26ViewModel?.texts.introServiciosBasicosText || this.datos.textoIntroServiciosBasicosAISI || '';
  }

  obtenerTextoServiciosAgua(): string {
    return this.seccion26ViewModel?.texts.serviciosAguaText || this.datos.textoServiciosAguaAISI || '';
  }

  obtenerTextoDesague(): string {
    return this.seccion26ViewModel?.texts.desagueText || this.datos.textoDesagueCP || '';
  }

  obtenerTextoDesechosSolidos(): string {
    return this.seccion26ViewModel?.texts.desechosSolidosText || this.datos.textoDesechosSolidosCP || '';
  }

  obtenerTextoElectricidad(): string {
    return this.seccion26ViewModel?.texts.electricidadText || this.datos.textoElectricidadCP || '';
  }

  obtenerTextoEnergiaCocinar(): string {
    return this.seccion26ViewModel?.texts.energiaCocinarText || this.datos.textoEnergiaCocinarCP || '';
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    this.actualizarFotografiasCache();
    
    // Cargar servicios básicos desde el backend
    if (!this.modoFormulario) {
      this.cargarServiciosBasicos();
    }
    
    if (this.modoFormulario) {
      if (this.seccionId) {
        this.timeouts.push(window.setTimeout(() => {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }, 0));
      }
      this.stateSubscription = this.stateAdapter.datos$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.seccionId) {
          this.actualizarFotografiasFormMulti();
          this.cdRef.detectChanges();
        }
      });
    } else {
      this.stateSubscription = this.stateAdapter.datos$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.cargarFotografias();
        this.actualizarFotografiasCache();
        this.cdRef.detectChanges();
      });
    }
  }

  override ngOnDestroy() {
    this.timeouts.forEach(id => clearTimeout(id));
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected getSectionKey(): string {
    return 'seccion26_aisi';
  }

  protected getLoadParameters(): string[] | null {
    return this.groupConfig.getAISICCPPActivos();
  }

  protected override detectarCambios(): boolean {
    const datosActuales = this.projectFacade.obtenerDatos();
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

  getTablaKeyAbastecimientoAgua(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `abastecimientoAguaCpTabla${prefijo}` : 'abastecimientoAguaCpTabla';
  }

  getTablaKeySaneamiento(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `saneamientoCpTabla${prefijo}` : 'saneamientoCpTabla';
  }

  getTablaKeyCoberturaElectrica(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `coberturaElectricaCpTabla${prefijo}` : 'coberturaElectricaCpTabla';
  }

  getTablaKeyCombustiblesCocinar(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `combustiblesCocinarCpTabla${prefijo}` : 'combustiblesCocinarCpTabla';
  }

  get abastecimientoAguaCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    return this.datos[tablaKey] || this.datos.abastecimientoAguaCpTabla || [];
  }

  get saneamientoCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeySaneamiento();
    return this.datos[tablaKey] || this.datos.saneamientoCpTabla || [];
  }

  get coberturaElectricaCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    return this.datos[tablaKey] || this.datos.coberturaElectricaCpTabla || [];
  }

  /**
   * Obtiene la tabla Abastecimiento Agua CP con porcentajes calculados dinámicamente
   * Cuadro 3.47
   */
  getAbastecimientoAguaCpConPorcentajes(): any[] {
    const tabla = this.abastecimientoAguaCpTablaVista;
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.47');
  }

  /**
   * Obtiene la tabla Saneamiento CP con porcentajes calculados dinámicamente
   * Cuadro 3.48
   */
  getSaneamientoCpConPorcentajes(): any[] {
    const tabla = this.saneamientoCpTablaVista;
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.48');
  }

  /**
   * Obtiene la tabla Cobertura Eléctrica CP con porcentajes calculados dinámicamente
   * Cuadro 3.49
   */
  getCoberturaElectricaCpConPorcentajes(): any[] {
    const tabla = this.coberturaElectricaCpTablaVista;
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.49');
  }

  /**
   * Obtiene la tabla Combustibles Cocinar CP con porcentajes calculados dinámicamente
   * Cuadro 3.50
   * Nota: Esta tabla usa 'nombre' en lugar de 'categoria' como campo de identificación
   */
  getCombustiblesCocinarCpConPorcentajes(): any[] {
    const tabla = this.combustiblesCocinarCpTablaVista;
    return TablePercentageHelper.calcularPorcentajesSimple(tabla, '3.50');
  }

  get combustiblesCocinarCpTablaVista(): any[] {
    const tablaKey = this.getTablaKeyCombustiblesCocinar();
    return this.datos[tablaKey] || this.datos.combustiblesCocinarCpTabla || [];
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  formatearParrafo(texto: string): string {
    if (!texto) return '';
    const parrafos = texto.split(/\n\n+/);
    return parrafos.map(p => {
      const textoLimpio = p.trim().replace(/\n/g, '<br>');
      return `<p class="text-justify">${textoLimpio}</p>`;
    }).join('');
  }

  getViviendasOcupadasPresentes(): string {
    if (!this.datos?.condicionOcupacionAISI || !Array.isArray(this.datos.condicionOcupacionAISI)) {
      return '____';
    }
    const item = this.datos.condicionOcupacionAISI.find((item: any) => 
      item.categoria?.toLowerCase().includes('ocupado') || item.categoria?.toLowerCase().includes('ocupada')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeAguaRedPublicaDentro(): string {
    if (!this.datos?.abastecimientoAguaCpTabla || !Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      return '____';
    }
    const item = this.datos.abastecimientoAguaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('dentro')
    );
    
    if (item?.porcentaje) {
      return item.porcentaje;
    }
    
    // Calcular porcentaje si no existe
    const total = this.datos.abastecimientoAguaCpTabla.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total === 0) return '____';
    
    const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
    const porcentaje = (casos / total) * 100;
    return porcentaje.toFixed(1) + '%';
  }

  getPorcentajeAguaRedPublicaFuera(): string {
    if (!this.datos?.abastecimientoAguaCpTabla || !Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      return '____';
    }
    const item = this.datos.abastecimientoAguaCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('fuera')
    );
    
    if (item?.porcentaje) {
      return item.porcentaje;
    }
    
    // Calcular porcentaje si no existe
    const total = this.datos.abastecimientoAguaCpTabla.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    
    if (total === 0) return '____';
    
    const casos = typeof item?.casos === 'number' ? item.casos : parseInt(item?.casos) || 0;
    const porcentaje = (casos / total) * 100;
    return porcentaje.toFixed(1) + '%';
  }

  getPorcentajeElectricidadSi(): string {
    if (!this.datos?.coberturaElectricaCpTabla || !Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      return '____';
    }
    const item = this.datos.coberturaElectricaCpTabla.find((item: any) => 
      item.tipo && (item.tipo.toLowerCase().includes('si') || item.tipo.toLowerCase().includes('con'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeElectricidadNo(): string {
    if (!this.datos?.coberturaElectricaCpTabla || !Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      return '____';
    }
    const item = this.datos.coberturaElectricaCpTabla.find((item: any) => 
      item.tipo && item.tipo.toLowerCase().includes('sin')
    );
    return item?.porcentaje || '____';
  }

  getTotalHogares(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const total = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    return total?.casos?.toString() || '____';
  }

  getPorcentajeLena(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.nombre && item.nombre.toLowerCase().includes('leña')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeGas(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.nombre && item.nombre.toLowerCase().includes('gas')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeBosta(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.nombre && (item.nombre.toLowerCase().includes('bosta') || item.nombre.toLowerCase().includes('estiércol'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeElectricidadCocinar(): string {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return '____';
    }
    const item = this.datos.combustiblesCocinarCpTabla.find((item: any) => 
      item.nombre && item.nombre.toLowerCase().includes('electricidad')
    );
    return item?.porcentaje || '____';
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasDesechosFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasElectricidadFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
    this.fotografiasCocinarFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COCINAR,
      groupPrefix
    );
  }

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  getFotografiasDesechosVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
  }

  getFotografiasElectricidadVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
  }

  getFotografiasCocinarVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COCINAR,
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
    this.fotografiasDesechosFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasElectricidadFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
    this.fotografiasCocinarFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_COCINAR,
      groupPrefix
    );
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
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
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }

  onFotografiasDesechosChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DESECHOS, fotografias);
    this.fotografiasDesechosFormMulti = [...fotografias];
  }

  onFotografiasElectricidadChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_ELECTRICIDAD, fotografias);
    this.fotografiasElectricidadFormMulti = [...fotografias];
  }

  onFotografiasCocinarChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_COCINAR, fotografias);
    this.fotografiasCocinarFormMulti = [...fotografias];
  }

  obtenerTextoIntroServiciosBasicosAISI(): string {
    if (this.datos.textoIntroServiciosBasicosAISI && this.datos.textoIntroServiciosBasicosAISI !== '____') {
      return this.datos.textoIntroServiciosBasicosAISI;
    }
    
    const viviendasOcupadas = this.getViviendasOcupadasPresentes();
    
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento.\n\nEn 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia al total de viviendas ocupadas presentes (${viviendasOcupadas}), tal como realiza el Censo Nacional 2017.`;
  }

  obtenerTextoServiciosAguaAISI(): string {
    if (this.datos.textoServiciosAguaAISI && this.datos.textoServiciosAguaAISI !== '____') {
      return this.datos.textoServiciosAguaAISI;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajeDentro = this.getPorcentajeAguaRedPublicaDentro();
    const porcentajeFuera = this.getPorcentajeAguaRedPublicaFuera();
    
    return `Respecto al servicio de agua para consumo humano en el CP ${centroPoblado}, se cuenta con cobertura de dicho recurso en las viviendas. Es así que, según los Censos Nacionales 2017, un ${porcentajeDentro} de las viviendas cuenta con red pública dentro de la misma. El porcentaje restante (${porcentajeFuera}) consta de red pública fuera de la vivienda, pero dentro de la edificación.`;
  }

  obtenerTextoDesechosSolidosCP(): string {
    if (this.datos.textoDesechosSolidosCP && this.datos.textoDesechosSolidosCP !== '____') {
      return this.datos.textoDesechosSolidosCP;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    
    return `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.\n\nCuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la capital distrital, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo. Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del CP ${centroPoblado} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
  }

  obtenerTextoDesagueCP(): string {
    if (this.datos.textoDesagueCP && this.datos.textoDesagueCP !== '____') {
      return this.datos.textoDesagueCP;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    
    return `Respecto al servicio de saneamiento en las viviendas de la capital distrital de ${distrito}, se cuenta con una amplia cobertura de dicho servicio. Es así que, según los Censos Nacionales 2017, un 81,63 % de las viviendas cuenta con red pública de desagüe dentro de las mismas. Adicionalmente, un 10,20 % cuenta con pozo séptico, tanque séptico o biodigestor.\n\nPor otra parte, se hallan otras categorías con porcentajes menores: red pública de desagüe fuera de la vivienda, pero dentro de la edificación; letrina (con tratamiento); pozo ciego o negro; y campo abierto o al aire libre, todas las cuales representan un 2,04 % cada una.`;
  }

  obtenerTextoElectricidadCP(): string {
    if (this.datos.textoElectricidadCP && this.datos.textoElectricidadCP !== '____') {
      return this.datos.textoElectricidadCP;
    }
    
    const porcentajeSi = this.getPorcentajeElectricidadSi();
    const porcentajeNo = this.getPorcentajeElectricidadNo();
    
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas del centro poblado en cuestión. Según los Censos Nacionales 2017, se cuenta con los siguientes datos: el ${porcentajeSi} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${porcentajeNo} restante no tiene el referido servicio.`;
  }

  obtenerTextoEnergiaCocinarCP(): string {
    if (this.datos.textoEnergiaCocinarCP && this.datos.textoEnergiaCocinarCP !== '____') {
      return this.datos.textoEnergiaCocinarCP;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const totalHogares = this.getTotalHogares();
    const porcentajeLena = this.getPorcentajeLena();
    const porcentajeGas = this.getPorcentajeGas();
    const porcentajeBosta = this.getPorcentajeBosta();
    const porcentajeElectricidad = this.getPorcentajeElectricidadCocinar();
    
    return `Según los Censos Nacionales 2017, de un total de ${totalHogares} hogares en el CP ${centroPoblado}, se obtiene que un ${porcentajeLena} emplea la leña. En menor medida, se emplean otros combustibles como el gas (balón GLP) en un ${porcentajeGas}, la bosta o estiércol en un ${porcentajeBosta} y la electricidad con un ${porcentajeElectricidad}. Cabe mencionar que los hogares pueden emplear más de un tipo de combustible para la cocción de los alimentos.`;
  }

  // Métodos para filtrar filas Total de abastecimiento de agua
  getAbastecimientoAguaSinTotal(): any[] {
    if (!this.datos?.abastecimientoAguaCpTabla || !Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      return [];
    }
    return this.datos.abastecimientoAguaCpTabla.filter((item: any) => 
      !item.tipo || !item.tipo.toLowerCase().includes('total')
    );
  }

  getTotalAbastecimientoAgua(): number {
    const filtered = this.getAbastecimientoAguaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Métodos para filtrar filas Total de saneamiento
  getSaneamientoSinTotal(): any[] {
    if (!this.datos?.saneamientoCpTabla || !Array.isArray(this.datos.saneamientoCpTabla)) {
      return [];
    }
    return this.datos.saneamientoCpTabla.filter((item: any) => 
      !item.tipo || !item.tipo.toLowerCase().includes('total')
    );
  }

  getTotalSaneamiento(): number {
    const filtered = this.getSaneamientoSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Métodos para filtrar filas Total de cobertura eléctrica
  getCoberturaElectricaSinTotal(): any[] {
    if (!this.datos?.coberturaElectricaCpTabla || !Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      return [];
    }
    return this.datos.coberturaElectricaCpTabla.filter((item: any) => 
      !item.tipo || !item.tipo.toLowerCase().includes('total')
    );
  }

  getTotalCoberturaElectrica(): number {
    const filtered = this.getCoberturaElectricaSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Métodos para filtrar filas Total de combustibles para cocinar
  getCombustiblesCocinarSinTotal(): any[] {
    if (!this.datos?.combustiblesCocinarCpTabla || !Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      return [];
    }
    return this.datos.combustiblesCocinarCpTabla.filter((item: any) => 
      !item.nombre || !item.nombre.toLowerCase().includes('total')
    );
  }

  getTotalCombustiblesCocinar(): number {
    const filtered = this.getCombustiblesCocinarSinTotal();
    return filtered.reduce((sum: number, item: any) => sum + (Number(item.casos) || 0), 0);
  }

  // Eliminar filas Total al cargar datos
  eliminarFilasTotal(): void {
    // Abastecimiento de Agua
    if (this.datos?.abastecimientoAguaCpTabla && Array.isArray(this.datos.abastecimientoAguaCpTabla)) {
      const filtered = this.datos.abastecimientoAguaCpTabla.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.abastecimientoAguaCpTabla.length) {
        this.datos.abastecimientoAguaCpTabla = filtered;
        this.onFieldChange('abastecimientoAguaCpTabla', filtered, { refresh: false });
      }
    }

    // Saneamiento
    if (this.datos?.saneamientoCpTabla && Array.isArray(this.datos.saneamientoCpTabla)) {
      const filtered = this.datos.saneamientoCpTabla.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.saneamientoCpTabla.length) {
        this.datos.saneamientoCpTabla = filtered;
        this.onFieldChange('saneamientoCpTabla', filtered, { refresh: false });
      }
    }

    // Cobertura Eléctrica
    if (this.datos?.coberturaElectricaCpTabla && Array.isArray(this.datos.coberturaElectricaCpTabla)) {
      const filtered = this.datos.coberturaElectricaCpTabla.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.coberturaElectricaCpTabla.length) {
        this.datos.coberturaElectricaCpTabla = filtered;
        this.onFieldChange('coberturaElectricaCpTabla', filtered, { refresh: false });
      }
    }

    // Combustibles para Cocinar
    if (this.datos?.combustiblesCocinarCpTabla && Array.isArray(this.datos.combustiblesCocinarCpTabla)) {
      const filtered = this.datos.combustiblesCocinarCpTabla.filter((item: any) => 
        !item.categoria || !item.categoria.toLowerCase().includes('total')
      );
      if (filtered.length !== this.datos.combustiblesCocinarCpTabla.length) {
        this.datos.combustiblesCocinarCpTabla = filtered;
        this.onFieldChange('combustiblesCocinarCpTabla', filtered, { refresh: false });
      }
    }
  }

  /**
   * Recalcula dinámicamente los porcentajes de un array de items
   * basándose en el total de casos
   */
  private recalcularPorcentajes(items: any[]): any[] {
    if (!items || items.length === 0) return items;
    
    const itemsConPorcentajeInicial = items.map(item => ({
      ...item,
      porcentaje: '0,00 %'
    }));
    
    const total = itemsConPorcentajeInicial.reduce((sum, item) => sum + (Number(item.casos) || 0), 0);
    
    if (total === 0) return itemsConPorcentajeInicial;
    
    return itemsConPorcentajeInicial.map(item => ({
      ...item,
      porcentaje: `${((Number(item.casos) / total) * 100).toFixed(2).replace('.', ',')} %`
    }));
  }

  /**
   * Normaliza un string removiendo palabras comunes cortas para comparación
   */
  private normalizarParaComparacion(texto: string): string {
    if (!texto) return '';
    // Convertir a minúsculas y remover palabras pequeñas: "de", "la", "el", "los", "las", etc.
    return texto
      .toLowerCase()
      .replace(/\b(de|la|el|los|las|un|una|unos|unas|y|o|a)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Elimina registros duplicados por tipo/nombre, manteniendo el primero
   * Detecta duplicados incluso con variaciones menores en el texto
   */
  private eliminarDuplicadosPorTipo(items: any[], campoTipo: string = 'tipo'): any[] {
    const vistos = new Set<string>();
    return items.filter(item => {
      const valor = this.normalizarParaComparacion(item[campoTipo] || '');
      if (vistos.has(valor)) {
        return false; // Filtrar duplicado
      }
      vistos.add(valor);
      return true; // Mantener
    });
  }

  cargarServiciosBasicos(): void {
    const codigos = this.groupConfig.getAISICCPPActivos();
    if (!codigos || codigos.length === 0) {
      return;
    }

    // Cargar servicios básicos (agua, desagüe, electricidad)
    this.serviciosBasicosService.obtenerServiciosPorCodigos(codigos).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          const datos = response.data;
          
          // Procesar Agua (3.48) - eliminar duplicados y recalcular porcentajes
          if (datos['Agua']) {
            const aguaSinDuplicados = this.eliminarDuplicadosPorTipo(datos['Agua'], 'tipo');
            this.datos.abastecimientoAguaCpTabla = this.recalcularPorcentajes(aguaSinDuplicados);
            this.onFieldChange('abastecimientoAguaCpTabla', this.datos.abastecimientoAguaCpTabla, { refresh: false });
          }
          
          // Procesar Desagüe (3.49) - eliminar duplicados y recalcular porcentajes
          if (datos['Desagüe']) {
            const desagueSinDuplicados = this.eliminarDuplicadosPorTipo(datos['Desagüe'], 'tipo');
            this.datos.saneamientoCpTabla = this.recalcularPorcentajes(desagueSinDuplicados);
            this.onFieldChange('saneamientoCpTabla', this.datos.saneamientoCpTabla, { refresh: false });
          }
          
          // Procesar Alumbrado (3.50) - eliminar duplicados y recalcular porcentajes
          if (datos['Alumbrado']) {
            const alumbradoSinDuplicados = this.eliminarDuplicadosPorTipo(datos['Alumbrado'], 'tipo');
            this.datos.coberturaElectricaCpTabla = this.recalcularPorcentajes(alumbradoSinDuplicados);
            this.onFieldChange('coberturaElectricaCpTabla', this.datos.coberturaElectricaCpTabla, { refresh: false });
          }

          this.cdRef.detectChanges();
        }
      },
      (error: any) => {
      }
    );

    // Cargar energía para cocinar (3.51) - eliminar duplicados y recalcular porcentajes
    this.serviciosBasicosService.obtenerEnergiaCocinavPorCodigos(codigos).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          const tablaKey = this.getTablaKeyCombustiblesCocinar();
          const combustiblesSinDuplicados = this.eliminarDuplicadosPorTipo(response.data, 'nombre');
          const combustiblesConPorcentajes = this.recalcularPorcentajes(combustiblesSinDuplicados);
          this.datos[tablaKey] = combustiblesConPorcentajes;
          this.datos.combustiblesCocinarCpTabla = combustiblesConPorcentajes;
          this.onFieldChange(tablaKey as any, combustiblesConPorcentajes, { refresh: false });
          this.tableFacade.calcularPorcentajes(this.datos, this.combustiblesCocinarConfig);
          this.cdRef.detectChanges();
        } else {
          }
      },
      (error: any) => {
        console.error('[S26] Error cargando datos energía cocinar:', error);
      }
    );
  }

  private calcularPorcentajesTablaCustom(tablaKey: string, campoCasos: string = 'casos', campoPorcentaje: string = 'porcentaje'): void {
    const tabla = this.datos[tablaKey] || [];
    if (!tabla || tabla.length === 0) return;
    
    const totalKey = tablaKey === 'combustiblesCocinarCpTabla' ? 'nombre' : 'categoria';
    
    const total = tabla.reduce((sum: number, item: any) => {
      const key = item[totalKey]?.toString().toLowerCase() || '';
      if (key.includes('total')) return sum;
      const casos = typeof item[campoCasos] === 'number' ? item[campoCasos] : parseInt(item[campoCasos]) || 0;
      return sum + casos;
    }, 0);
    
    if (total > 0) {
      tabla.forEach((item: any) => {
        const key = item[totalKey]?.toString().toLowerCase() || '';
        if (!key.includes('total')) {
          const casos = typeof item[campoCasos] === 'number' ? item[campoCasos] : parseInt(item[campoCasos]) || 0;
          const porcentaje = ((casos / total) * 100)
            .toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace('.', ',') + ' %';
          item[campoPorcentaje] = porcentaje;
        }
      });
    } else {
      tabla.forEach((item: any) => {
        const key = item[totalKey]?.toString().toLowerCase() || '';
        if (!key.includes('total')) {
          item[campoPorcentaje] = '0,00 %';
        }
      });
    }
    
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
  }

  // ✅ MIGRADO: Usa factory centralizado
  onAbastecimientoAguaFieldChange = this.createTableHandler('abastecimientoAguaTabla', this.abastecimientoAguaConfig);

  onAbastecimientoAguaTableUpdated(): void {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    const tabla = this.datos[tablaKey] || this.datos.abastecimientoAguaCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onSaneamientoFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeySaneamiento();
    const tabla = this.datos[tablaKey] || this.datos.saneamientoCpTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTablaCustom(tablaKey);
      } else {
        this.datos[tablaKey] = [...tabla];
        this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      }
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onSaneamientoTableUpdated(): void {
    const tablaKey = this.getTablaKeySaneamiento();
    const tabla = this.datos[tablaKey] || this.datos.saneamientoCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCoberturaElectricaFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    const tabla = this.datos[tablaKey] || this.datos.coberturaElectricaCpTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTablaCustom(tablaKey);
      } else {
        this.datos[tablaKey] = [...tabla];
        this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      }
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onCoberturaElectricaTableUpdated(): void {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    const tabla = this.datos[tablaKey] || this.datos.coberturaElectricaCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCombustiblesCocinarFieldChange(index: number, field: string, value: any): void {
    const tablaKey = this.getTablaKeyCombustiblesCocinar();
    const tabla = this.datos[tablaKey] || this.datos.combustiblesCocinarCpTabla || [];
    if (index >= 0 && index < tabla.length) {
      tabla[index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesTablaCustom(tablaKey);
      } else {
        this.datos[tablaKey] = [...tabla];
        this.onFieldChange(tablaKey as any, tabla, { refresh: false });
      }
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onCombustiblesCocinarTableUpdated(): void {
    const tablaKey = this.getTablaKeyCombustiblesCocinar();
    const tabla = this.datos[tablaKey] || this.datos.combustiblesCocinarCpTabla || [];
    this.datos[tablaKey] = [...tabla];
    this.onFieldChange(tablaKey as any, tabla, { refresh: false });
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


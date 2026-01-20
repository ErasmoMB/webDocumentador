import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { AutoBackendDataLoaderService } from 'src/app/core/services/auto-backend-data-loader.service';
import { GroupConfigService } from 'src/app/core/services/group-config.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { AutoLoadSectionComponent } from '../auto-load-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion10',
  templateUrl: './seccion10.component.html',
  styleUrls: ['./seccion10.component.css']
})
export class Seccion10Component extends AutoLoadSectionComponent implements OnDestroy {
  // Component para gestionar servicios básicos - agua, saneamiento, electricidad, energía para cocinar
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'parrafoSeccion10_servicios_basicos_intro', 'abastecimientoAguaTabla', 'cuotaMensualAgua', 'tiposSaneamientoTabla', 'saneamientoTabla', 'alumbradoElectricoTabla', 'empresaElectrica', 'costoElectricidadMinimo', 'costoElectricidadMaximo', 'textoServiciosAgua', 'textoServiciosAguaDetalle', 'textoServiciosDesague', 'textoServiciosDesagueDetalle', 'textoDesechosSolidos1', 'textoDesechosSolidos2', 'textoDesechosSolidos3', 'textoElectricidad1', 'textoElectricidad2', 'textoEnergiaParaCocinar'];
  
  readonly PHOTO_PREFIX_DESECHOS = 'fotografiaDesechosSolidos';
  readonly PHOTO_PREFIX_ELECTRICIDAD = 'fotografiaElectricidad';
  
  fotografiasDesechosSolidosFormMulti: FotoItem[] = [];
  fotografiasElectricidadFormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';
  
  override fotografiasCache: FotoItem[] = [];
  fotografiasDesechosSolidosCache: FotoItem[] = [];
  fotografiasElectricidadCache: FotoItem[] = [];

  private readonly regexCache = new Map<string, RegExp>();

  get abastecimientoAguaConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyAbastecimientoAgua(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get tiposSaneamientoConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyTiposSaneamiento(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
      calcularPorcentajes: true,
      camposParaCalcular: ['casos']
    };
  }

  get coberturaElectricaConfig(): TableConfig {
    return {
      tablaKey: this.getTablaKeyCoberturaElectrica(),
      totalKey: 'categoria',
      campoTotal: 'casos',
      campoPorcentaje: 'porcentaje',
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
    return 'seccion10_aisd';
  }

  protected getLoadParameters(): string[] | null {
    const ccppDesdeGrupo = this.groupConfig.getAISDCCPPActivos();
    console.log('[S10] CCPP activos desde GroupConfig:', ccppDesdeGrupo);
    if (ccppDesdeGrupo && ccppDesdeGrupo.length > 0) {
      return ccppDesdeGrupo;
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
    
    for (const campo of this.watchedFields) {
      let valorActual: any = null;
      let valorAnterior: any = null;
      
      if (campo === 'abastecimientoAguaTabla' || campo === 'tiposSaneamientoTabla' || campo === 'alumbradoElectricoTabla') {
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
        if (campo === 'abastecimientoAguaTabla' || campo === 'tiposSaneamientoTabla' || campo === 'alumbradoElectricoTabla') {
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

  getViviendasOcupadas(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    
    const tablaKeyConPrefijo = prefijo ? `condicionOcupacionTabla${prefijo}` : 'condicionOcupacionTabla';
    
    let tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'condicionOcupacionTabla', this.seccionId);
    
    if (!tabla || !Array.isArray(tabla)) {
      tabla = this.datos?.condicionOcupacionTabla;
    }
    
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    
    const ocupadas = tabla.find((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      const match = categoria.includes('ocupada') || categoria.includes('ocupadas');
      return match;
    });
    
    const resultado = ocupadas?.casos || '____';
    
    return resultado;
  }

  getPorcentajeAguaRedPublica(): string {
    const tabla = this.getTablaAbastecimientoAgua();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    
    const redPublica = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('red pública') || cat.includes('red pública dentro');
    });
    
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeAguaSinAbastecimiento(): string {
    const tabla = this.getTablaAbastecimientoAgua();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }
    
    const sinAbastecimiento = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('sin acceso a red pública') || 
             cat.includes('sin abastecimiento') || 
             cat.includes('no se abastece') ||
             cat.includes('río') ||
             cat.includes('otro tipo');
    });
    
    return sinAbastecimiento?.porcentaje || '____';
  }

  getPorcentajeSaneamientoRedPublica(): string {
    const tabla = this.getTablaTiposSaneamiento();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }

    const redPublica = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('red pública') || 
             cat.includes('con alcantarillado') ||
             cat.includes('red pública de desagüe');
    });
    
    return redPublica?.porcentaje || '____';
  }

  getPorcentajeSaneamientoSinSaneamiento(): string {
    const tabla = this.getTablaTiposSaneamiento();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }

    const sinSaneamiento = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('sin alcantarillado') || 
             cat.includes('no tiene desagüe') ||
             cat.includes('río') ||
             cat.includes('pozo negro');
    });
    
    return sinSaneamiento?.porcentaje || '____';
  }

  getPorcentajeElectricidad(): string {
    const tabla = this.getTablaCoberturaElectrica();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }

    const conElectricidad = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('con electricidad') || 
             cat.includes('con alumbrado');
    });
    
    return conElectricidad?.porcentaje || '____';
  }

  getPorcentajeSinElectricidad(): string {
    const tabla = this.getTablaCoberturaElectrica();
    if (!tabla || !Array.isArray(tabla)) {
      return '____';
    }

    const sinElectricidad = tabla.find((item: any) => {
      const cat = (item.categoria || '').toLowerCase();
      return cat.includes('sin electricidad') || 
             cat.includes('sin alumbrado');
    });
    
    return sinElectricidad?.porcentaje || '____';
  }

  private getTablaAbastecimientoAgua(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'abastecimientoAguaTabla', this.seccionId) || this.datos.abastecimientoAguaTabla || [];
    return tabla;
  }

  getTablaKeyAbastecimientoAgua(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `abastecimientoAguaTabla${prefijo}` : 'abastecimientoAguaTabla';
  }

  getAbastecimientoAguaSinTotal(): any[] {
    const tabla = this.getTablaAbastecimientoAgua();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalAbastecimientoAgua(): string {
    const tabla = this.getTablaAbastecimientoAgua();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  private getTablaTiposSaneamiento(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'tiposSaneamientoTabla', this.seccionId) 
      || this.datos?.tiposSaneamientoTabla 
      || this.datos?.saneamientoTabla 
      || [];
    return tabla;
  }

  getTablaKeyTiposSaneamiento(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `tiposSaneamientoTabla${prefijo}` : 'tiposSaneamientoTabla';
  }

  getTiposSaneamientoSinTotal(): any[] {
    const tabla = this.getTablaTiposSaneamiento();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalTiposSaneamiento(): string {
    const tabla = this.getTablaTiposSaneamiento();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  private getTablaCoberturaElectrica(): any[] {
    const prefijo = this.obtenerPrefijoGrupo();
    const tabla = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'alumbradoElectricoTabla', this.seccionId) || this.datos.alumbradoElectricoTabla || [];
    return tabla;
  }

  getTablaKeyCoberturaElectrica(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `alumbradoElectricoTabla${prefijo}` : 'alumbradoElectricoTabla';
  }

  getCoberturaElectricaSinTotal(): any[] {
    const tabla = this.getTablaCoberturaElectrica();
    if (!tabla || !Array.isArray(tabla)) {
      return [];
    }
    return tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
  }

  getTotalCoberturaElectrica(): string {
    const tabla = this.getTablaCoberturaElectrica();
    if (!tabla || !Array.isArray(tabla)) {
      return '0';
    }
    const datosSinTotal = tabla.filter((item: any) => {
      const categoria = item.categoria?.toString().toLowerCase() || '';
      return !categoria.includes('total');
    });
    const total = datosSinTotal.reduce((sum: number, item: any) => {
      const casos = typeof item.casos === 'number' ? item.casos : parseInt(item.casos) || 0;
      return sum + casos;
    }, 0);
    return total.toString();
  }

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasDesechosSolidosVista(): FotoItem[] {
    if (this.fotografiasDesechosSolidosCache && this.fotografiasDesechosSolidosCache.length > 0) {
      return [...this.fotografiasDesechosSolidosCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasDesechosSolidosCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasDesechosSolidosCache;
  }

  getFotografiasElectricidadVista(): FotoItem[] {
    if (this.fotografiasElectricidadCache && this.fotografiasElectricidadCache.length > 0) {
      return [...this.fotografiasElectricidadCache];
    }
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
    this.fotografiasElectricidadCache = fotos && fotos.length > 0 ? [...fotos] : [];
    return this.fotografiasElectricidadCache;
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasDesechosSolidosFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasElectricidadFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
  }


  protected override applyLoadedData(loadedData: { [fieldName: string]: any }): void {
    console.log('[S10] Datos del backend:', loadedData);
    
    // El backend POST retorna datos ya separados por categoría
    // Solo necesitamos resetear porcentajes y calcular
    
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

        // Calcular porcentajes SOLO si es tabla y hubo cambio
        if (fieldName === 'abastecimientoAguaTabla' && Array.isArray(data)) {
          console.log('[S10] Calculando porcentajes para abastecimientoAguaTabla');
          this.tableService.calcularPorcentajes(this.datos, this.abastecimientoAguaConfig);
        }
        if (fieldName === 'tiposSaneamientoTabla' && Array.isArray(data)) {
          console.log('[S10] Calculando porcentajes para tiposSaneamientoTabla');
          this.tableService.calcularPorcentajes(this.datos, this.tiposSaneamientoConfig);
        }
        if (fieldName === 'alumbradoElectricoTabla' && Array.isArray(data)) {
          console.log('[S10] Calculando porcentajes para alumbradoElectricoTabla');
          this.tableService.calcularPorcentajes(this.datos, this.coberturaElectricaConfig);
        }
      }
    }

    this.actualizarDatos();
  }

  protected override onInitCustom(): void {
    this.eliminarFilasTotal();
    // Recalcular porcentajes después de eliminar filas totales
    this.recalcularPorcentajesSiHayDatos();
    this.cargarFotografias();
    if (!this.modoFormulario) {
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  private recalcularPorcentajesSiHayDatos(): void {
    // Recalcular porcentajes si las tablas tienen datos
    const tablaAgua = this.getTablaAbastecimientoAgua();
    if (tablaAgua && tablaAgua.length > 0 && tablaAgua[0].casos) {
      this.tableService.calcularPorcentajes(this.datos, this.abastecimientoAguaConfig);
    }

    const tablaSaneamiento = this.getTablaTiposSaneamiento();
    if (tablaSaneamiento && tablaSaneamiento.length > 0 && tablaSaneamiento[0].casos) {
      this.tableService.calcularPorcentajes(this.datos, this.tiposSaneamientoConfig);
    }

    const tablaElectrica = this.getTablaCoberturaElectrica();
    if (tablaElectrica && tablaElectrica.length > 0 && tablaElectrica[0].casos) {
      this.tableService.calcularPorcentajes(this.datos, this.coberturaElectricaConfig);
    }
  }

  private eliminarFilasTotal(): void {
    const tablaKeyAgua = this.getTablaKeyAbastecimientoAgua();
    const tablaAgua = this.getTablaAbastecimientoAgua();
    
    if (tablaAgua && Array.isArray(tablaAgua)) {
      const longitudOriginal = tablaAgua.length;
      const datosFiltrados = tablaAgua.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyAgua, datosFiltrados);
      }
    }
    
    const tablaKeySaneamiento = this.getTablaKeyTiposSaneamiento();
    const tablaSaneamiento = this.getTablaTiposSaneamiento();
    
    if (tablaSaneamiento && Array.isArray(tablaSaneamiento)) {
      const longitudOriginal = tablaSaneamiento.length;
      const datosFiltrados = tablaSaneamiento.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeySaneamiento, datosFiltrados);
      }
    }
    
    const tablaKeyElectrica = this.getTablaKeyCoberturaElectrica();
    const tablaElectrica = this.getTablaCoberturaElectrica();
    
    if (tablaElectrica && Array.isArray(tablaElectrica)) {
      const longitudOriginal = tablaElectrica.length;
      const datosFiltrados = tablaElectrica.filter((item: any) => {
        const categoria = item.categoria?.toString().toLowerCase() || '';
        return !categoria.includes('total');
      });
      if (datosFiltrados.length !== longitudOriginal) {
        this.formularioService.actualizarDato(tablaKeyElectrica, datosFiltrados);
      }
    }
  }

  override ngOnInit() {
    super.ngOnInit();
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

  cargarFotografias(): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const fotosDesechos = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_DESECHOS,
      groupPrefix
    );
    this.fotografiasDesechosSolidosCache = fotosDesechos && fotosDesechos.length > 0 ? [...fotosDesechos] : [];
    
    const fotosElectricidad = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX_ELECTRICIDAD,
      groupPrefix
    );
    this.fotografiasElectricidadCache = fotosElectricidad && fotosElectricidad.length > 0 ? [...fotosElectricidad] : [];
    
    this.cdRef.markForCheck();
  }

  onFotografiasDesechosSolidosChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_DESECHOS, fotografias);
    this.fotografiasDesechosSolidosFormMulti = [...fotografias];
    this.fotografiasDesechosSolidosCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  onFotografiasElectricidadChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX_ELECTRICIDAD, fotografias);
    this.fotografiasElectricidadFormMulti = [...fotografias];
    this.fotografiasElectricidadCache = [...fotografias];
    this.cdRef.detectChanges();
  }

  obtenerTextoSeccion10ServiciosBasicosIntro(): string {
    if (this.datos.parrafoSeccion10_servicios_basicos_intro) {
      return this.datos.parrafoSeccion10_servicios_basicos_intro;
    }
    
    const viviendasOcupadas = this.getViviendasOcupadas();
    
    return `Los servicios básicos nos indican el nivel de desarrollo de una comunidad y un saneamiento deficiente va asociado a la transmisión de enfermedades como el cólera, la diarrea, la disentería, la hepatitis A, la fiebre tifoidea y la poliomielitis, y agrava el retraso del crecimiento. En 2010, la Asamblea General de las Naciones Unidas reconoció que el acceso al agua potable salubre y limpia, y al saneamiento es un derecho humano y pidió que se realizaran esfuerzos internacionales para ayudar a los países a proporcionar agua potable e instalaciones de saneamiento salubres, limpias, accesibles y asequibles. Los servicios básicos serán descritos a continuación tomando como referencia el total de viviendas con ocupantes presentes (${viviendasOcupadas}), tal como realiza el Censo Nacional 2017.`;
  }

  onAbastecimientoAguaFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    let tabla = this.getTablaAbastecimientoAgua();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableService.actualizarFila(this.datos, this.abastecimientoAguaConfig, index, field, value, false);
    
    tabla = this.getTablaAbastecimientoAgua();
    
    if (field === 'casos') {
      const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
      const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      
      itemsSinTotal.forEach((item: any) => {
        if (totalCasos > 0) {
          const casos = parseInt(item.casos) || 0;
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
          item.porcentaje = porcentaje;
        } else {
          item.porcentaje = '0,00 %';
        }
      });
      
      const totalItem = tabla.find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onAbastecimientoAguaTableUpdated() {
    const tablaKey = this.getTablaKeyAbastecimientoAgua();
    let tabla = this.getTablaAbastecimientoAgua();
    
    const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
    const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
    
    itemsSinTotal.forEach((item: any) => {
      if (totalCasos > 0) {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
        item.porcentaje = porcentaje;
      } else {
        item.porcentaje = '0,00 %';
      }
    });
    
    const totalItem = tabla.find((item: any) => item.categoria === 'Total');
    if (totalItem) {
      totalItem.casos = totalCasos;
      totalItem.porcentaje = '100,00 %';
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposSaneamientoFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyTiposSaneamiento();
    let tabla = this.getTablaTiposSaneamiento();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableService.actualizarFila(this.datos, this.tiposSaneamientoConfig, index, field, value, false);
    
    tabla = this.getTablaTiposSaneamiento();
    
    if (field === 'casos') {
      const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
      const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      
      itemsSinTotal.forEach((item: any) => {
        if (totalCasos > 0) {
          const casos = parseInt(item.casos) || 0;
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
          item.porcentaje = porcentaje;
        } else {
          item.porcentaje = '0,00 %';
        }
      });
      
      const totalItem = tabla.find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onTiposSaneamientoTableUpdated() {
    const tablaKey = this.getTablaKeyTiposSaneamiento();
    let tabla = this.getTablaTiposSaneamiento();
    
    const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
    const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
    
    itemsSinTotal.forEach((item: any) => {
      if (totalCasos > 0) {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
        item.porcentaje = porcentaje;
      } else {
        item.porcentaje = '0,00 %';
      }
    });
    
    const totalItem = tabla.find((item: any) => item.categoria === 'Total');
    if (totalItem) {
      totalItem.casos = totalCasos;
      totalItem.porcentaje = '100,00 %';
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCoberturaElectricaFieldChange(index: number, field: string, value: any) {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    let tabla = this.getTablaCoberturaElectrica();
    if (!tabla || !Array.isArray(tabla)) {
      tabla = [];
    }
    
    this.tableService.actualizarFila(this.datos, this.coberturaElectricaConfig, index, field, value, false);
    
    tabla = this.getTablaCoberturaElectrica();
    
    if (field === 'casos') {
      const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
      const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
      
      itemsSinTotal.forEach((item: any) => {
        if (totalCasos > 0) {
          const casos = parseInt(item.casos) || 0;
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
          item.porcentaje = porcentaje;
        } else {
          item.porcentaje = '0,00 %';
        }
      });
      
      const totalItem = tabla.find((item: any) => item.categoria === 'Total');
      if (totalItem) {
        totalItem.casos = totalCasos;
        totalItem.porcentaje = '100,00 %';
      }
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onCoberturaElectricaTableUpdated() {
    const tablaKey = this.getTablaKeyCoberturaElectrica();
    let tabla = this.getTablaCoberturaElectrica();
    
    const itemsSinTotal = tabla.filter((item: any) => item.categoria !== 'Total');
    const totalCasos = itemsSinTotal.reduce((sum: number, item: any) => sum + (parseInt(item.casos) || 0), 0);
    
    itemsSinTotal.forEach((item: any) => {
      if (totalCasos > 0) {
        const casos = parseInt(item.casos) || 0;
        const porcentaje = ((casos / totalCasos) * 100).toFixed(2).replace('.', ',') + ' %';
        item.porcentaje = porcentaje;
      } else {
        item.porcentaje = '0,00 %';
      }
    });
    
    const totalItem = tabla.find((item: any) => item.categoria === 'Total');
    if (totalItem) {
      totalItem.casos = totalCasos;
      totalItem.porcentaje = '100,00 %';
    }
    
    this.formularioService.actualizarDato(tablaKey, tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  obtenerTextoServiciosAgua(): string {
    if (this.datos.textoServiciosAgua && this.datos.textoServiciosAgua !== '____') {
      return this.datos.textoServiciosAgua;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeAguaRedPublica();
    const porcentajeSinAbastecimiento = this.getPorcentajeAguaSinAbastecimiento();
    
    return `Respecto al servicio de agua para consumo humano en la CC ${grupoAISD}, se cuenta con cobertura regular de dicho recurso en las viviendas. Es así que, según la plataforma REDINFORMA, un ${porcentajeRedPublica} de las viviendas cuenta con abastecimiento de agua por red pública. Ninguna vivienda cuenta con abastecimiento por pilón, mientras que el ${porcentajeSinAbastecimiento} restante no se abastece por ninguno de estos dos medios.`;
  }

  obtenerTextoServiciosAguaConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosAgua();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeAguaRedPublica();
    const porcentajeSinAbastecimiento = this.getPorcentajeAguaSinAbastecimiento();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeRedPublica)), `<span class="data-calculated">${this.escapeHtml(porcentajeRedPublica)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeSinAbastecimiento)), `<span class="data-calculated">${this.escapeHtml(porcentajeSinAbastecimiento)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoServiciosAguaDetalle(): string {
    if (this.datos.textoServiciosAguaDetalle && this.datos.textoServiciosAguaDetalle !== '____') {
      return this.datos.textoServiciosAguaDetalle;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const cuotaMensual = this.datos.cuotaMensualAgua || '____';
    
    return `De las entrevistas aplicadas durante el trabajo de campo, se obtuvo la información de que la institución responsable de la administración del servicio de abastecimiento de agua y de su respectivo mantenimiento es la JASS ${grupoAISD}. Esta junta lleva a cabo una cloración del recurso hídrico para el consumo de las familias de la CC ${grupoAISD} y también realiza el cobro de una cuota mensual de S/. ${cuotaMensual} para poder contar con recursos económicos y desarrollar sus actividades.`;
  }

  obtenerTextoServiciosAguaDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosAguaDetalle();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const cuotaMensual = this.datos.cuotaMensualAgua || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(cuotaMensual)), `<span class="data-manual">${this.escapeHtml(cuotaMensual)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoServiciosDesague(): string {
    if (this.datos.textoServiciosDesague && this.datos.textoServiciosDesague !== '____') {
      return this.datos.textoServiciosDesague;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeSaneamientoRedPublica();
    const porcentajeSinSaneamiento = this.getPorcentajeSaneamientoSinSaneamiento();
    
    return `Respecto al servicio de saneamiento en las viviendas de la CC ${grupoAISD}, se cuenta con cobertura regular. Es así que, según la plataforma REDINFORMA, un ${porcentajeRedPublica} de las viviendas cuenta con saneamiento vía red pública. Ninguna vivienda tiene saneamiento vía pozo séptico, mientras que el ${porcentajeSinSaneamiento} restante no posee saneamiento por vía de los dos medios mencionados.`;
  }

  obtenerTextoServiciosDesagueConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosDesague();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const porcentajeRedPublica = this.getPorcentajeSaneamientoRedPublica();
    const porcentajeSinSaneamiento = this.getPorcentajeSaneamientoSinSaneamiento();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeRedPublica)), `<span class="data-calculated">${this.escapeHtml(porcentajeRedPublica)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeSinSaneamiento)), `<span class="data-calculated">${this.escapeHtml(porcentajeSinSaneamiento)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoServiciosDesagueDetalle(): string {
    if (this.datos.textoServiciosDesagueDetalle && this.datos.textoServiciosDesagueDetalle !== '____') {
      return this.datos.textoServiciosDesagueDetalle;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Por medio de las entrevistas aplicadas, se recolectó la información de que la institución responsable de la administración del servicio de desagüe por red pública y de su mantenimiento es, al igual que con el agua, la JASS ${grupoAISD}. Las excretas son destinadas a una poza de oxidación, ubicada fuera del entorno urbano del anexo ${grupoAISD}.`;
  }

  obtenerTextoServiciosDesagueDetalleConResaltado(): SafeHtml {
    const texto = this.obtenerTextoServiciosDesagueDetalle();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoDesechosSolidos1(): string {
    if (this.datos.textoDesechosSolidos1 && this.datos.textoDesechosSolidos1 !== '____') {
      return this.datos.textoDesechosSolidos1;
    }
    
    const distrito = this.datos.distritoSeleccionado || '____';
    
    return `La gestión de los desechos sólidos está a cargo de la Municipalidad Distrital de ${distrito}, aunque según los entrevistados, la recolección se realiza de manera mensual, en promedio. En ese sentido, no existe una fecha establecida en la que la municipalidad gestione los desechos sólidos. Adicional a ello, las limitaciones en cuanto a infraestructura adecuada para el tratamiento de desechos sólidos generan algunos retos en la gestión eficiente de los mismos.`;
  }

  obtenerTextoDesechosSolidos1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDesechosSolidos1();
    const distrito = this.datos.distritoSeleccionado || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(distrito)), `<span class="data-section">${this.escapeHtml(distrito)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoDesechosSolidos2(): string {
    if (this.datos.textoDesechosSolidos2 && this.datos.textoDesechosSolidos2 !== '____') {
      return this.datos.textoDesechosSolidos2;
    }
    
    return `Cuando los desechos sólidos son recolectados, estos son trasladados a un botadero cercano a la comunidad, donde se realiza su disposición final. La falta de un sistema más avanzado para el tratamiento de los residuos, como plantas de reciclaje o de tratamiento, dificulta el manejo integral de los desechos y plantea preocupaciones ambientales a largo plazo.`;
  }

  obtenerTextoDesechosSolidos3(): string {
    if (this.datos.textoDesechosSolidos3 && this.datos.textoDesechosSolidos3 !== '____') {
      return this.datos.textoDesechosSolidos3;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `Además, la comunidad enfrenta desafíos derivados de la acumulación de basura en ciertos puntos, especialmente en épocas en que la recolección es menos frecuente. Ante ello, la misma población acude al botadero para disponer sus residuos sólidos, puesto que está prohibida la incineración. Cabe mencionar que sí existen puntos dentro del anexo ${grupoAISD} en donde la población puede disponer sus desechos plásticos como botellas, aunque estos tampoco son recolectados frecuentemente por el personal de la municipalidad.`;
  }

  obtenerTextoDesechosSolidos3ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoDesechosSolidos3();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoElectricidad1(): string {
    if (this.datos.textoElectricidad1 && this.datos.textoElectricidad1 !== '____') {
      return this.datos.textoElectricidad1;
    }
    
    const porcentajeElectricidad = this.getPorcentajeElectricidad();
    const porcentajeSinElectricidad = this.getPorcentajeSinElectricidad();
    
    return `Se puede apreciar una amplia cobertura de alumbrado eléctrico en las viviendas de la comunidad campesina en cuestión. Según la plataforma REDINFORMA, se cuenta con los siguientes datos: el ${porcentajeElectricidad} de las viviendas cuenta con alumbrado eléctrico, mientras que el ${porcentajeSinElectricidad} restante no tiene el referido servicio.`;
  }

  obtenerTextoElectricidad1ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoElectricidad1();
    const porcentajeElectricidad = this.getPorcentajeElectricidad();
    const porcentajeSinElectricidad = this.getPorcentajeSinElectricidad();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeElectricidad)), `<span class="data-calculated">${this.escapeHtml(porcentajeElectricidad)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(porcentajeSinElectricidad)), `<span class="data-calculated">${this.escapeHtml(porcentajeSinElectricidad)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoElectricidad2(): string {
    if (this.datos.textoElectricidad2 && this.datos.textoElectricidad2 !== '____') {
      return this.datos.textoElectricidad2;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    const empresa = this.datos.empresaElectrica || '____';
    const costoMinimo = this.datos.costoElectricidadMinimo || '____';
    const costoMaximo = this.datos.costoElectricidadMaximo || '____';
    
    return `Adicionalmente, con las entrevistas semiestructuradas se pudo validar que la empresa responsable de la provisión del servicio eléctrico y su respectivo mantenimiento es ${empresa}. Asimismo, según los entrevistados, el costo promedio por este servicio ronda entre S/. ${costoMinimo} y S/. ${costoMaximo} de acuerdo al medidor de cada vivienda. Por otro lado, cabe mencionar que son pocas las familias dentro de la CC ${grupoAISD} que cuentan con vale FISE.`;
  }

  obtenerTextoElectricidad2ConResaltado(): SafeHtml {
    const texto = this.obtenerTextoElectricidad2();
    const grupoAISD = this.obtenerNombreComunidadActual();
    const empresa = this.datos.empresaElectrica || '____';
    const costoMinimo = this.datos.costoElectricidadMinimo || '____';
    const costoMaximo = this.datos.costoElectricidadMaximo || '____';
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(empresa)), `<span class="data-manual">${this.escapeHtml(empresa)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(costoMinimo)), `<span class="data-manual">${this.escapeHtml(costoMinimo)}</span>`)
      .replace(this.obtenerRegExp(this.escapeRegex(costoMaximo)), `<span class="data-manual">${this.escapeHtml(costoMaximo)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoEnergiaParaCocinar(): string {
    if (this.datos.textoEnergiaParaCocinar && this.datos.textoEnergiaParaCocinar !== '____') {
      return this.datos.textoEnergiaParaCocinar;
    }
    
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    return `En la CC ${grupoAISD}, el principal combustible utilizado para cocinar es la leña. Este recurso es ampliamente aprovechado por las familias, quienes lo obtienen y almacenan para su uso diario en la preparación de alimentos. La disponibilidad constante de leña hace que sea el combustible preferido debido a su bajo costo y fácil acceso, lo que contribuye a su uso extendido en los hogares de la comunidad. La costumbre de emplear leña también está vinculada a prácticas ancestrales, en las que se ha recurrido a los recursos locales para la subsistencia.\n\nDe manera complementaria, las familias también adquieren balones de gas (GLP) para cocinar, especialmente en situaciones puntuales o cuando tienen la posibilidad económica de acceder a este recurso. Sin embargo, el uso del gas sigue siendo limitado, puesto que su disponibilidad no está presente permanentemente, lo que hace que la mayoría de la población continúe dependiendo de los recursos naturales más accesibles, como la leña.`;
  }

  obtenerTextoEnergiaParaCocinarConResaltado(): SafeHtml {
    const texto = this.obtenerTextoEnergiaParaCocinar();
    const grupoAISD = this.obtenerNombreComunidadActual();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(grupoAISD)), `<span class="data-section">${this.escapeHtml(grupoAISD)}</span>`)
      .replace(/\n\n/g, '<br><br>');
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
  }

  obtenerTextoSeccion10ServiciosBasicosIntroConResaltado(): SafeHtml {
    const texto = this.obtenerTextoSeccion10ServiciosBasicosIntro();
    const viviendasOcupadas = this.getViviendasOcupadas();
    
    let textoConResaltado = texto
      .replace(this.obtenerRegExp(this.escapeRegex(viviendasOcupadas)), `<span class="data-section">${this.escapeHtml(viviendasOcupadas)}</span>`);
    
    return this.sanitizer.sanitize(1, textoConResaltado) as SafeHtml;
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

  /**
   * Recalcula porcentajes después de cargar datos del backend
   * Asegura que los porcentajes se calculen dinámicamente basados en los casos
   */
  protected override recalcularPorcentajesDelBackend(loadedData: { [fieldName: string]: any }): void {
    // Recalcular porcentajes para cada tabla que vino del backend
    if (loadedData['abastecimientoAguaTabla']) {
      this.tableService.calcularPorcentajes(this.datos, this.abastecimientoAguaConfig);
    }
    // Verificar tanto tiposSaneamientoTabla como saneamientoTabla
    if (loadedData['tiposSaneamientoTabla'] || loadedData['saneamientoTabla']) {
      this.tableService.calcularPorcentajes(this.datos, this.tiposSaneamientoConfig);
    }
    if (loadedData['alumbradoElectricoTabla']) {
      this.tableService.calcularPorcentajes(this.datos, this.coberturaElectricaConfig);
    }
  }
}
// Cache rebuild trigger - 2026-01-19



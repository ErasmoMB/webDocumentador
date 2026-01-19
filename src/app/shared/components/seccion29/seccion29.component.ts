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
import { SaludService } from 'src/app/core/services/salud.service';

@Component({
  selector: 'app-seccion29',
  templateUrl: './seccion29.component.html',
  styleUrls: ['./seccion29.component.css']
})
export class Seccion29Component extends AutoLoadSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.8';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  private readonly regexCache = new Map<string, RegExp>();
  
  override watchedFields: string[] = ['centroPobladoAISI', 'natalidadMortalidadCpTabla', 'morbilidadCpTabla', 'afiliacionSaludTabla', 'textoNatalidadCP1', 'textoNatalidadCP2', 'textoMorbilidadCP', 'textoAfiliacionSalud'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB18';
  
  fotografiasInstitucionalidadCache: any[] = [];

  natalidadMortalidadConfig: TableConfig = {
    tablaKey: 'natalidadMortalidadCpTabla',
    totalKey: 'anio',
    campoTotal: 'natalidad',
    campoPorcentaje: 'mortalidad',
    estructuraInicial: [{ anio: '', natalidad: 0, mortalidad: 0 }]
  };

  morbilidadConfig: TableConfig = {
    tablaKey: 'morbilidadCpTabla',
    totalKey: 'grupo',
    campoTotal: 'casos',
    campoPorcentaje: 'casos',
    estructuraInicial: [{ grupo: '', edad0_11: 0, edad12_17: 0, edad18_29: 0, edad30_59: 0, edad60_mas: 0, casos: 0 }]
  };

  afiliacionSaludConfig: TableConfig = {
    tablaKey: 'afiliacionSaludTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }],
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
    private saludService: SaludService
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
      this.stateSubscription = this.stateService.datos$.subscribe(() => {
        // Cargar datos de seguros cuando el CPP cambia
        if (this.datos.centroPobladoAISI) {
          this.cargarSegurosSalud();
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
    return 'seccion29_aisi';
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

  getTablaKeyNatalidadMortalidad(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `natalidadMortalidadCpTabla${prefijo}` : 'natalidadMortalidadCpTabla';
  }

  getTablaKeyMorbilidad(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `morbilidadCpTabla${prefijo}` : 'morbilidadCpTabla';
  }

  getTablaKeyAfiliacionSalud(): string {
    const prefijo = this.obtenerPrefijoGrupo();
    return prefijo ? `afiliacionSaludTabla${prefijo}` : 'afiliacionSaludTabla';
  }

  protected override tieneFotografias(): boolean {
    return true;
  }

  getNatalidad2023(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2023')
    );
    return item?.natalidad?.toString() || '____';
  }

  getNatalidad2024(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2024')
    );
    return item?.natalidad?.toString() || '____';
  }

  getMortalidad2023(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2023')
    );
    return item?.mortalidad?.toString() || '____';
  }

  getMortalidad2024(): string {
    if (!this.datos?.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return '____';
    }
    const item = this.datos.natalidadMortalidadCpTabla.find((item: any) => 
      item.anio && item.anio.toString().includes('2024')
    );
    return item?.mortalidad?.toString() || '____';
  }

  getCasosInfeccionesRespiratorias(): string {
    if (!this.datos?.morbilidadCpTabla || !Array.isArray(this.datos.morbilidadCpTabla)) {
      return '____';
    }
    const item = this.datos.morbilidadCpTabla.find((item: any) => 
      item.grupo && item.grupo.toLowerCase().includes('infecciones agudas') && item.grupo.toLowerCase().includes('respiratorias')
    );
    return item?.casos?.toString() || '____';
  }

  getCasosObesidad(): string {
    if (!this.datos?.morbilidadCpTabla || !Array.isArray(this.datos.morbilidadCpTabla)) {
      return '____';
    }
    const item = this.datos.morbilidadCpTabla.find((item: any) => 
      item.grupo && item.grupo.toLowerCase().includes('obesidad')
    );
    return item?.casos?.toString() || '____';
  }

  getPorcentajeSIS(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('sis') || item.categoria.toLowerCase().includes('integral'))
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeESSALUD(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('essalud')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinSeguro(): string {
    if (!this.datos?.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return '____';
    }
    const item = this.datos.afiliacionSaludTabla.find((item: any) => 
      item.categoria && (item.categoria.toLowerCase().includes('ningún') || item.categoria.toLowerCase().includes('ninguno') || item.categoria.toLowerCase().includes('sin seguro'))
    );
    return item?.porcentaje || '____';
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

  onMorbilidadFieldChange(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.morbilidadConfig, index, field, value, false);
    if (field !== 'casos' && field !== 'grupo') {
      this.calcularTotalesMorbilidadCP();
    }
    this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
  }

  onMorbilidadTableUpdated() {
    this.calcularTotalesMorbilidadCP();
    this.formularioService.actualizarDato('morbilidadCpTabla', this.datos['morbilidadCpTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularTotalesMorbilidadCP() {
    if (!this.datos['morbilidadCpTabla'] || this.datos['morbilidadCpTabla'].length === 0) {
      return;
    }
    this.datos['morbilidadCpTabla'].forEach((item: any) => {
      const edad0_11 = parseFloat(item.edad0_11) || 0;
      const edad12_17 = parseFloat(item.edad12_17) || 0;
      const edad18_29 = parseFloat(item.edad18_29) || 0;
      const edad30_59 = parseFloat(item.edad30_59) || 0;
      const edad60_mas = parseFloat(item.edad60_mas) || 0;
      const total = edad0_11 + edad12_17 + edad18_29 + edad30_59 + edad60_mas;
      item.casos = total;
    });
  }

  // Métodos para natalidadMortalidadCpTabla
  getNatalidadMortalidadSinTotal() {
    if (!this.datos.natalidadMortalidadCpTabla || !Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      return [];
    }
    return this.datos.natalidadMortalidadCpTabla.filter((item: any) => 
      !item.anio || item.anio.toString().toLowerCase() !== 'total'
    );
  }

  getTotalNatalidadMortalidad() {
    const sinTotal = this.getNatalidadMortalidadSinTotal();
    const totalNatalidad = sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.natalidad) || 0), 0);
    const totalMortalidad = sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.mortalidad) || 0), 0);
    return {
      anio: 'Total',
      natalidad: totalNatalidad,
      mortalidad: totalMortalidad
    };
  }

  // Métodos para morbilidadCpTabla
  getMorbilidadSinTotal() {
    if (!this.datos.morbilidadCpTabla || !Array.isArray(this.datos.morbilidadCpTabla)) {
      return [];
    }
    return this.datos.morbilidadCpTabla.filter((item: any) => 
      !item.grupo || item.grupo.toString().toLowerCase() !== 'total'
    );
  }

  getTotalMorbilidadRango0_11() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.edad0_11) || 0), 0);
  }

  getTotalMorbilidadRango12_17() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.edad12_17) || 0), 0);
  }

  getTotalMorbilidadRango18_29() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.edad18_29) || 0), 0);
  }

  getTotalMorbilidadRango30_59() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.edad30_59) || 0), 0);
  }

  getTotalMorbilidadRango60_mas() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.edad60_mas) || 0), 0);
  }

  getTotalMorbilidadCasos() {
    const sinTotal = this.getMorbilidadSinTotal();
    return sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.casos) || 0), 0);
  }

  // Métodos para afiliacionSaludTabla
  getAfiliacionSaludSinTotal() {
    if (!this.datos.afiliacionSaludTabla || !Array.isArray(this.datos.afiliacionSaludTabla)) {
      return [];
    }
    return this.datos.afiliacionSaludTabla.filter((item: any) => 
      !item.categoria || item.categoria.toString().toLowerCase() !== 'total'
    );
  }

  getTotalAfiliacionSalud() {
    const sinTotal = this.getAfiliacionSaludSinTotal();
    const totalCasos = sinTotal.reduce((sum: number, item: any) => sum + (parseFloat(item.casos) || 0), 0);
    return {
      categoria: 'Total',
      casos: totalCasos,
      porcentaje: '100,00 %'
    };
  }

  calcularPorcentajeAfiliacion(item: any): string {
    const total = this.getTotalAfiliacionSalud().casos;
    if (total === 0 || !item.casos) return '____';
    const porcentaje = ((item.casos / total) * 100).toFixed(2).replace('.', ',');
    return `${porcentaje} %`;
  }

  eliminarFilasTotal() {
    if (this.datos.natalidadMortalidadCpTabla && Array.isArray(this.datos.natalidadMortalidadCpTabla)) {
      this.datos.natalidadMortalidadCpTabla = this.datos.natalidadMortalidadCpTabla.filter((item: any) => 
        !item.anio || item.anio.toString().toLowerCase() !== 'total'
      );
    }
    if (this.datos.morbilidadCpTabla && Array.isArray(this.datos.morbilidadCpTabla)) {
      this.datos.morbilidadCpTabla = this.datos.morbilidadCpTabla.filter((item: any) => 
        !item.grupo || item.grupo.toString().toLowerCase() !== 'total'
      );
    }
    if (this.datos.afiliacionSaludTabla && Array.isArray(this.datos.afiliacionSaludTabla)) {
      this.datos.afiliacionSaludTabla = this.datos.afiliacionSaludTabla.filter((item: any) => 
        !item.categoria || item.categoria.toString().toLowerCase() !== 'total'
      );
    }
  }

  obtenerTextoNatalidadCP1(): string {
    if (this.datos.textoNatalidadCP1 && this.datos.textoNatalidadCP1 !== '____') {
      return this.datos.textoNatalidadCP1;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const natalidad2023 = this.getNatalidad2023();
    const natalidad2024 = this.getNatalidad2024();
    
    return `Este ítem proporciona una visión crucial de la dinámica demográfica, reflejando las tendencias de crecimiento poblacional. Los datos obtenidos del trabajo de campo del Puesto de Salud ${centroPoblado} indican que, durante el año 2023, se registró un total de ${natalidad2023} nacimientos. Para el año 2024 (hasta el 14 de noviembre), se registró únicamente ${natalidad2024} nacimiento.`;
  }

  obtenerTextoNatalidadCP2(): string {
    if (this.datos.textoNatalidadCP2 && this.datos.textoNatalidadCP2 !== '____') {
      return this.datos.textoNatalidadCP2;
    }
    
    const mortalidad2023 = this.getMortalidad2023();
    const mortalidad2024 = this.getMortalidad2024();
    
    return `Respecto a la mortalidad, se puede observar que el número de defunciones en la localidad fue de ${mortalidad2023} durante el año 2023. Sin embargo, para el año 2024, sí se registró ${mortalidad2024} defunción.`;
  }

  obtenerTextoMorbilidadCP(): string {
    if (this.datos.textoMorbilidadCP && this.datos.textoMorbilidadCP !== '____') {
      return this.datos.textoMorbilidadCP;
    }
    
    const distrito = this.datos.distritoSeleccionado || 'Cahuacho';
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const casosInfecciones = this.getCasosInfeccionesRespiratorias();
    const casosObesidad = this.getCasosObesidad();
    
    return `Entre los grupos de morbilidad que se hallan a nivel distrital de ${distrito} (jurisdicción que abarca al Puesto de Salud ${centroPoblado}), para el año 2023, los más frecuentes fueron las infecciones agudas de las vías respiratorias superiores (${casosInfecciones} casos) y la obesidad y otros de hiperalimentación (${casosObesidad} casos). Para el primero, se reportó un mayor número de casos en el grupo etario de 0 a 11 años, mientras que para el segundo, la mayor cantidad se halló en el rango de 30 a 59 años. A continuación, se presenta el cuadro con el número de casos por grupo de morbilidad y bloque etario dentro del distrito, según el portal REUNIS del MINSA.`;
  }

  obtenerTextoAfiliacionSalud(): string {
    if (this.datos.textoAfiliacionSalud && this.datos.textoAfiliacionSalud !== '____') {
      return this.datos.textoAfiliacionSalud;
    }
    
    const centroPoblado = this.datos.centroPobladoAISI || 'Cahuacho';
    const porcentajeSIS = this.getPorcentajeSIS();
    const porcentajeESSALUD = this.getPorcentajeESSALUD();
    const porcentajeSinSeguro = this.getPorcentajeSinSeguro();
    
    return `En el CP ${centroPoblado}, la mayor parte de los habitantes se encuentra afiliada a algún tipo de seguro de salud. Es así que el grupo mayoritario corresponde al Seguro Integral de Salud (SIS), el cual representa el ${porcentajeSIS} de la población. En menor medida, se halla la afiliación a ESSALUD, que representa el ${porcentajeESSALUD} de la población. Por último, cabe mencionar que el ${porcentajeSinSeguro} de la población no cuenta con ningún tipo de seguro de salud.`;
  }

  cargarSegurosSalud(): void {
    const cpp = this.datos.centroPobladoAISI;
    if (!cpp) {
      return; // No hay CPP
    }

    this.saludService.obtenerSeguroSaludPorCpp(cpp).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          this.datos.afiliacionSaludTabla = response.data;
          this.cdRef.detectChanges();
        }
      },
      error: (error: any) => {
      }
    });
  }

  cargarSegurosSaludGrupo(cpps: string[]): void {
    if (!cpps || cpps.length === 0) {
      return;
    }

    this.saludService.obtenerSeguroSaludMultiples(cpps).subscribe({
      next: (response: any) => {
        if (response?.success && response?.data) {
          // Si el CPP actual está en los datos, cargar para la tabla actual
          const cppActual = this.datos.centroPobladoAISI;
          if (cppActual && response.data[cppActual]) {
            this.datos.afiliacionSaludTabla = response.data[cppActual];
            this.cdRef.detectChanges();
          }
        }
      },
      error: (error: any) => {
      }
    });
  }

  onNatalidadMortalidadTableUpdated(): void {
    const tabla = this.datos.natalidadMortalidadCpTabla || [];
    this.datos.natalidadMortalidadCpTabla = [...tabla];
    this.formularioService.actualizarDato('natalidadMortalidadCpTabla', tabla);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  onAfiliacionSaludFieldChange(index: number, field: string, value: any): void {
    const tabla = this.datos.afiliacionSaludTabla || [];
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
      }
      
      this.datos.afiliacionSaludTabla = [...tabla];
      this.formularioService.actualizarDato('afiliacionSaludTabla', tabla);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  onAfiliacionSaludTableUpdated(): void {
    const tabla = this.datos.afiliacionSaludTabla || [];
    this.datos.afiliacionSaludTabla = [...tabla];
    this.formularioService.actualizarDato('afiliacionSaludTabla', tabla);
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
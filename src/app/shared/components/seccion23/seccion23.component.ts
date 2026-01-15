import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion23',
  templateUrl: './seccion23.component.html',
  styleUrls: ['./seccion23.component.css']
})
export class Seccion23Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'distritoSeleccionado', 'petGruposEdadAISI', 'peaDistritoSexoTabla', 'peaOcupadaDesocupadaTabla', 'poblacionDistritalAISI', 'petDistritalAISI', 'ingresoPerCapitaAISI', 'rankingIngresoAISI'];
  
  override readonly PHOTO_PREFIX = 'fotografiaPEA';
  
  fotografiasInstitucionalidadCache: any[] = [];

  petGruposEdadConfig: TableConfig = {
    tablaKey: 'petGruposEdadAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  peaDistritoSexoConfig: TableConfig = {
    tablaKey: 'peaDistritoSexoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: false,
    camposParaCalcular: []
  };

  peaOcupadaDesocupadaConfig: TableConfig = {
    tablaKey: 'peaOcupadaDesocupadaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [
      { categoria: '', hombres: 0, porcentajeHombres: '0,00 %', mujeres: 0, porcentajeMujeres: '0,00 %', casos: 0, porcentaje: '0,00 %' }
    ],
    calcularPorcentajes: false,
    camposParaCalcular: []
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService,
    private stateService: StateService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
  }

  protected override onInitCustom(): void {
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
        this.cargarFotografias();
        this.cdRef.detectChanges();
      });
    }
  }

  ngOnDestroy() {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
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

  protected override tieneFotografias(): boolean {
    return true;
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  override actualizarFotografiasFormMulti() {
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

  onFotografiasPEAChange(fotografias: FotoItem[]) {
    this.onGrupoFotografiasChange(this.PHOTO_PREFIX, fotografias);
    this.fotografiasFormMulti = [...fotografias];
    this.fotografiasCache = [...fotografias];
  }


  getPorcentajePET(): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const totalItem = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    if (!totalItem) {
      return '____';
    }
    const totalPET = totalItem.casos;
    const totalPoblacion = this.datos?.poblacionSexoAISI?.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    )?.casos || 160;
    if (!totalPoblacion || totalPoblacion === 0) {
      return '____';
    }
    const porcentaje = ((totalPET / totalPoblacion) * 100).toFixed(2);
    return porcentaje + ' %';
  }

  getPorcentajeGrupoPET(categoria: string): string {
    if (!this.datos?.petGruposEdadAISI || !Array.isArray(this.datos.petGruposEdadAISI)) {
      return '____';
    }
    const item = this.datos.petGruposEdadAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  getPoblacionDistrital(): string {
    return this.datos?.poblacionDistritalAISI || '610';
  }

  obtenerTextoPEAAISI(): string {
    return this.datos.textoPEAAISI || '';
  }

  getPETDistrital(): string {
    return this.datos?.petDistritalAISI || '461';
  }

  getPorcentajePEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('pea') && !item.categoria.toLowerCase().includes('no')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresNoPEA(): string {
    if (!this.datos?.peaDistritoSexoTabla || !Array.isArray(this.datos.peaDistritoSexoTabla)) {
      return '____';
    }
    const item = this.datos.peaDistritoSexoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('no pea')
    );
    return item?.porcentajeMujeres || '____';
  }

  getIngresoPerCapita(): string {
    return this.datos?.ingresoPerCapitaAISI || '391,06';
  }

  getRankingIngreso(): string {
    return this.datos?.rankingIngresoAISI || '1191';
  }

  getPorcentajeDesempleo(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('desocupada')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombresOcupados(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeHombres || '____';
  }

  getPorcentajeMujeresOcupadas(): string {
    if (!this.datos?.peaOcupadaDesocupadaTabla || !Array.isArray(this.datos.peaOcupadaDesocupadaTabla)) {
      return '____';
    }
    const item = this.datos.peaOcupadaDesocupadaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('ocupada')
    );
    return item?.porcentajeMujeres || '____';
  }

  // Eliminar métodos de cache y eventos de cambio de fotos

  override getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    return this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }


  inicializarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      this.datos['petGruposEdadAISI'] = [
        { categoria: '', casos: 0, porcentaje: '0,00 %' }
      ];
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.cdRef.detectChanges();
    }
  }

  agregarPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    this.datos['petGruposEdadAISI'].push({ categoria: '', casos: 0, porcentaje: '0,00 %' });
    this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
    this.calcularPorcentajesPETGruposEdadAISI();
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPETGruposEdadAISI(index: number) {
    if (this.datos['petGruposEdadAISI'] && this.datos['petGruposEdadAISI'].length > 1) {
      const item = this.datos['petGruposEdadAISI'][index];
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        this.datos['petGruposEdadAISI'].splice(index, 1);
        this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
        this.calcularPorcentajesPETGruposEdadAISI();
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarPETGruposEdadAISI(index: number, field: string, value: any) {
    if (!this.datos['petGruposEdadAISI']) {
      this.inicializarPETGruposEdadAISI();
    }
    if (this.datos['petGruposEdadAISI'][index]) {
      this.datos['petGruposEdadAISI'][index][field] = value;
      if (field === 'casos') {
        this.calcularPorcentajesPETGruposEdadAISI();
      }
      this.formularioService.actualizarDato('petGruposEdadAISI', this.datos['petGruposEdadAISI']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  calcularPorcentajesPETGruposEdadAISI() {
    if (!this.datos['petGruposEdadAISI'] || this.datos['petGruposEdadAISI'].length === 0) {
      return;
    }
    const totalItem = this.datos['petGruposEdadAISI'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const total = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    if (total > 0) {
      this.datos['petGruposEdadAISI'].forEach((item: any) => {
        if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
          const casos = parseFloat(item.casos) || 0;
          const porcentaje = ((casos / total) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      });
    }
  }

  inicializarPEADistritoSexo() {
    this.tableService.inicializarTabla(this.datos, this.peaDistritoSexoConfig);
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.cdRef.detectChanges();
  }

  agregarPEADistritoSexo() {
    this.tableService.agregarFila(this.datos, this.peaDistritoSexoConfig);
    this.calcularPorcentajesPEADistritoSexo();
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPEADistritoSexo(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.peaDistritoSexoConfig, index);
    if (deleted) {
      this.calcularPorcentajesPEADistritoSexo();
      this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEADistritoSexo(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.peaDistritoSexoConfig, index, field, value, false);
    if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
      this.calcularPorcentajesPEADistritoSexo();
    }
    this.formularioService.actualizarDato('peaDistritoSexoTabla', this.datos['peaDistritoSexoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEADistritoSexo() {
    if (!this.datos['peaDistritoSexoTabla'] || this.datos['peaDistritoSexoTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaDistritoSexoTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaDistritoSexoTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }

  inicializarPEAOcupadaDesocupada() {
    this.tableService.inicializarTabla(this.datos, this.peaOcupadaDesocupadaConfig);
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.cdRef.detectChanges();
  }

  agregarPEAOcupadaDesocupada() {
    this.tableService.agregarFila(this.datos, this.peaOcupadaDesocupadaConfig);
    this.calcularPorcentajesPEAOcupadaDesocupada();
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarPEAOcupadaDesocupada(index: number) {
    const deleted = this.tableService.eliminarFila(this.datos, this.peaOcupadaDesocupadaConfig, index);
    if (deleted) {
      this.calcularPorcentajesPEAOcupadaDesocupada();
      this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarPEAOcupadaDesocupada(index: number, field: string, value: any) {
    this.tableService.actualizarFila(this.datos, this.peaOcupadaDesocupadaConfig, index, field, value, false);
    if (field === 'hombres' || field === 'mujeres' || field === 'casos') {
      this.calcularPorcentajesPEAOcupadaDesocupada();
    }
    this.formularioService.actualizarDato('peaOcupadaDesocupadaTabla', this.datos['peaOcupadaDesocupadaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  calcularPorcentajesPEAOcupadaDesocupada() {
    if (!this.datos['peaOcupadaDesocupadaTabla'] || this.datos['peaOcupadaDesocupadaTabla'].length === 0) {
      return;
    }
    const totalItem = this.datos['peaOcupadaDesocupadaTabla'].find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total')
    );
    const totalHombres = totalItem ? parseFloat(totalItem.hombres) || 0 : 0;
    const totalMujeres = totalItem ? parseFloat(totalItem.mujeres) || 0 : 0;
    const totalCasos = totalItem ? parseFloat(totalItem.casos) || 0 : 0;
    
    this.datos['peaOcupadaDesocupadaTabla'].forEach((item: any) => {
      if (!item.categoria || !item.categoria.toLowerCase().includes('total')) {
        const hombres = parseFloat(item.hombres) || 0;
        const mujeres = parseFloat(item.mujeres) || 0;
        const casos = parseFloat(item.casos) || 0;
        
        if (totalHombres > 0) {
          const porcentajeHombres = ((hombres / totalHombres) * 100).toFixed(2);
          item.porcentajeHombres = porcentajeHombres + ' %';
        }
        if (totalMujeres > 0) {
          const porcentajeMujeres = ((mujeres / totalMujeres) * 100).toFixed(2);
          item.porcentajeMujeres = porcentajeMujeres + ' %';
        }
        if (totalCasos > 0) {
          const porcentaje = ((casos / totalCasos) * 100).toFixed(2);
          item.porcentaje = porcentaje + ' %';
        }
      }
    });
  }
}


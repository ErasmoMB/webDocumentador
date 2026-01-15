import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion29',
  templateUrl: './seccion29.component.html',
  styleUrls: ['./seccion29.component.css']
})
export class Seccion29Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '3.1.4.B.1.8';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'natalidadMortalidadCpTabla', 'morbilidadCpTabla', 'afiliacionSaludTabla'];
  
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

  obtenerTextoNatalidadCP1(): string {
    return this.datos.textoNatalidadCP1 || '';
  }

  obtenerTextoNatalidadCP2(): string {
    return this.datos.textoNatalidadCP2 || '';
  }

  obtenerTextoMorbilidadCP(): string {
    return this.datos.textoMorbilidadCP || '';
  }
}


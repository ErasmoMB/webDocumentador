import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion22',
  templateUrl: './seccion22.component.html',
  styleUrls: ['./seccion22.component.css']
})
export class Seccion22Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  fotografiasInstitucionalidadCache: any[] = [];
  override watchedFields: string[] = ['centroPobladoAISI', 'poblacionSexoAISI', 'poblacionEtarioAISI'];
  
  readonly PHOTO_PREFIX_CAHUACHO_B11 = 'fotografiaCahuachoB11';
  
  fotografiasCahuachoB11FormMulti: FotoItem[] = [];
  
  override readonly PHOTO_PREFIX = '';

  poblacionSexoAISIConfig: TableConfig = {
    tablaKey: 'poblacionSexoAISI',
    totalKey: 'sexo',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ sexo: '', casos: 0, porcentaje: '0,00 %' }]
  };

  poblacionEtarioAISIConfig: TableConfig = {
    tablaKey: 'poblacionEtarioAISI',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0,00 %' }]
  };

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef,
    private tableService: TableManagementService
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
    this.actualizarFotografiasFormMulti();
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
    this.actualizarFotografiasCache();
  }

  protected override actualizarValoresConPrefijo(): void {
    const centroPobladoAISI = PrefijoHelper.obtenerValorConPrefijo(this.datos, 'centroPobladoAISI', this.seccionId);
    this.datos.centroPobladoAISI = centroPobladoAISI || null;
    this.datosAnteriores.centroPobladoAISI = centroPobladoAISI || null;
  }

  protected override tieneFotografias(): boolean {
    return false;
  }

  getTotalPoblacion(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const totalItem = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('total')
    );
    return totalItem?.casos?.toString() || '____';
  }

  getPorcentajeMujeres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('mujer')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHombres(): string {
    if (!this.datos?.poblacionSexoAISI || !Array.isArray(this.datos.poblacionSexoAISI)) {
      return '____';
    }
    const item = this.datos.poblacionSexoAISI.find((item: any) => 
      item.sexo && item.sexo.toLowerCase().includes('hombre')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeGrupoEtario(categoria: string): string {
    if (!this.datos?.poblacionEtarioAISI || !Array.isArray(this.datos.poblacionEtarioAISI)) {
      return '____';
    }
    const item = this.datos.poblacionEtarioAISI.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes(categoria.toLowerCase())
    );
    return item?.porcentaje || '____';
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasVista(): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.1');
    return this.imageService.loadImages(
      '3.1.4.B.1.1',
      this.PHOTO_PREFIX_CAHUACHO_B11,
      groupPrefix
    );
  }

  override actualizarFotografiasFormMulti() {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.1');
    this.fotografiasCahuachoB11FormMulti = this.imageService.loadImages(
      '3.1.4.B.1.1',
      this.PHOTO_PREFIX_CAHUACHO_B11,
      groupPrefix
    );
  }

  protected override onChangesCustom(changes: any): void {
    if (changes['seccionId']) {
      this.actualizarFotografiasFormMulti();
    }
  }

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix('3.1.4.B.1.1');
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_CAHUACHO_B11}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_CAHUACHO_B11}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX_CAHUACHO_B11}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  obtenerTextoDemografiaAISI(): string {
    return this.datos.textoDemografiaAISI || '';
  }
}


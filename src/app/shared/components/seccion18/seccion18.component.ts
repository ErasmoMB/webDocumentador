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
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'nbiCCAyrocaTabla', 'nbiDistritoCahuachoTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaNBI';

  nbiCCAyrocaConfig: TableConfig = {
    tablaKey: 'nbiCCAyrocaTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
    calcularPorcentajes: true,
    camposParaCalcular: ['casos']
  };

  nbiDistritoCahuachoConfig: TableConfig = {
    tablaKey: 'nbiDistritoCahuachoTabla',
    totalKey: 'categoria',
    campoTotal: 'casos',
    campoPorcentaje: 'porcentaje',
    estructuraInicial: [{ categoria: '', casos: 0, porcentaje: '0%' }],
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
    if (!this.modoFormulario) {
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
    const grupoAISDActual = PrefijoHelper.obtenerValorConPrefijo(datosActuales, 'grupoAISD', this.seccionId);
    const grupoAISDAnterior = this.datosAnteriores.grupoAISD || null;
    const grupoAISDEnDatos = this.datos.grupoAISD || null;
    
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
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

  getTotalPersonasCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  getPorcentajeHacinamientoCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeSinServiciosCC(): string {
    if (!this.datos?.nbiCCAyrocaTabla || !Array.isArray(this.datos.nbiCCAyrocaTabla)) {
      return '____';
    }
    const item = this.datos.nbiCCAyrocaTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getTotalUnidadesDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const totalItem = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('total referencial')
    );
    return totalItem?.casos || '____';
  }

  obtenerTextoNecesidadesBasicasInsatisfechas(): string {
    return this.datos.textoNecesidadesBasicasInsatisfechas || '';
  }

  getPorcentajeSinServiciosDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('sin servicios higiénicos')
    );
    return item?.porcentaje || '____';
  }

  getPorcentajeHacinamientoDistrito(): string {
    if (!this.datos?.nbiDistritoCahuachoTabla || !Array.isArray(this.datos.nbiDistritoCahuachoTabla)) {
      return '____';
    }
    const item = this.datos.nbiDistritoCahuachoTabla.find((item: any) => 
      item.categoria && item.categoria.toLowerCase().includes('hacinamiento')
    );
    return item?.porcentaje || '____';
  }

  getFotografiasNBIVista(): FotoItem[] {
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
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.imageService.saveImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      fotografias,
      groupPrefix
    );
    this.fotografiasCache = [...fotografias];
    this.fotografiasFormMulti = [...fotografias];
    this.cdRef.detectChanges();
  }

}


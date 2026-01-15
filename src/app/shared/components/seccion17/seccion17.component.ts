import { Component, ChangeDetectorRef, Input, OnDestroy } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { TableManagementService, TableConfig } from 'src/app/core/services/table-management.service';
import { StateService } from 'src/app/core/services/state.service';
import { Subscription } from 'rxjs';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion17',
  templateUrl: './seccion17.component.html',
  styleUrls: ['./seccion17.component.css']
})
export class Seccion17Component extends BaseSectionComponent implements OnDestroy {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  private stateSubscription?: Subscription;
  
  override watchedFields: string[] = ['distritoSeleccionado', 'indiceDesarrolloHumanoTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaIDH';

  indiceDesarrolloHumanoConfig: TableConfig = {
    tablaKey: 'indiceDesarrolloHumanoTabla',
    totalKey: 'poblacion',
    campoTotal: 'poblacion',
    campoPorcentaje: 'idh',
    estructuraInicial: [{ poblacion: 0, rankIdh1: 0, idh: '0.000', rankEsperanza: 0, esperanzaVida: '0.0', rankEducacion1: 0, educacion: '0.0%', rankEducacion2: 0, anosEducacion: '0.0', rankAnios: 0, ingreso: '0.0', rankIngreso: 0 }]
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
    let hayCambios = false;
    
    for (const campo of this.watchedFields) {
      const valorActual = (datosActuales as any)[campo] || null;
      const valorAnterior = this.datosAnteriores[campo] || null;
      if (JSON.stringify(valorActual) !== JSON.stringify(valorAnterior)) {
        hayCambios = true;
        this.datosAnteriores[campo] = JSON.parse(JSON.stringify(valorActual));
      }
    }
    
    return hayCambios;
  }

  protected override actualizarValoresConPrefijo(): void {
  }

  getIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.idh || '____';
  }

  getRankIDH(): string {
    if (!this.datos?.indiceDesarrolloHumanoTabla || !Array.isArray(this.datos.indiceDesarrolloHumanoTabla) || this.datos.indiceDesarrolloHumanoTabla.length === 0) {
      return '____';
    }
    const item = this.datos.indiceDesarrolloHumanoTabla[0];
    return item?.rankIdh || item?.rankEsperanza || '____';
  }

  getFotografiasIDHVista(): FotoItem[] {
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

  obtenerTextoIndiceDesarrolloHumano(): string {
    return this.datos.textoIndiceDesarrolloHumano || '';
  }
}


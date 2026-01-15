import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Input, Directive } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from './image-upload/image-upload.component';

@Directive()
export abstract class BaseSectionComponent implements OnInit, OnChanges, DoCheck {
  @Input() seccionId: string = '';
  @Input() modoFormulario: boolean = false;
  
  datos: any = {};
  protected datosAnteriores: any = {};
  watchedFields: string[] = [];
  
  fotografiasCache: FotoItem[] = [];
  fotografiasFormMulti: FotoItem[] = [];
  readonly PHOTO_PREFIX: string = '';

  protected constructor(
    protected formularioService: FormularioService,
    protected fieldMapping: FieldMappingService,
    protected sectionDataLoader: SectionDataLoaderService,
    protected imageService: ImageManagementService,
    protected photoNumberingService: PhotoNumberingService | null,
    protected cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.actualizarDatos();
    this.loadSectionData();
    if (this.tieneFotografias()) {
      this.actualizarFotografiasFormMulti();
    }
    this.onInitCustom();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seccionId']) {
      this.actualizarDatos();
      this.loadSectionData();
      if (this.tieneFotografias()) {
        this.actualizarFotografiasFormMulti();
      }
    }
    this.onChangesCustom(changes);
  }

  ngDoCheck(): void {
    if (this.detectarCambios()) {
      this.actualizarDatos();
      if (this.tieneFotografias()) {
        this.actualizarFotografiasCache();
      }
      this.cdRef.markForCheck();
    }
  }

  protected actualizarDatos(): void {
    const datosNuevos = this.formularioService.obtenerDatos();
    this.datos = { ...datosNuevos };
    this.actualizarValoresConPrefijo();
    this.actualizarDatosCustom();
    this.cdRef.detectChanges();
  }

  protected loadSectionData(): void {
    const fieldsToLoad = this.fieldMapping.getFieldsForSection(this.seccionId);
    if (fieldsToLoad.length > 0) {
      this.sectionDataLoader.loadSectionData(this.seccionId, fieldsToLoad).subscribe();
    }
  }

  protected obtenerValorConPrefijo(campo: string): any {
    return PrefijoHelper.obtenerValorConPrefijo(this.datos, campo, this.seccionId);
  }

  protected obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  protected actualizarFotografiasCache(): void {
    if (!this.PHOTO_PREFIX) return;
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasCache = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected actualizarFotografiasFormMulti(): void {
    if (!this.PHOTO_PREFIX) return;
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    this.fotografiasFormMulti = this.imageService.loadImages(
      this.seccionId,
      this.PHOTO_PREFIX,
      groupPrefix
    );
  }

  protected getDataSourceType(fieldName: string): 'manual' | 'automatic' | 'section' {
    return this.fieldMapping.getDataSourceType(fieldName);
  }

  protected onFieldChange(fieldId: string, value: any): void {
    let valorLimpio = '';
    if (value !== undefined && value !== null && value !== 'undefined') {
      valorLimpio = value;
    }
    this.formularioService.actualizarDato(fieldId as any, valorLimpio);
    this.actualizarDatos();
  }

  protected abstract detectarCambios(): boolean;
  protected abstract actualizarValoresConPrefijo(): void;
  
  protected tieneFotografias(): boolean {
    return !!this.PHOTO_PREFIX;
  }

  protected onInitCustom(): void {
    // Hook para lógica personalizada en ngOnInit
  }

  protected onChangesCustom(changes: SimpleChanges): void {
    // Hook para lógica personalizada en ngOnChanges
  }

  protected actualizarDatosCustom(): void {
    // Hook para lógica personalizada en actualizarDatos
  }
}

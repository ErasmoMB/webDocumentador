import { OnInit, OnChanges, SimpleChanges, DoCheck, ChangeDetectorRef, Input, Directive } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { FotoItem } from './image-upload/image-upload.component';
import { PhotoGroupConfig } from '../utils/photo-group-config';

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
  
  protected photoGroups: Map<string, FotoItem[]> = new Map();
  protected photoGroupsConfig: PhotoGroupConfig[] = [];

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
    if (changes['modoFormulario'] && !this.modoFormulario) {
      if (this.tieneFotografias()) {
        this.actualizarFotografiasCache();
        this.actualizarFotografiasFormMulti();
      }
      this.cdRef.detectChanges();
    }
    this.onChangesCustom(changes);
  }

  ngDoCheck(): void {
    if (this.detectarCambios()) {
      this.actualizarDatos();
      if (this.tieneFotografias()) {
        this.actualizarFotografiasCache();
        if (this.modoFormulario) {
          this.actualizarFotografiasFormMulti();
        }
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

  protected getDataSourceType(fieldName: string): 'manual' | 'section' | 'backend' {
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

  protected getPhotoGroup(prefix: string): FotoItem[] {
    if (!this.photoGroups.has(prefix)) {
      this.photoGroups.set(prefix, []);
    }
    return this.photoGroups.get(prefix)!;
  }

  protected setPhotoGroup(prefix: string, fotografias: FotoItem[]): void {
    this.photoGroups.set(prefix, [...fotografias]);
  }

  protected cargarGrupoFotografias(prefix: string): FotoItem[] {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    const fotos = this.imageService.loadImages(
      this.seccionId,
      prefix,
      groupPrefix
    );
    return fotos;
  }

  protected guardarGrupoFotografias(prefix: string, fotografias: FotoItem[]): void {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    
    const fotosConNumeros = fotografias.map((foto, index) => {
      if (!foto.numero || foto.numero === '') {
        const numeroGlobal = this.photoNumberingService?.getGlobalPhotoNumber(
          this.seccionId,
          index + 1,
          prefix,
          groupPrefix
        ) || '';
        return { ...foto, numero: numeroGlobal };
      }
      return foto;
    });
    
    this.imageService.saveImages(
      this.seccionId,
      prefix,
      fotosConNumeros,
      groupPrefix
    );
    this.setPhotoGroup(prefix, fotosConNumeros);
  }

  protected cargarTodosLosGrupos(): void {
    if (this.photoGroupsConfig.length === 0) {
      return;
    }
    this.photoGroupsConfig.forEach(config => {
      try {
        const fotos = this.cargarGrupoFotografias(config.prefix);
        this.setPhotoGroup(config.prefix, fotos);
      } catch (error) {
        console.error(`[BaseSection] ❌ Error cargando grupo "${config.prefix}":`, error);
      }
    });
  }

  protected onGrupoFotografiasChange(prefix: string, fotografias: FotoItem[]): void {
    try {
      this.guardarGrupoFotografias(prefix, fotografias);
      this.cdRef.detectChanges();
    } catch (error) {
      console.error(`[BaseSection] ❌ Error actualizando grupo "${prefix}":`, error);
    }
  }

  protected getFotografiasVista(prefix: string): FotoItem[] {
    const fotos = this.getPhotoGroup(prefix);
    if (fotos.length === 0 && !this.modoFormulario) {
      const fotosCargadas = this.cargarGrupoFotografias(prefix);
      this.setPhotoGroup(prefix, fotosCargadas);
      return fotosCargadas;
    }
    return fotos;
  }

  protected getFotografiasFormMulti(prefix: string): FotoItem[] {
    return this.getPhotoGroup(prefix);
  }
}

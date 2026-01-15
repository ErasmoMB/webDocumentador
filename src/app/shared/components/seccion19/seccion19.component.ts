import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PhotoNumberingService } from 'src/app/core/services/photo-numbering.service';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion19',
  templateUrl: './seccion19.component.html',
  styleUrls: ['./seccion19.component.css']
})
export class Seccion19Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'comunerosCalificados', 'autoridades'];
  
  override readonly PHOTO_PREFIX = 'fotografiaOrganizacionSocial';

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    photoNumberingService: PhotoNumberingService,
    cdRef: ChangeDetectorRef
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, photoNumberingService, cdRef);
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

  override obtenerPrefijoGrupo(): string {
    return PrefijoHelper.obtenerPrefijoGrupo(this.seccionId);
  }

  getFotografiasOrganizacionSocialVista(): FotoItem[] {
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

  onFotografiasChange(fotografias: FotoItem[]) {
    const groupPrefix = this.imageService.getGroupPrefix(this.seccionId);
    fotografias.forEach((foto, index) => {
      const num = index + 1;
      const suffix = groupPrefix ? groupPrefix : '';
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Titulo${suffix}` as any, foto.titulo || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Fuente${suffix}` as any, foto.fuente || '');
      this.formularioService.actualizarDato(`${this.PHOTO_PREFIX}${num}Imagen${suffix}` as any, foto.imagen || '');
    });
    this.actualizarFotografiasFormMulti();
    this.actualizarDatos();
  }

  inicializarAutoridades() {
    if (!this.datos['autoridades'] || this.datos['autoridades'].length === 0) {
      this.datos['autoridades'] = [
        { organizacion: 'CC Ayroca', cargo: 'Presidente', nombre: '' },
        { organizacion: 'CC Ayroca', cargo: 'Secretario', nombre: '' }
      ];
      this.formularioService.actualizarDato('autoridades', this.datos['autoridades']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarAutoridades() {
    if (!this.datos['autoridades']) {
      this.inicializarAutoridades();
    }
    this.datos['autoridades'].push({ organizacion: '', cargo: '', nombre: '' });
    this.formularioService.actualizarDato('autoridades', this.datos['autoridades']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarAutoridades(index: number) {
    if (this.datos['autoridades'] && this.datos['autoridades'].length > 1) {
      this.datos['autoridades'].splice(index, 1);
      this.formularioService.actualizarDato('autoridades', this.datos['autoridades']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarAutoridades(index: number, field: string, value: any) {
    if (!this.datos['autoridades']) {
      this.inicializarAutoridades();
    }
    if (this.datos['autoridades'][index]) {
      this.datos['autoridades'][index][field] = value;
      this.formularioService.actualizarDato('autoridades', this.datos['autoridades']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  shouldShowOrgCell(index: number, autoridades: any[]): boolean {
    if (!autoridades || index === 0) {
      return true;
    }
    return autoridades[index].organizacion !== autoridades[index - 1].organizacion;
  }

  getOrgRowSpan(organizacion: string, autoridades: any[]): number {
    if (!autoridades) {
      return 1;
    }
    return autoridades.filter((item: any) => item.organizacion === organizacion).length;
  }
}


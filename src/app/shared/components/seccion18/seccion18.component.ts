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
  selector: 'app-seccion18',
  templateUrl: './seccion18.component.html',
  styleUrls: ['./seccion18.component.css']
})
export class Seccion18Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['grupoAISD', 'distritoSeleccionado', 'nbiCCAyrocaTabla', 'nbiDistritoCahuachoTabla'];
  
  override readonly PHOTO_PREFIX = 'fotografiaNBI';

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

  inicializarNBICCAyroca() {
    if (!this.datos['nbiCCAyrocaTabla'] || this.datos['nbiCCAyrocaTabla'].length === 0) {
      this.datos['nbiCCAyrocaTabla'] = [
        { categoria: 'Viviendas con hacinamiento', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas sin servicios higiénicos', casos: 0, porcentaje: '0%' },
        { categoria: 'Total referencial', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarNBICCAyroca() {
    if (!this.datos['nbiCCAyrocaTabla']) {
      this.inicializarNBICCAyroca();
    }
    const totalIndex = this.datos['nbiCCAyrocaTabla'].findIndex((item: any) => item.categoria === 'Total referencial');
    if (totalIndex >= 0) {
      this.datos['nbiCCAyrocaTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['nbiCCAyrocaTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNBICCAyroca(index: number) {
    if (this.datos['nbiCCAyrocaTabla'] && this.datos['nbiCCAyrocaTabla'].length > 1) {
      const item = this.datos['nbiCCAyrocaTabla'][index];
      if (item.categoria !== 'Total referencial') {
        this.datos['nbiCCAyrocaTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBICCAyroca(index: number, field: string, value: any) {
    if (!this.datos['nbiCCAyrocaTabla']) {
      this.inicializarNBICCAyroca();
    }
    if (this.datos['nbiCCAyrocaTabla'][index]) {
      this.datos['nbiCCAyrocaTabla'][index][field] = value;
      this.formularioService.actualizarDato('nbiCCAyrocaTabla', this.datos['nbiCCAyrocaTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  inicializarNBIDistritoCahuacho() {
    if (!this.datos['nbiDistritoCahuachoTabla'] || this.datos['nbiDistritoCahuachoTabla'].length === 0) {
      this.datos['nbiDistritoCahuachoTabla'] = [
        { categoria: 'Viviendas sin servicios higiénicos', casos: 0, porcentaje: '0%' },
        { categoria: 'Viviendas con hacinamiento', casos: 0, porcentaje: '0%' },
        { categoria: 'Total referencial', casos: 0, porcentaje: '0%' }
      ];
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  agregarNBIDistritoCahuacho() {
    if (!this.datos['nbiDistritoCahuachoTabla']) {
      this.inicializarNBIDistritoCahuacho();
    }
    const totalIndex = this.datos['nbiDistritoCahuachoTabla'].findIndex((item: any) => item.categoria === 'Total referencial');
    if (totalIndex >= 0) {
      this.datos['nbiDistritoCahuachoTabla'].splice(totalIndex, 0, { categoria: '', casos: 0, porcentaje: '0%' });
    } else {
      this.datos['nbiDistritoCahuachoTabla'].push({ categoria: '', casos: 0, porcentaje: '0%' });
    }
    this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarNBIDistritoCahuacho(index: number) {
    if (this.datos['nbiDistritoCahuachoTabla'] && this.datos['nbiDistritoCahuachoTabla'].length > 1) {
      const item = this.datos['nbiDistritoCahuachoTabla'][index];
      if (item.categoria !== 'Total referencial') {
        this.datos['nbiDistritoCahuachoTabla'].splice(index, 1);
        this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
        this.actualizarDatos();
        this.cdRef.detectChanges();
      }
    }
  }

  actualizarNBIDistritoCahuacho(index: number, field: string, value: any) {
    if (!this.datos['nbiDistritoCahuachoTabla']) {
      this.inicializarNBIDistritoCahuacho();
    }
    if (this.datos['nbiDistritoCahuachoTabla'][index]) {
      this.datos['nbiDistritoCahuachoTabla'][index][field] = value;
      this.formularioService.actualizarDato('nbiDistritoCahuachoTabla', this.datos['nbiDistritoCahuachoTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}


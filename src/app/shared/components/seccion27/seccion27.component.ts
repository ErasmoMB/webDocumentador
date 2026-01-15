import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { FormularioService } from 'src/app/core/services/formulario.service';
import { FieldMappingService } from 'src/app/core/services/field-mapping.service';
import { SectionDataLoaderService } from 'src/app/core/services/section-data-loader.service';
import { ImageManagementService } from 'src/app/core/services/image-management.service';
import { PrefijoHelper } from 'src/app/shared/utils/prefijo-helper';
import { BaseSectionComponent } from '../base-section.component';
import { FotoItem } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-seccion27',
  templateUrl: './seccion27.component.html',
  styleUrls: ['./seccion27.component.css']
})
export class Seccion27Component extends BaseSectionComponent {
  @Input() override seccionId: string = '';
  @Input() override modoFormulario: boolean = false;
  
  override watchedFields: string[] = ['centroPobladoAISI', 'telecomunicacionesCpTabla', 'costoTransporteMinimo', 'costoTransporteMaximo'];
  
  override readonly PHOTO_PREFIX = 'fotografiaCahuachoB16';
  
  fotografiasInstitucionalidadCache: any[] = [];

  constructor(
    formularioService: FormularioService,
    fieldMapping: FieldMappingService,
    sectionDataLoader: SectionDataLoaderService,
    imageService: ImageManagementService,
    cdRef: ChangeDetectorRef
  ) {
    super(formularioService, fieldMapping, sectionDataLoader, imageService, null as any, cdRef);
  }

  protected override onInitCustom(): void {
    this.actualizarFotografiasCache();
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
    return true;
  }

  getFotoTransporte(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTransporteAISITitulo'] || 'Infraestructura de transporte en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTransporteAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTransporteAISIImagen'] || '';
    
    return {
      numero: '3. 31',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  getFotoTelecomunicaciones(): any {
    const centroPobladoAISI = this.datos.centroPobladoAISI || '____';
    const titulo = this.datos?.['fotografiaTelecomunicacionesAISITitulo'] || 'Infraestructura de telecomunicaciones en el CP ' + centroPobladoAISI;
    const fuente = this.datos?.['fotografiaTelecomunicacionesAISIFuente'] || 'GEADES, 2024';
    const imagen = this.datos?.['fotografiaTelecomunicacionesAISIImagen'] || '';
    
    return {
      numero: '3. 32',
      titulo: titulo,
      fuente: fuente,
      ruta: imagen
    };
  }

  override actualizarFotografiasCache() {
    this.fotografiasInstitucionalidadCache = this.getFotografiasVista();
  }

  getFotografiasVista(): FotoItem[] {
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

  inicializarTelecomunicacionesCP() {
    if (!this.datos['telecomunicacionesCpTabla'] || this.datos['telecomunicacionesCpTabla'].length === 0) {
      this.datos['telecomunicacionesCpTabla'] = [
        { medio: '', descripcion: '' }
      ];
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.cdRef.detectChanges();
    }
  }

  agregarTelecomunicacionesCP() {
    if (!this.datos['telecomunicacionesCpTabla']) {
      this.inicializarTelecomunicacionesCP();
    }
    this.datos['telecomunicacionesCpTabla'].push({ medio: '', descripcion: '' });
    this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
    this.actualizarDatos();
    this.cdRef.detectChanges();
  }

  eliminarTelecomunicacionesCP(index: number) {
    if (this.datos['telecomunicacionesCpTabla'] && this.datos['telecomunicacionesCpTabla'].length > 1) {
      this.datos['telecomunicacionesCpTabla'].splice(index, 1);
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }

  actualizarTelecomunicacionesCP(index: number, field: string, value: any) {
    if (!this.datos['telecomunicacionesCpTabla']) {
      this.inicializarTelecomunicacionesCP();
    }
    if (this.datos['telecomunicacionesCpTabla'][index]) {
      this.datos['telecomunicacionesCpTabla'][index][field] = value;
      this.formularioService.actualizarDato('telecomunicacionesCpTabla', this.datos['telecomunicacionesCpTabla']);
      this.actualizarDatos();
      this.cdRef.detectChanges();
    }
  }
}

